import { NavLink } from 'react-router-dom';
import { clsx } from 'clsx';
import {
	Logo,
	BurgerIcon,
	Button,
	ListIcon,
	ProfileIcon,
} from '@ya.praktikum/react-developer-burger-ui-components';
import s from './app-header.module.scss';

// Тип для функции renderProp в NavLink
interface NavLinkRenderProps {
	isActive: boolean;
}

export const AppHeader: React.FC = () => {
	return (
		<header className={clsx(s.header)}>
			<div className={clsx(s.container)}>
				<div className={clsx(s.header__wrapper)}>
					<nav className={clsx(s.header__nav)}>
						<NavLink to='/'>
							{({ isActive }: NavLinkRenderProps) => (
								<Button
									htmlType='button'
									type='secondary'
									size='small'
									className={`${isActive ? s.active : ''} ${clsx(
										s.button__burger
									)}`}>
									<BurgerIcon type={isActive ? 'primary' : 'secondary'} />
									Конструктор
								</Button>
							)}
						</NavLink>

						<Button
							htmlType='button'
							type='secondary'
							size='small'
							className={clsx(s.button__orders)}>
							<ListIcon type='secondary' /> Лента заказов
						</Button>
					</nav>
					<NavLink to='/'>
						<Logo className={clsx(s.logo)} />
					</NavLink>
					<NavLink to='/profile'>
						{({ isActive }: NavLinkRenderProps) => (
							<Button
								htmlType='button'
								type='secondary'
								size='small'
								className={`${isActive ? s.active : ''} ${clsx(s.button__lk)}`}>
								<ProfileIcon type={isActive ? 'primary' : 'secondary'} />
								Личный кабинет
							</Button>
						)}
					</NavLink>
				</div>
			</div>
		</header>
	);
};
