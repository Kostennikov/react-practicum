import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import s from './app.module.scss';
import { API_URL } from '../../config';

import { BurgerConstructor } from '../burger-constructor/burger-constructor';
import { BurgerIngredients } from '../burger-ingredients/burger-ingredients';
import { AppHeader } from '../app-header/app-header';

export const App = () => {
	const [ingredients, setIngredients] = useState([]);
	const [error, setError] = useState(null);

	useEffect(() => {
		const getIngredients = async () => {
			try {
				const response = await fetch(API_URL);
				if (!response.ok) {
					throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
				}
				const dataIngredients = await response.json();
				setIngredients(dataIngredients.data);
			} catch (err) {
				setError(err.message);
			}
		};

		getIngredients();
	}, []);

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
						<BurgerIngredients ingredients={ingredients} />
						<BurgerConstructor ingredients={ingredients} />
					</div>
				</div>
			</main>
		</div>
	);
};
