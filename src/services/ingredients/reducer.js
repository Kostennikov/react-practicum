import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_URL } from '../../config';

export const fetchIngredients = createAsyncThunk(
	'ingredients/fetchIngredients',
	async (_, { rejectWithValue }) => {
		try {
			const response = await fetch(API_URL);
			if (!response.ok) {
				throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
			}
			const data = await response.json();
			if (!data.data || !Array.isArray(data.data)) {
				throw new Error('Некорректный формат ответа сервера');
			}
			return data.data;
		} catch (error) {
			return rejectWithValue(error.message);
		}
	}
);

const ingredientsSlice = createSlice({
	name: 'ingredients',
	initialState: {
		ingredients: [],
		loading: false,
		error: null,
	},
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(fetchIngredients.pending, (state) => {
				state.loading = true;
				state.error = null;
				state.ingredients = [];
			})
			.addCase(fetchIngredients.fulfilled, (state, action) => {
				state.loading = false;
				state.ingredients = action.payload.length ? action.payload : [];
			})
			.addCase(fetchIngredients.rejected, (state, action) => {
				console.error('Ошибка загрузки ингредиентов:', action.payload);
				state.loading = false;
				state.error = action.payload || 'Неизвестная ошибка';
				state.ingredients = [];

				// return { ...initialState, error: action.payload };
			});
	},
});

export const { reducer: ingredientsReducer } = ingredientsSlice;
export default ingredientsSlice;
