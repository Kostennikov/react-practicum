import { clsx } from 'clsx';
// import PropTypes from 'prop-types';
import { ingredientPropType } from '../../../utils/prop-types';
import s from './ingredient-details.module.scss';

export const IngredientDetails = (props) => {
	const { ingredient } = props;

	return (
		<div className={clsx(s.ingredient_details__wrapper)}>
			<div
				className={clsx(
					s.ingredient_details__title,
					'text text_type_main-large'
				)}>
				Детали ингредиента
			</div>
			<div className={clsx(s.ingredient_details__content)}>
				<div className={clsx(s.ingredient_details__img)}>
					<img src={ingredient.image_large} alt={ingredient.name} />
				</div>
				<div
					className={clsx(
						s.ingredient_details__name,
						'text text_type_main-medium mt-4 mb-8'
					)}>
					{ingredient.name}
				</div>
				<div className={clsx(s.ingredient_details__structure)}>
					<div className={clsx(s.ingredient_details__structure_item, 'mr-5')}>
						<p className='text text_type_main-default text_color_inactive'>
							Калории,ккал
						</p>
						<p className='text text_type_digits-default mt-2'>
							{ingredient.calories}
						</p>
					</div>
					<div className={clsx(s.ingredient_details__structure_item, 'mr-5')}>
						<p className='text text_type_main-default text_color_inactive'>
							Белки, г
						</p>
						<p className='text text_type_digits-default mt-2'>
							{ingredient.proteins}
						</p>
					</div>
					<div className={clsx(s.ingredient_details__structure_item, 'mr-5')}>
						<p className='text text_type_main-default text_color_inactive'>
							Жиры, г
						</p>
						<p className='text text_type_digits-default mt-2'>
							{ingredient.fat}
						</p>
					</div>
					<div className={clsx(s.ingredient_details__structure_item)}>
						<p className='text text_type_main-default text_color_inactive'>
							Углеводы, г
						</p>
						<p className='text text_type_digits-default mt-2'>
							{ingredient.carbohydrates}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

IngredientDetails.propTypes = {
	ingredient: ingredientPropType.isRequired,
};
