import React, { FC, useEffect, useState } from 'react';
import { useAppSelector } from '../../../hooks/redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import s from './feed-list.module.scss';
import { FeedItem } from '../feed-item/feed-item';
import { Preloader } from '../../preloader/preloader';
import { RootState, Order, Ingredient } from '../../../types/types';

interface FeedListProps {}

export const FeedList: FC<FeedListProps> = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const isProfileOrders = location.pathname.startsWith('/profile/orders');
	const { orders, wsConnected, wsError, wsCloseInfo } = useAppSelector(
		(state: RootState) => (isProfileOrders ? state.profileOrders : state.feed)
	);
	const { ingredientsMap } = useAppSelector(
		(state: RootState) => state.ingredients
	);
	const { authChecked, loading } = useAppSelector(
		(state: RootState) => state.auth
	);

	const [showPreloader, setShowPreloader] = useState(true);

	// Управляем прелоадером в useEffect
	useEffect(() => {
		if (authChecked && !loading) {
			setShowPreloader(false);
		}
	}, [authChecked, loading]);

	if (!authChecked || loading || showPreloader) {
		return <Preloader />;
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
