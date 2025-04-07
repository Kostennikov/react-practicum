import { useState, useMemo, useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
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
import { createOrder, clearOrder } from '../../services/order/reducer';
import { setPendingOrder } from '../../services/pending-order/reducer';

import s from './burger-constructor.module.scss';
import { DraggableIngredient } from './draggable-ingredient/draggable-ingredient';

export const BurgerConstructor = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const [orderModalOpen, setOrderModalOpen] = useState(false);

	const { bun, burgerIngredients } = useSelector(
		(state) => state.burgerConstructor ?? { bun: null, burgerIngredients: [] }
	);
	const { user } = useSelector((state) => state.auth);
	const { order, loading, error } = useSelector((state) => state.order);

	// зона для верхней булочки
	const [{ isOver: isOverTopBun, canDrop: canDropTopBun }, topBunDropRef] =
		useDrop({
			accept: 'bun',
			drop: (item) => {
				// dispatch(setBun(item.ingredient));
				return { name: 'Top Bun' };
			},
			collect: (monitor) => ({
				isOver: monitor.isOver(),
				canDrop: monitor.canDrop(),
			}),
		});

	// зона для нижней булочки
	const [
		{ isOver: isOverBottomBun, canDrop: canDropBottomBun },
		bottomBunDropRef,
	] = useDrop({
		accept: 'bun',
		drop: (item) => {
			// dispatch(setBun(item.ingredient));
			return { name: 'Bottom Bun' };
		},
		collect: (monitor) => ({
			isOver: monitor.isOver(),
			canDrop: monitor.canDrop(),
		}),
	});

	// зона для добавления ингредиентов
	const [{ isOver: isOverIngredient, canDrop: canDropIngredient }, dropRef] =
		useDrop({
			accept: 'ingredient',
			drop: (item) => {
				// if (ingredient.type !== 'bun') {
				// 	dispatch(addIngredient(ingredient));
				// }
				// dispatch(addIngredient(item.ingredient));
				return { name: 'Ingredient Area' };
			},
			collect: (monitor) => ({
				isOver: monitor.isOver(),
				canDrop: monitor.canDrop(),
			}),
		});

	// формируем массив
	const ingredientIds = useMemo(() => {
		const ids = [];
		if (bun) {
			ids.push(bun._id); // верхняя булка
		}
		burgerIngredients.forEach((ingredient) => {
			ids.push(ingredient._id); // ингредиенты
		});
		if (bun) {
			ids.push(bun._id); // нижняя булка
		}
		return ids;
	}, [bun, burgerIngredients]);

	const totalPrice = useMemo(() => {
		const bunPrice = bun ? bun.price * 2 : 0;
		const ingredientsPrice = burgerIngredients.reduce(
			(sum, item) => sum + item.price,
			0
		);
		return bunPrice + ingredientsPrice;
	}, [bun, burgerIngredients]);

	const handleOrderSubmit = () => {
		// Проверяем авторизацию
		if (!user) {
			// Если пользователь не авторизован, сохраняем заказ и перенаправляем на логин
			dispatch(
				setPendingOrder({
					bun,
					burgerIngredients,
				})
			);
			navigate('/sign-in');
			return;
		}

		// Если пользователь авторизован, отправляем заказ
		if (!bun) {
			alert('Пожалуйста, выберите булку для заказа');
			return;
		}

		const ingredientIds = [
			bun._id,
			...burgerIngredients.map((item) => item._id),
			bun._id,
		];

		dispatch(createOrder(ingredientIds));
	};

	// useMemo(() => {
	// 	if (order && !loading && !error) {
	// 		setOrderModalOpen(true);
	// 	}
	// }, [order, loading, error]);

	useEffect(() => {
		if (order && !loading && !error) {
			setOrderModalOpen(true);
		}
	}, [order, loading, error]);

	const handleModalClose = () => {
		setOrderModalOpen(false);
		dispatch(clearOrder());
		dispatch(clearOrder());
		dispatch(clearConstructor());
	};

	return (
		<>
			<section className={clsx(s.constructor)}>
				<div className={clsx(s.constructor__wrapper)}>
					{/* Верхняя булочка */}
					<div
						ref={topBunDropRef}
						className={clsx(s.dropZone, {
							[s.dropZoneActive]: isOverTopBun,
							[s.dropZoneCanDrop]: canDropTopBun && !isOverTopBun,
						})}>
						{bun ? (
							<div className={clsx(s.dropZone__bun, 'pl-8')}>
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
						className={clsx(s.dropZone, {
							[s.dropZoneActive]: isOverIngredient,
							[s.dropZoneCanDrop]: canDropIngredient && !isOverIngredient,
						})}>
						{burgerIngredients && burgerIngredients.length > 0 && (
							<ul className={clsx(s.constructor__list)}>
								{burgerIngredients.map((item, index) => (
									<DraggableIngredient
										key={item.uid}
										uid={item.uid}
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
					<div
						ref={bottomBunDropRef}
						className={clsx(s.dropZone, {
							[s.dropZoneActive]: isOverBottomBun,
							[s.dropZoneCanDrop]: canDropBottomBun && !isOverBottomBun,
						})}>
						{bun ? (
							<div className={clsx(s.dropZone__bun, 'pl-8')}>
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
						{error && (
							<p className='text text_type_main-default text_color_error mr-8'>
								{error}
							</p>
						)}
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
							onClick={handleOrderSubmit}
							disabled={!bun || burgerIngredients.length === 0}>
							{loading ? 'Оформление...' : 'Оформить заказ'}
						</Button>
					</div>

					{/* Модальное окно заказа */}
					{/* {orderModalOpen && (
						<Modal onClose={() => setOrderModalOpen(false)}>
							<OrderDetails />
						</Modal>
					)} */}

					{orderModalOpen && (
						<Modal onClose={handleModalClose}>
							<OrderDetails orderId={order?.order?.number} />
						</Modal>
					)}
				</div>
			</section>
		</>
	);
};

BurgerConstructor.propTypes = {};
