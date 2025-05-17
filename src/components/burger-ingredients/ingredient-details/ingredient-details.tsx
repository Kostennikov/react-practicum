import React from 'react';
import { Ingredient } from '../../../types/types';
import s from './ingredient-details.module.scss';
import { clsx } from 'clsx';

interface IngredientDetailsProps {
	ingredient: Ingredient;
}

const IngredientDetails: React.FC<IngredientDetailsProps> = ({
	ingredient,
}) => {
	if (!ingredient) {
		return (
			<p
				className='text text_type_main-medium'
				data-testid='ingredient-details-error'>
				Ингредиент не найден
			</p>
		);
	}

	return (
		<div
			className={clsx(s.ingredient_details__wrapper)}
			data-testid='ingredient-details'>
			<div
				className={clsx(
					s.ingredient_details__title,
					'text text_type_main-large'
				)}
				data-testid='ingredient-details-title'>
				Детали ингредиента
			</div>
			<div className={clsx(s.ingredient_details__content)}>
				<div className={clsx(s.ingredient_details__img)}>
					<img
						src={ingredient.image_large}
						alt={ingredient.name}
						data-testid='ingredient-image'
					/>
				</div>
				<div
					className={clsx(
						s.ingredient_details__name,
						'text text_type_main-medium mt-4 mb-8'
					)}
					data-testid='ingredient-name'>
					{ingredient.name}
				</div>
				<div
					className={clsx(s.ingredient_details__structure)}
					data-testid='ingredient-nutrition'>
					<div
						className={clsx(s.ingredient_details__structure_item, 'mr-5')}
						data-testid='ingredient-calories'>
						<p className='text text_type_main-default text_color_inactive'>
							Калории, ккал
						</p>
						<p className='text text_type_digits-default mt-2'>
							{ingredient.calories}
						</p>
					</div>
					<div
						className={clsx(s.ingredient_details__structure_item, 'mr-5')}
						data-testid='ingredient-proteins'>
						<p className='text text_type_main-default text_color_inactive'>
							Белки, г
						</p>
						<p className='text text_type_digits-default mt-2'>
							{ingredient.proteins}
						</p>
					</div>
					<div
						className={clsx(s.ingredient_details__structure_item, 'mr-5')}
						data-testid='ingredient-fat'>
						<p className='text text_type_main-default text_color_inactive'>
							Жиры, г
						</p>
						<p className='text text_type_digits-default mt-2'>
							{ingredient.fat}
						</p>
					</div>
					<div
						className={clsx(s.ingredient_details__structure_item)}
						data-testid='ingredient-carbohydrates'>
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

export default IngredientDetails;
