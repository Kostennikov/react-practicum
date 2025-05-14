import { createAction } from '@reduxjs/toolkit';

export interface Ingredient {
	_id: string;
	name: string;
	type: 'bun' | 'main' | 'sauce';
	proteins: number;
	fat: number;
	carbohydrates: number;
	calories: number;
	price: number;
	image?: string;
	image_mobile?: string;
	image_large?: string;
	__v?: number;
	uid?: string;
}

export interface User {
	name: string;
	email: string;
}

export interface Order {
	order: {
		number: number;
	};
	_id: string; // Добавлено
	number: number;
	name: string;
	status: 'created' | 'pending' | 'done'; // Добавлено
	ingredients: string[]; // Массив ID ингредиентов
	createdAt: string; // ISO строка даты
	updatedAt: string;
	success?: boolean; // Для совместимости с текущим Order
}

export interface PendingOrderState {
	pendingOrder: {
		bun: Ingredient | null;
		burgerIngredients: Ingredient[];
	} | null;
	fetchedOrder: Order | null;
	loading: boolean;
	error: string | null;
}

export interface BurgerConstructorState {
	bun: Ingredient | null;
	burgerIngredients: Ingredient[];
}

export interface AuthState {
	user: {
		email: string;
		name: string;
	} | null;
	accessToken: string | null;
	refreshToken: string | null;
	loading: boolean;
	error: string | null;
	authChecked: boolean;
	resetPasswordAllowed: boolean;
}

export interface IngredientsState {
	ingredients: Ingredient[];
	ingredientsMap: Map<string, Ingredient>;
	loading: boolean;
	error: string | null;
}

// Тип для ответа createOrder (где ожидается data.order)
export interface CreateOrderResponse {
	success: boolean;
	order: Order;
	message?: string;
}

// Новый тип для ответа fetchOrderByNumber (где ожидается data.orders)
export interface FetchOrderByNumberResponse {
	success: boolean;
	orders: Order[];
	message?: string;
}

export interface OrderState {
	order: Order | null;
	loading: boolean;
	error: string | null;
}

export interface SingleIngredientState {
	singleIngredient: Ingredient | null;
}

export interface FilteredIngredients {
	bun: Ingredient[];
	sauce: Ingredient[];
	main: Ingredient[];
}

export interface DraggableIngredientProps {
	uid: string;
	index: number;
	item: Ingredient;
}

export interface FeedState {
	orders: Order[];
	total: number;
	totalToday: number;
	wsConnected: boolean;
	wsError: string | null;
	wsCloseInfo: { code: number; reason: string } | null;
	loading: boolean;
	error: string | null;
}

export interface ProfileOrdersState {
	orders: Order[];
	wsConnected: boolean;
	wsError: string | null;
	wsCloseInfo: { code: number; reason: string } | null;
	loading: boolean;
	error: string | null;
}

export enum FeedWsActionTypes {
	WS_CONNECTION_START = 'FEED_WS_CONNECTION_START',
	WS_CONNECTION_SUCCESS = 'FEED_WS_CONNECTION_SUCCESS',
	WS_CONNECTION_ERROR = 'FEED_WS_CONNECTION_ERROR',
	WS_CONNECTION_CLOSED = 'FEED_WS_CONNECTION_CLOSED',
	WS_GET_MESSAGE = 'FEED_WS_GET_MESSAGE',
	WS_SEND_MESSAGE = 'FEED_WS_SEND_MESSAGE',
}

export enum ProfileOrdersWsActionTypes {
	WS_CONNECTION_START = 'PROFILE_ORDERS_WS_CONNECTION_START',
	WS_CONNECTION_SUCCESS = 'PROFILE_ORDERS_WS_CONNECTION_SUCCESS',
	WS_CONNECTION_ERROR = 'PROFILE_ORDERS_WS_CONNECTION_ERROR',
	WS_CONNECTION_CLOSED = 'PROFILE_ORDERS_WS_CONNECTION_CLOSED',
	WS_GET_MESSAGE = 'PROFILE_ORDERS_WS_GET_MESSAGE',
	WS_SEND_MESSAGE = 'PROFILE_ORDERS_WS_SEND_MESSAGE',
}

export interface ProfileOrdersWsAction {
	type: ProfileOrdersWsActionTypes;
	payload?: any;
}

// Action creators for Feed
export const feedWsConnectionStart = createAction<string>(
	FeedWsActionTypes.WS_CONNECTION_START
);
export const feedWsConnectionSuccess = createAction(
	FeedWsActionTypes.WS_CONNECTION_SUCCESS
);
export const feedWsConnectionError = createAction<string>(
	FeedWsActionTypes.WS_CONNECTION_ERROR
);
export const feedWsConnectionClosed = createAction<{
	code: number;
	reason: string;
}>(FeedWsActionTypes.WS_CONNECTION_CLOSED);
export const feedWsGetMessage = createAction<{
	orders: Order[];
	total: number;
	totalToday: number;
	success: boolean;
}>(FeedWsActionTypes.WS_GET_MESSAGE);
export const feedWsSendMessage = createAction<any>(
	FeedWsActionTypes.WS_SEND_MESSAGE
);

// Action creators for ProfileOrders
export const profileOrdersWsConnectionStart = createAction<string>(
	ProfileOrdersWsActionTypes.WS_CONNECTION_START
);
export const profileOrdersWsConnectionSuccess = createAction(
	ProfileOrdersWsActionTypes.WS_CONNECTION_SUCCESS
);
export const profileOrdersWsConnectionError = createAction<string>(
	ProfileOrdersWsActionTypes.WS_CONNECTION_ERROR
);
export const profileOrdersWsConnectionClosed = createAction<{
	code: number;
	reason: string;
}>(ProfileOrdersWsActionTypes.WS_CONNECTION_CLOSED);
export const profileOrdersWsGetMessage = createAction<{
	orders: Order[];
	success: boolean;
}>(ProfileOrdersWsActionTypes.WS_GET_MESSAGE);
export const profileOrdersWsSendMessage = createAction<any>(
	ProfileOrdersWsActionTypes.WS_SEND_MESSAGE
);

// Типы для Feed и WebSocket
export enum WsActionTypes {
	WS_CONNECTION_START = 'WS_CONNECTION_START',
	WS_CONNECTION_SUCCESS = 'WS_CONNECTION_SUCCESS',
	WS_CONNECTION_ERROR = 'WS_CONNECTION_ERROR',
	WS_CONNECTION_CLOSED = 'WS_CONNECTION_CLOSED',
	WS_GET_MESSAGE = 'WS_GET_MESSAGE',
	WS_SEND_MESSAGE = 'WS_SEND_MESSAGE',
}

export const wsGetMessageAction = createAction<{
	orders: Order[];
	total: number;
	totalToday: number;
	success: boolean;
}>(WsActionTypes.WS_GET_MESSAGE);

export interface WsConnectionStart {
	type: WsActionTypes.WS_CONNECTION_START;
	payload: string;
}

export interface WsConnectionSuccess {
	type: WsActionTypes.WS_CONNECTION_SUCCESS;
}

export interface WsConnectionError {
	type: WsActionTypes.WS_CONNECTION_ERROR;
	payload: string;
}

export interface WsConnectionClosed {
	type: WsActionTypes.WS_CONNECTION_CLOSED;
}

export interface WsGetMessage {
	type: WsActionTypes.WS_GET_MESSAGE;
	payload: {
		orders: Order[];
		total: number;
		totalToday: number;
		success: boolean;
	};
}

export interface WsSendMessage {
	type: WsActionTypes.WS_SEND_MESSAGE;
	payload: any;
}

export type WsActions =
	| WsConnectionStart
	| WsConnectionSuccess
	| WsConnectionError
	| WsConnectionClosed
	| WsGetMessage
	| WsSendMessage;

export interface RootState {
	auth: AuthState;
	burgerConstructor: BurgerConstructorState;
	ingredients: IngredientsState;
	order: OrderState;
	pendingOrder: PendingOrderState;
	singleIngredient: SingleIngredientState;
	feed: FeedState;
	profileOrders: ProfileOrdersState;
}
