import React, { FC, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import s from './orders.module.scss';
import { ORDERS_URL } from '../../../config';
import { ProfileMenu } from '../../../components/profile-menu/profile-menu';
import { FeedList } from '../../../components/feed/feed-list/feed-list';
import {
	wsConnectionStart,
	wsConnectionClose,
} from '../../../services/websocket/actions';
import { RootState } from '../../../types/types';

const getCookie = (name: string): string | undefined => {
	const matches = document.cookie.match(
		new RegExp(
			`(?:^|; )${name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1')}=([^;]*)`
		)
	);
	return matches ? decodeURIComponent(matches[1]) : undefined;
};

interface OrdersProps {}

export const Orders: FC<OrdersProps> = () => {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const { wsConnected, wsError, wsCloseInfo } = useAppSelector(
		(state: RootState) => state.profileOrders
	);
	const { authChecked, accessToken, loading } = useAppSelector(
		(state: RootState) => state.auth
	);

	useEffect(() => {
		if (!authChecked || loading || !accessToken) {
			return;
		}

		// Получаем токен
		let token = accessToken || getCookie('accessToken');
		if (token) {
			token = token.replace(/^Bearer\s+/i, '');
		}

		// Редирект, если нет токена
		if (!token) {
			navigate('/login');
			return;
		}

		setTimeout(() => {
			dispatch(
				wsConnectionStart({
					url: ORDERS_URL,
					connectionId: 'profile',
					token,
				})
			);
		}, 100);

		// Закрываем WebSocket только один раз при размонтировании
		return () => {
			dispatch(wsConnectionClose('profile'));
		};
	}, [dispatch, authChecked, accessToken, loading, navigate]);

	if (!authChecked || loading) {
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

	return (
		<section className={clsx(s.orders)}>
			<div className={clsx(s.container)}>
				<div className={clsx(s.orders__wrapper)}>
					<ProfileMenu />
					<div className={clsx(s.orders__content, 'mt-10')}>
						<FeedList />
					</div>
				</div>
			</div>
		</section>
	);
};
