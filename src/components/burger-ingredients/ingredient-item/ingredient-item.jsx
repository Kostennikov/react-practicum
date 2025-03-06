import { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useDrag } from 'react-dnd';
import PropTypes from 'prop-types';
import {
	ingredientPropType,
	functionPropType,
} from '../../../utils/prop-types';

import { clsx } from 'clsx';
import {
	CurrencyIcon,
	Counter,
} from '@ya.praktikum/react-developer-burger-ui-components';
// import {
// 	setSingleIngredient,
// 	clearSingleIngredient,
// } from '../../../services/single-ingredient/reducer';

import {
	setBun,
	addIngredient,
	clearConstructor,
	removeIngredient,
	moveIngredient,
} from '../../../services/burger-constructor/reducer';

import s from './ingredient-item.module.scss';

export const IngredientItem = ({ ingredient, openModal }) => {
	const dispatch = useDispatch();

	const dragType = ingredient.type === 'bun' ? 'bun' : 'ingredient';

	const { bun, burgerIngredients } = useSelector(
		(state) => state.burgerConstructor ?? { bun: null, burgerIngredients: [] }
	);

	const count = useMemo(() => {
		if (ingredient.type === 'bun') {
			return bun && bun._id === ingredient._id ? 2 : 0;
		} else {
			return burgerIngredients.filter((item) => item._id === ingredient._id)
				.length;
		}
	}, [ingredient, bun, burgerIngredients]);

	const [{ isDragging }, dragRef] = useDrag({
		type: dragType,
		item: { ingredient },
		end: (item, monitor) => {
			const dropResult = monitor.getDropResult();
			if (item.ingredient && dropResult) {
				if (item.ingredient.type === 'bun') {
					dispatch(setBun(item.ingredient));
				} else {
					dispatch(addIngredient(item.ingredient));
				}
				// alert(`You dropped ${item.ingredient.name} into ${dropResult.name}!`);
			}
		},
		collect: (monitor) => ({
			isDragging: monitor.isDragging(),
			handlerId: monitor.getHandlerId(),
		}),
	});

	const opacity = isDragging ? 0.4 : 1;

	return (
		<div
			className={clsx(s.ingredients__item)}
			ref={dragRef}
			style={{ opacity }}
			onClick={() => openModal(ingredient)}
			// onClick={() => {
			// 	handleAddIngredient(ingredient);
			// }}
			onKeyDown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					openModal(ingredient);
				}
			}}
			tabIndex={0}
			role='button'>
			<Counter count={count} size='default' extraClass='m-1' />

			<div className={clsx(s.ingredients__img)}>
				<img src={ingredient.image} alt={ingredient.name} />
			</div>

			<p
				className={clsx(s.ingredients__price, 'text text_type_digits-default')}>
				{ingredient.price}
				<CurrencyIcon type='primary' />
			</p>

			<p className={clsx(s.ingredients__text, 'text text_type_main-small')}>
				{ingredient.name}
			</p>
		</div>
	);
};

IngredientItem.propTypes = {
	ingredient: ingredientPropType.isRequired,
	openModal: functionPropType.isRequired,
};
