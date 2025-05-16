import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';
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
	_id: string;
	number: number;
	name: string;
	status: 'created' | 'pending' | 'done';
	ingredients: string[];
	createdAt: string;
	updatedAt: string;
	success?: boolean;
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

export interface WsActionTypes {
	WS_CONNECTION_START: string;
	WS_CONNECTION_SUCCESS: string;
	WS_CONNECTION_ERROR: string;
	WS_CONNECTION_CLOSED: string;
	WS_GET_MESSAGE: string;
	WS_SEND_MESSAGE: string;
	WS_CONNECTION_CLOSE: string;
}

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

export type AppDispatch = ThunkDispatch<RootState, unknown, AnyAction>;
