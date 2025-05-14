import React from 'react';
import { clsx } from 'clsx';
import s from './feed-details.module.scss';
import { useSelector } from 'react-redux';
import { RootState, Order, Ingredient } from '../../../types/types';
import {
	CurrencyIcon,
	FormattedDate,
} from '@ya.praktikum/react-developer-burger-ui-components';

interface FeedDetailsProps {
	order: Order;
}

export const FeedDetails: React.FC<FeedDetailsProps> = ({ order }) => {
	const { ingredientsMap } = useSelector(
		(state: RootState) => state.ingredients
	);

	if (!order) {
		console.log('FeedDetails: Order is null or undefined');
		return <p>Заказ не найден</p>;
	}

	console.log('FeedDetails: Received order:', order);

	const orderIngredients = order.ingredients
		.map((id) => ingredientsMap.get(id))
		.filter((ingredient): ingredient is Ingredient => !!ingredient);

	const totalPrice = orderIngredients.reduce(
		(sum, ingredient) => sum + ingredient.price,
		0
	);

	const ingredientCounts = orderIngredients.reduce((acc, ingredient) => {
		acc[ingredient._id] = (acc[ingredient._id] || 0) + 1;
		return acc;
	}, {} as Record<string, number>);

	const uniqueIngredients = Array.from(
		new Set(orderIngredients.map((i) => i._id))
	).map((id) => {
		const ingredient = orderIngredients.find((i) => i._id === id)!;
		return { ...ingredient, count: ingredientCounts[id] };
	});

	const statusText =
		order.status === 'created'
			? 'Создан'
			: order.status === 'pending'
			? 'Готовится'
			: order.status === 'done'
			? 'Выполнен'
			: order.status;

	return (
		<div className={clsx(s.order_details)}>
			<p
				className={clsx(
					s.order_details__number,
					'text text_type_digits-large'
				)}>
				#{order.number}
			</p>
			<p
				className={clsx(
					s.order_details__name,
					'text text_type_main-medium mt-4'
				)}>
				{order.name}
			</p>
			<p
				className={clsx(
					s.order_details__status,
					'text text_type_main-default mt-2',
					{
						[s.order_details__status_done]: order.status === 'done',
					}
				)}>
				{statusText}
			</p>
			<p
				className={clsx(
					s.order_details__composition,
					'text text_type_main-medium mt-15'
				)}>
				Состав:
			</p>
			<ul className={clsx(s.order_details__list, 'mt-6')}>
				{uniqueIngredients.map((ingredient, index) => (
					<li key={index} className={clsx(s.order_details__item, 'mb-4')}>
						<div className={clsx(s.order_details__item_image)}>
							<img src={ingredient.image_mobile} alt={ingredient.name} />
						</div>
						<p
							className={clsx(
								s.order_details__item_name,
								'text text_type_main-default'
							)}>
							{ingredient.name}
						</p>
						<div
							className={clsx(
								s.order_details__item_price,
								'text text_type_digits-default'
							)}>
							{ingredient.count} x {ingredient.price}
							<CurrencyIcon type='primary' />
						</div>
					</li>
				))}
			</ul>
			<div className={clsx(s.order_details__footer, 'mt-10')}>
				<FormattedDate
					date={new Date(order.createdAt)}
					className='text text_type_main-default text_color_inactive'
				/>
				<div
					className={clsx(
						s.order_details__total,
						'text text_type_digits-default'
					)}>
					{totalPrice}
					<CurrencyIcon type='primary' />
				</div>
			</div>
		</div>
	);
};
