import React, { FC, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import s from './feed.module.scss';
import { ORDERS_ALL_URL } from '../../config';
import { FeedList } from '../../components/feed/feed-list/feed-list';
import {
	wsConnectionStart,
	wsConnectionClose,
} from '../../services/websocket/actions';
import { RootState, Order } from '../../types/types';

interface FeedProps {}

export const Feed: FC<FeedProps> = () => {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const { orders, wsConnected, wsError, wsCloseInfo, total, totalToday } =
		useAppSelector((state: RootState) => state.feed);
	const { authChecked, accessToken } = useAppSelector(
		(state: RootState) => state.auth
	);

	useEffect(() => {
		if (!authChecked || !accessToken) {
			return;
		}

		setTimeout(() => {
			dispatch(
				wsConnectionStart({
					url: 'wss://norma.nomoreparties.space/orders/all',
					connectionId: 'feed',
				})
			);
		}, 100);

		return () => {
			dispatch(wsConnectionClose('feed'));
		};
	}, [dispatch, authChecked, accessToken]);

	if (!authChecked) {
		return <p>Проверка авторизации...</p>;
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

	const doneOrders = orders
		.filter((order) => order.status === 'done')
		.slice(0, 6);
	const pendingOrders = orders
		.filter((order) => order.status === 'pending')
		.slice(0, 6);

	return (
		<main className={clsx(s.feed)}>
			<div className={clsx(s.container)}>
				<h1 className='text text_type_main-large mb-5'>Лента заказов</h1>
				<div className={clsx(s.feed__wrapper)}>
					<FeedList />
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
								{doneOrders.length > 6 && (
									<div className={clsx(s.feed__column)}>
										<h2 className='text text_type_main-medium'> </h2>
										<div className={clsx(s.feed__numbers)}>
											{doneOrders.slice(6, 12).map((order) => (
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
									<h2 className='text text_type_main-medium mb-5'>В работе:</h2>
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
				</div>
			</div>
		</main>
	);
};
