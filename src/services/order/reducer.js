import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ORDER_ENDPOINT } from '../../config';
import { request } from '../../utils/api';

export const createOrder = createAsyncThunk(
	'order/createOrder',
	async (ingredientIds, { rejectWithValue }) => {
		try {
			const data = await request(ORDER_ENDPOINT, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ ingredients: ingredientIds }),
			});
			return data;
		} catch (error) {
			return rejectWithValue(error.message);
		}
	}
);

const orderSlice = createSlice({
	name: 'order',
	initialState: {
		order: null,
		loading: false,
		error: null,
	},
	reducers: {
		// Очистка
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
				state.order = null; // сброс
			})
			.addCase(createOrder.fulfilled, (state, action) => {
				state.loading = false;
				state.order = action.payload; // сохраняем
			})
			.addCase(createOrder.rejected, (state, action) => {
				state.order = null;
				state.loading = false;
				state.error = action.payload;
				// return { ...initialState, error: action.payload };
			});
	},
});

export const { clearOrder } = orderSlice.actions;

export const { reducer: orderReducer } = orderSlice;
export default orderSlice;
