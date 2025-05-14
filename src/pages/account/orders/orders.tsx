import { FC } from 'react';
import { clsx } from 'clsx';
import s from './orders.module.scss';
import { ProfileMenu } from '../../../components/profile-menu/profile-menu';
import { FeedList } from '../../../components/feed/feed-list/feed-list';

interface OrdersProps {}

export const Orders: FC<OrdersProps> = () => {
	return (
		<section className={clsx(s.orders)}>
			<div className={clsx(s.container)}>
				<div className={clsx(s.orders__wrapper)}>
					<ProfileMenu />
					<div className={clsx(s.orders__content, 'mt-10')}>
						{/* <h1 className='text text_type_main-large mb-6'>Список заказов</h1> */}
						<FeedList />
					</div>
				</div>
			</div>
		</section>
	);
};
