import {
	feedWsConnectionStart,
	feedWsConnectionSuccess,
	feedWsConnectionError,
	feedWsConnectionClosed,
	feedWsGetMessage,
	feedWsSendMessage,
	profileOrdersWsConnectionStart,
	profileOrdersWsConnectionSuccess,
	profileOrdersWsConnectionError,
	profileOrdersWsConnectionClosed,
	profileOrdersWsGetMessage,
	profileOrdersWsSendMessage,
} from '../../types/types';

const feedWsClose = () => ({
	type: 'FEED_WS_CLOSE',
});

const profileOrdersWsClose = () => ({
	type: 'PROFILE_ORDERS_WS_CLOSE',
});

export {
	feedWsConnectionStart,
	feedWsConnectionSuccess,
	feedWsConnectionError,
	feedWsConnectionClosed,
	feedWsGetMessage,
	feedWsSendMessage,
	feedWsClose,
	profileOrdersWsConnectionStart,
	profileOrdersWsConnectionSuccess,
	profileOrdersWsConnectionError,
	profileOrdersWsConnectionClosed,
	profileOrdersWsGetMessage,
	profileOrdersWsSendMessage,
	profileOrdersWsClose,
};
