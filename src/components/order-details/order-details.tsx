import { clsx } from 'clsx';
import doneImage from '../../assets/images/done.png';
import s from './order-details.module.scss';

interface OrderDetailsProps {
	orderId: number | string;
}

export const OrderDetails: React.FC<OrderDetailsProps> = ({ orderId }) => {
	return (
		<>
			<section className={clsx(s.order_details)}>
				<div className={clsx(s.order_details__wrapper)}>
					<div className={clsx(s.order_details__content)}>
						<div
							className={clsx(
								s.order_details__id,
								'text text_type_digits-large mb-8'
							)}>
							<p className='text text_type_digits-large'>{orderId}</p>
						</div>

						<div
							className={clsx(
								s.order_details__subtitle,
								'text text_type_main-medium mb-15'
							)}>
							идентификатор заказа
						</div>
						<div className={clsx(s.order_details__img, 'mb-15')}>
							<img src={doneImage} alt='done' />
						</div>

						<p className='text text_type_main-default mb-2'>
							Ваш заказ начали готовить
						</p>
						<p className='text text_type_main-default text_color_inactive'>
							Дождитесь готовности на орбитальной станции
						</p>
					</div>
				</div>
			</section>
		</>
	);
};
