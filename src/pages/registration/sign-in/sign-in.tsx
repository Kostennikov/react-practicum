import React, { FC, useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux';
import s from './sign-in.module.scss';
import {
	Input,
	PasswordInput,
	Button,
} from '@ya.praktikum/react-developer-burger-ui-components';
import { loginUser } from '../../../services/auth/reducer';
import { createOrder } from '../../../services/order/reducer';
import { clearPendingOrder } from '../../../services/pending-order/reducer';
import {
	RootState,
	BurgerConstructorState,
	Ingredient,
	AppDispatch,
} from '../../../types/types';

interface SignInProps {}
interface LoginUserPayload {
	email: string;
	password: string;
}

export const SignIn: FC<SignInProps> = () => {
	const [email, setEmail] = useState<string>('');
	const [password, setPassword] = useState<string>('');
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const location = useLocation();
	const { loading, error, user } = useAppSelector(
		(state: RootState) => state.auth
	);
	const { pendingOrder } = useAppSelector(
		(state: RootState) => state.pendingOrder
	);

	const inputRef = useRef<HTMLInputElement>(null);

	const onIconClick = () => {
		setTimeout(() => inputRef.current?.focus(), 0);
	};

	// После успешного логина проверяем pendingOrder
	useEffect(() => {
		if (user) {
			const from = location.state?.from || { pathname: '/' };

			if (pendingOrder) {
				const { bun, burgerIngredients }: BurgerConstructorState = pendingOrder;
				if (bun) {
					const ingredientIds: string[] = [
						bun._id,
						...burgerIngredients.map((item: Ingredient) => item._id),
						bun._id,
					];
					dispatch(createOrder(ingredientIds)).then(() => {
						dispatch(clearPendingOrder());
						navigate(from, { replace: true });
					});
				} else {
					dispatch(clearPendingOrder());
					navigate(from, { replace: true });
				}
			} else {
				navigate(from, { replace: true });
			}
		}
	}, [user, pendingOrder, dispatch, navigate, location.state]);

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		dispatch(loginUser({ email, password }));
	};

	return (
		<section className={clsx(s.sign_in)}>
			<div className={clsx(s.sign_in__wrapper)}>
				<h1 className='text text_type_main-large mb-6'>Вход</h1>
				<form onSubmit={handleSubmit}>
					<Input
						type='email'
						placeholder='E-mail'
						onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
							setEmail(e.target.value)
						}
						value={email}
						name='email'
						error={!!error}
						ref={inputRef}
						onIconClick={onIconClick}
						errorText={error || undefined}
						size='default'
						extraClass='mb-6'
					/>
					<PasswordInput
						onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
							setPassword(e.target.value)
						}
						value={password}
						name='password'
						extraClass='mb-6'
					/>
					<Button
						disabled={loading}
						htmlType='submit'
						type='primary'
						size='large'
						extraClass='mb-20'>
						{loading ? 'Вход...' : 'Войти'}
					</Button>
				</form>
				{error && <p style={{ color: 'red' }}>{error}</p>}
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
