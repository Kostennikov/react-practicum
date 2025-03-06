import { clsx } from 'clsx';
import PropTypes from 'prop-types';
import { ingredientPropType } from '../../../utils/prop-types';
import s from './ingredients-group.module.scss';
import { IngredientItem } from '../ingredient-item/ingredient-item';

export const IngredientsGroup = ({
	filteredIngredients,
	openModal,
	bunRef,
	sauceRef,
	mainRef,
}) => {
	const refMap = { bun: bunRef, sauce: sauceRef, main: mainRef };

	return (
		<div>
			{Object.entries(filteredIngredients).map(([category, ingredients]) => (
				<div
					ref={refMap[category]}
					data-section={category}
					className={clsx(s.ingredients__block, 'mb-15')}
					key={category}>
					<h2
						className={clsx(
							s.ingredients__item_title,
							'text text_type_main-medium mb-6'
						)}>
						{category === 'bun'
							? 'Булки'
							: category === 'sauce'
							? 'Соусы'
							: 'Начинки'}
					</h2>
					<ul className={clsx(s.ingredients__list)}>
						{ingredients.map((ingredient) => (
							<li key={ingredient._id}>
								<IngredientItem ingredient={ingredient} openModal={openModal} />
							</li>
						))}
					</ul>
				</div>
			))}
		</div>
	);
};

IngredientsGroup.propTypes = {
	filteredIngredients: PropTypes.shape({
		bun: PropTypes.arrayOf(ingredientPropType).isRequired,
		sauce: PropTypes.arrayOf(ingredientPropType).isRequired,
		main: PropTypes.arrayOf(ingredientPropType).isRequired,
	}).isRequired,
	openModal: PropTypes.func.isRequired,
	bunRef: PropTypes.shape({ current: PropTypes.instanceOf(Element) })
		.isRequired,
	sauceRef: PropTypes.shape({ current: PropTypes.instanceOf(Element) })
		.isRequired,
	mainRef: PropTypes.shape({ current: PropTypes.instanceOf(Element) })
		.isRequired,
};
