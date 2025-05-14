// pages/feed/feed-item/feed-item.tsx
import React, { FC } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import {
	CurrencyIcon,
	FormattedDate,
} from '@ya.praktikum/react-developer-burger-ui-components';
import s from './feed-item.module.scss';
import { Order, Ingredient } from '../../../types/types';
import {} from '@ya.praktikum/react-developer-burger-ui-components';

interface FeedItemProps {
	order: Order;
	ingredients: Ingredient[];
	onClick: () => void;
}

export const FeedItem: FC<FeedItemProps> = ({
	order,
	ingredients,
	onClick,
}) => {
	const orderIngredients = order.ingredients
		.map((id) => ingredients.find((ing) => ing._id === id))
		.filter((ing): ing is Ingredient => !!ing);

	const totalPrice = orderIngredients.reduce(
		(sum, ing) => sum + (ing.type === 'bun' ? ing.price * 2 : ing.price),
		0
	);

	// const createdAt = new Date(order.createdAt);
	// const timeAgo = formatDistanceToNow(createdAt, {
	// 	locale: ru,
	// 	addSuffix: true,
	// });
	const statusText =
		order.status === 'created'
			? 'Создан'
			: order.status === 'pending'
			? 'Готовится'
			: order.status === 'done'
			? 'Выполнен'
			: order.status;

	const location = useLocation();
	const isProfileOrders = location.pathname.startsWith('/profile/orders');

	return (
		<div className={clsx(s.feed_item)} onClick={onClick}>
			<div className={clsx(s.feed_item__header, 'mb-6')}>
				<p className='text text_type_digits-default'>#{order.number}</p>

				<FormattedDate
					date={new Date(order.createdAt)}
					className='text text_type_main-default text_color_inactive'
				/>
			</div>
			<h3 className='text text_type_main-medium mb-6'>{order.name}</h3>

			{isProfileOrders && (
				<p
					className={clsx(
						s.order_details__status,
						'text text_type_main-default mt-2 mb-6',
						{
							['text_color_success']: order.status === 'done',
						}
					)}>
					{statusText}
				</p>
			)}

			<div className={clsx(s.feed_item__content)}>
				<div className={clsx(s.feed_item__ingredients)}>
					{orderIngredients.slice(0, 6).map((ing, index) => (
						<div
							key={`${ing._id}-${index}`}
							className={clsx(s.feed_item__ingredient)}
							style={{ zIndex: 6 - index }}>
							<img src={ing.image} alt={ing.name} />
							{index === 5 && orderIngredients.length > 6 && (
								<span
									className={clsx(
										s.feed_item__overlay,
										'text text_type_main-default'
									)}>
									+{orderIngredients.length - 6}
								</span>
							)}
						</div>
					))}
				</div>
				<div className={clsx(s.feed_item__price)}>
					<p className='text text_type_digits-default'>{totalPrice}</p>
					<CurrencyIcon type='primary' />
				</div>
			</div>
		</div>
	);
};
