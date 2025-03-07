import React, { useEffect } from 'react';
import { clsx } from 'clsx';
import { useDispatch, useSelector } from 'react-redux';
import s from './app.module.scss';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { BurgerConstructor } from '../burger-constructor/burger-constructor';
import { BurgerIngredients } from '../burger-ingredients/burger-ingredients';
import { AppHeader } from '../app-header/app-header';
import { fetchIngredients } from '../../services/ingredients/reducer';

export const App = () => {
	const dispatch = useDispatch();

	const { ingredients, loading, error } = useSelector(
		(state) => state.ingredients ?? { ingredients: [] }
	);

	useEffect(() => {
		if (!ingredients.length && !loading && !error) {
			dispatch(fetchIngredients());
		}
	}, [dispatch, ingredients.length, loading, error]);

	if (loading) {
		return <p>Загрузка...</p>;
	}

	if (error) {
		return <p>Ошибка: {error}</p>;
	}

	return (
		<div className='page'>
			<AppHeader />
			<main className={clsx(s.main)}>
				<div className={clsx(s.container)}>
					<h1 className='text text_type_main-large mb-5'>Соберите бургер</h1>
					<div className={clsx(s.main__wrapper)}>
						<DndProvider backend={HTML5Backend}>
							<BurgerIngredients />
							<BurgerConstructor />
						</DndProvider>
					</div>
				</div>
			</main>
		</div>
	);
};
