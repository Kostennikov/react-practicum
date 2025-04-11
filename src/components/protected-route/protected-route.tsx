import React, { useEffect, useState, FC } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Preloader } from '../preloader/preloader';
import { RootState } from '../../types/types';

interface ProtectedRouteProps {
	element: React.ReactElement;
	onlyUnAuth?: boolean;
	requireForgotPassword?: boolean;
}

export const ProtectedRoute: FC<ProtectedRouteProps> = ({
	element,
	onlyUnAuth = false,
	requireForgotPassword = false,
}) => {
	const { user, authChecked } = useSelector((state: RootState) => state.auth);
	const location = useLocation();
	const [hasVisitedForgotPassword, setHasVisitedForgotPassword] =
		useState<boolean>(false);
	const [showPreloader, setShowPreloader] = useState<boolean>(true);

	// Отслеживаем посещение /forgot-password
	useEffect(() => {
		if (location.pathname === '/forgot-password') {
			setHasVisitedForgotPassword(true);
		}
	}, [location.pathname]);

	// Добавляем минимальную задержку для прелоадера
	useEffect(() => {
		if (authChecked) {
			const timer = setTimeout(() => {
				setShowPreloader(false);
			}, 300); // Минимальная задержка 300 мс
			return () => clearTimeout(timer);
		}
	}, [authChecked]);

	// Если проверка авторизации еще не завершена или прелоадер еще должен отображаться
	if (!authChecked || showPreloader) {
		return <Preloader />;
	}

	// Логика для маршрутов, доступных только неавторизованным пользователям (onlyUnAuth = true)
	if (onlyUnAuth) {
		// Если пользователь авторизован, перенаправляем на главную
		if (user) {
			return <Navigate to='/' replace />;
		}

		// Для /reset-password проверяем, был ли посещен /forgot-password
		if (requireForgotPassword && !hasVisitedForgotPassword) {
			return <Navigate to='/forgot-password' replace />;
		}

		// Если пользователь не авторизован, рендерим компонент
		return element;
	}

	// Логика для маршрутов, доступных только авторизованным пользователям (onlyUnAuth = false)
	if (!user) {
		// Если пользователь не авторизован, перенаправляем на /login и сохраняем запрошенный маршрут
		return <Navigate to='/login' state={{ from: location }} replace />;
	}

	// Если пользователь авторизован, рендерим компонент
	return element;
};
