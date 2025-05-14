// src/services/middleware/feedSocketMiddleware.ts
import {
	Middleware,
	MiddlewareAPI,
	Dispatch,
	UnknownAction,
} from '@reduxjs/toolkit';
import { RootState, FeedWsActionTypes } from '../../types/types';
import { AppDispatch } from '../../services/store';

export const feedSocketMiddleware = (): Middleware<{}, RootState> => {
	let socket: WebSocket | null = null;
	let reconnectTimeout: NodeJS.Timeout | null = null;
	let isConnecting = false;
	let url: string | null = null;

	const connect = (
		dispatch: AppDispatch,
		getState: () => RootState,
		wsUrl: string
	) => {
		if (isConnecting || socket) return;
		isConnecting = true;
		url = wsUrl;

		console.log('Feed WebSocket: Starting connection to', wsUrl);
		socket = new WebSocket(wsUrl);

		socket.onopen = () => {
			console.log('Feed WebSocket: Connection opened');
			dispatch({ type: FeedWsActionTypes.WS_CONNECTION_SUCCESS });
			isConnecting = false;
			if (reconnectTimeout) {
				clearTimeout(reconnectTimeout);
				reconnectTimeout = null;
			}
		};

		socket.onerror = (error: Event) => {
			console.error('Feed WebSocket: Error', error);
			dispatch({
				type: FeedWsActionTypes.WS_CONNECTION_ERROR,
				payload: `WebSocket error: ${JSON.stringify(error)}`,
			});
			isConnecting = false;
		};

		socket.onmessage = (event) => {
			const { data } = event;
			console.log('Feed WebSocket: Received message', data);
			try {
				const parsedData = JSON.parse(data);
				console.log('Feed WebSocket: Dispatching WS_GET_MESSAGE', parsedData);
				dispatch({
					type: FeedWsActionTypes.WS_GET_MESSAGE,
					payload: parsedData,
				});
			} catch (error) {
				console.error('Feed WebSocket: Failed to parse message', error);
				dispatch({
					type: FeedWsActionTypes.WS_CONNECTION_ERROR,
					payload: `Failed to parse message: ${(error as Error).message}`,
				});
			}
		};

		socket.onclose = (event) => {
			console.log(
				'Feed WebSocket: Connection closed',
				event.code,
				event.reason
			);
			dispatch({
				type: FeedWsActionTypes.WS_CONNECTION_CLOSED,
				payload: { code: event.code, reason: event.reason },
			});
			socket = null;
			isConnecting = false;

			if (!reconnectTimeout && url) {
				reconnectTimeout = setTimeout(() => {
					console.log('Feed WebSocket: Attempting to reconnect');
					if (url) {
						connect(dispatch, getState, url);
					}
				}, 5000);
			}
		};
	};

	const middleware =
		({
			dispatch,
			getState,
		}: MiddlewareAPI<Dispatch<UnknownAction>, RootState>) =>
		(next: Dispatch<UnknownAction>) =>
		(action: UnknownAction): UnknownAction => {
			if (action.type === FeedWsActionTypes.WS_CONNECTION_START) {
				if (typeof action.payload === 'string') {
					connect(dispatch as AppDispatch, getState, action.payload);
				} else {
					console.error('Feed WebSocket: Invalid URL payload', action.payload);
				}
			}

			if (action.type === FeedWsActionTypes.WS_SEND_MESSAGE && socket) {
				console.log('Feed WebSocket: Sending message', action.payload);
				socket.send(JSON.stringify(action.payload));
			}

			if (action.type === FeedWsActionTypes.WS_CONNECTION_CLOSED && socket) {
				console.log('Feed WebSocket: Closing connection');
				socket.close(1000, 'Normal closure');
				socket = null;
				if (reconnectTimeout) {
					clearTimeout(reconnectTimeout);
					reconnectTimeout = null;
				}
			}

			return next(action);
		};

	return middleware as Middleware<{}, RootState>;
};
