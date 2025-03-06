import { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { clsx } from 'clsx';
import PropTypes from 'prop-types';
import { Tab } from '@ya.praktikum/react-developer-burger-ui-components';
import s from './burger-ingredients.module.scss';

import { ingredientPropType } from '../../utils/prop-types';
import { Modal } from '../modal/modal';
import { IngredientDetails } from './ingredient-details/ingredient-details';
import { IngredientsGroup } from './ingredientsGroup/ingredients-group';

import {
	setBun,
	addIngredient,
	clearConstructor,
	removeIngredient,
} from '../../services/burger-constructor/reducer';

export const BurgerIngredients = () => {
	const dispatch = useDispatch();
	const [current, setCurrent] = useState('bun');
	const [modalOpen, setModalOpen] = useState(false);
	const [selectedIngredient, setSelectedIngredient] = useState(null);

	const { ingredients, loading, error } = useSelector(
		(state) => state.ingredients ?? { ingredients: [] }
	);
	console.log(
		'%csrc/components/burger-ingredients/burger-ingredients.jsx:23 ingredients',
		'color: #007acc;',
		ingredients
	);
	const openModal = (ingredient) => {
		setSelectedIngredient(ingredient);
		setModalOpen(true);
	};

	const closeModal = () => {
		setSelectedIngredient(null);
		setModalOpen(false);
	};
	const filteredIngredients = {
		bun: ingredients.filter((e) => e.type === 'bun'),
		sauce: ingredients.filter((e) => e.type === 'sauce'),
		main: ingredients.filter((e) => e.type === 'main'),
	};

	return (
		<section className={clsx(s.ingredients)}>
			<div className={clsx(s.ingredients__tabs, 'mb-10')}>
				<Tab value='bun' active={current === 'bun'} onClick={setCurrent}>
					Булки
				</Tab>
				<Tab value='sauce' active={current === 'sauce'} onClick={setCurrent}>
					Соусы
				</Tab>
				<Tab value='main' active={current === 'main'} onClick={setCurrent}>
					Начинки
				</Tab>
			</div>

			<div className={clsx(s.ingredients__items)}>
				<IngredientsGroup
					filteredIngredients={filteredIngredients}
					openModal={openModal}
					selectedIngredient={selectedIngredient}
				/>
			</div>

			{modalOpen && selectedIngredient && (
				<Modal onClose={closeModal}>
					<IngredientDetails ingredient={selectedIngredient} />
				</Modal>
			)}
		</section>
	);
};

BurgerIngredients.propTypes = {
	ingredients: PropTypes.arrayOf(ingredientPropType.isRequired).isRequired,
};
