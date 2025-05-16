import {
	pendingOrderReducer,
	setPendingOrder,
	clearPendingOrder,
} from '../src/services/pending-order/reducer';
import { fetchOrderByNumber } from '../src/services/order/reducer';

// Начальное состояние
const initialState = pendingOrderReducer(undefined, { type: '' });

// Пример ингредиентов и заказа для тестов
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

const mockIngredient = {
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
	uid: 'uid1',
};

const mockPendingOrder = {
	bun: mockBun,
	burgerIngredients: [mockIngredient],
};

const mockOrder = {
	_id: 'order123',
	number: 12345,
	ingredients: ['1', '2'],
	status: 'done',
	name: 'Test Burger',
	createdAt: '2025-05-16T12:00:00Z',
	updatedAt: '2025-05-16T12:00:00Z',
};

describe('pendingOrderReducer', () => {
	it('should return the initial state', () => {
		expect(pendingOrderReducer(undefined, { type: '' })).toEqual(initialState);
	});

	describe('Synchronous actions', () => {
		it('should handle setPendingOrder with order', () => {
			const action = setPendingOrder(mockPendingOrder);
			const expectedState = {
				...initialState,
				pendingOrder: mockPendingOrder,
			};
			expect(pendingOrderReducer(initialState, action)).toEqual(expectedState);
		});

		it('should handle setPendingOrder with null', () => {
			const state = {
				...initialState,
				pendingOrder: mockPendingOrder,
			};
			const action = setPendingOrder(null);
			const expectedState = {
				...initialState,
				pendingOrder: null,
			};
			expect(pendingOrderReducer(state, action)).toEqual(expectedState);
		});

		it('should handle clearPendingOrder', () => {
			const state = {
				...initialState,
				pendingOrder: mockPendingOrder,
				fetchedOrder: mockOrder,
				error: 'Some error',
			};
			const action = clearPendingOrder();
			const expectedState = {
				...initialState,
				pendingOrder: null,
				fetchedOrder: null,
				error: null,
			};
			expect(pendingOrderReducer(state, action)).toEqual(expectedState);
		});
	});

	describe('Asynchronous actions', () => {
		describe('fetchOrderByNumber', () => {
			it('should handle fetchOrderByNumber.pending', () => {
				const action = { type: fetchOrderByNumber.pending.type };
				const expectedState = {
					...initialState,
					loading: true,
					error: null,
				};
				expect(pendingOrderReducer(initialState, action)).toEqual(
					expectedState
				);
			});

			it('should handle fetchOrderByNumber.fulfilled', () => {
				const action = {
					type: fetchOrderByNumber.fulfilled.type,
					payload: mockOrder,
				};
				const expectedState = {
					...initialState,
					loading: false,
					fetchedOrder: mockOrder,
				};
				expect(pendingOrderReducer(initialState, action)).toEqual(
					expectedState
				);
			});

			it('should handle fetchOrderByNumber.rejected', () => {
				const errorMessage = 'Failed to fetch order';
				const action = {
					type: fetchOrderByNumber.rejected.type,
					payload: errorMessage,
				};
				const expectedState = {
					...initialState,
					loading: false,
					error: errorMessage,
				};
				expect(pendingOrderReducer(initialState, action)).toEqual(
					expectedState
				);
			});
		});
	});
});
