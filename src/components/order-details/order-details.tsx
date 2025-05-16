import { clsx } from 'clsx';
import doneImage from '../../assets/images/done.png';
import s from './order-details.module.scss';

interface OrderDetailsProps {
	orderId: string | number;
}

export const OrderDetails: React.FC<OrderDetailsProps> = ({ orderId }) => {
	return (
		<>
			<section className={clsx(s.order_details)} data-testid='order-details'>
				<div className={clsx(s.order_details__wrapper)}>
					<div className={clsx(s.order_details__content)}>
						<div
							className={clsx(
								s.order_details__id,
								'text text_type_digits-large mb-8'
							)}
							data-testid='order-number'>
							<p className='text text_type_digits-large'>{orderId}</p>
						</div>

						<div
							className={clsx(
								s.order_details__subtitle,
								'text text_type_main-medium mb-15'
							)}
							data-testid='order-subtitle'>
							идентификатор заказа
						</div>
						<div
							className={clsx(s.order_details__img, 'mb-15')}
							data-testid='order-done-image'>
							<img src={doneImage} alt='done' />
						</div>

						<p
							className='text text_type_main-default mb-2'
							data-testid='order-status'>
							Ваш заказ начали готовить
						</p>
						<p
							className='text text_type_main-default text_color_inactive'
							data-testid='order-instruction'>
							Дождитесь готовности на орбитальной станции
						</p>
					</div>
				</div>
			</section>
		</>
	);
};
