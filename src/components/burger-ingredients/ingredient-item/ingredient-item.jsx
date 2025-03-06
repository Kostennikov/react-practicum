import { useDrag } from 'react-dnd';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { clsx } from 'clsx';
import {
	CurrencyIcon,
	Counter,
} from '@ya.praktikum/react-developer-burger-ui-components';
import {
	setSingleIngredient,
	clearSingleIngredient,
} from '../../../services/single-ingredient/reducer';

import {
	setBun,
	addIngredient,
	clearConstructor,
	removeIngredient,
	moveIngredient,
} from '../../../services/burger-constructor/reducer';

import { ingredientPropType } from '../../../utils/prop-types';

import s from './ingredient-item.module.scss';

export const IngredientItem = ({ ingredient, openModal }) => {
	const dispatch = useDispatch();

	const [{ isDragging }, dragRef] = useDrag({
		type: 'ingredient',
		item: { ingredient }, // передаем сам объект ингредиента
		end: (item, monitor) => {
			console.log('item', item);
			const dropResult = monitor.getDropResult();
			// console.log(
			// 	'%csrc/components/burger-ingredients/ingredient-item/ingredient-item.jsx:25 dropResult',
			// 	'color: #007acc;',sZ
			// 	dropResult
			// );

			if (item.ingredient && dropResult) {
				alert(`You dropped ${item.ingredient.name} into ${dropResult.name}!`);
			}
			if (item.ingredient.type === 'bun' && dropResult) {
				dispatch(setBun(item.ingredient));
			} else if (item.ingredient.type !== 'bun' && dropResult) {
				dispatch(addIngredient(item.ingredient));
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
			// ref={(node) => dragRef(dropRef(node))}
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
			<Counter count={1} size='default' extraClass='m-1' />

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
	openModal: PropTypes.func.isRequired,
};
