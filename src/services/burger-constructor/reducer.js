import { createSlice, nanoid } from '@reduxjs/toolkit';

const constructorSlice = createSlice({
	name: 'burgerConstructor',
	initialState: {
		bun: null,
		burgerIngredients: [],
	},
	reducers: {
		// Установка булочки
		setBun: (state, action) => {
			state.bun = action.payload;
		},
		// Добавление начинки
		addIngredient: {
			reducer: (state, action) => {
				state.burgerIngredients.push(action.payload);
			},
			prepare: (ingredient) => {
				return {
					payload: {
						...ingredient,
						uid: nanoid(),
					},
				};
			},
		},
		// Удаление начинки по индексу
		removeIngredient: (state, action) => {
			state.burgerIngredients = state.burgerIngredients.filter(
				(_, index) => index !== action.payload
			);
		},
		moveIngredient: (state, action) => {
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
