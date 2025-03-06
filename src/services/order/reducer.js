import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_URL } from '../../config';

// Асинхронный экшен для создания заказа
export const createOrder = createAsyncThunk(
	'order/createOrder',
	async (ingredientIds, { rejectWithValue }) => {
		try {
			const response = await fetch(`${API_URL}/orders`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ ingredients: ingredientIds }), // Передаем массив ID ингредиентов
			});
			if (!response.ok) {
				throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
			}
			const data = await response.json();
			return data; // Ожидаем, что API вернет объект, например { success: true, order: { number: 12345 } }
		} catch (error) {
			return rejectWithValue(error.message);
		}
	}
);

const orderSlice = createSlice({
	name: 'order',
	initialState: {
		order: null, // Данные о заказе
		loading: false, // Состояние загрузки заказа
		error: null, // Ошибка при создании заказа
	},
	reducers: {
		// Действие для очистки данных заказа
		clearOrder: (state) => {
			state.order = null;
			state.error = null;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(createOrder.pending, (state) => {
				state.loading = true;
				state.error = null;
				state.order = null; // Сбрасываем предыдущий заказ
			})
			.addCase(createOrder.fulfilled, (state, action) => {
				state.loading = false;
				state.order = action.payload; // Сохраняем данные заказа
			})
			.addCase(createOrder.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			});
	},
});

export const { clearOrder } = orderSlice.actions;
// export default orderSlice.reducer;

export const { reducer: orderReducer } = orderSlice; // Экспортируем редьюсер
export default orderSlice; // Экспортируем весь slice как default
