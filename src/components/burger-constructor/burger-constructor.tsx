import { useState, useMemo, useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
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

// Тип для объекта, который принимает useDrop
interface DropResult {
	name: string;
}

// Тип для объекта, который собирается в useDrop
interface CollectedProps {
	isOver: boolean;
	canDrop: boolean;
}

// Тип для пропсов OrderDetails (расширяем, чтобы включить undefined)
interface OrderDetailsProps {
	orderId?: number | undefined;
}

export const BurgerConstructor: React.FC = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const [orderModalOpen, setOrderModalOpen] = useState<boolean>(false);

	const { bun, burgerIngredients } = useSelector(
		(state: any) => state.burgerConstructor
	);
	const { user } = useSelector((state: any) => state.auth);
	const { order, loading, error } = useSelector((state: any) => state.order);

	// Зона для верхней булочки
	const [{ isOver: isOverTopBun, canDrop: canDropTopBun }, topBunDropRef] =
		useDrop<{ ingredient: any }, DropResult, CollectedProps>({
			accept: 'bun',
			drop: (item: { ingredient: any }) => {
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
	] = useDrop<{ ingredient: any }, DropResult, CollectedProps>({
		accept: 'bun',
		drop: (item: { ingredient: any }) => {
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
		useDrop<{ ingredient: any }, DropResult, CollectedProps>({
			accept: 'ingredient',
			drop: (item: { ingredient: any }) => {
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
		burgerIngredients.forEach((ingredient: any) => {
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
			(sum: number, item: any) => sum + item.price,
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
			...burgerIngredients.map((item: any) => item._id),
			bun._id,
		];
		// @ts-ignore
		dispatch(createOrder(ingredientIds));
	}, [dispatch, navigate, user, bun, burgerIngredients]);

	useEffect(() => {
		if (order && !loading && !error) {
			setOrderModalOpen(true);
		}
	}, [order, loading, error]);

	const handleModalClose = useCallback(() => {
		setOrderModalOpen(false);
		// @ts-ignore
		dispatch(clearOrder());
		// @ts-ignore
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
								{burgerIngredients.map((item: any, index: number) => (
									<DraggableIngredient
										key={item.uid}
										uid={item.uid}
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
