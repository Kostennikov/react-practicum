import {
	ingredientsReducer,
	fetchIngredients,
} from '../src/services/ingredients/reducer';

// Начальное состояние
const initialState = {
	ingredients: [],
	ingredientsMap: new Map(),
	loading: false,
	error: null,
};

// Пример ингредиента для тестов
const mockIngredients = [
	{
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
	},
	{
		_id: '2',
		name: 'Соус',
		type: 'sauce',
		proteins: 5,
		fat: 10,
		carbohydrates: 15,
		calories: 100,
		price: 50,
		image: 'sauce.jpg',
		image_mobile: 'sauce_mobile.jpg',
		image_large: 'sauce_large.jpg',
		__v: 0,
	},
];

describe('ingredientsReducer', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		jest.spyOn(console, 'error').mockImplementation(() => {});
	});

	afterEach(() => {
		console.error.mockRestore();
	});

	it('should return the initial state', () => {
		expect(ingredientsReducer(undefined, {})).toEqual(initialState);
	});

	describe('fetchIngredients', () => {
		it('should handle fetchIngredients.pending', () => {
			const action = { type: fetchIngredients.pending.type };
			const expectedState = {
				...initialState,
				loading: true,
				error: null,
				ingredients: [],
				ingredientsMap: new Map(),
			};
			expect(ingredientsReducer(initialState, action)).toEqual(expectedState);
		});

		it('should handle fetchIngredients.fulfilled with ingredients', () => {
			const action = {
				type: fetchIngredients.fulfilled.type,
				payload: mockIngredients,
			};
			const expectedMap = new Map([
				['1', mockIngredients[0]],
				['2', mockIngredients[1]],
			]);
			const expectedState = {
				...initialState,
				loading: false,
				ingredients: mockIngredients,
				ingredientsMap: expectedMap,
			};
			expect(ingredientsReducer(initialState, action)).toEqual(expectedState);
		});

		it('should handle fetchIngredients.fulfilled with empty array', () => {
			const action = {
				type: fetchIngredients.fulfilled.type,
				payload: [],
			};
			const expectedState = {
				...initialState,
				loading: false,
				ingredients: [],
				ingredientsMap: new Map(),
			};
			expect(ingredientsReducer(initialState, action)).toEqual(expectedState);
		});

		it('should handle fetchIngredients.rejected', () => {
			const errorMessage = 'Failed to fetch ingredients';
			const action = {
				type: fetchIngredients.rejected.type,
				payload: errorMessage,
			};
			const expectedState = {
				...initialState,
				loading: false,
				error: errorMessage,
				ingredients: [],
				ingredientsMap: new Map(),
			};
			expect(ingredientsReducer(initialState, action)).toEqual(expectedState);
		});
	});
});
