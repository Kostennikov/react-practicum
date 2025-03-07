import { createSlice } from '@reduxjs/toolkit';

const singleIngredientSlice = createSlice({
	name: 'singleIngredient',
	initialState: null,
	reducers: {
		setSingleIngredient: (state, action) => action.payload,
		clearSingleIngredient: () => null,
	},
});

export const { setSingleIngredient, clearSingleIngredient } =
	singleIngredientSlice.actions;

export const { reducer: singleIngredientReducer } = singleIngredientSlice;
export default singleIngredientSlice;
