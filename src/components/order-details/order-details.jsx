import { clsx } from 'clsx';
import s from './order-details.module.scss';
import PropTypes from 'prop-types';
import doneImage from '../../assets/images/done.png';

export const OrderDetails = (props) => {
	const { orderId } = props;

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
							{orderId}
						</div>

						<div
							className={clsx(
								s.order_details__subtitle,
								'text text_type_main-medium mb-15'
							)}>
							идентификатор заказа
						</div>
						<div className={clsx(s.order_details__img, 'mb-15')}>
							<img src={doneImage} alt='' />
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

OrderDetails.propTypes = {
	orderId: PropTypes.number.isRequired,
};
