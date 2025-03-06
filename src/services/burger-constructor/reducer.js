import { createSlice } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

const constructorSlice = createSlice({
	name: 'burgerConstructor',
	initialState: {
		bun: '', // Выбранная булочка
		burgerIngredients: [], // Список начинок
	},
	reducers: {
		// Установка булочки (случайная или конкретная)
		setBun: (state, action) => {
			state.bun = action.payload;
		},
		// Добавление начинки
		addIngredient: (state, action) => {
			// state.burgerIngredients.push(action.payload);
			state.burgerIngredients.push(action.payload.ingredient || action.payload);
			// state.burgerIngredients.push({
			// 	...action.payload.ingredient,
			// 	uid: uuidv4(),
			// });
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
				console.log(
					'%csrc/services/burger-constructor/reducer.js:39 movedItem',
					'color: #007acc;',
					movedItem
				);
				state.burgerIngredients.splice(fromIndex, 1);
				state.burgerIngredients.splice(toIndex, 0, movedItem);
			}
		},
		// Очистка конструктора
		clearConstructor: (state) => {
			state.bun = null;
			state.burgerIngredients = []; // Исправлено
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

export const { reducer: burgerConstructorReducer } = constructorSlice; // Экспортируем редьюсер
export default constructorSlice; // Экспортируем весь slice как default
