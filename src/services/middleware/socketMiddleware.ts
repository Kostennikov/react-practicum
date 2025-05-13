// services/middleware/socketMiddleware.ts
import {
	Middleware,
	MiddlewareAPI,
	Dispatch,
	AnyAction,
} from '@reduxjs/toolkit';
import { RootState, WsActions, WsActionTypes } from '../../types/types';

export const socketMiddleware = (wsUrl: string): Middleware<{}, RootState> => {
	let socket: WebSocket | null = null;
	let reconnectTimeout: NodeJS.Timeout | null = null;
	let isConnecting = false;

	const connect = (
		dispatch: Dispatch<AnyAction>,
		getState: () => RootState,
		url: string
	) => {
		if (isConnecting || socket) return;
		isConnecting = true;

		console.log('WebSocket: Starting connection to', url); // Отладка
		// const accessToken = getState().auth.accessToken?.replace('Bearer ', '');
		// // Для /orders/all токен не добавляем
		// const finalUrl = url.includes('/orders/all')
		// 	? url
		// 	: accessToken
		// 	? `${url}?token=${accessToken}`
		// 	: url;
		// socket = new WebSocket(finalUrl);

		socket = new WebSocket(url);

		socket.onopen = () => {
			console.log('WebSocket: Connection opened'); // Отладка
			dispatch({ type: WsActionTypes.WS_CONNECTION_SUCCESS });
			isConnecting = false;
			if (reconnectTimeout) {
				clearTimeout(reconnectTimeout);
				reconnectTimeout = null;
			}
		};

		socket.onerror = (error) => {
			console.error('WebSocket: Error', error); // Отладка
			dispatch({
				type: WsActionTypes.WS_CONNECTION_ERROR,
				payload: `WebSocket error: ${JSON.stringify(error)}`,
			});
			isConnecting = false;
		};

		socket.onmessage = (event) => {
			const { data } = event;
			console.log('WebSocket: Received message', data); // Отладка
			try {
				const parsedData = JSON.parse(data);
				console.log('WebSocket: Dispatching WS_GET_MESSAGE', parsedData); // Отладка
				if (
					parsedData &&
					typeof parsedData === 'object' &&
					'success' in parsedData &&
					'orders' in parsedData &&
					'total' in parsedData &&
					'totalToday' in parsedData
				) {
					dispatch({
						type: WsActionTypes.WS_GET_MESSAGE,
						payload: parsedData,
					});
				} else {
					console.error('WebSocket: Invalid message format', parsedData);
					dispatch({
						type: WsActionTypes.WS_CONNECTION_ERROR,
						payload: 'Invalid message format',
					});
				}
			} catch (error) {
				console.error('WebSocket: Failed to parse message', error);
				// dispatch({
				// 	type: WsActionTypes.WS_CONNECTION_ERROR,
				// 	payload: `Failed to parse message: ${error.message}`,
				// });
			}
		};

		socket.onclose = (event) => {
			console.log('WebSocket: Connection closed', event.code, event.reason); // Отладка
			dispatch({
				type: WsActionTypes.WS_CONNECTION_CLOSED,
				payload: { code: event.code, reason: event.reason },
			});
			socket = null;
			isConnecting = false;

			// Попытка переподключения через 5 секунд, если код не 1008
			if (event.code !== 1008 && !reconnectTimeout) {
				reconnectTimeout = setTimeout(() => {
					console.log('WebSocket: Attempting to reconnect'); // Отладка
					connect(dispatch, getState, url);
				}, 5000);
			}
		};
	};

	return ({
			dispatch,
			getState,
		}: MiddlewareAPI<Dispatch<AnyAction>, RootState>) =>
		(next: (action: unknown) => unknown) =>
		(action: unknown): unknown => {
			if (
				action &&
				typeof action === 'object' &&
				'type' in action &&
				Object.values(WsActionTypes).includes((action as WsActions).type)
			) {
				const wsAction = action as WsActions;

				if (wsAction.type === WsActionTypes.WS_CONNECTION_START) {
					connect(dispatch, getState, wsAction.payload || wsUrl);
				}

				if (wsAction.type === WsActionTypes.WS_SEND_MESSAGE && socket) {
					console.log('WebSocket: Sending message', wsAction.payload); // Отладка
					socket.send(JSON.stringify(wsAction.payload));
				}

				if (wsAction.type === WsActionTypes.WS_CONNECTION_CLOSED && socket) {
					console.log('WebSocket: Closing connection'); // Отладка
					socket.close();
					socket = null;
					if (reconnectTimeout) {
						clearTimeout(reconnectTimeout);
						reconnectTimeout = null;
					}
				}
			}

			return next(action);
		};
};
