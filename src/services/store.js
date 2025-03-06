// src/services/store.js
import { combineSlices, configureStore as createStore } from '@reduxjs/toolkit';
import ingredientsSlice from './ingredients/reducer.js'; // Импортируем весь slice
import orderSlice from './order/reducer.js';
import constructorSlice from './burger-constructor/reducer.js';
import singleIngredientSlice from './single-ingredient/reducer.js';

// Объединяем slices
const rootReducer = combineSlices(
	ingredientsSlice,
	orderSlice,
	constructorSlice,
	singleIngredientSlice
);

export const configureStore = (initialState) => {
	return createStore({
		reducer: rootReducer,
		preloadedState: initialState,
	});
};
