import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { checkAuth } from '../../services/auth/reducer';

export const ProtectedRoute = ({ element }) => {
	const dispatch = useDispatch();
	const { user, authChecked, loading } = useSelector((state) => state.auth);
	const location = useLocation();

	useEffect(() => {
		if (!authChecked) {
			dispatch(checkAuth());
		}
	}, [dispatch, authChecked]);

	// Если проверка еще не завершена или идет загрузка, показываем индикатор
	if (!authChecked || loading) {
		return <p>Проверка авторизации...</p>;
	}

	// Проверка авторизации на основе данных пользователя
	const isAuthenticated = !!user;

	if (!isAuthenticated) {
		return <Navigate to='/sign-in' state={{ from: location }} replace />;
	}

	return element;
};
