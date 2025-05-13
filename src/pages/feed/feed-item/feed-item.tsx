// pages/feed/feed-item/feed-item.tsx
import React, { FC } from 'react';
import { clsx } from 'clsx';
import { CurrencyIcon } from '@ya.praktikum/react-developer-burger-ui-components';
import s from './feed-item.module.scss';
import { Order, Ingredient } from '../../../types/types';
// import { formatDistanceToNow } from 'date-fns';
// import ru from 'date-fns/locale/ru';

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

	return (
		<div className={clsx(s.feed_item)} onClick={onClick}>
			<div className={clsx(s.feed_item__header)}>
				<p className='text text_type_digits-default'>#{order.number}</p>
				{/* <p className='text text_type_main-default text_color_inactive'>
					{timeAgo}
				</p> */}
			</div>
			<h3 className='text text_type_main-medium'>{order.name}</h3>
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
