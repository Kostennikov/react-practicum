import { clsx } from 'clsx';
import {
	Logo,
	BurgerIcon,
	Button,
	ListIcon,
	ProfileIcon,
} from '@ya.praktikum/react-developer-burger-ui-components';
import s from './app-header.module.scss';

export const AppHeader = () => {
	return (
		<header className={clsx(s.header)}>
			<div className={clsx(s.container)}>
				<div className={clsx(s.header__wrapper)}>
					<nav className={clsx(s.header__nav)}>
						<Button
							htmlType='button'
							type='secondary'
							size='small'
							className={clsx(s.button__burger)}>
							<BurgerIcon type='primary' /> Конструктор
						</Button>

						<Button
							htmlType='button'
							type='secondary'
							size='small'
							className={clsx(s.button__orders)}>
							<ListIcon type='secondary' /> Лента заказов
						</Button>
					</nav>

					<Logo className={clsx(s.logo)} />

					<Button
						htmlType='button'
						type='secondary'
						size='small'
						className={clsx(s.button__lk)}>
						<ProfileIcon type='secondary' /> Личный кабинет
					</Button>
				</div>
			</div>
		</header>
	);
};
