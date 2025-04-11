import { clsx } from 'clsx';
import { IngredientItem } from '../ingredient-item/ingredient-item';
import { FilteredIngredients, Ingredient } from '../../../types/types';
import s from './ingredients-group.module.scss';

interface IngredientsGroupProps {
	filteredIngredients: FilteredIngredients;
	onIngredientClick: (id: string) => void;
	bunRef: React.RefObject<HTMLDivElement>;
	sauceRef: React.RefObject<HTMLDivElement>;
	mainRef: React.RefObject<HTMLDivElement>;
}

export const IngredientsGroup: React.FC<IngredientsGroupProps> = ({
	filteredIngredients,
	onIngredientClick,
	bunRef,
	sauceRef,
	mainRef,
}) => {
	const refMap: Record<string, React.RefObject<HTMLDivElement>> = {
		bun: bunRef,
		sauce: sauceRef,
		main: mainRef,
	};

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
						{ingredients.map((ingredient: Ingredient) => (
							<li key={ingredient._id}>
								<IngredientItem
									ingredient={ingredient}
									onIngredientClick={onIngredientClick}
								/>
							</li>
						))}
					</ul>
				</div>
			))}
		</div>
	);
};
