import {
	burgerConstructorReducer,
	setBun,
	addIngredient,
	removeIngredient,
	moveIngredient,
	clearConstructor,
} from '../src/services/burger-constructor/reducer';
import { nanoid } from '@reduxjs/toolkit';

// Мокаем nanoid для предсказуемых значений
jest.mock('@reduxjs/toolkit', () => ({
	...jest.requireActual('@reduxjs/toolkit'),
	nanoid: jest.fn(),
}));

// Начальное состояние
const initialState = {
	bun: null,
	burgerIngredients: [],
};

// Пример ингредиентов для тестов
const mockBun = {
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

const mockIngredient1 = {
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
};

const mockIngredient2 = {
	_id: '3',
	name: 'Котлета',
	type: 'main',
	proteins: 15,
	fat: 25,
	carbohydrates: 5,
	calories: 300,
	price: 150,
	image: 'patty.jpg',
	image_mobile: 'patty_mobile.jpg',
	image_large: 'patty_large.jpg',
	__v: 0,
};

describe('burgerConstructorReducer', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		// Устанавливаем предсказуемые значения для nanoid
		nanoid.mockReturnValue('mocked-uid');
	});

	it('should return the initial state', () => {
		expect(burgerConstructorReducer(undefined, {})).toEqual(initialState);
	});

	describe('Synchronous actions', () => {
		it('should handle setBun with ingredient', () => {
			const action = setBun(mockBun);
			const expectedState = {
				...initialState,
				bun: mockBun,
			};
			expect(burgerConstructorReducer(initialState, action)).toEqual(
				expectedState
			);
		});

		it('should handle setBun with null', () => {
			const state = {
				...initialState,
				bun: mockBun,
			};
			const action = setBun(null);
			const expectedState = {
				...initialState,
				bun: null,
			};
			expect(burgerConstructorReducer(state, action)).toEqual(expectedState);
		});

		it('should handle addIngredient', () => {
			const action = addIngredient(mockIngredient1);
			const expectedState = {
				...initialState,
				burgerIngredients: [
					{
						...mockIngredient1,
						uid: 'mocked-uid',
					},
				],
			};
			expect(burgerConstructorReducer(initialState, action)).toEqual(
				expectedState
			);
		});

		it('should handle removeIngredient', () => {
			const state = {
				...initialState,
				burgerIngredients: [
					{ ...mockIngredient1, uid: 'uid1' },
					{ ...mockIngredient2, uid: 'uid2' },
				],
			};
			const action = removeIngredient(1);
			const expectedState = {
				...initialState,
				burgerIngredients: [{ ...mockIngredient1, uid: 'uid1' }],
			};
			expect(burgerConstructorReducer(state, action)).toEqual(expectedState);
		});

		it('should handle moveIngredient', () => {
			const state = {
				...initialState,
				burgerIngredients: [
					{ ...mockIngredient1, uid: 'uid1' },
					{ ...mockIngredient2, uid: 'uid2' },
				],
			};
			const action = moveIngredient({ fromIndex: 0, toIndex: 1 });
			const expectedState = {
				...initialState,
				burgerIngredients: [
					{ ...mockIngredient2, uid: 'uid2' },
					{ ...mockIngredient1, uid: 'uid1' },
				],
			};
			expect(burgerConstructorReducer(state, action)).toEqual(expectedState);
		});

		it('should not modify state on moveIngredient with invalid indices', () => {
			const state = {
				...initialState,
				burgerIngredients: [
					{ ...mockIngredient1, uid: 'uid1' },
					{ ...mockIngredient2, uid: 'uid2' },
				],
			};
			const action = moveIngredient({ fromIndex: -1, toIndex: 10 });
			expect(burgerConstructorReducer(state, action)).toEqual(state);
		});

		it('should handle clearConstructor', () => {
			const state = {
				bun: mockBun,
				burgerIngredients: [
					{ ...mockIngredient1, uid: 'uid1' },
					{ ...mockIngredient2, uid: 'uid2' },
				],
			};
			const action = clearConstructor();
			const expectedState = {
				...initialState,
				bun: null,
				burgerIngredients: [],
			};
			expect(burgerConstructorReducer(state, action)).toEqual(expectedState);
		});
	});
});
