import { clsx } from 'clsx';
import PropTypes from 'prop-types';
import { ingredientPropType } from '../../../utils/prop-types';
import {
	CurrencyIcon,
	Counter,
} from '@ya.praktikum/react-developer-burger-ui-components';
import s from './ingredient-item.module.scss';

export const IngredientItem = (props) => {
	const { ingredient, openModal } = props;

	return (
		<div
			className={clsx(s.ingredients__item)}
			onClick={() => openModal(ingredient)}
			onKeyDown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					openModal(ingredient);
				}
			}}
			tabIndex={0}
			role='button'>
			<Counter
				count={1}
				size='default'
				extraClass='m-1'
				className={clsx(s.ingredients__count, 'pl-2 pr-2')}
			/>

			<div className={clsx(s.ingredients__img)}>
				<img src={ingredient.image} alt={ingredient.name} />
			</div>

			<p
				className={clsx(
					s.ingredients__price,
					'text text_type_digits-default mb-2'
				)}>
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
