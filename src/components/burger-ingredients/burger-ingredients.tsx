import { useState, useMemo, useRef, useEffect } from 'react';
import { useAppSelector } from '../../hooks/redux';
import { clsx } from 'clsx';
import { Tab } from '@ya.praktikum/react-developer-burger-ui-components';
import { RootState, Ingredient } from '../../types/types';
import { IngredientsGroup } from './ingredientsGroup/ingredients-group';
import s from './burger-ingredients.module.scss';

interface BurgerIngredientsProps {
	onIngredientClick: (id: string) => void;
}

interface FilteredIngredients {
	bun: Ingredient[];
	sauce: Ingredient[];
	main: Ingredient[];
}

export const BurgerIngredients: React.FC<BurgerIngredientsProps> = ({
	onIngredientClick,
}) => {
	const [current, setCurrent] = useState<'bun' | 'sauce' | 'main'>('bun');

	const { ingredients } = useAppSelector(
		(state: RootState) => state.ingredients ?? { ingredients: [] }
	);

	const containerRef = useRef<HTMLDivElement>(null);
	const bunRef = useRef<HTMLDivElement>(null);
	const sauceRef = useRef<HTMLDivElement>(null);
	const mainRef = useRef<HTMLDivElement>(null);

	const filteredIngredients = useMemo<FilteredIngredients>(
		() => ({
			bun: ingredients.filter((e) => e.type === 'bun'),
			sauce: ingredients.filter((e) => e.type === 'sauce'),
			main: ingredients.filter((e) => e.type === 'main'),
		}),
		[ingredients]
	);

	// Прокрутка по клику на таб
	const handleTabClick = (value: 'bun' | 'sauce' | 'main') => {
		setCurrent(value);
		const refMap: Record<string, React.RefObject<HTMLDivElement>> = {
			bun: bunRef,
			sauce: sauceRef,
			main: mainRef,
		};
		const targetRef = refMap[value];

		if (targetRef.current && containerRef.current) {
			containerRef.current.scrollTo({
				top: targetRef.current.offsetTop - containerRef.current.offsetTop,
				behavior: 'smooth',
			});
		}
	};

	// Автообновление активного таба при прокрутке (IntersectionObserver)
	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				const visibleSection = entries.find((entry) => entry.isIntersecting);
				if (visibleSection) {
					const section = (visibleSection.target as HTMLElement).dataset
						.section as 'bun' | 'sauce' | 'main';
					if (section) {
						setCurrent(section);
					}
				}
			},
			{
				root: containerRef.current,
				threshold: 0.4,
			}
		);

		[bunRef, sauceRef, mainRef].forEach((ref) => {
			if (ref.current) observer.observe(ref.current);
		});

		return () => {
			[bunRef, sauceRef, mainRef].forEach((ref) => {
				if (ref.current) observer.unobserve(ref.current);
			});
		};
	}, []);

	// Дополнительная логика для прокрутки (handleScroll)
	useEffect(() => {
		const handleScroll = () => {
			if (!containerRef.current || !mainRef.current) return;

			const { scrollTop, clientHeight } = containerRef.current;
			const mainTop = mainRef.current.offsetTop;

			if (scrollTop + clientHeight >= mainTop) {
				setCurrent('main');
			}
		};

		containerRef.current?.addEventListener('scroll', handleScroll);
		return () =>
			containerRef.current?.removeEventListener('scroll', handleScroll);
	}, []);

	return (
		<section className={clsx(s.ingredients)} data-testid='burger-ingredients'>
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
					onIngredientClick={onIngredientClick}
					bunRef={bunRef}
					sauceRef={sauceRef}
					mainRef={mainRef}
				/>
			</div>
		</section>
	);
};
