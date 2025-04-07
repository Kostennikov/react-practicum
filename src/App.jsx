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
import { ProtectedRoute } from './components/protected-route/protected-route';
import { Modal } from './components/modal/modal';
import { IngredientDetails } from './components/burger-ingredients/ingredient-details/ingredient-details';
import { logoutUser, checkAuth } from './services/auth/reducer';

export const App = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const location = useLocation();
	const { user, authChecked } = useSelector((state) => state.auth);
	const { ingredients } = useSelector((state) => state.ingredients);

	useEffect(() => {
		if (!authChecked) {
			dispatch(checkAuth());
		}
	}, [dispatch, authChecked]);

	const background = location.state?.background;

	const handleCloseModal = () => {
		navigate(background?.pathname || '/', { replace: true });
	};

	// Компонент для рендеринга модального окна с IngredientDetails
	const IngredientModal = () => {
		const { id } = useParams();
		const ingredient = ingredients.find((item) => item._id === id); // Находим ингредиент в сторе

		if (!ingredient) return null; // Если ингредиент не найден, ничего не рендерим

		return (
			<Modal onClose={handleCloseModal}>
				<IngredientDetails ingredient={ingredient} />
			</Modal>
		);
	};

	// if (!authChecked) {
	// 	return <p>Проверка авторизации...</p>;
	// }

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
			</Routes>

			{background && location.pathname.startsWith('/ingredients/') && (
				<Routes>
					<Route path='/ingredients/:id' element={<IngredientModal />} />
				</Routes>
			)}
		</div>
	);
};
