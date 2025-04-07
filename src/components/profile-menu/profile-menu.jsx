import { clsx } from 'clsx';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
	Logo,
	BurgerIcon,
	Button,
	ListIcon,
	ProfileIcon,
} from '@ya.praktikum/react-developer-burger-ui-components';
import s from './profile-menu.module.scss';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuth, logoutUser } from '../../services/auth/reducer';

export const ProfileMenu = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const { loading, error, isAuthenticated } = useSelector(
		(state) => state.auth
	);

	const handleLogout = () => {
		dispatch(logoutUser()).then(() => {
			navigate('/sign-in');
		});
	};
	return (
		<div className={clsx(s.profile_menu)}>
			<nav className={clsx(s.profile_menu__nav)}>
				<NavLink to='/profile' end>
					{({ isActive }) => (
						<p
							className={`${
								isActive ? s.active : ''
							} text text_type_main-medium`}>
							Профиль
						</p>
					)}
				</NavLink>

				<NavLink to='/profile/orders'>
					{({ isActive }) => (
						<p
							className={`${
								isActive ? s.active : ''
							} text text_type_main-medium`}>
							История заказов
						</p>
					)}
				</NavLink>

				<button onClick={handleLogout} className='text text_type_main-medium'>
					Выйти
				</button>

				<span className='text text_type_main-default text_color_inactive mt-20'>
					В этом разделе вы можете изменить свои персональные данные
				</span>
			</nav>
		</div>
	);
};
