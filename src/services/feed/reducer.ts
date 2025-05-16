import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FeedState, Order } from '../../types/types';
import { wsActionTypes } from '../websocket/actions'; // Исправленный импорт

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
};

const feedSlice = createSlice({
	name: 'feed',
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(
				wsActionTypes.WS_CONNECTION_SUCCESS,
				(state, action: PayloadAction<{ connectionId: string }>) => {
					if (action.payload.connectionId === 'feed') {
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
					if (action.payload.connectionId === 'feed') {
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
					if (action.payload.connectionId === 'feed') {
						state.wsConnected = false;
						state.wsCloseInfo = {
							code: action.payload.code,
							reason: action.payload.reason,
						};
					}
				}
			)
			// В feedSlice
			.addCase(
				wsActionTypes.WS_GET_MESSAGE,
				(state, action: PayloadAction<{ connectionId: string; data: any }>) => {
					if (action.payload.connectionId === 'feed') {
						const { orders, total, totalToday, success } = action.payload.data;
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
							// Обновляем существующие заказы и добавляем новые
							const updatedOrders = [
								...validOrders,
								...state.orders.filter(
									(existing) =>
										!validOrders.some(
											(newOrder: Order) => newOrder._id === existing._id
										)
								),
							].sort(
								(a: Order, b: Order) =>
									new Date(b.createdAt).getTime() -
									new Date(a.createdAt).getTime()
							);
							state.orders = updatedOrders;
							state.total = total;
							state.totalToday = totalToday;
							saveOrderMapping(updatedOrders);
						} else {
							state.wsError = 'Invalid data received';
						}
					}
				}
			);
	},
});

export const { reducer: feedReducer } = feedSlice;
export default feedSlice;
