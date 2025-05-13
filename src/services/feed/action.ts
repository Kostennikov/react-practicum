import { WsActionTypes } from '../../types/types';

export const wsConnectionStart = (url: string) => ({
	type: WsActionTypes.WS_CONNECTION_START,
	payload: url,
});

export const wsSendMessage = (data: any) => ({
	type: WsActionTypes.WS_SEND_MESSAGE,
	payload: data,
});

export const wsConnectionSuccess = () => ({
	type: WsActionTypes.WS_CONNECTION_SUCCESS,
});

export const wsConnectionError = (error: string) => ({
	type: WsActionTypes.WS_CONNECTION_ERROR,
	payload: error,
});

export const wsConnectionClosed = () => ({
	type: WsActionTypes.WS_CONNECTION_CLOSED,
});

// export const wsGetMessage = (data: {
// 	orders: Order[];
// 	total: number;
// 	totalToday: number;
// }) => ({
// 	type: WsActionTypes.WS_GET_MESSAGE,
// 	payload: data,
// });
