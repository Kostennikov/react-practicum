import React, { FC, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import s from './feed-list.module.scss';
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
			console.log(
				'FeedList: Waiting for auth check, authChecked:',
				authChecked,
				'loading:',
				loading
			);
			return;
		}

		if (isProfileOrders && !accessToken && !getCookie('accessToken')) {
			console.log(
				'FeedList: No access token in Redux or cookie, skipping WebSocket'
			);
			return;
		}

		const token =
			accessToken ||
			(getCookie('accessToken') ? `Bearer ${getCookie('accessToken')}` : null);
		console.log(
			'FeedList: Access token:',
			token,
			'Cookie accessToken:',
			getCookie('accessToken')
		);

		if (authChecked) {
			setShowPreloader(false);
		}

		if (isProfileOrders) {
			console.log('FeedList: Initiating ProfileOrders WebSocket connection');
			dispatch(
				profileOrdersWsConnectionStart('wss://norma.nomoreparties.space/orders')
			);
		} else {
			console.log('FeedList: Initiating Feed WebSocket connection');
			dispatch(
				feedWsConnectionStart('wss://norma.nomoreparties.space/orders/all')
			);
		}

		return () => {
			console.log(
				`${
					isProfileOrders ? 'ProfileOrders' : 'Feed'
				}: Closing WebSocket connection`
			);
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
		console.log('FeedList: Rendering loading state');
		return <p>Проверка авторизации...</p>;
	}

	const token =
		accessToken ||
		(getCookie('accessToken') ? `Bearer ${getCookie('accessToken')}` : null);
	console.log('FeedList: Rendering, token:', token, 'auth error:', error);

	if (isProfileOrders && !token) {
		console.log('FeedList: No access token, redirecting to login');
		navigate('/login');
		return null;
	}

	if (wsError) {
		console.log(
			`${isProfileOrders ? 'ProfileOrders' : 'Feed'}: WebSocket error`,
			wsError
		);
		return <p>Ошибка WebSocket: {wsError}</p>;
	}

	if (wsCloseInfo) {
		console.log(
			`${isProfileOrders ? 'ProfileOrders' : 'Feed'}: WebSocket closed`,
			wsCloseInfo
		);
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

	console.log(
		`${isProfileOrders ? 'ProfileOrders' : 'Feed'}: Orders`,
		sortedOrders
	);
	console.log(
		`${isProfileOrders ? 'ProfileOrders' : 'Feed'}: Total`,
		total,
		'TotalToday',
		totalToday
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
