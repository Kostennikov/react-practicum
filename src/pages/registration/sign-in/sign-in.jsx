import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link, useLocation } from 'react-router-dom';

import { clsx } from 'clsx';
import s from './sign-in.module.scss';
import {
	CurrencyIcon,
	Counter,
	Input,
	PasswordInput,
	Button,
} from '@ya.praktikum/react-developer-burger-ui-components';

import { loginUser } from '../../../services/auth/reducer';
import { createOrder } from '../../../services/order/reducer';
import { clearPendingOrder } from '../../../services/pending-order/reducer';

export const SignIn = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const location = useLocation();
	const { loading, error, user, isAuthenticated } = useSelector(
		(state) => state.auth
	);
	const { pendingOrder } = useSelector((state) => state.pendingOrder);

	const handleSubmit = (e) => {
		e.preventDefault();
		dispatch(loginUser({ email, password }));
	};

	const inputRef = useRef(null);
	const onIconClick = () => {
		setTimeout(() => inputRef.current.focus(), 0);
		alert('Icon Click Callback');
	};

	// После успешного логина проверяем pendingOrder
	useEffect(() => {
		if (user) {
			const from = location.state?.from || { pathname: '/' };

			if (pendingOrder) {
				// Если есть сохраненный заказ, отправляем его
				const { bun, burgerIngredients } = pendingOrder;
				if (bun) {
					const ingredientIds = [
						bun._id,
						...burgerIngredients.map((item) => item._id),
						bun._id,
					];
					dispatch(createOrder(ingredientIds)).then(() => {
						dispatch(clearPendingOrder()); // Очищаем сохраненный заказ
						navigate(from, { replace: true }); // Перенаправляем на запрошенный маршрут
					});
				} else {
					dispatch(clearPendingOrder());
					navigate(from, { replace: true }); // Если заказа нет, просто перенаправляем
				}
			} else {
				navigate(from, { replace: true }); // Если нет сохраненного заказа, перенаправляем
			}
		}
	}, [user, pendingOrder, dispatch, navigate, location.state]);

	return (
		<section className={clsx(s.sign_in)}>
			<div className={clsx(s.sign_in__wrapper)}>
				<h1 className='text text_type_main-large mb-6'>Вход</h1>
				<form onSubmit={handleSubmit}>
					<Input
						type={'email'}
						placeholder={'E-mail'}
						onChange={(e) => setEmail(e.target.value)}
						// icon={'CurrencyIcon'}
						value={email}
						name={'email'}
						error={false}
						ref={inputRef}
						onIconClick={onIconClick}
						errorText={'Ошибка'}
						size={'default'}
						extraClass='mb-6'
					/>

					<PasswordInput
						onChange={(e) => setPassword(e.target.value)}
						value={password}
						name={'password'}
						extraClass='mb-6'
					/>

					<Button
						disabled={loading}
						htmlType='submit'
						type='primary'
						size='large'
						extraClass='mb-20'>
						{loading ? 'Загрузка...' : 'Войти'}
					</Button>
				</form>

				{error && <p style={{ color: 'red' }}>{error}</p>}
				{isAuthenticated && <p>Вы успешно вошли!</p>}

				<p className='text text_type_main-default text_color_inactive mb-4'>
					Вы — новый пользователь?{' '}
					<Link to='/register'>Зарегистрироваться</Link>
				</p>
				<p className='text text_type_main-default text_color_inactive'>
					Забыли пароль? <Link to='/forgot-password'>Восстановить пароль</Link>
				</p>
			</div>
		</section>
	);
};
