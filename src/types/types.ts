export interface Ingredient {
	_id: string;
	name: string;
	type: 'bun' | 'main' | 'sauce';
	proteins: number;
	fat: number;
	carbohydrates: number;
	calories: number;
	price: number;
	image: string;
	image_mobile?: string;
	image_large?: string;
	__v?: number;
	uid?: string;
}

export interface User {
	name: string;
	email: string;
}

export interface Order {
	order: {
		number: number;
	};
	name: string;
	success: boolean;
}

export interface BurgerConstructorState {
	bun: Ingredient | null;
	burgerIngredients: Ingredient[];
}

export interface AuthState {
	user: User | null;
	loading: boolean;
	error: string | null;
	authChecked: boolean;
	resetPasswordAllowed: boolean;
}

export interface IngredientsState {
	ingredients: Ingredient[];
	loading: boolean;
	error: string | null;
}

export interface OrderState {
	order: Order | null;
	loading: boolean;
	error: string | null;
}

export interface PendingOrderState {
	pendingOrder: BurgerConstructorState | null;
}

export interface SingleIngredientState {
	singleIngredient: Ingredient | null;
}

export interface FilteredIngredients {
	bun: Ingredient[];
	sauce: Ingredient[];
	main: Ingredient[];
}

export interface DraggableIngredientProps {
	uid: string;
	index: number;
	item: Ingredient;
}

export interface RootState {
	auth: AuthState;
	burgerConstructor: BurgerConstructorState;
	ingredients: IngredientsState;
	order: OrderState;
	pendingOrder: PendingOrderState;
	singleIngredient: SingleIngredientState;
	draggableIngredien: DraggableIngredientProps;
}
