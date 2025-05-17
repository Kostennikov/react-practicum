import { useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux';
import { useDrag, DragSourceMonitor } from 'react-dnd';
import type { Identifier } from 'dnd-core';
import { clsx } from 'clsx';
import {
	CurrencyIcon,
	Counter,
} from '@ya.praktikum/react-developer-burger-ui-components';
import {
	setBun,
	addIngredient,
} from '../../../services/burger-constructor/reducer';
import { RootState, Ingredient } from '../../../types/types';
import s from './ingredient-item.module.scss';

interface IngredientItemProps {
	ingredient: Ingredient;
	onIngredientClick: (id: string) => void;
}

interface DragItem {
	ingredient: Ingredient;
}

interface DragCollectedProps {
	isDragging: boolean;
	handlerId: Identifier | null;
}

export const IngredientItem: React.FC<IngredientItemProps> = ({
	ingredient,
	onIngredientClick,
}) => {
	const dispatch = useAppDispatch();

	const dragType = ingredient.type === 'bun' ? 'bun' : 'ingredient';

	const { bun, burgerIngredients } = useAppSelector(
		(state: RootState) =>
			state.burgerConstructor ?? { bun: null, burgerIngredients: [] }
	);

	const count = useMemo(() => {
		if (ingredient.type === 'bun') {
			return bun && bun._id === ingredient._id ? 2 : 0;
		} else {
			return burgerIngredients.filter((item) => item._id === ingredient._id)
				.length;
		}
	}, [ingredient, bun, burgerIngredients]);

	const [{ isDragging }, dragRef] = useDrag<
		DragItem,
		unknown,
		DragCollectedProps
	>({
		type: dragType,
		item: { ingredient },
		collect: (monitor: DragSourceMonitor) => ({
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
			onClick={() => onIngredientClick(ingredient._id)}
			onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
				if (e.key === 'Enter' || e.key === ' ') {
					onIngredientClick(ingredient._id);
				}
			}}
			tabIndex={0}
			role='button'
			data-testid={`ingredient-${ingredient._id}`}>
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
