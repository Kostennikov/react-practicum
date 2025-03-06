import { useState, useMemo, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { clsx } from 'clsx';
import { Tab } from '@ya.praktikum/react-developer-burger-ui-components';
import s from './burger-ingredients.module.scss';

import { Modal } from '../modal/modal';
import { IngredientDetails } from './ingredient-details/ingredient-details';
import { IngredientsGroup } from './ingredientsGroup/ingredients-group';

export const BurgerIngredients = () => {
	const [current, setCurrent] = useState('bun');
	const [modalOpen, setModalOpen] = useState(false);
	const [selectedIngredient, setSelectedIngredient] = useState(null);

	const { ingredients } = useSelector(
		(state) => state.ingredients ?? { ingredients: [] }
	);

	const containerRef = useRef(null);
	const bunRef = useRef(null);
	const sauceRef = useRef(null);
	const mainRef = useRef(null);

	const filteredIngredients = useMemo(
		() => ({
			bun: ingredients.filter((e) => e.type === 'bun'),
			sauce: ingredients.filter((e) => e.type === 'sauce'),
			main: ingredients.filter((e) => e.type === 'main'),
		}),
		[ingredients]
	);

	const openModal = (ingredient) => {
		setSelectedIngredient(ingredient);
		setModalOpen(true);
	};

	const closeModal = () => {
		setSelectedIngredient(null);
		setModalOpen(false);
	};

	// Прокрутка по клику на таб
	const handleTabClick = (value) => {
		setCurrent(value);
		const refMap = { bun: bunRef, sauce: sauceRef, main: mainRef };
		const targetRef = refMap[value];

		if (targetRef.current && containerRef.current) {
			containerRef.current.scrollTo({
				top: targetRef.current.offsetTop - containerRef.current.offsetTop,
				behavior: 'smooth',
			});
		}
	};

	// Автообновление активного таба при прокрутке
	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				const visibleSection = entries.find((entry) => entry.isIntersecting);
				if (visibleSection) {
					setCurrent(visibleSection.target.dataset.section);
				}
			},
			{
				root: containerRef.current,
				threshold: 0.4, // Уменьшил до 40%
			}
		);

		// Подключаем наблюдатель к каждой секции
		[bunRef, sauceRef, mainRef].forEach((ref) => {
			if (ref.current) observer.observe(ref.current);
		});

		return () => {
			[bunRef, sauceRef, mainRef].forEach((ref) => {
				if (ref.current) observer.unobserve(ref.current);
			});
		};
	}, []);

	useEffect(() => {
		const handleScroll = () => {
			if (!containerRef.current || !mainRef.current) return;

			const { scrollTop, clientHeight } = containerRef.current;
			const mainTop = mainRef.current.offsetTop;

			// Проверяем, если верх mainRef достигнут
			if (scrollTop + clientHeight >= mainTop) {
				setCurrent('main');
			}
		};

		containerRef.current?.addEventListener('scroll', handleScroll);
		return () =>
			containerRef.current?.removeEventListener('scroll', handleScroll);
	}, []);

	return (
		<section className={clsx(s.ingredients)}>
			<div className={clsx(s.ingredients__tabs, 'mb-10')}>
				<Tab
					value='bun'
					active={current === 'bun'}
					onClick={() => handleTabClick('bun')}>
					Булки
				</Tab>
				<Tab
					value='sauce'
					active={current === 'sauce'}
					onClick={() => handleTabClick('sauce')}>
					Соусы
				</Tab>
				<Tab
					value='main'
					active={current === 'main'}
					onClick={() => handleTabClick('main')}>
					Начинки
				</Tab>
			</div>

			<div ref={containerRef} className={clsx(s.ingredients__items)}>
				<IngredientsGroup
					filteredIngredients={filteredIngredients}
					openModal={openModal}
					bunRef={bunRef}
					sauceRef={sauceRef}
					mainRef={mainRef}
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
