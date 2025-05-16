import {
	Middleware,
	MiddlewareAPI,
	Dispatch,
	UnknownAction,
} from '@reduxjs/toolkit';
import { RootState } from '../../types/types';
import { AppDispatch } from '../store';
import { refreshToken } from '../auth/reducer';

interface WsActionTypes {
	WS_CONNECTION_START: string;
	WS_CONNECTION_SUCCESS: string;
	WS_CONNECTION_ERROR: string;
	WS_CONNECTION_CLOSED: string;
	WS_GET_MESSAGE: string;
	WS_SEND_MESSAGE: string;
	WS_CONNECTION_CLOSE: string;
}

interface WsConnectionPayload {
	url: string;
	connectionId: string;
	token?: string;
}

export const socketMiddleware = (
	wsActionTypes: WsActionTypes
): Middleware<{}, RootState> => {
	const connections: {
		[key: string]: {
			socket: WebSocket | null;
			url: string | null;
			reconnectTimeout: NodeJS.Timeout | null;
			isConnecting: boolean;
			isClosedIntentionally: boolean;
		};
	} = {};

	const connect = async (
		dispatch: AppDispatch,
		getState: () => RootState,
		payload: WsConnectionPayload
	) => {
		const { url, connectionId, token } = payload;

		if (
			connections[connectionId]?.isConnecting ||
			connections[connectionId]?.socket ||
			connections[connectionId]?.reconnectTimeout ||
			connections[connectionId]?.isClosedIntentionally
		) {
			return;
		}

		connections[connectionId] = {
			socket: null,
			url,
			reconnectTimeout: null,
			isConnecting: true,
			isClosedIntentionally: false,
		};

		let wsUrl = url;
		if (token) {
			const cleanToken = token.replace(/^Bearer\s+/i, '');
			wsUrl = `${url}?token=${cleanToken}`;
		}

		const socket = new WebSocket(wsUrl);
		connections[connectionId].socket = socket;

		socket.onopen = () => {
			if (!connections[connectionId]) return;
			console.log(`WebSocket: Opened for ${connectionId}`);
			dispatch({
				type: wsActionTypes.WS_CONNECTION_SUCCESS,
				payload: { connectionId },
			});
			connections[connectionId].isConnecting = false;
			if (connections[connectionId].reconnectTimeout) {
				clearTimeout(connections[connectionId].reconnectTimeout!);
				connections[connectionId].reconnectTimeout = null;
			}
		};

		socket.onerror = (error: Event) => {
			if (!connections[connectionId]) return;
			const errorMessage =
				error instanceof Error ? error.message : JSON.stringify(error);
			console.error(`WebSocket: Error for ${connectionId}`, errorMessage);
			dispatch({
				type: wsActionTypes.WS_CONNECTION_ERROR,
				payload: {
					connectionId,
					error: `WebSocket error: ${errorMessage}`,
				},
			});
			connections[connectionId].isConnecting = false;
		};

		socket.onmessage = (event) => {
			if (!connections[connectionId]) return;
			try {
				const parsedData = JSON.parse(event.data);

				dispatch({
					type: wsActionTypes.WS_GET_MESSAGE,
					payload: { connectionId, data: parsedData },
				});
			} catch (error) {
				console.error(
					`WebSocket: Failed to parse message for ${connectionId}`,
					error
				);
				dispatch({
					type: wsActionTypes.WS_CONNECTION_ERROR,
					payload: {
						connectionId,
						error: `Failed to parse message: ${(error as Error).message}`,
					},
				});
			}
		};

		socket.onclose = async (event) => {
			if (!connections[connectionId]) return;

			dispatch({
				type: wsActionTypes.WS_CONNECTION_CLOSED,
				payload: { connectionId, code: event.code, reason: event.reason },
			});
			connections[connectionId].socket = null;
			connections[connectionId].isConnecting = false;

			if (connections[connectionId].isClosedIntentionally) {
				return;
			}

			if (event.code === 1008 && connections[connectionId].url) {
				try {
					const result = await dispatch(refreshToken()).unwrap();
					const newToken = getState().auth.accessToken ?? undefined;

					if (connections[connectionId]) {
						connect(dispatch, getState, { url, connectionId, token: newToken });
					}
				} catch (error: any) {
					console.error(
						`WebSocket: Failed to refresh token for ${connectionId}`,
						error
					);
					if (connections[connectionId]) {
						dispatch({
							type: wsActionTypes.WS_CONNECTION_ERROR,
							payload: {
								connectionId,
								error: `Failed to refresh token: ${error.message}`,
							},
						});
					}
				}
			} else if (
				connections[connectionId].url &&
				!connections[connectionId].reconnectTimeout
			) {
				connections[connectionId].reconnectTimeout = setTimeout(() => {
					if (
						connections[connectionId]?.url &&
						!connections[connectionId]?.isClosedIntentionally
					) {
						const currentToken = getState().auth.accessToken ?? undefined;

						connect(dispatch, getState, {
							url,
							connectionId,
							token: currentToken,
						});
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
			if (action.type === wsActionTypes.WS_CONNECTION_START) {
				const payload = action.payload as WsConnectionPayload;
				if (payload?.url && payload?.connectionId) {
					connect(dispatch as AppDispatch, getState, payload);
				} else {
					console.error('WebSocket: Invalid payload', payload);
				}
			}

			if (action.type === wsActionTypes.WS_SEND_MESSAGE) {
				const { connectionId, data } = action.payload as {
					connectionId: string;
					data: any;
				};
				const socket = connections[connectionId]?.socket;
				if (socket) {
					socket.send(JSON.stringify(data));
				}
			}

			if (action.type === wsActionTypes.WS_CONNECTION_CLOSE) {
				const { connectionId } = action.payload as { connectionId: string };
				const connection = connections[connectionId];
				if (connection?.socket) {
					connection.isClosedIntentionally = true;
					connection.socket.close(1000, 'Normal closure');
					connection.socket = null;
					connection.url = null;
					if (connection.reconnectTimeout) {
						clearTimeout(connection.reconnectTimeout);
						connection.reconnectTimeout = null;
					}
					delete connections[connectionId];
				}
			}

			return next(action);
		};

	return middleware as Middleware<{}, RootState>;
};
