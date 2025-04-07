import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { checkAuth } from '../../services/auth/reducer';

export const AuthRoute = ({ element, restrictResetPassword = false }) => {
	const dispatch = useDispatch();
	const { user, authChecked, loading, resetPasswordAllowed } = useSelector(
		(state) => state.auth
	);
	// const location = useLocation();

	useEffect(() => {
		if (!authChecked) {
			dispatch(checkAuth());
		}
	}, [dispatch, authChecked]);

	if (!authChecked || loading) {
		return <p>Проверка авторизации...</p>;
	}

	// Проверка авторизации на основе данных пользователя
	const isAuthenticated = !!user;

	if (isAuthenticated) {
		return <Navigate to='/' replace />;
	}

	// Защита /reset-password от прямого доступа
	if (restrictResetPassword && !resetPasswordAllowed) {
		return <Navigate to='/forgot-password' replace />;
	}

	return element;
};
