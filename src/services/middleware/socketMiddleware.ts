import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
	FeedState,
	FeedWsActionTypes,
	Order,
	feedWsGetMessage,
} from '../../types/types';

const initialState: FeedState = {
	orders: [],
	total: 0,
	totalToday: 0,
	wsConnected: false,
	wsError: null,
	wsCloseInfo: null,
	loading: false,
	error: null,
};

const feedSlice = createSlice({
	name: 'feed',
	initialState,
	reducers: {
		wsConnectionSuccess(state) {
			console.log('Feed Reducer: WebSocket connected');
			state.wsConnected = true;
			state.wsError = null;
			state.wsCloseInfo = null;
		},
		wsConnectionError(state, action: PayloadAction<string>) {
			console.log('Feed Reducer: WebSocket error', action.payload);
			state.wsConnected = false;
			state.wsError = action.payload;
		},
		wsConnectionClosed(
			state,
			action: PayloadAction<{ code: number; reason: string }>
		) {
			console.log('Feed Reducer: WebSocket closed', action.payload);
			state.wsConnected = false;
			state.wsCloseInfo = action.payload;
		},
	},
	extraReducers: (builder) => {
		builder.addCase(feedWsGetMessage, (state, action) => {
			console.log('Feed Reducer: Received payload', action);
			const { orders, total, totalToday, success } = action.payload;
			if (success) {
				// Проверяем корректность заказов
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
				console.log('Feed Reducer: Updating orders', validOrders);
				state.orders = validOrders;
				state.total = total;
				state.totalToday = totalToday;
			} else {
				console.error('Feed Reducer: Invalid data received', action.payload);
				state.wsError = 'Invalid data received';
			}
		});
	},
});

export const {
	wsConnectionSuccess: feedWsConnectionSuccess,
	wsConnectionError: feedWsConnectionError,
	wsConnectionClosed: feedWsConnectionClosed,
} = feedSlice.actions;

export const { reducer: feedReducer } = feedSlice;
export default feedSlice;
