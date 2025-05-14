import React, { useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { clsx } from 'clsx';
import s from './order-page.module.scss';
import { FeedDetails } from '../../components/feed/feed-details/feed-details';
import { fetchOrderByNumber } from '../../services/order/reducer';
import { RootState, Order } from '../../types/types';
import {
	feedWsConnectionStart,
	profileOrdersWsConnectionStart,
} from '../../services/feed/action'; // Импортируем действия для WebSocket

interface OrderPageProps {}

export const OrderPage: React.FC<OrderPageProps> = () => {
	const { id } = useParams<{ id: string }>();
	const dispatch = useDispatch();
	const location = useLocation();
	const isProfileOrders = location.pathname.startsWith('/profile/orders');
	const { orders: feedOrders } = useSelector((state: RootState) => state.feed);
	const { orders: profileOrders } = useSelector(
		(state: RootState) => state.profileOrders
	);
	const { order, loading, error } = useSelector(
		(state: RootState) => state.order
	);
	const { accessToken, authChecked } = useSelector(
		(state: RootState) => state.auth
	);

	const orders = isProfileOrders ? profileOrders : feedOrders;
	const foundOrder = orders.find((o: Order) => o._id === id);

	// Инициализация WebSocket, если заказы не загружены
	useEffect(() => {
		if (!authChecked) return;

		if (orders.length === 0) {
			console.log(
				`OrderPage: Orders not loaded, initiating ${
					isProfileOrders ? 'ProfileOrders' : 'Feed'
				} WebSocket connection`
			);
			if (isProfileOrders) {
				if (!accessToken) {
					console.log(
						'OrderPage: No access token, skipping ProfileOrders WebSocket'
					);
					return;
				}
				dispatch(
					profileOrdersWsConnectionStart(
						'wss://norma.nomoreparties.space/orders'
					)
				);
			} else {
				dispatch(
					feedWsConnectionStart('wss://norma.nomoreparties.space/orders/all')
				);
			}
		}
	}, [dispatch, isProfileOrders, orders.length, accessToken, authChecked]);

	// Получение номера заказа из localStorage
	useEffect(() => {
		if (!id) return;

		// Проверяем, есть ли заказ в состоянии
		if (foundOrder) {
			console.log('OrderPage: Order found in state:', foundOrder);
			return;
		}

		// Ищем номер заказа в localStorage
		const orderMapping = JSON.parse(
			localStorage.getItem('orderMapping') || '{}'
		);
		const orderNumber = orderMapping[id];

		if (orderNumber) {
			console.log(
				`OrderPage: Order not found in state, fetching by number ${orderNumber}`
			);
			// @ts-ignore
			dispatch(fetchOrderByNumber(orderNumber));
		} else {
			console.log(
				`OrderPage: Order number not found in localStorage for id ${id}`
			);
		}
	}, [id, foundOrder, dispatch]);

	const displayOrder = foundOrder || order;

	if (!authChecked) return <p>Проверка авторизации...</p>;
	if (loading) return <p>Загрузка...</p>;
	if (error) return <p>Ошибка: {error}</p>;
	if (!displayOrder) return <p>Заказ не найден</p>;

	return (
		<div className={clsx(s.feed_details)}>
			<FeedDetails order={displayOrder} />
		</div>
	);
};
