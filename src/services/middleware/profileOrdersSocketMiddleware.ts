import {
	Middleware,
	MiddlewareAPI,
	Dispatch,
	UnknownAction,
} from '@reduxjs/toolkit';
import { RootState, ProfileOrdersWsActionTypes } from '../../types/types';
import { refreshToken } from '../auth/reducer';
import { AppDispatch } from '../../services/store';

const getCookie = (name: string): string | undefined => {
	const matches = document.cookie.match(
		new RegExp(
			`(?:^|; )${name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1')}=([^;]*)`
		)
	);
	return matches ? decodeURIComponent(matches[1]) : undefined;
};

export const profileOrdersSocketMiddleware = (): Middleware<{}, RootState> => {
	let socket: WebSocket | null = null;
	let reconnectTimeout: NodeJS.Timeout | null = null;
	let isConnecting = false;
	let url: string | null = null;

	const connect = async (
		dispatch: AppDispatch,
		getState: () => RootState,
		wsUrl: string
	) => {
		if (isConnecting || socket) return;
		isConnecting = true;
		url = wsUrl;

		let accessToken = getState().auth.accessToken;
		if (!accessToken) {
			const cookieToken = getCookie('accessToken');
			accessToken = cookieToken ? `Bearer ${cookieToken}` : null;
		}

		if (!accessToken) {
			console.error('ProfileOrders WebSocket: No access token');
			dispatch({
				type: ProfileOrdersWsActionTypes.WS_CONNECTION_ERROR,
				payload: 'No access token',
			});
			isConnecting = false;
			return;
		}

		const wsUrlWithToken = `${wsUrl}?token=${accessToken.replace(
			'Bearer ',
			''
		)}`;

		socket = new WebSocket(wsUrlWithToken);

		socket.onopen = () => {
			dispatch({ type: ProfileOrdersWsActionTypes.WS_CONNECTION_SUCCESS });
			isConnecting = false;
			if (reconnectTimeout) {
				clearTimeout(reconnectTimeout);
				reconnectTimeout = null;
			}
		};

		socket.onerror = (error: Event) => {
			console.error('ProfileOrders WebSocket: Error', error);
			dispatch({
				type: ProfileOrdersWsActionTypes.WS_CONNECTION_ERROR,
				payload: `WebSocket error: ${JSON.stringify(error)}`,
			});
			isConnecting = false;
		};

		socket.onmessage = (event) => {
			const { data } = event;

			try {
				const parsedData = JSON.parse(data);

				dispatch({
					type: ProfileOrdersWsActionTypes.WS_GET_MESSAGE,
					payload: parsedData,
				});
			} catch (error) {
				console.error(
					'ProfileOrders WebSocket: Failed to parse message',
					error
				);
				dispatch({
					type: ProfileOrdersWsActionTypes.WS_CONNECTION_ERROR,
					payload: `Failed to parse message: ${(error as Error).message}`,
				});
			}
		};

		socket.onclose = async (event) => {
			dispatch({
				type: ProfileOrdersWsActionTypes.WS_CONNECTION_CLOSED,
				payload: { code: event.code, reason: event.reason },
			});
			socket = null;
			isConnecting = false;

			if (event.code === 1008 && url) {
				try {
					const result = await dispatch(refreshToken()).unwrap();

					connect(dispatch, getState, url);
				} catch (error: any) {
					console.error(
						'ProfileOrders WebSocket: Failed to refresh token',
						error
					);
					dispatch({
						type: ProfileOrdersWsActionTypes.WS_CONNECTION_ERROR,
						payload: `Failed to refresh token: ${error.message}`,
					});
				}
			} else if (!reconnectTimeout && url) {
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
			if (action.type === ProfileOrdersWsActionTypes.WS_CONNECTION_START) {
				if (typeof action.payload === 'string') {
					connect(dispatch as AppDispatch, getState, action.payload);
				} else {
					console.error(
						'ProfileOrders WebSocket: Invalid URL payload',
						action.payload
					);
				}
			}

			if (
				action.type === ProfileOrdersWsActionTypes.WS_SEND_MESSAGE &&
				socket
			) {
				console.log('ProfileOrders WebSocket: Sending message', action.payload);
				socket.send(JSON.stringify(action.payload));
			}

			// Обновляем обработку закрытия
			if (action.type === 'PROFILE_ORDERS_WS_CONNECTION_CLOSE' && socket) {
				console.log('ProfileOrders WebSocket: Closing connection');
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
