import { useState, useMemo, useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom'; // Добавляем useLocation
import { clsx } from 'clsx';
import { useDrop, DropTargetMonitor } from 'react-dnd';
import {
	Button,
	ConstructorElement,
	CurrencyIcon,
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
import { createOrder, clearOrder } from '../../services/order/reducer';
import { setPendingOrder } from '../../services/pending-order/reducer';
import { DraggableIngredient } from './draggable-ingredient/draggable-ingredient';
import s from './burger-constructor.module.scss';
import {
	Ingredient,
	User,
	Order,
	BurgerConstructorState,
	AppDispatch,
	RootState,
} from '../../types/types';

// Тип для объекта, который принимает useDrop
interface DropResult {
	name: string;
}

// Тип для объекта, который собирается в useDrop
interface CollectedProps {
	isOver: boolean;
	canDrop: boolean;
}

// Тип для пропсов OrderDetails
interface OrderDetailsProps {
	orderId?: number | undefined;
}

export const BurgerConstructor: React.FC = () => {
	const dispatch = useDispatch<AppDispatch>();
	const navigate = useNavigate();
	const location = useLocation();
	const [orderModalOpen, setOrderModalOpen] = useState<boolean>(false);

	const { bun, burgerIngredients } = useSelector(
		(state: RootState) => state.burgerConstructor
	);
	const { user } = useSelector((state: RootState) => state.auth);
	const { order, loading, error } = useSelector(
		(state: RootState) => state.order
	);

	// Зона для верхней булочки
	const [{ isOver: isOverTopBun, canDrop: canDropTopBun }, topBunDropRef] =
		useDrop<{ ingredient: Ingredient }, DropResult, CollectedProps>({
			accept: 'bun',
			drop: (item: { ingredient: Ingredient }) => {
				dispatch(setBun(item.ingredient));
				return { name: 'Top Bun' };
			},
			collect: (monitor: DropTargetMonitor) => ({
				isOver: monitor.isOver(),
				canDrop: monitor.canDrop(),
			}),
		});

	// Зона для нижней булочки
	const [
		{ isOver: isOverBottomBun, canDrop: canDropBottomBun },
		bottomBunDropRef,
	] = useDrop<{ ingredient: Ingredient }, DropResult, CollectedProps>({
		accept: 'bun',
		drop: (item: { ingredient: Ingredient }) => {
			dispatch(setBun(item.ingredient));
			return { name: 'Bottom Bun' };
		},
		collect: (monitor: DropTargetMonitor) => ({
			isOver: monitor.isOver(),
			canDrop: monitor.canDrop(),
		}),
	});

	// Зона для добавления ингредиентов
	const [{ isOver: isOverIngredient, canDrop: canDropIngredient }, dropRef] =
		useDrop<{ ingredient: Ingredient }, DropResult, CollectedProps>({
			accept: 'ingredient',
			drop: (item: { ingredient: Ingredient }) => {
				if (item.ingredient.type !== 'bun') {
					dispatch(addIngredient(item.ingredient));
				}
				return { name: 'Ingredient Area' };
			},
			collect: (monitor: DropTargetMonitor) => ({
				isOver: monitor.isOver(),
				canDrop: monitor.canDrop(),
			}),
		});

	// Формируем массив ID ингредиентов
	const ingredientIds = useMemo<string[]>(() => {
		const ids: string[] = [];
		if (bun) {
			ids.push(bun._id); // Верхняя булка
		}
		burgerIngredients.forEach((ingredient: Ingredient) => {
			ids.push(ingredient._id); // Ингредиенты
		});
		if (bun) {
			ids.push(bun._id); // Нижняя булка
		}
		return ids;
	}, [bun, burgerIngredients]);

	// Вычисляем общую стоимость
	const totalPrice = useMemo<number>(() => {
		const bunPrice = bun ? bun.price * 2 : 0;
		const ingredientsPrice = burgerIngredients.reduce(
			(sum: number, item: Ingredient) => sum + item.price,
			0
		);
		return bunPrice + ingredientsPrice;
	}, [bun, burgerIngredients]);

	const handleOrderSubmit = useCallback(() => {
		// Проверяем авторизацию
		if (!user) {
			// Если пользователь не авторизован, сохраняем заказ и перенаправляем на логин
			dispatch(
				setPendingOrder({
					bun,
					burgerIngredients,
				})
			);
			navigate('/login');
			return;
		}

		// Если пользователь авторизован, отправляем заказ
		if (!bun) {
			alert('Пожалуйста, выберите булку для заказа');
			return;
		}

		const ingredientIds = [
			bun._id,
			...burgerIngredients.map((item: Ingredient) => item._id),
			bun._id,
		];
		dispatch(createOrder(ingredientIds));
	}, [dispatch, navigate, user, bun, burgerIngredients]);

	// Очищаем state.order при монтировании на главной странице
	useEffect(() => {
		if (location.pathname === '/') {
			dispatch(clearOrder());
		}
	}, [dispatch, location.pathname]);

	// Открываем модальное окно только после успешного создания заказа
	useEffect(() => {
		if (order && !loading && !error) {
			console.log('BurgerConstructor: Order created, order:', order);
			setOrderModalOpen(true);
		}
	}, [order, loading, error]);

	const handleModalClose = useCallback(() => {
		setOrderModalOpen(false);
		dispatch(clearOrder());
		dispatch(clearConstructor());
	}, [dispatch]);

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
								{burgerIngredients.map((item: Ingredient, index: number) => (
									<DraggableIngredient
										key={item.uid}
										uid={item.uid ?? ''}
										index={index}
										item={item}
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
								onClick={handleOrderSubmit}
								disabled={!bun || burgerIngredients.length === 0}>
								{loading ? 'Оформление...' : 'Оформить заказ'}
							</Button>
						</div>
					</div>

					{/* Модальное окно заказа */}
					{orderModalOpen && (
						<Modal onClose={handleModalClose}>
							<OrderDetails orderId={order?.number ?? 0} />
						</Modal>
					)}
				</div>
			</section>
		</>
	);
};
