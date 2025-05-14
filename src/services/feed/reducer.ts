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

const saveOrderMapping = (orders: Order[]) => {
	const existingMapping = JSON.parse(
		localStorage.getItem('orderMapping') || '{}'
	);
	orders.forEach((order) => {
		existingMapping[order._id] = order.number;
	});
	localStorage.setItem('orderMapping', JSON.stringify(existingMapping));
	console.log('Feed Reducer: Updated orderMapping:', existingMapping);
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
				const sortedOrders = [...validOrders].sort(
					(a, b) =>
						new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
				);
				console.log('Feed Reducer: Updating sorted orders', sortedOrders);
				state.orders = sortedOrders;
				state.total = total;
				state.totalToday = totalToday;
				saveOrderMapping(sortedOrders);
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
