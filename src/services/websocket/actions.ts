import { WsActionTypes } from '../../types/types';

export const wsActionTypes: WsActionTypes = {
	WS_CONNECTION_START: 'WS_CONNECTION_START',
	WS_CONNECTION_SUCCESS: 'WS_CONNECTION_SUCCESS',
	WS_CONNECTION_ERROR: 'WS_CONNECTION_ERROR',
	WS_CONNECTION_CLOSED: 'WS_CONNECTION_CLOSED',
	WS_GET_MESSAGE: 'WS_GET_MESSAGE',
	WS_SEND_MESSAGE: 'WS_SEND_MESSAGE',
	WS_CONNECTION_CLOSE: 'WS_CONNECTION_CLOSE',
};

export const wsConnectionStart = (payload: {
	url: string;
	connectionId: string;
	token?: string;
}) => ({
	type: wsActionTypes.WS_CONNECTION_START,
	payload,
});

export const wsConnectionClose = (connectionId: string) => ({
	type: wsActionTypes.WS_CONNECTION_CLOSE,
	payload: { connectionId },
});

export const wsSendMessage = (connectionId: string, data: any) => ({
	type: wsActionTypes.WS_SEND_MESSAGE,
	payload: { connectionId, data },
});
