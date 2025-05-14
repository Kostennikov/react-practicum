import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { clsx } from 'clsx';
import s from './order-page.module.scss';
import { ORDERS_ALL_URL, ORDERS_URL } from '../../config';
import { FeedDetails } from '../../components/feed/feed-details/feed-details';
import { fetchOrderByNumber } from '../../services/order/reducer';
import { RootState, Order, AppDispatch } from '../../types/types';
import {
	feedWsConnectionStart,
	profileOrdersWsConnectionStart,
} from '../../services/feed/action';

interface OrderPageProps {}

export const OrderPage: React.FC<OrderPageProps> = () => {
	const { id } = useParams<{ id: string }>();
	const dispatch = useDispatch<AppDispatch>(); // Уже типизирован
	const navigate = useNavigate();
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

	const [displayOrder, setDisplayOrder] = useState<Order | null>(null);

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
					console.log('OrderPage: No access token, redirecting to login');
					navigate('/login');
					return;
				}
				dispatch(profileOrdersWsConnectionStart(ORDERS_URL));
			} else {
				dispatch(feedWsConnectionStart(ORDERS_ALL_URL));
			}
		}
	}, [
		dispatch,
		isProfileOrders,
		orders.length,
		accessToken,
		authChecked,
		navigate,
	]);

	// Получение номера заказа из localStorage
	useEffect(() => {
		if (!id) return;

		if (foundOrder) {
			console.log('OrderPage: Order found in state:', foundOrder);
			setDisplayOrder(foundOrder);
			return;
		}

		// Типизация orderMapping
		const orderMapping: { [key: string]: number } = JSON.parse(
			localStorage.getItem('orderMapping') || '{}'
		);
		const orderNumber = orderMapping[id];

		if (typeof orderNumber === 'number') {
			console.log(
				`OrderPage: Order not found in state, fetching by number ${orderNumber}`
			);
			dispatch(fetchOrderByNumber(orderNumber)); // Теперь типизация работает
		} else {
			console.log(
				`OrderPage: Order number not found in localStorage for id ${id} or invalid type`
			);
		}
	}, [id, foundOrder, dispatch]);

	// Отслеживание изменений state.order после fetchOrderByNumber
	useEffect(() => {
		if (order) {
			console.log('OrderPage: state.order updated:', order);
			setDisplayOrder(order);
		} else if (error && foundOrder) {
			console.log(
				'OrderPage: fetchOrderByNumber failed, using foundOrder:',
				foundOrder
			);
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
