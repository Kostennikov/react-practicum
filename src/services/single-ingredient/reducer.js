import { createSlice } from '@reduxjs/toolkit';

const singleIngredientSlice = createSlice({
	name: 'singleIngredient',
	initialState: null, // Перетаскиваемый ингредиент
	reducers: {
		setSingleIngredient: (state, action) => action.payload, // Устанавливаем ингредиент
		clearSingleIngredient: () => null, // Очищаем после завершения перетаскивания
	},
});

export const { setSingleIngredient, clearSingleIngredient } =
	singleIngredientSlice.actions;

// export default singleIngredientSlice.reducer;

export const { reducer: singleIngredientReducer } = singleIngredientSlice; // Экспортируем редьюсер
export default singleIngredientSlice; // Экспортируем весь slice как default
