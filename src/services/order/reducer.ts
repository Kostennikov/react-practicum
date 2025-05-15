import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ORDER_ENDPOINT } from '../../config';
import { request } from '../../utils/api';
import { OrderState, Order, RootState } from '../../types/types';

const getCookie = (name: string): string | undefined => {
	const matches = document.cookie.match(
		new RegExp(
			'(?:^|; )' + name.replace(/([.$?*|{}()[]\\\/+^])/g, '\\$1') + '=([^;]*)'
		)
	);
	return matches ? decodeURIComponent(matches[1]) : undefined;
};

export const createOrder = createAsyncThunk<
	Order,
	string[],
	{ state: RootState }
>(
	'order/createOrder',
	async (ingredientIds: string[], { getState, rejectWithValue }) => {
		try {
			const { accessToken } = (getState() as RootState).auth;
			if (!accessToken) throw new Error('Токен отсутствует');

			const data = await request(ORDER_ENDPOINT, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${accessToken}`,
				},
				body: JSON.stringify({ ingredients: ingredientIds }),
			});

			console.log('createOrder: API response:', data);

			// Проверяем, что data имеет тип CreateOrderApiResponse
			if ('order' in data) {
				if (!data.success || !data.order) {
					throw new Error(data.message || 'Ошибка создания заказа');
				}
				return data.order as Order;
			} else {
				throw new Error('Некорректный формат ответа API');
			}
		} catch (error: any) {
			console.error('createOrder: Error:', error.message);
			return rejectWithValue(error.message);
		}
	}
);

export const fetchOrderByNumber = createAsyncThunk<
	Order,
	number,
	{ state: RootState }
>(
	'order/fetchOrderByNumber',
	async (number: number, { getState, rejectWithValue }) => {
		try {
			const { accessToken } = (getState() as RootState).auth;
			const headers: HeadersInit = { 'Content-Type': 'application/json' };
			if (accessToken) {
				headers.Authorization = `Bearer ${accessToken}`;
			}

			console.log(`fetchOrderByNumber: Fetching order with number ${number}`);
			const data = await request(`${ORDER_ENDPOINT}/${number}`, {
				method: 'GET',
				headers,
			});

			console.log('fetchOrderByNumber: API response:', data);

			// Проверяем, что data имеет тип FetchOrderByNumberApiResponse
			if ('orders' in data) {
				if (!data.success) {
					throw new Error(data.message || 'Ошибка получения заказа');
				}

				if (
					!data.orders ||
					!Array.isArray(data.orders) ||
					data.orders.length === 0
				) {
					throw new Error('Заказ не найден');
				}

				const order = data.orders[0];
				if (!order._id || !order.number) {
					throw new Error('Некорректные данные заказа');
				}

				return order as Order;
			} else {
				throw new Error('Некорректный формат ответа API');
			}
		} catch (error: any) {
			console.error('fetchOrderByNumber: Error:', error.message);
			return rejectWithValue(error.message);
		}
	}
);

const initialState: OrderState = {
	order: null,
	loading: false,
	error: null,
};

const orderSlice = createSlice({
	name: 'order',
	initialState,
	reducers: {
		clearOrder: (state) => {
			console.log('orderSlice: Clearing order');
			state.order = null;
			state.error = null;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(createOrder.pending, (state) => {
				console.log('createOrder: Pending');
				state.loading = true;
				state.error = null;
				state.order = null;
			})
			.addCase(createOrder.fulfilled, (state, action: PayloadAction<Order>) => {
				console.log('createOrder: Fulfilled, order:', action.payload);
				state.loading = false;
				state.order = action.payload;
			})
			.addCase(createOrder.rejected, (state, action) => {
				console.log('createOrder: Rejected, error:', action.payload);
				state.order = null;
				state.loading = false;
				state.error = action.payload as string;
			})
			.addCase(fetchOrderByNumber.pending, (state) => {
				console.log('fetchOrderByNumber: Pending');
				state.loading = true;
				state.error = null;
			})
			.addCase(
				fetchOrderByNumber.fulfilled,
				(state, action: PayloadAction<Order>) => {
					console.log('fetchOrderByNumber: Fulfilled, order:', action.payload);
					state.loading = false;
					state.order = action.payload;
				}
			)
			.addCase(fetchOrderByNumber.rejected, (state, action) => {
				console.log('fetchOrderByNumber: Rejected, error:', action.payload);
				state.loading = false;
				state.error = action.payload as string;
			});
	},
});

export const { clearOrder } = orderSlice.actions;
export const { reducer: orderReducer } = orderSlice;
export default orderSlice;
