import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { INGREDIENTS_ENDPOINT } from '../../config';
import { request } from '../../utils/api';
import { IngredientsState, Ingredient } from '../../types/types';

export const fetchIngredients = createAsyncThunk(
	'ingredients/fetchIngredients',
	async (_, { rejectWithValue }) => {
		try {
			const data = await request(INGREDIENTS_ENDPOINT);
			if (!data.data || !Array.isArray(data.data)) {
				throw new Error('Некорректный формат ответа сервера');
			}
			return data.data;
		} catch (error: any) {
			return rejectWithValue(error.message);
		}
	}
);

const initialState: IngredientsState = {
	ingredients: [],
	ingredientsMap: new Map<string, Ingredient>(),
	loading: false,
	error: null,
};

const ingredientsSlice = createSlice({
	name: 'ingredients',
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(fetchIngredients.pending, (state) => {
				state.loading = true;
				state.error = null;
				state.ingredients = [];
				state.ingredientsMap = new Map<string, Ingredient>();
			})
			.addCase(
				fetchIngredients.fulfilled,
				(state, action: PayloadAction<Ingredient[]>) => {
					state.loading = false;
					state.ingredients = action.payload.length ? action.payload : [];
					state.ingredientsMap = new Map(
						action.payload.map((item) => [item._id, item])
					);
				}
			)
			.addCase(fetchIngredients.rejected, (state, action) => {
				console.error('Ошибка загрузки ингредиентов:', action.payload);
				state.loading = false;
				state.error = action.payload as string;
				state.ingredients = [];
				state.ingredientsMap = new Map<string, Ingredient>();
			});
	},
});

export const { reducer: ingredientsReducer } = ingredientsSlice;
export default ingredientsSlice;
