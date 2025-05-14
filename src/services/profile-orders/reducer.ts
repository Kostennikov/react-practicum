// src/services/profile-orders/reducer.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
	ProfileOrdersState,
	ProfileOrdersWsActionTypes,
	Order,
	profileOrdersWsGetMessage,
} from '../../types/types';

const initialState: ProfileOrdersState = {
	orders: [],
	wsConnected: false,
	wsError: null,
	wsCloseInfo: null,
	loading: false,
	error: null,
};

const profileOrdersSlice = createSlice({
	name: 'profileOrders',
	initialState,
	reducers: {
		wsConnectionSuccess(state) {
			console.log('ProfileOrders Reducer: WebSocket connected');
			state.wsConnected = true;
			state.wsError = null;
			state.wsCloseInfo = null;
		},
		wsConnectionError(state, action: PayloadAction<string>) {
			console.log('ProfileOrders Reducer: WebSocket error', action.payload);
			state.wsConnected = false;
			state.wsError = action.payload;
		},
		wsConnectionClosed(
			state,
			action: PayloadAction<{ code: number; reason: string }>
		) {
			console.log('ProfileOrders Reducer: WebSocket closed', action.payload);
			state.wsConnected = false;
			state.wsCloseInfo = action.payload;
		},
	},
	extraReducers: (builder) => {
		builder.addCase(profileOrdersWsGetMessage, (state, action) => {
			console.log('ProfileOrders Reducer: Received payload', action);
			const { orders, success } = action.payload;
			if (success) {
				const validOrders = orders.filter(
					(order) =>
						order._id &&
						order.number &&
						order.name &&
						order.status &&
						Array.isArray(order.ingredients) &&
						order.createdAt &&
						order.updatedAt
				);
				const now = new Date();
				const updatedOrders = validOrders.map((order) => {
					const createdAt = new Date(order.createdAt);
					const timeDiff = (now.getTime() - createdAt.getTime()) / 1000;
					if (timeDiff > 15 && order.status === 'created') {
						return { ...order, status: 'pending' as 'pending' };
					}
					return order;
				});
				console.log('ProfileOrders Reducer: Updating orders', updatedOrders);
				state.orders = updatedOrders;
			} else {
				console.error(
					'ProfileOrders Reducer: Invalid data received',
					action.payload
				);
				state.wsError = 'Invalid data received';
			}
		});
	},
});

export const {
	wsConnectionSuccess: profileOrdersWsConnectionSuccess,
	wsConnectionError: profileOrdersWsConnectionError,
	wsConnectionClosed: profileOrdersWsConnectionClosed,
} = profileOrdersSlice.actions;

export const { reducer: profileOrdersReducer } = profileOrdersSlice;
export default profileOrdersSlice;
