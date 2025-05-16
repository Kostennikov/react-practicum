import React, { useEffect } from 'react';
import {
	Route,
	Routes,
	useNavigate,
	useLocation,
	useParams,
} from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './hooks/redux';
import { clsx } from 'clsx';
import { ORDERS_ALL_URL, ORDERS_URL } from './config';
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
import {
	logoutUser,
	checkAuth,
	syncAccessToken,
} from './services/auth/reducer';
import { fetchIngredients } from './services/ingredients/reducer';
import { RootState, Ingredient, Order, AppDispatch } from './types/types';
import { fetchOrderByNumber, clearOrder } from './services/order/reducer';
import {
	wsConnectionStart,
	wsConnectionClose,
} from './services/websocket/actions';

interface BackgroundLocation extends Location {
	pathname: string;
}

export const App: React.FC = () => {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const location = useLocation();
	const { user, authChecked, accessToken } = useAppSelector(
		(state: RootState) => state.auth
	);
	const { ingredients, loading: ingredientsLoading } = useAppSelector(
		(state: RootState) => state.ingredients
	);
	const { orders: feedOrders, wsConnected: feedWsConnected } = useAppSelector(
		(state: RootState) => state.feed
	);
	const { orders: profileOrders, wsConnected: profileWsConnected } =
		useAppSelector((state: RootState) => state.profileOrders);

	useEffect(() => {
		dispatch(syncAccessToken());
		if (!authChecked) {
			dispatch(checkAuth());
		}
		if (!ingredients.length) {
			dispatch(fetchIngredients());
		}
	}, [dispatch, authChecked, ingredients.length]);

	// Логика открытия и закрытия WebSocket-соединений
	useEffect(() => {
		if (!authChecked) return;

		const isFeedPage = location.pathname.startsWith('/feed');
		const isProfileOrdersPage = location.pathname.startsWith('/profile/orders');

		if (isFeedPage && feedOrders.length === 0 && !feedWsConnected) {
			dispatch(
				wsConnectionStart({
					url: ORDERS_ALL_URL,
					connectionId: 'feed',
				})
			);
		}

		if (
			isProfileOrdersPage &&
			profileOrders.length === 0 &&
			!profileWsConnected
		) {
			if (!accessToken) {
				navigate('/login');
				return;
			}
			dispatch(
				wsConnectionStart({
					url: ORDERS_URL,
					connectionId: 'profile',
					token: accessToken, // Преобразуем null в undefined
				})
			);
		}

		// Закрываем WebSocket-соединение и очищаем state.order при уходе
		// return () => {
		// 	if (isFeedPage && feedWsConnected) {
		// 		dispatch(wsConnectionClose('feed'));
		// 		dispatch(clearOrder());
		// 	}
		// 	if (isProfileOrdersPage && profileWsConnected) {
		// 		dispatch(wsConnectionClose('profile'));
		// 		dispatch(clearOrder());
		// 	}
		// };
	}, [
		dispatch,
		location.pathname,
		authChecked,
		accessToken,
		feedOrders.length,
		profileOrders.length,
		feedWsConnected,
		profileWsConnected,
		navigate,
	]);

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
				const orderFromState = orders.find((o: Order) => o._id === id);
				if (
					orderFromState?.number &&
					typeof orderFromState.number === 'number'
				) {
					dispatch(fetchOrderByNumber(orderFromState.number));
				} else {
					console.log('App: Order number not found or invalid for id:', id);
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
