import { useState, useMemo } from 'react';
import { clsx } from 'clsx';
import PropTypes from 'prop-types';
import {
	Button,
	ConstructorElement,
	DragIcon,
	CurrencyIcon,
} from '@ya.praktikum/react-developer-burger-ui-components';
import s from './burger-constructor.module.scss';
import { ingredientPropType } from '../../utils/prop-types';

import { Modal } from '../modal/modal';
import { OrderDetails } from '../order-details/order-details';

export const BurgerConstructor = (props) => {
	const { ingredients } = props;
	const [orderModalOpen, setOrderModalOpen] = useState(false);

	const openOrderModal = () => {
		setOrderModalOpen(true);
	};
	const closeOrderModal = () => {
		setOrderModalOpen(false);
	};

	const buns = useMemo(
		() => ingredients.filter((item) => item.type === 'bun'),
		[ingredients]
	);

	const randomBun = useMemo(
		() =>
			buns.length > 0 ? buns[Math.floor(Math.random() * buns.length)] : null,
		[buns]
	);

	return (
		<>
			<section className={clsx(s.constructor)}>
				<div className={clsx(s.constructor__wrapper)}>
					{randomBun && (
						<>
							<div className='pl-8'>
								<ConstructorElement
									type='top'
									isLocked={true}
									text={`${randomBun.name} (верх)`}
									price={randomBun.price}
									thumbnail={randomBun.image}
								/>
							</div>

							<ul className={clsx(s.constructor__list)}>
								{ingredients
									.filter((item) => item.type !== 'bun')
									.map((item) => (
										<li className={clsx(s.constructor__item)} key={item._id}>
											<DragIcon type='primary' />
											<ConstructorElement
												text={item.name}
												price={item.price}
												thumbnail={item.image}
											/>
										</li>
									))}
							</ul>
							<div className='pl-8'>
								<ConstructorElement
									type='bottom'
									isLocked={true}
									text={`${randomBun.name} (низ)`}
									price={randomBun.price}
									thumbnail={randomBun.image}
								/>
							</div>
						</>
					)}

					<div className={clsx(s.constructor__total, 'mt-10')}>
						<div className={clsx(s.constructor__price, 'mr-10')}>
							<p
								className={clsx(
									s.constructor__price_num,
									'text text_type_main-medium mr-2'
								)}>
								610
							</p>
							<CurrencyIcon type='primary' />
						</div>
						<Button
							htmlType='button'
							type='primary'
							size='large'
							onClick={openOrderModal}>
							Оформить заказ
						</Button>
					</div>

					{orderModalOpen && (
						<Modal onClose={closeOrderModal}>
							<OrderDetails orderId='034536' />
						</Modal>
					)}
				</div>
			</section>
		</>
	);
};

BurgerConstructor.propTypes = {
	ingredients: PropTypes.arrayOf(ingredientPropType.isRequired).isRequired,
};
