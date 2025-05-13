// pages/feed/feed.tsx
import React, { FC, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import s from './feed.module.scss';
import { FeedItem } from './feed-item/feed-item';
import {
	wsConnectionStart,
	wsConnectionClosed,
} from '../../services/feed/action';
import { RootState, Order, Ingredient } from '../../types/types';

interface FeedProps {}

export const Feed: FC<FeedProps> = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const { orders, total, totalToday, wsConnected, wsError, wsCloseInfo } =
		useSelector((state: RootState) => state.feed);
	const { ingredients } = useSelector((state: RootState) => state.ingredients);

	useEffect(() => {
		console.log('Feed: Initiating WebSocket connection'); // Отладка
		dispatch(wsConnectionStart('wss://norma.nomoreparties.space/orders/all'));
		return () => {
			console.log('Feed: Closing WebSocket connection'); // Отладка
			dispatch(wsConnectionClosed());
		};
	}, [dispatch]);

	if (wsError) {
		console.log('Feed: WebSocket error', wsError); // Отладка
		return <p>Ошибка WebSocket: {wsError}</p>;
	}

	if (wsCloseInfo) {
		console.log('Feed: WebSocket closed', wsCloseInfo); // Отладка
		return (
			<p>
				Соединение закрыто: Код {wsCloseInfo.code}, Причина:{' '}
				{wsCloseInfo.reason || 'Не указана'}
			</p>
		);
	}

	// if (!wsConnected) {
	// 	console.log('Feed: WebSocket connecting'); // Отладка
	// 	return <p>Подключение...</p>;
	// }

	console.log('Feed: Orders', orders); // Отладка
	console.log('Feed: Total', total, 'TotalToday', totalToday); // Отладка

	const doneOrders = orders
		.filter((order) => order.status === 'done')
		.slice(0, 20);
	const pendingOrders = orders
		.filter((order) => order.status === 'pending')
		.slice(0, 20);

	return (
		<main className={clsx(s.feed)}>
			<div className={clsx(s.container)}>
				<h1 className='text text_type_main-large mb-5'>Лента заказов</h1>
				<div className={clsx(s.feed__wrapper)}>
					<section className={clsx(s.feed__list)}>
						{orders.map((order) => (
							<FeedItem
								key={order._id}
								order={order}
								ingredients={ingredients}
								onClick={() =>
									navigate(`/feed/${order._id}`, {
										state: { background: { pathname: '/feed' } },
									})
								}
							/>
						))}
					</section>
					<section className={clsx(s.feed__stats)}>
						<div className={clsx(s.feed__status)}>
							<div className={clsx(s.feed__column)}>
								<h2 className='text text_type_main-medium'>Готово:</h2>
								<div className={clsx(s.feed__numbers)}>
									{doneOrders.slice(0, 10).map((order) => (
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
										{doneOrders.slice(10, 20).map((order) => (
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
								<h2 className='text text_type_main-medium'>В работе:</h2>
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
				</div>
			</div>
		</main>
	);
};
