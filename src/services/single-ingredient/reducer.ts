import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Ingredient, SingleIngredientState } from '../../types/types';

const initialState: SingleIngredientState = {
	singleIngredient: null,
};

const singleIngredientSlice = createSlice({
	name: 'singleIngredient',
	initialState,
	reducers: {
		setSingleIngredient: (state, action: PayloadAction<Ingredient | null>) => {
			state.singleIngredient = action.payload;
		},
		clearSingleIngredient: (state) => {
			state.singleIngredient = null;
		},
	},
});

export const { setSingleIngredient, clearSingleIngredient } =
	singleIngredientSlice.actions;
export const { reducer: singleIngredientReducer } = singleIngredientSlice;
export default singleIngredientSlice;
