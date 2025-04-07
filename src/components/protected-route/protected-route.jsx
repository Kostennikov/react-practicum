// src/components/protected-route/protected-route.js
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

export const ProtectedRoute = ({
	element,
	onlyUnAuth = false,
	requireForgotPassword = false,
}) => {
	const { user, authChecked } = useSelector((state) => state.auth);
	const location = useLocation();
	const [hasVisitedForgotPassword, setHasVisitedForgotPassword] =
		useState(false);

	console.log(
		'%csrc/components/protected-route/protected-route.jsx:17 onlyUnAuth',
		'color: #007acc;',
		onlyUnAuth
	);
	// Отслеживаем посещение /forgot-password
	useEffect(() => {
		if (location.pathname === '/forgot-password') {
			setHasVisitedForgotPassword(true);
		}
	}, [location.pathname]);

	// Если проверка авторизации еще не завершена, показываем загрузку
	if (!authChecked) {
		return <p>Проверка авторизации...</p>;
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
