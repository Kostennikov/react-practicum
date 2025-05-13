// components/feed-order-details/feed-order-details.tsx
import React, { FC } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { clsx } from 'clsx';
import s from './feed-details.module.scss';
import { CurrencyIcon } from '@ya.praktikum/react-developer-burger-ui-components';
import { RootState, Order, Ingredient } from '../../types/types';
// import { formatDistanceToNow } from 'date-fns';
// import ru from 'date-fns/locale/ru';

interface FeedDetailsProps {
	isModal?: boolean;
}

export const FeedDetails: FC<FeedDetailsProps> = ({ isModal }) => {
	// const { id } = useParams<{ id: string }>();
	// const { orders } = useSelector((state: RootState) => state.feed);
	// const { ingredients } = useSelector((state: RootState) => state.ingredients);

	// const order = orders.find((o) => o._id === id);

	// if (!order) return <p>Заказ не найден</p>;

	// const orderIngredients = order.ingredients
	// 	.map((id) => ingredients.find((ing) => ing._id === id))
	// 	.filter((ing): ing is Ingredient => !!ing);

	// const totalPrice = orderIngredients.reduce(
	// 	(sum, ing) => sum + (ing.type === 'bun' ? ing.price * 2 : ing.price),
	// 	0
	// );
	// const createdAt = new Date(order.createdAt);
	// const timeAgo = formatDistanceToNow(createdAt, {
	// 	locale: ru,
	// 	addSuffix: true,
	// });

	return (
		<div>detail</div>
		// <div className={clsx(s.feed_order_details, { [s.modal]: isModal })}>
		// 	<p
		// 		className={clsx(
		// 			'text text_type_digits-default mb-10',
		// 			{ [s.feed_order_details__number]: isModal },
		// 			{ 'text_type_main-medium': !isModal }
		// 		)}>
		// 		#{order.number}
		// 	</p>
		// 	<h2 className='text text_type_main-medium mb-3'>{order.name}</h2>
		// 	<p
		// 		className={clsx('text text_type_main-default mb-15', {
		// 			text_color_success: order.status === 'done',
		// 		})}>
		// 		{order.status === 'done' ? 'Выполнен' : 'Готовится'}
		// 	</p>
		// 	<h3 className='text text_type_main-medium mb-6'>Состав:</h3>
		// 	<div className={clsx(s.feed_order_details__ingredients)}>
		// 		{orderIngredients.map((ing, index) => (
		// 			<div
		// 				key={`${ing._id}-${index}`}
		// 				className={clsx(s.feed_order_details__ingredient)}>
		// 				<div className={clsx(s.feed_order_details__image)}>
		// 					<img src={ing.image} alt={ing.name} />
		// 				</div>
		// 				<p className='text text_type_main-default'>{ing.name}</p>
		// 				<div className={clsx(s.feed_order_details__price)}>
		// 					<p className='text text_type_digits-default'>
		// 						{ing.type === 'bun' ? 2 : 1} x {ing.price}
		// 					</p>
		// 					<CurrencyIcon type='primary' />
		// 				</div>
		// 			</div>
		// 		))}
		// 	</div>
		// 	<div className={clsx(s.feed_order_details__footer)}>
		// 		{/* <p className='text text_type_main-default text_color_inactive'>
		// 			{timeAgo}
		// 		</p> */}
		// 		<div className={clsx(s.feed_order_details__total)}>
		// 			<p className='text text_type_digits-default'>{totalPrice}</p>
		// 			<CurrencyIcon type='primary' />
		// 		</div>
		// 	</div>
		// </div>
	);
};
