import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ProfileOrdersState, Order } from '../../types/types';
import { wsActionTypes } from '../websocket/actions';

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
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(
				wsActionTypes.WS_CONNECTION_SUCCESS,
				(state, action: PayloadAction<{ connectionId: string }>) => {
					if (action.payload.connectionId === 'profile') {
						state.wsConnected = true;
						state.wsError = null;
						state.wsCloseInfo = null;
					}
				}
			)
			.addCase(
				wsActionTypes.WS_CONNECTION_ERROR,
				(
					state,
					action: PayloadAction<{ connectionId: string; error: string }>
				) => {
					if (action.payload.connectionId === 'profile') {
						state.wsConnected = false;
						state.wsError = action.payload.error;
					}
				}
			)
			.addCase(
				wsActionTypes.WS_CONNECTION_CLOSED,
				(
					state,
					action: PayloadAction<{
						connectionId: string;
						code: number;
						reason: string;
					}>
				) => {
					if (action.payload.connectionId === 'profile') {
						state.wsConnected = false;
						state.wsCloseInfo = {
							code: action.payload.code,
							reason: action.payload.reason,
						};
					}
				}
			)
			.addCase(
				wsActionTypes.WS_GET_MESSAGE,
				(state, action: PayloadAction<{ connectionId: string; data: any }>) => {
					if (action.payload.connectionId === 'profile') {
						const { orders, success } = action.payload.data;
						if (success) {
							const validOrders = orders.filter(
								(order: Order) =>
									order._id &&
									order.number &&
									order.name &&
									order.status &&
									Array.isArray(order.ingredients) &&
									order.createdAt &&
									order.updatedAt
							);
							const now = new Date();
							const updatedOrders = validOrders.map((order: Order) => {
								const createdAt = new Date(order.createdAt);
								const timeDiff = (now.getTime() - createdAt.getTime()) / 1000;
								if (timeDiff > 15 && order.status === 'created') {
									return { ...order, status: 'pending' as 'pending' };
								}
								return order;
							});
							state.orders = updatedOrders;
						} else {
							state.wsError = 'Invalid data received';
						}
					}
				}
			);
	},
});

export const { reducer: profileOrdersReducer } = profileOrdersSlice;
export default profileOrdersSlice;
