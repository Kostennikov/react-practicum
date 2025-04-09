// src/components/protected-route/protected-route.js
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { Preloader } from '../preloader/preloader';

export const ProtectedRoute = ({
	element,
	onlyUnAuth = false,
	requireForgotPassword = false,
}) => {
	const { user, authChecked } = useSelector((state) => state.auth);
	const location = useLocation();
	const [hasVisitedForgotPassword, setHasVisitedForgotPassword] =
		useState(false);
	const [showPreloader, setShowPreloader] = useState(true);

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

ProtectedRoute.propTypes = {
	element: PropTypes.element.isRequired,
	onlyUnAuth: PropTypes.bool,
	requireForgotPassword: PropTypes.bool,
};

ProtectedRoute.defaultProps = {
	onlyUnAuth: false,
	requireForgotPassword: false,
};
