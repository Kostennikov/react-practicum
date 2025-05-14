import React, { useEffect } from 'react';
import {
	Route,
	Routes,
	useNavigate,
	useLocation,
	useParams,
} from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clsx } from 'clsx';
import { AppHeader } from './components/app-header/app-header';
import { Home } from './pages/home/home';
import { SignIn } from './pages/registration/sign-in/sign-in';
import { Registration } from './pages/registration/registration/registration';
import { ForgotPassword } from './pages/registration/forgot-password/forgot-password';
import { ResetPassword } from './pages/registration/reset-password/reset-password';
import { Profile } from './pages/account/profile/profile';
import { Orders } from './pages/account/orders/orders';
import { IngredientPage } from './pages/ingredient-page/ingredient-page';
import { NotFound404 } from './pages/not-found/not-found';
import { Feed } from './pages/feed/feed';
import { OrderPage } from './pages/order-page/order-page';
import { ProtectedRoute } from './components/protected-route/protected-route';
import { Modal } from './components/modal/modal';
import IngredientDetails from './components/burger-ingredients/ingredient-details/ingredient-details';
import { FeedDetails } from './components/feed/feed-details/feed-details';
// import { OrderDetails } from './components/feed/order-details/order-details'; // Импортируем новый компонент
import {
	logoutUser,
	checkAuth,
	syncAccessToken,
} from './services/auth/reducer';
import { fetchIngredients } from './services/ingredients/reducer';
import { RootState, Ingredient, Order } from './types/types';
import { Location } from 'react-router-dom';
import { fetchOrderByNumber } from './services/order/reducer'; // Импортируем для получения заказа

interface BackgroundLocation extends Location {
	pathname: string;
}

export const App: React.FC = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const location = useLocation();
	const { user, authChecked, accessToken } = useSelector(
		(state: RootState) => state.auth
	);
	const { ingredients, loading: ingredientsLoading } = useSelector(
		(state: RootState) => state.ingredients
	);
	const { orders: feedOrders } = useSelector((state: RootState) => state.feed);
	const { orders: profileOrders } = useSelector(
		(state: RootState) => state.profileOrders
	);

	const getCookie = (name: string): string | undefined => {
		const matches = document.cookie.match(
			new RegExp(
				`(?:^|; )${name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1')}=([^;]*)`
			)
		);
		return matches ? decodeURIComponent(matches[1]) : undefined;
	};

	useEffect(() => {
		console.log('App: Cookie accessToken:', getCookie('accessToken'));
		console.log(
			'App: LocalStorage refreshToken:',
			localStorage.getItem('refreshToken')
		);
		console.log('App: Initializing, syncing access token');
		dispatch(syncAccessToken());
		console.log('App: authChecked:', authChecked, 'accessToken:', accessToken);
		if (!authChecked) {
			console.log('App: Dispatching checkAuth');
			// @ts-ignore
			dispatch(checkAuth());
		}
		if (!ingredients.length) {
			console.log('App: Fetching ingredients');
			// @ts-ignore
			dispatch(fetchIngredients());
		}
	}, [dispatch, authChecked, ingredients.length]);

	const background = (location.state as { background?: BackgroundLocation })
		?.background;

	const handleCloseModal = () => {
		navigate(background?.pathname || '/', { replace: true });
	};

	const IngredientModal: React.FC = () => {
		const { id } = useParams<{ id: string }>();
		const ingredient = ingredients.find((item: Ingredient) => item._id === id);

		if (!ingredient) return <p>Ингредиент не найден</p>;

		return (
			<Modal onClose={handleCloseModal}>
				<IngredientDetails ingredient={ingredient} />
			</Modal>
		);
	};

	const OrderModal: React.FC = () => {
		const { id } = useParams<{ id: string }>();
		const isProfileOrders = location.pathname.startsWith('/profile/orders');
		const orders = isProfileOrders ? profileOrders : feedOrders;
		const order = orders.find((o: Order) => o._id === id);

		useEffect(() => {
			if (!order && id) {
				console.log('App: Order not found in state, fetching by number');
				// Попытка найти номер заказа по _id
				const orderFromState = orders.find((o: Order) => o._id === id);
				if (orderFromState?.number) {
					// @ts-ignore
					dispatch(fetchOrderByNumber(orderFromState.number));
				}
			}
		}, [id, orders]);

		if (!order) return <p>Заказ не найден</p>;

		return (
			<Modal onClose={handleCloseModal}>
				<FeedDetails order={order} />
			</Modal>
		);
	};

	if (!authChecked) {
		console.log('App: Rendering loading state, auth not checked');
		return <p>Загрузка...</p>;
	}

	return (
		<div className='page'>
			<AppHeader />
			<Routes location={background || location}>
				<Route path='/' element={<Home />} />
				<Route
					path='/profile/orders'
					element={<ProtectedRoute element={<Orders />} />}
				/>
				<Route
					path='/login'
					element={<ProtectedRoute element={<SignIn />} onlyUnAuth={true} />}
				/>
				<Route
					path='/register'
					element={
						<ProtectedRoute element={<Registration />} onlyUnAuth={true} />
					}
				/>
				<Route
					path='/forgot-password'
					element={
						<ProtectedRoute element={<ForgotPassword />} onlyUnAuth={true} />
					}
				/>
				<Route
					path='/reset-password'
					element={
						<ProtectedRoute
							element={<ResetPassword />}
							onlyUnAuth={true}
							requireForgotPassword={true}
						/>
					}
				/>
				<Route
					path='/profile/*'
					element={<ProtectedRoute element={<Profile />} />}
				/>
				<Route path='/ingredients/:id' element={<IngredientPage />} />
				<Route path='/feed' element={<Feed />} />
				<Route path='/feed/:id' element={<OrderPage />} />
				<Route path='/profile/orders/:id' element={<OrderPage />} />
				<Route path='*' element={<NotFound404 />} />
			</Routes>

			{background && location.pathname.startsWith('/ingredients/') && (
				<Routes>
					<Route path='/ingredients/:id' element={<IngredientModal />} />
				</Routes>
			)}

			{background &&
				(location.pathname.startsWith('/feed/') ||
					location.pathname.startsWith('/profile/orders/')) && (
					<Routes>
						<Route path='/feed/:id' element={<OrderModal />} />
						<Route path='/profile/orders/:id' element={<OrderModal />} />
					</Routes>
				)}
		</div>
	);
};
