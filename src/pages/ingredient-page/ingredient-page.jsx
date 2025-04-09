import React from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { clsx } from 'clsx';
import s from './ingredient-page.module.scss';
import { IngredientDetails } from '../../components/burger-ingredients/ingredient-details/ingredient-details';

export const IngredientPage = () => {
	const { id } = useParams();
	const { ingredients, loading, error } = useSelector(
		(state) => state.ingredients
	);

	const ingredient = ingredients.find((item) => item._id === id);

	if (loading) return <p>Загрузка...</p>;
	if (error) return <p>Ошибка: {error}</p>;
	if (!ingredient) return <p>Ингредиент не найден</p>;

	return (
		<div className={clsx(s.ingredient_page)}>
			<IngredientDetails ingredient={ingredient} />
		</div>
	);
};
