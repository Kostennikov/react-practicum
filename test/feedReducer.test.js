import { feedReducer } from '../src/services/feed/reducer';
import { wsActionTypes } from '../src/services/websocket/actions';

// Начальное состояние
const initialState = feedReducer(undefined, { type: '' });

// Пример заказов для тестов
const mockOrders = [
	{
		_id: 'order1',
		number: 12345,
		ingredients: ['ingredient1', 'ingredient2'],
		status: 'done',
		name: 'Test Burger 1',
		createdAt: '2025-05-16T12:00:00Z',
		updatedAt: '2025-05-16T12:00:00Z',
	},
	{
		_id: 'order2',
		number: 12346,
		ingredients: ['ingredient3'],
		status: 'pending',
		name: 'Test Burger 2',
		createdAt: '2025-05-16T11:00:00Z',
		updatedAt: '2025-05-16T11:00:00Z',
	},
];

const invalidOrder = {
	_id: 'order3',
	number: 12347,
	ingredients: [], // Отсутствуют некоторые поля
	createdAt: '2025-05-16T10:00:00Z',
};

// Мокаем localStorage
const mockLocalStorage = {
	store: {},
	getItem: jest.fn((key) => mockLocalStorage.store[key] || '{}'),
	setItem: jest.fn((key, value) => {
		mockLocalStorage.store[key] = value;
	}),
	clear: jest.fn(() => {
		mockLocalStorage.store = {};
	}),
};

Object.defineProperty(global, 'localStorage', {
	value: mockLocalStorage,
	writable: true,
});

describe('feedReducer', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockLocalStorage.clear();
	});

	it('should return the initial state', () => {
		expect(feedReducer(undefined, { type: '' })).toEqual(initialState);
	});

	describe('WebSocket actions', () => {
		it('should handle WS_CONNECTION_SUCCESS for feed connection', () => {
			const action = {
				type: wsActionTypes.WS_CONNECTION_SUCCESS,
				payload: { connectionId: 'feed' },
			};
			const expectedState = {
				...initialState,
				wsConnected: true,
				wsError: null,
				wsCloseInfo: null,
			};
			expect(feedReducer(initialState, action)).toEqual(expectedState);
		});

		it('should not handle WS_CONNECTION_SUCCESS for other connectionId', () => {
			const action = {
				type: wsActionTypes.WS_CONNECTION_SUCCESS,
				payload: { connectionId: 'other' },
			};
			expect(feedReducer(initialState, action)).toEqual(initialState);
		});

		it('should handle WS_CONNECTION_ERROR for feed connection', () => {
			const errorMessage = 'Connection failed';
			const action = {
				type: wsActionTypes.WS_CONNECTION_ERROR,
				payload: { connectionId: 'feed', error: errorMessage },
			};
			const expectedState = {
				...initialState,
				wsConnected: false,
				wsError: errorMessage,
			};
			expect(feedReducer(initialState, action)).toEqual(expectedState);
		});

		it('should not handle WS_CONNECTION_ERROR for other connectionId', () => {
			const action = {
				type: wsActionTypes.WS_CONNECTION_ERROR,
				payload: { connectionId: 'other', error: 'Error' },
			};
			expect(feedReducer(initialState, action)).toEqual(initialState);
		});

		it('should handle WS_CONNECTION_CLOSED for feed connection', () => {
			const action = {
				type: wsActionTypes.WS_CONNECTION_CLOSED,
				payload: {
					connectionId: 'feed',
					code: 1006,
					reason: 'Abnormal closure',
				},
			};
			const expectedState = {
				...initialState,
				wsConnected: false,
				wsCloseInfo: { code: 1006, reason: 'Abnormal closure' },
			};
			expect(feedReducer(initialState, action)).toEqual(expectedState);
		});

		it('should not handle WS_CONNECTION_CLOSED for other connectionId', () => {
			const action = {
				type: wsActionTypes.WS_CONNECTION_CLOSED,
				payload: {
					connectionId: 'other',
					code: 1006,
					reason: 'Abnormal closure',
				},
			};
			expect(feedReducer(initialState, action)).toEqual(initialState);
		});

		it('should handle WS_GET_MESSAGE with valid orders', () => {
			const action = {
				type: wsActionTypes.WS_GET_MESSAGE,
				payload: {
					connectionId: 'feed',
					data: {
						success: true,
						orders: mockOrders,
						total: 1000,
						totalToday: 50,
					},
				},
			};
			const expectedOrders = [...mockOrders].sort(
				(a, b) =>
					new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
			);
			const expectedState = {
				...initialState,
				orders: expectedOrders,
				total: 1000,
				totalToday: 50,
			};
			expect(feedReducer(initialState, action)).toEqual(expectedState);
			expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
				'orderMapping',
				JSON.stringify({
					order1: 12345,
					order2: 12346,
				})
			);
		});

		it('should handle WS_GET_MESSAGE with some invalid orders', () => {
			const action = {
				type: wsActionTypes.WS_GET_MESSAGE,
				payload: {
					connectionId: 'feed',
					data: {
						success: true,
						orders: [...mockOrders, invalidOrder],
						total: 1000,
						totalToday: 50,
					},
				},
			};
			const expectedOrders = [...mockOrders].sort(
				(a, b) =>
					new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
			);
			const expectedState = {
				...initialState,
				orders: expectedOrders,
				total: 1000,
				totalToday: 50,
			};
			expect(feedReducer(initialState, action)).toEqual(expectedState);
			expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
				'orderMapping',
				JSON.stringify({
					order1: 12345,
					order2: 12346,
				})
			);
		});

		it('should handle WS_GET_MESSAGE with success: false', () => {
			const action = {
				type: wsActionTypes.WS_GET_MESSAGE,
				payload: {
					connectionId: 'feed',
					data: {
						success: false,
						orders: [],
						total: 0,
						totalToday: 0,
					},
				},
			};
			const expectedState = {
				...initialState,
				wsError: 'Invalid data received',
			};
			expect(feedReducer(initialState, action)).toEqual(expectedState);
			expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
		});

		it('should not handle WS_GET_MESSAGE for other connectionId', () => {
			const action = {
				type: wsActionTypes.WS_GET_MESSAGE,
				payload: {
					connectionId: 'other',
					data: {
						success: true,
						orders: mockOrders,
						total: 1000,
						totalToday: 50,
					},
				},
			};
			expect(feedReducer(initialState, action)).toEqual(initialState);
			expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
		});

		it('should merge new orders with existing orders', () => {
			const existingOrder = {
				_id: 'order3',
				number: 12347,
				ingredients: ['ingredient4'],
				status: 'done',
				name: 'Test Burger 3',
				createdAt: '2025-05-16T10:00:00Z',
				updatedAt: '2025-05-16T10:00:00Z',
			};
			const state = {
				...initialState,
				orders: [existingOrder],
			};
			const newOrder = mockOrders[0];
			const action = {
				type: wsActionTypes.WS_GET_MESSAGE,
				payload: {
					connectionId: 'feed',
					data: {
						success: true,
						orders: [newOrder],
						total: 1000,
						totalToday: 50,
					},
				},
			};
			const expectedOrders = [newOrder, existingOrder].sort(
				(a, b) =>
					new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
			);
			const expectedState = {
				...initialState,
				orders: expectedOrders,
				total: 1000,
				totalToday: 50,
			};
			expect(feedReducer(state, action)).toEqual(expectedState);
			expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
				'orderMapping',
				JSON.stringify({
					order1: 12345,
					order3: 12347,
				})
			);
		});
	});
});
