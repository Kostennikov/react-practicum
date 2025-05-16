import { configureStore, Middleware } from '@reduxjs/toolkit';
import { RootState } from '../types/types';
import ingredientsSlice from './ingredients/reducer';
import orderSlice from './order/reducer';
import constructorSlice from './burger-constructor/reducer';
import singleIngredientSlice from './single-ingredient/reducer';
import authSlice from './auth/reducer';
import pendingOrder from './pending-order/reducer';
import feedSlice from './feed/reducer';
import profileOrdersSlice from './profile-orders/reducer';
import { socketMiddleware } from './middleware/socketMiddleware';
import { wsActionTypes } from './websocket/actions'; // Исправленный импорт

export const store = configureStore({
	reducer: {
		ingredients: ingredientsSlice.reducer,
		order: orderSlice.reducer,
		burgerConstructor: constructorSlice.reducer,
		singleIngredient: singleIngredientSlice.reducer,
		auth: authSlice.reducer,
		pendingOrder: pendingOrder.reducer,
		feed: feedSlice.reducer,
		profileOrders: profileOrdersSlice.reducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: false,
		}).concat([socketMiddleware(wsActionTypes) as Middleware<{}, RootState>]),
});

export type AppDispatch = typeof store.dispatch;
