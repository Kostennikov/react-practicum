import React, { FC, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import s from './feed-list.module.scss';
import { ORDERS_ALL_URL, ORDERS_URL } from '../../../config';
import { FeedItem } from '../feed-item/feed-item';
import { Preloader } from '../../preloader/preloader';
import {
	feedWsConnectionStart,
	feedWsConnectionClosed,
	profileOrdersWsConnectionStart,
	profileOrdersWsConnectionClosed,
} from '../../../services/feed/action';
import { RootState, Order, Ingredient } from '../../../types/types';

const getCookie = (name: string): string | undefined => {
	const matches = document.cookie.match(
		new RegExp(
			`(?:^|; )${name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1')}=([^;]*)`
		)
	);
	return matches ? decodeURIComponent(matches[1]) : undefined;
};

interface FeedListProps {}

export const FeedList: FC<FeedListProps> = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const location = useLocation();
	const isProfileOrders = location.pathname.startsWith('/profile/orders');
	const { orders, wsConnected, wsError, wsCloseInfo } = useSelector(
		(state: RootState) => (isProfileOrders ? state.profileOrders : state.feed)
	);
	const { total, totalToday } = useSelector((state: RootState) => state.feed);
	const { ingredientsMap } = useSelector(
		(state: RootState) => state.ingredients
	);
	const { authChecked, accessToken, loading, error } = useSelector(
		(state: RootState) => state.auth
	);

	const [showPreloader, setShowPreloader] = useState(true);

	useEffect(() => {
		if (!authChecked || loading) {
			return;
		}

		if (isProfileOrders && !accessToken && !getCookie('accessToken')) {
			return;
		}

		const token =
			accessToken ||
			(getCookie('accessToken') ? `Bearer ${getCookie('accessToken')}` : null);

		if (authChecked) {
			setShowPreloader(false);
		}

		if (isProfileOrders) {
			dispatch(profileOrdersWsConnectionStart(ORDERS_URL));
		} else {
			dispatch(feedWsConnectionStart(ORDERS_ALL_URL));
		}

		return () => {
			dispatch(
				isProfileOrders
					? profileOrdersWsConnectionClosed({
							code: 1000,
							reason: 'Component unmounted',
					  })
					: feedWsConnectionClosed({
							code: 1000,
							reason: 'Component unmounted',
					  })
			);
		};
	}, [dispatch, isProfileOrders, authChecked, accessToken, loading]);

	if (!authChecked || loading) {
		return <p>Проверка авторизации...</p>;
	}

	const token =
		accessToken ||
		(getCookie('accessToken') ? `Bearer ${getCookie('accessToken')}` : null);

	if (isProfileOrders && !token) {
		navigate('/login');
		return null;
	}

	if (wsError) {
		return <p>Ошибка WebSocket: {wsError}</p>;
	}

	if (wsCloseInfo) {
		return (
			<p>
				Соединение закрыто: Код {wsCloseInfo.code}, Причина:{' '}
				{wsCloseInfo.reason || 'Не указана'}
			</p>
		);
	}

	const sortedOrders = [...orders].sort(
		(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
	);

	if (!authChecked || showPreloader || orders.length === 0) {
		return <Preloader />;
	}

	return (
		<section className={clsx(s.feed__list)}>
			{sortedOrders.length === 0 ? (
				<p>Заказы отсутствуют</p>
			) : (
				sortedOrders.map((order) => (
					<FeedItem
						key={order._id}
						order={order}
						ingredients={order.ingredients
							.map((id) => ingredientsMap.get(id))
							.filter((i): i is Ingredient => !!i)}
						onClick={() =>
							navigate(
								`${isProfileOrders ? '/profile/orders' : '/feed'}/${order._id}`,
								{
									state: { background: location },
								}
							)
						}
					/>
				))
			)}
		</section>
	);
};
