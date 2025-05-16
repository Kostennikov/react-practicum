import { profileOrdersReducer } from '../src/services/profile-orders/reducer';
import { wsActionTypes } from '../src/services/websocket/actions';

// Начальное состояние
const initialState = {
	orders: [],
	wsConnected: false,
	wsError: null,
	wsCloseInfo: null,
	loading: false,
	error: null,
};

// Пример заказов для тестов
const mockOrders = [
	{
		_id: 'order1',
		number: 12345,
		ingredients: ['ingredient1', 'ingredient2'],
		status: 'pending',
		name: 'Test Burger 1',
		createdAt: '2025-05-16T12:00:00Z',
		updatedAt: '2025-05-16T12:00:00Z',
	},
	{
		_id: 'order2',
		number: 12346,
		ingredients: ['ingredient3'],
		status: 'done',
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

// Мокаем Date
const mockDate = new Date('2025-05-16T12:00:30Z').getTime();
jest.spyOn(global, 'Date').mockImplementation((arg) => {
	if (arg) {
		return new Date(arg); // Для new Date(order.createdAt)
	}
	return new Date(mockDate); // Для new Date()
});

// Для отладки: мокаем Date.now
Date.now = jest.fn(() => mockDate);

describe('profileOrdersReducer', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it('should return the initial state', () => {
		expect(profileOrdersReducer(undefined, {})).toEqual(initialState);
	});

	describe('WebSocket actions', () => {
		it('should handle WS_CONNECTION_SUCCESS for profile connection', () => {
			const action = {
				type: wsActionTypes.WS_CONNECTION_SUCCESS,
				payload: { connectionId: 'profile' },
			};
			const expectedState = {
				...initialState,
				wsConnected: true,
				wsError: null,
				wsCloseInfo: null,
			};
			expect(profileOrdersReducer(initialState, action)).toEqual(expectedState);
		});

		it('should not handle WS_CONNECTION_SUCCESS for other connectionId', () => {
			const action = {
				type: wsActionTypes.WS_CONNECTION_SUCCESS,
				payload: { connectionId: 'feed' },
			};
			expect(profileOrdersReducer(initialState, action)).toEqual(initialState);
		});

		it('should handle WS_CONNECTION_ERROR for profile connection', () => {
			const errorMessage = 'Connection failed';
			const action = {
				type: wsActionTypes.WS_CONNECTION_ERROR,
				payload: { connectionId: 'profile', error: errorMessage },
			};
			const expectedState = {
				...initialState,
				wsConnected: false,
				wsError: errorMessage,
			};
			expect(profileOrdersReducer(initialState, action)).toEqual(expectedState);
		});

		it('should not handle WS_CONNECTION_ERROR for other connectionId', () => {
			const action = {
				type: wsActionTypes.WS_CONNECTION_ERROR,
				payload: { connectionId: 'feed', error: 'Error' },
			};
			expect(profileOrdersReducer(initialState, action)).toEqual(initialState);
		});

		it('should handle WS_CONNECTION_CLOSED for profile connection', () => {
			const action = {
				type: wsActionTypes.WS_CONNECTION_CLOSED,
				payload: {
					connectionId: 'profile',
					code: 1006,
					reason: 'Abnormal closure',
				},
			};
			const expectedState = {
				...initialState,
				wsConnected: false,
				wsCloseInfo: { code: 1006, reason: 'Abnormal closure' },
			};
			expect(profileOrdersReducer(initialState, action)).toEqual(expectedState);
		});

		it('should not handle WS_CONNECTION_CLOSED for other connectionId', () => {
			const action = {
				type: wsActionTypes.WS_CONNECTION_CLOSED,
				payload: {
					connectionId: 'feed',
					code: 1006,
					reason: 'Abnormal closure',
				},
			};
			expect(profileOrdersReducer(initialState, action)).toEqual(initialState);
		});

		it('should handle WS_GET_MESSAGE with valid orders and update status', () => {
			const action = {
				type: wsActionTypes.WS_GET_MESSAGE,
				payload: {
					connectionId: 'profile',
					data: {
						success: true,
						orders: mockOrders,
					},
				},
			};
			const expectedOrders = [
				{ ...mockOrders[0], status: 'pending' }, // createdAt в прошлом (>15 сек), статус меняется
				mockOrders[1], // Статус остаётся pending
			];
			const expectedState = {
				...initialState,
				orders: expectedOrders,
			};
			const result = profileOrdersReducer(initialState, action);
			expect(result).toEqual(expectedState);
		});

		it('should handle WS_GET_MESSAGE with some invalid orders', () => {
			const action = {
				type: wsActionTypes.WS_GET_MESSAGE,
				payload: {
					connectionId: 'profile',
					data: {
						success: true,
						orders: [...mockOrders, invalidOrder],
					},
				},
			};
			const expectedOrders = [
				{ ...mockOrders[0], status: 'pending' }, // createdAt в прошлом, статус меняется
				mockOrders[1], // Статус остаётся pending
			];
			const expectedState = {
				...initialState,
				orders: expectedOrders,
			};
			expect(profileOrdersReducer(initialState, action)).toEqual(expectedState);
		});

		it('should handle WS_GET_MESSAGE with success: false', () => {
			const action = {
				type: wsActionTypes.WS_GET_MESSAGE,
				payload: {
					connectionId: 'profile',
					data: {
						success: false,
						orders: [],
					},
				},
			};
			const expectedState = {
				...initialState,
				wsError: 'Invalid data received',
			};
			expect(profileOrdersReducer(initialState, action)).toEqual(expectedState);
		});

		it('should not handle WS_GET_MESSAGE for other connectionId', () => {
			const action = {
				type: wsActionTypes.WS_GET_MESSAGE,
				payload: {
					connectionId: 'feed',
					data: {
						success: true,
						orders: mockOrders,
					},
				},
			};
			expect(profileOrdersReducer(initialState, action)).toEqual(initialState);
		});

		it('should not update status if order is recent', () => {
			const recentOrder = [
				{
					...mockOrders[0],
					createdAt: '2025-05-16T12:00:20Z', // 10 секунд назад
				},
				mockOrders[1],
			];
			const action = {
				type: wsActionTypes.WS_GET_MESSAGE,
				payload: {
					connectionId: 'profile',
					data: {
						success: true,
						orders: recentOrder,
					},
				},
			};
			const expectedOrders = [
				recentOrder[0], // Статус остаётся created, так как <15 сек
				recentOrder[1], // Статус остаётся pending
			];
			const expectedState = {
				...initialState,
				orders: expectedOrders,
			};
			expect(profileOrdersReducer(initialState, action)).toEqual(expectedState);
		});

		it('should not handle unrelated WebSocket action', () => {
			const action = {
				type: 'UNRELATED_WS_ACTION',
				payload: { connectionId: 'profile' },
			};
			expect(profileOrdersReducer(initialState, action)).toEqual(initialState);
		});
	});
});
