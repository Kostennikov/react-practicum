import { useState, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { clsx } from 'clsx';
import { useDrop } from 'react-dnd';

import {
	Button,
	ConstructorElement,
	CurrencyIcon,
	DragIcon,
} from '@ya.praktikum/react-developer-burger-ui-components';

import { Modal } from '../modal/modal';
import { OrderDetails } from '../order-details/order-details';

import {
	setBun,
	addIngredient,
	clearConstructor,
	removeIngredient,
	moveIngredient,
} from '../../services/burger-constructor/reducer';

import {
	setSingleIngredient,
	clearSingleIngredient,
} from '../../services/single-ingredient/reducer';

import s from './burger-constructor.module.scss';
import { DraggableIngredient } from './draggable-ingredient/draggable-ingredient';

export const BurgerConstructor = () => {
	const dispatch = useDispatch();
	const [orderModalOpen, setOrderModalOpen] = useState(false);

	const { bun, burgerIngredients } = useSelector(
		(state) => state.burgerConstructor ?? { bun: null, burgerIngredients: [] }
	);
	const [droppedBoxNames, setDroppedBoxNames] = useState([]);

	const [{ isOver: isOverBun, canDrop: canDropBun }, bunDropRef] = useDrop({
		accept: 'ingredient',
		drop: (ingredient) => {
			// if (ingredient.type === 'bun') {
			// 	dispatch(setBun(ingredient));
			// }
		},
		collect: (monitor) => ({
			isOver: monitor.isOver(),
			canDrop: monitor.canDrop(),
		}),
	});

	// Drop-зона для добавления ингредиентов
	const [{ isOver: isOverIngredient, canDrop: canDropIngredient }, dropRef] =
		useDrop({
			accept: 'ingredient',
			drop: (ingredient) => {
				// if (ingredient.type !== 'bun') {
				// 	dispatch(addIngredient(ingredient)); // Добавляем ингредиент
				// }
			},
			collect: (monitor) => ({
				isOver: monitor.isOver(),
				canDrop: monitor.canDrop(),
			}),
		});

	// const isActive = canDrop && isOver;
	// let backgroundColor = '#222';
	// if (isActive) {
	// 	backgroundColor = 'darkgreen';
	// } else if (canDrop) {
	// 	backgroundColor = 'darkkhaki';
	// }

	const bunBackgroundColor = isOverBun
		? 'darkgreen'
		: canDropBun
		? 'darkkhaki'
		: 'transparent';
	const ingredientBackgroundColor = isOverIngredient
		? 'darkgreen'
		: canDropIngredient
		? 'darkkhaki'
		: 'transparent';

	const totalPrice = useMemo(() => {
		const bunPrice = bun ? bun.price * 2 : 0;
		const ingredientsPrice = burgerIngredients.reduce(
			(sum, item) => sum + item.price,
			0
		);
		return bunPrice + ingredientsPrice;
	}, [bun, burgerIngredients]);

	const handleDrop = useCallback(
		(index, item) => {
			const { name } = item;
			setDroppedBoxNames(
				update(droppedBoxNames, name ? { $push: [name] } : { $push: [] })
			);
			setDustbins(
				update(dustbins, {
					[index]: {
						lastDroppedItem: {
							$set: item,
						},
					},
				})
			);
		},
		[droppedBoxNames]
	);
	return (
		<>
			<section className={clsx(s.constructor)}>
				<div className={clsx(s.constructor__wrapper)}>
					{/* Верхняя булочка */}
					<div
						ref={bunDropRef}
						style={{ backgroundColor: bunBackgroundColor }}
						onDrop={(bun) => handleDrop(index, bun)}>
						{bun ? (
							<div className='pl-8'>
								<ConstructorElement
									type='top'
									isLocked={true}
									text={`${bun.name} (верх)`}
									price={bun.price}
									thumbnail={bun.image}
								/>
							</div>
						) : (
							<div
								className={clsx(
									s.constructor__bun,
									s.constructor__bun_top,
									'text text_type_main-default ml-8'
								)}>
								Выберите булочки
							</div>
						)}
					</div>

					{/* Список ингредиентов */}
					<div
						ref={dropRef}
						style={{ backgroundColor: ingredientBackgroundColor }}>
						{burgerIngredients && burgerIngredients.length > 0 && (
							<ul className={clsx(s.constructor__list)}>
								{burgerIngredients.map((item, index) => (
									<DraggableIngredient
										key={item._id}
										index={index}
										item={item}
										// moveCard={moveCard}
									/>
								))}
							</ul>
						)}
						{burgerIngredients.length === 0 && (
							<div
								className={clsx(
									s.constructor__ingredient,
									'text text_type_main-default ml-8'
								)}>
								Выберите начинку
							</div>
						)}
					</div>

					{/* Нижняя булочка */}
					<div ref={bunDropRef} style={{ backgroundColor: bunBackgroundColor }}>
						{bun ? (
							<div className='pl-8'>
								<ConstructorElement
									type='bottom'
									isLocked={true}
									text={`${bun.name} (низ)`}
									price={bun.price}
									thumbnail={bun.image}
								/>
							</div>
						) : (
							<div
								className={clsx(
									s.constructor__bun,
									s.constructor__bun_bottom,
									'text text_type_main-default ml-8'
								)}>
								Выберите булочки
							</div>
						)}
					</div>

					{/* Итоговая сумма и кнопка заказа */}
					<div className={clsx(s.constructor__total, 'mt-10')}>
						<div className={clsx(s.constructor__price, 'mr-10')}>
							<p
								className={clsx(
									s.constructor__price_num,
									'text text_type_main-medium mr-2'
								)}>
								{totalPrice}
							</p>
							<CurrencyIcon type='primary' />
						</div>
						<Button
							htmlType='button'
							type='primary'
							size='large'
							onClick={() => setOrderModalOpen(true)}
							disabled={!bun || burgerIngredients.length === 0}>
							Оформить заказ
						</Button>
					</div>

					{/* Модальное окно заказа */}
					{orderModalOpen && (
						<Modal onClose={() => setOrderModalOpen(false)}>
							<OrderDetails />
						</Modal>
					)}
				</div>
			</section>
		</>
	);
};
