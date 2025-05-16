import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Ingredient, Order } from '../../types/types';
import { fetchOrderByNumber } from '../order/reducer';

interface PendingOrderState {
	pendingOrder: {
		bun: Ingredient | null;
		burgerIngredients: Ingredient[];
	} | null;
	fetchedOrder: Order | null;
	loading: boolean;
	error: string | null;
}

const initialState: PendingOrderState = {
	pendingOrder: null,
	fetchedOrder: null,
	loading: false,
	error: null,
};

const pendingOrderSlice = createSlice({
	name: 'pendingOrder',
	initialState,
	reducers: {
		setPendingOrder(
			state,
			action: PayloadAction<{
				bun: Ingredient | null;
				burgerIngredients: Ingredient[];
			} | null>
		) {
			state.pendingOrder = action.payload;
		},
		clearPendingOrder(state) {
			state.pendingOrder = null;
			state.fetchedOrder = null;
			state.error = null;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchOrderByNumber.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(
				fetchOrderByNumber.fulfilled,
				(state, action: PayloadAction<Order>) => {
					state.loading = false;
					state.fetchedOrder = action.payload;
				}
			)
			.addCase(fetchOrderByNumber.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			});
	},
});

export const { setPendingOrder, clearPendingOrder } = pendingOrderSlice.actions;
export const { reducer: pendingOrderReducer } = pendingOrderSlice;
export default pendingOrderSlice;
