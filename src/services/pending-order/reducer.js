import { createSlice } from '@reduxjs/toolkit';

const initialState = {
	pendingOrder: null, // Храним ингредиенты заказа (bun и burgerIngredients)
};

const pendingOrderSlice = createSlice({
	name: 'pendingOrder',
	initialState,
	reducers: {
		setPendingOrder(state, action) {
			state.pendingOrder = action.payload;
		},
		clearPendingOrder(state) {
			state.pendingOrder = null;
		},
	},
});

export const { setPendingOrder, clearPendingOrder } = pendingOrderSlice.actions;
// export default pendingOrderSlice.reducer;
export const { reducer: pendingOrderReducer } = pendingOrderSlice;
export default pendingOrderSlice;
