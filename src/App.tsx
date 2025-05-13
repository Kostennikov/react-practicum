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

import { ProtectedRoute } from './components/protected-route/protected-route';
import { Modal } from './components/modal/modal';
import IngredientDetails from './components/burger-ingredients/ingredient-details/ingredient-details';
import { FeedDetails } from './components/feed-details/feed-details';
import { logoutUser, checkAuth } from './services/auth/reducer.js';
import { fetchIngredients } from './services/ingredients/reducer';

// import { AppDispatch } from './services/store';
import { RootState, Ingredient } from './types/types';
import { Location } from 'react-router-dom';

// Типизация для background (location.state?.background)
interface BackgroundLocation extends Location {
	pathname: string;
}

export const App: React.FC = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const location = useLocation();
	const { user, authChecked } = useSelector((state: RootState) => state.auth);
	const { ingredients, loading: ingredientsLoading } = useSelector(
		(state: RootState) => state.ingredients
	);

	useEffect(() => {
		// Проверяем авторизацию
		if (!authChecked) {
			// @ts-ignore
			dispatch(checkAuth());
		}
		// Загружаем ингредиенты
		if (!ingredients.length) {
			// @ts-ignore
			dispatch(fetchIngredients());
		}
	}, [dispatch, authChecked, ingredients.length]);

	const background = (location.state as { background?: BackgroundLocation })
		?.background;

	const handleCloseModal = () => {
		navigate(background?.pathname || '/', { replace: true });
	};

	// Компонент для рендеринга модального окна с IngredientDetails
	const IngredientModal: React.FC = () => {
		const { id } = useParams<{ id: string }>();
		const ingredient = ingredients.find((item: Ingredient) => item._id === id);

		// if (ingredientsLoading) return <p>Загрузка ингредиентов...</p>;
		if (!ingredient) return <p>Ингредиент не найден</p>;

		return (
			<Modal onClose={handleCloseModal}>
				<IngredientDetails ingredient={ingredient} />
			</Modal>
		);
	};

	return (
		<div className='page'>
			<AppHeader />
			<Routes location={background || location}>
				<Route path='/' element={<Home />} />
				<Route path='/profile/orders' element={<Orders />} />
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
				<Route path='*' element={<NotFound404 />} />

				<Route path='/feed' element={<Feed />} />
				<Route path='/feed/:id' element={<FeedDetails />} />
			</Routes>

			{background && location.pathname.startsWith('/ingredients/') && (
				<Routes>
					<Route path='/ingredients/:id' element={<IngredientModal />} />
					{/* <Route path='/feed/:id' element={<OrderModal />} /> */}
				</Routes>
			)}
		</div>
	);
};
