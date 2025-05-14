import { createSlice, nanoid, PayloadAction } from '@reduxjs/toolkit';
import { Ingredient } from '../../types/types';

interface ConstructorState {
	bun: Ingredient | null;
	burgerIngredients: Ingredient[];
}

const initialState: ConstructorState = {
	bun: null,
	burgerIngredients: [],
};

const constructorSlice = createSlice({
	name: 'burgerConstructor',
	initialState,
	reducers: {
		// Установка булочки
		setBun: (state, action: PayloadAction<Ingredient | null>) => {
			state.bun = action.payload;
		},
		// Добавление начинки
		addIngredient: {
			reducer: (state, action: PayloadAction<Ingredient>) => {
				state.burgerIngredients.push(action.payload);
			},
			prepare: (ingredient: Ingredient) => {
				return {
					payload: {
						...ingredient,
						uid: nanoid(),
					},
				};
			},
		},
		// Удаление начинки по индексу
		removeIngredient: (state, action: PayloadAction<number>) => {
			state.burgerIngredients = state.burgerIngredients.filter(
				(_, index) => index !== action.payload
			);
		},
		moveIngredient: (
			state,
			action: PayloadAction<{ fromIndex: number; toIndex: number }>
		) => {
			const { fromIndex, toIndex } = action.payload;
			if (
				fromIndex >= 0 &&
				toIndex >= 0 &&
				fromIndex < state.burgerIngredients.length &&
				toIndex < state.burgerIngredients.length
			) {
				const movedItem = state.burgerIngredients[fromIndex];
				state.burgerIngredients.splice(fromIndex, 1);
				state.burgerIngredients.splice(toIndex, 0, movedItem);
			}
		},
		// Очистка
		clearConstructor: (state) => {
			state.bun = null;
			state.burgerIngredients = [];
		},
	},
});

export const {
	setBun,
	addIngredient,
	removeIngredient,
	moveIngredient,
	clearConstructor,
} = constructorSlice.actions;

export const { reducer: burgerConstructorReducer } = constructorSlice;
export default constructorSlice;
