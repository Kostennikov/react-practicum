// services/feed/reducer.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
	FeedState,
	WsActionTypes,
	Order,
	wsGetMessageAction,
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
			console.log('Reducer: WebSocket connected'); // Отладка
			state.wsConnected = true;
			state.wsError = null;
			state.wsCloseInfo = null;
		},
		wsConnectionError(state, action: PayloadAction<string>) {
			console.log('Reducer: WebSocket error', action.payload); // Отладка
			state.wsConnected = false;
			state.wsError = action.payload;
		},
		wsConnectionClosed(
			state,
			action: PayloadAction<{ code: number; reason: string }>
		) {
			console.log('Reducer: WebSocket closed', action.payload); // Отладка
			state.wsConnected = false;
			state.wsCloseInfo = action.payload;
		},
	},
	extraReducers: (builder) => {
		builder.addCase(wsGetMessageAction, (state, action) => {
			console.log('Reducer: Received payload', action); // Отладка
			const { orders, total, totalToday, success } = action.payload;
			if (success) {
				console.log('Reducer: Updating orders', orders); // Отладка
				state.orders = orders;
				state.total = total;
				state.totalToday = totalToday;
			} else {
				console.error('Reducer: Invalid data received', action.payload); // Отладка
				state.wsError = 'Invalid data received';
			}
		});
	},
});

export const { wsConnectionSuccess, wsConnectionError, wsConnectionClosed } =
	feedSlice.actions;

export const { reducer: feedReducer } = feedSlice;
export default feedSlice;
