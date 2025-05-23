import React, { FC, useEffect } from 'react';
import { clsx } from 'clsx';
import { useAppSelector } from '../../hooks/redux';
import { useNavigate } from 'react-router-dom';
import s from './home.module.scss';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { BurgerConstructor } from '../../components/burger-constructor/burger-constructor';
import { BurgerIngredients } from '../../components/burger-ingredients/burger-ingredients';
import { RootState, Ingredient } from '../../types/types';

interface HomeProps {}

export const Home: FC<HomeProps> = () => {
	const navigate = useNavigate();
	const { ingredients, loading, error } = useAppSelector(
		(state: RootState) => state.ingredients
	);

	const handleIngredientClick = (id: string) => {
		navigate(`/ingredients/${id}`, {
			state: { background: { pathname: '/' } },
		});
	};

	if (loading) return <p>Загрузка ингредиентов...</p>;
	if (error) return <p>Ошибка: {error}</p>;
	if (!ingredients.length) return <p>Данные недоступны</p>;

	return (
		<main className={clsx(s.main)} data-testid='home-page'>
			<div className={clsx(s.container)}>
				<h1 className='text text_type_main-large mb-5'>Соберите бургер</h1>
				<div className={clsx(s.main__wrapper)}>
					<DndProvider backend={HTML5Backend}>
						<BurgerIngredients onIngredientClick={handleIngredientClick} />
						<BurgerConstructor />
					</DndProvider>
				</div>
			</div>
		</main>
	);
};
