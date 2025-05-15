import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { clsx } from 'clsx';
import s from './order-page.module.scss';
import { ORDERS_ALL_URL, ORDERS_URL } from '../../config';
import { FeedDetails } from '../../components/feed/feed-details/feed-details';
import { fetchOrderByNumber } from '../../services/order/reducer';
import { RootState, Order, AppDispatch } from '../../types/types';
import {
	wsConnectionStart,
	wsConnectionClose,
} from '../../services/websocket/actions';

interface OrderPageProps {}

export const OrderPage: React.FC<OrderPageProps> = () => {
	const { id } = useParams<{ id: string }>();
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const location = useLocation();
	const isProfileOrders = location.pathname.startsWith('/profile/orders');
	const connectionId = isProfileOrders ? 'profile' : 'feed';
	const { orders: feedOrders } = useAppSelector((state: RootState) => state.feed);
	const { orders: profileOrders } = useAppSelector(
		(state: RootState) => state.profileOrders
	);
	const { order, loading, error } = useAppSelector(
		(state: RootState) => state.order
	);
	const { accessToken, authChecked } = useAppSelector(
		(state: RootState) => state.auth
	);

	const orders = isProfileOrders ? profileOrders : feedOrders;
	const foundOrder = orders.find((o: Order) => o._id === id);

	const [displayOrder, setDisplayOrder] = useState<Order | null>(null);

	// Инициализация WebSocket, если заказы не загружены
	useEffect(() => {
		if (!authChecked) return;

		if (orders.length === 0) {
			const url = isProfileOrders ? ORDERS_URL : ORDERS_ALL_URL;
			const payload = isProfileOrders
				? { url, connectionId, token: accessToken ?? undefined } // Преобразуем null в undefined
				: { url, connectionId };
			dispatch(wsConnectionStart(payload));
		}

		return () => {
			if (orders.length > 0) {
				dispatch(wsConnectionClose(connectionId));
			}
		};
	}, [
		dispatch,
		isProfileOrders,
		orders.length,
		accessToken,
		authChecked,
		navigate,
		connectionId,
	]);

	// Получение номера заказа из localStorage
	useEffect(() => {
		if (!id) return;

		if (foundOrder) {
			setDisplayOrder(foundOrder);
			return;
		}

		const orderMapping: { [key: string]: number } = JSON.parse(
			localStorage.getItem('orderMapping') || '{}'
		);
		const orderNumber = orderMapping[id];

		if (typeof orderNumber === 'number') {
			dispatch(fetchOrderByNumber(orderNumber));
		}
	}, [id, foundOrder, dispatch]);

	// Отслеживание изменений state.order после fetchOrderByNumber
	useEffect(() => {
		if (order) {
			setDisplayOrder(order);
		} else if (error && foundOrder) {
			setDisplayOrder(foundOrder);
		} else if (error === 'Токен отсутствует, требуется авторизация') {
			navigate('/login');
		}
	}, [order, error, foundOrder, navigate]);

	if (!authChecked) return <p>Проверка авторизации...</p>;
	if (loading) return <p>Загрузка...</p>;
	if (error && !foundOrder) return <p>Ошибка: {error}</p>;
	if (!displayOrder) return <p>Заказ не найден</p>;

	return (
		<div className={clsx(s.feed_details)}>
			<FeedDetails order={displayOrder} />
		</div>
	);
};
