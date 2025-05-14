// src/pages/feed/feed.tsx
import React, { FC, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import s from './feed.module.scss';
import { FeedItem } from '../../components/feed/feed-item/feed-item';
import { FeedList } from '../../components/feed/feed-list/feed-list';
import {
	feedWsConnectionStart,
	feedWsConnectionClosed,
	profileOrdersWsConnectionStart,
	profileOrdersWsConnectionClosed,
} from '../../services/feed/action';
import { RootState, Order, Ingredient } from '../../types/types';

interface FeedProps {}

export const Feed: FC<FeedProps> = () => {
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

	useEffect(() => {
		if (isProfileOrders) {
			console.log('ProfileOrders: Initiating WebSocket connection');
			dispatch(
				profileOrdersWsConnectionStart('wss://norma.nomoreparties.space/orders')
			);
		} else {
			console.log('Feed: Initiating WebSocket connection');
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
			// dispatch(isProfileOrders ? profileOrdersWsConnectionClosed() : feedWsConnectionClosed());
		};
	}, [dispatch, isProfileOrders]);

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

	// if (!wsConnected) {
	// 	console.log(
	// 		`${isProfileOrders ? 'ProfileOrders' : 'Feed'}: WebSocket connecting`
	// 	);
	// 	return <p>Подключение...</p>;
	// }

	console.log(`${isProfileOrders ? 'ProfileOrders' : 'Feed'}: Orders`, orders);
	console.log(
		`${isProfileOrders ? 'ProfileOrders' : 'Feed'}: Total`,
		total,
		'TotalToday',
		totalToday
	);

	const doneOrders = orders
		.filter((order) => order.status === 'done')
		.slice(0, 12);
	const pendingOrders = orders
		.filter((order) => order.status === 'pending')
		.slice(0, 12);

	return (
		<main className={clsx(s.feed)}>
			<div className={clsx(s.container)}>
				<h1 className='text text_type_main-large mb-5'>
					{isProfileOrders ? 'Ваши заказы' : 'Лента заказов'}
				</h1>
				<div className={clsx(s.feed__wrapper)}>
					<FeedList />
					{!isProfileOrders && (
						<section className={clsx(s.feed__stats)}>
							<div className={clsx(s.feed__head)}>
								<div className={clsx(s.feed__status)}>
									<div className={clsx(s.feed__column)}>
										<h2 className='text text_type_main-medium mb-5'>Готово:</h2>
										<div className={clsx(s.feed__numbers)}>
											{doneOrders.slice(0, 6).map((order) => (
												<p
													key={order._id}
													className='text text_type_digits-default text_color_success'>
													{order.number}
												</p>
											))}
										</div>
									</div>
									{doneOrders.length > 10 && (
										<div className={clsx(s.feed__column)}>
											<h2 className='text text_type_main-medium'> </h2>
											<div className={clsx(s.feed__numbers)}>
												{doneOrders.slice(6, 6).map((order) => (
													<p
														key={order._id}
														className='text text_type_digits-default text_color_success'>
														{order.number}
													</p>
												))}
											</div>
										</div>
									)}
								</div>
								<div className={clsx(s.feed__status)}>
									<div className={clsx(s.feed__column)}>
										<h2 className='text text_type_main-medium mb-5'>
											В работе:
										</h2>
										<div className={clsx(s.feed__numbers)}>
											{pendingOrders.slice(0, 10).map((order) => (
												<p
													key={order._id}
													className='text text_type_digits-default'>
													{order.number}
												</p>
											))}
										</div>
									</div>
									{pendingOrders.length > 10 && (
										<div className={clsx(s.feed__column)}>
											<h2 className='text text_type_main-medium'> </h2>
											<div className={clsx(s.feed__numbers)}>
												{pendingOrders.slice(10, 20).map((order) => (
													<p
														key={order._id}
														className='text text_type_digits-default'>
														{order.number}
													</p>
												))}
											</div>
										</div>
									)}
								</div>
							</div>

							<div className={clsx(s.feed__total)}>
								<h2 className='text text_type_main-medium'>
									Выполнено за всё время:
								</h2>
								<p className='text text_type_digits-large'>{total}</p>
							</div>
							<div className={clsx(s.feed__total)}>
								<h2 className='text text_type_main-medium'>
									Выполнено за сегодня:
								</h2>
								<p className='text text_type_digits-large'>{totalToday}</p>
							</div>
						</section>
					)}
				</div>
			</div>
		</main>
	);
};
