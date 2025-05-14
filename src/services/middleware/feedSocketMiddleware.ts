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

		socket = new WebSocket(wsUrl);

		socket.onopen = () => {
			dispatch({ type: FeedWsActionTypes.WS_CONNECTION_SUCCESS });
			isConnecting = false;
			if (reconnectTimeout) {
				clearTimeout(reconnectTimeout);
				reconnectTimeout = null;
			}
		};

		socket.onerror = (error: Event) => {
			dispatch({
				type: FeedWsActionTypes.WS_CONNECTION_ERROR,
				payload: `WebSocket error: ${JSON.stringify(error)}`,
			});
			isConnecting = false;
		};

		socket.onmessage = (event) => {
			const { data } = event;
			try {
				const parsedData = JSON.parse(data);
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
			dispatch({
				type: FeedWsActionTypes.WS_CONNECTION_CLOSED,
				payload: { code: event.code, reason: event.reason },
			});
			socket = null;
			isConnecting = false;

			if (!reconnectTimeout && url) {
				reconnectTimeout = setTimeout(() => {
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
				socket.send(JSON.stringify(action.payload));
			}

			// Обновляем обработку закрытия
			if (action.type === 'FEED_WS_CONNECTION_CLOSE' && socket) {
				socket.close(1000, 'Normal closure');
				socket = null;
				url = null; // Сбрасываем URL, чтобы предотвратить переподключение
				if (reconnectTimeout) {
					clearTimeout(reconnectTimeout);
					reconnectTimeout = null;
				}
			}

			return next(action);
		};

	return middleware as Middleware<{}, RootState>;
};
