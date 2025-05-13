// services/store.ts
import { configureStore } from '@reduxjs/toolkit';
import { combineSlices } from '@reduxjs/toolkit';
import ingredientsSlice from './ingredients/reducer';
import orderSlice from './order/reducer';
import constructorSlice from './burger-constructor/reducer';
import singleIngredientSlice from './single-ingredient/reducer';
import authSlice from './auth/reducer';
import pendingOrder from './pending-order/reducer';
import feedSlice from './feed/reducer';
import { socketMiddleware } from './middleware/socketMiddleware';
import { RootState } from '../types/types';

const wsUrl = 'wss://norma.nomoreparties.space/orders/all';

const rootReducer = combineSlices(
	ingredientsSlice,
	orderSlice,
	constructorSlice,
	singleIngredientSlice,
	authSlice,
	pendingOrder,
	feedSlice
);

export const configureStoreFun = (initialState?: any) => {
	return configureStore({
		reducer: rootReducer,
		preloadedState: initialState,
		middleware: (getDefaultMiddleware) =>
			getDefaultMiddleware({
				serializableCheck: false, // Отключаем проверку сериализуемости для WebSocket
			}).concat(socketMiddleware(wsUrl)),
	});
};

export type AppDispatch = ReturnType<typeof configureStore>['dispatch'];
