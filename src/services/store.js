import { combineSlices, configureStore as createStore } from '@reduxjs/toolkit';
import ingredientsSlice from './ingredients/reducer.js';
import orderSlice from './order/reducer.js';
import constructorSlice from './burger-constructor/reducer.js';
import singleIngredientSlice from './single-ingredient/reducer.js';
import authSlice from './auth/reducer.js';
import pendingOrder from './pending-order/reducer.js';
import { composeWithDevTools } from '@redux-devtools/extension';

const rootReducer = combineSlices(
	ingredientsSlice,
	orderSlice,
	constructorSlice,
	singleIngredientSlice,
	authSlice,
	pendingOrder
);

export const configureStore = (initialState) => {
	return createStore({
		reducer: rootReducer,
		preloadedState: initialState,
		composeWithDevTools,
	});
};
