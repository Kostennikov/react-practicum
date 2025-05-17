import {
	singleIngredientReducer,
	setSingleIngredient,
	clearSingleIngredient,
} from '../src/services/single-ingredient/reducer';

// Начальное состояние
const initialState = singleIngredientReducer(undefined, { type: '' });

// Пример ингредиента для тестов
const mockIngredient = {
	_id: '1',
	name: 'Булка',
	type: 'bun',
	proteins: 10,
	fat: 20,
	carbohydrates: 30,
	calories: 200,
	price: 100,
	image: 'bun.jpg',
	image_mobile: 'bun_mobile.jpg',
	image_large: 'bun_large.jpg',
	__v: 0,
};

describe('singleIngredientReducer', () => {
	it('should return the initial state', () => {
		expect(singleIngredientReducer(undefined, { type: '' })).toEqual(
			initialState
		);
	});

	describe('Synchronous actions', () => {
		it('should handle setSingleIngredient with ingredient', () => {
			const action = setSingleIngredient(mockIngredient);
			const expectedState = {
				...initialState,
				singleIngredient: mockIngredient,
			};
			expect(singleIngredientReducer(initialState, action)).toEqual(
				expectedState
			);
		});

		it('should handle setSingleIngredient with null', () => {
			const state = {
				...initialState,
				singleIngredient: mockIngredient,
			};
			const action = setSingleIngredient(null);
			const expectedState = {
				...initialState,
				singleIngredient: null,
			};
			expect(singleIngredientReducer(state, action)).toEqual(expectedState);
		});

		it('should handle clearSingleIngredient', () => {
			const state = {
				...initialState,
				singleIngredient: mockIngredient,
			};
			const action = clearSingleIngredient();
			const expectedState = {
				...initialState,
				singleIngredient: null,
			};
			expect(singleIngredientReducer(state, action)).toEqual(expectedState);
		});
	});
});
