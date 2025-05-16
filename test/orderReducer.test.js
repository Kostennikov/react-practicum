import {
	orderReducer,
	clearOrder,
	createOrder,
	fetchOrderByNumber,
} from '../src/services/order/reducer';

// Начальное состояние
const initialState = {
	order: null,
	loading: false,
	error: null,
};

// Пример заказа для тестов
const mockOrder = {
	_id: 'order123',
	number: 12345,
	ingredients: ['ingredient1', 'ingredient2'],
	status: 'done',
	name: 'Test Burger',
	createdAt: '2025-05-16T12:00:00Z',
	updatedAt: '2025-05-16T12:00:00Z',
};

describe('orderReducer', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		// Мокаем console.log и console.error
		jest.spyOn(console, 'log').mockImplementation(() => {});
		jest.spyOn(console, 'error').mockImplementation(() => {});
	});

	afterEach(() => {
		console.log.mockRestore();
		console.error.mockRestore();
	});

	it('should return the initial state', () => {
		expect(orderReducer(undefined, {})).toEqual(initialState);
	});

	describe('Synchronous actions', () => {
		it('should handle clearOrder', () => {
			const state = {
				...initialState,
				order: mockOrder,
				error: 'Some error',
			};
			const action = clearOrder();
			const expectedState = {
				...initialState,
				order: null,
				error: null,
			};
			expect(orderReducer(state, action)).toEqual(expectedState);
		});
	});

	describe('Asynchronous actions', () => {
		describe('createOrder', () => {
			it('should handle createOrder.pending', () => {
				const action = { type: createOrder.pending.type };
				const expectedState = {
					...initialState,
					loading: true,
					error: null,
					order: null,
				};
				expect(orderReducer(initialState, action)).toEqual(expectedState);
			});

			it('should handle createOrder.fulfilled', () => {
				const action = {
					type: createOrder.fulfilled.type,
					payload: mockOrder,
				};
				const expectedState = {
					...initialState,
					loading: false,
					order: mockOrder,
				};
				expect(orderReducer(initialState, action)).toEqual(expectedState);
			});

			it('should handle createOrder.rejected', () => {
				const errorMessage = 'Failed to create order';
				const action = {
					type: createOrder.rejected.type,
					payload: errorMessage,
				};
				const expectedState = {
					...initialState,
					loading: false,
					error: errorMessage,
					order: null,
				};
				expect(orderReducer(initialState, action)).toEqual(expectedState);
			});
		});

		describe('fetchOrderByNumber', () => {
			it('should handle fetchOrderByNumber.pending', () => {
				const action = { type: fetchOrderByNumber.pending.type };
				const expectedState = {
					...initialState,
					loading: true,
					error: null,
				};
				expect(orderReducer(initialState, action)).toEqual(expectedState);
			});

			it('should handle fetchOrderByNumber.fulfilled', () => {
				const action = {
					type: fetchOrderByNumber.fulfilled.type,
					payload: mockOrder,
				};
				const expectedState = {
					...initialState,
					loading: false,
					order: mockOrder,
				};
				expect(orderReducer(initialState, action)).toEqual(expectedState);
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
				expect(orderReducer(initialState, action)).toEqual(expectedState);
			});
		});
	});
});
