import React, { FC } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { clsx } from 'clsx';
import s from './ingredient-page.module.scss';
import IngredientDetails from '../../components/burger-ingredients/ingredient-details/ingredient-details';
import { RootState, Ingredient } from '../../types/types';

interface IngredientPageProps {}

export const IngredientPage: FC<IngredientPageProps> = () => {
	const { id } = useParams<{ id: string }>();
	const { ingredients, loading, error } = useAppSelector(
		(state: RootState) => state.ingredients
	);

	const ingredient = ingredients.find((item: Ingredient) => item._id === id);

	if (loading) return <p>Загрузка...</p>;
	if (error) return <p>Ошибка: {error}</p>;
	if (!ingredient) return <p>Ингредиент не найден</p>;

	return (
		<div className={clsx(s.ingredient_page)}>
			<IngredientDetails ingredient={ingredient} />
		</div>
	);
};
