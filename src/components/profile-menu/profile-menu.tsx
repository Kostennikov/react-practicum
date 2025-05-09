import { clsx } from 'clsx';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuth, logoutUser } from '../../services/auth/reducer.js';
import s from './profile-menu.module.scss';
import { RootState } from '../../types/types';

export const ProfileMenu = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const { loading, error } = useSelector((state: RootState) => state.auth);

	const handleLogout = async () => {
		try {
			// @ts-ignore
			await dispatch(logoutUser()).unwrap(); // unwrap для обработки промса из thunk
			navigate('/login');
		} catch (err) {
			console.error('Logout failed:', err);
		}
	};

	return (
		<div className={clsx(s.profile_menu)}>
			<nav className={clsx(s.profile_menu__nav)}>
				<NavLink to='/profile' end>
					{({ isActive }) => (
						<p
							className={clsx(
								'text text_type_main-medium',
								isActive && s.active
							)}>
							Профиль
						</p>
					)}
				</NavLink>

				<NavLink to='/profile/orders'>
					{({ isActive }) => (
						<p
							className={clsx(
								'text text_type_main-medium',
								isActive && s.active
							)}>
							История заказов
						</p>
					)}
				</NavLink>

				<button
					onClick={handleLogout}
					className='text text_type_main-medium'
					disabled={loading}>
					Выйти
				</button>

				<span className='text text_type_main-default text_color_inactive mt-20'>
					В этом разделе вы можете изменить свои персональные данные
				</span>
			</nav>
		</div>
	);
};
