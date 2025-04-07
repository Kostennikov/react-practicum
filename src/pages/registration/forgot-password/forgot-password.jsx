import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { useDispatch } from 'react-redux';
import s from './forgot-password.module.scss';
import {
	Input,
	Button,
} from '@ya.praktikum/react-developer-burger-ui-components';
import { allowResetPassword } from '../../../services/auth/reducer';

export const ForgotPassword = () => {
	const [value, setValue] = useState('');
	const [error, setError] = useState(null);
	const dispatch = useDispatch();
	const navigate = useNavigate();

	const inputRef = useRef(null);
	const onIconClick = () => {
		setTimeout(() => inputRef.current.focus(), 0);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError(null);
		try {
			const response = await fetch(
				'https://norma.nomoreparties.space/api/password-reset',
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ email: value }),
				}
			);
			const data = await response.json();
			if (!response.ok || !data.success) {
				throw new Error(data.message || 'Ошибка восстановления пароля');
			}
			dispatch(allowResetPassword());
			navigate('/reset-password');
		} catch (error) {
			setError(error.message);
		}
	};

	return (
		<section className={clsx(s.forgot_password)}>
			<div className={clsx(s.forgot_password__wrapper)}>
				<h1 className='text text_type_main-large mb-6'>
					Восстановление пароля
				</h1>
				<form onSubmit={handleSubmit}>
					<Input
						type={'email'}
						placeholder={'Укажите e-mail'}
						onChange={(e) => setValue(e.target.value)}
						value={value}
						name={'email'}
						error={!!error}
						ref={inputRef}
						onIconClick={onIconClick}
						errorText={error}
						size={'default'}
						extraClass='mb-6'
						required
					/>
					<Button
						htmlType='submit'
						type='primary'
						size='large'
						extraClass='mb-20'>
						Восстановить
					</Button>
				</form>
				{error && (
					<p className='text text_type_main-default text_color_error'>
						{error}
					</p>
				)}
				<p className='text text_type_main-default text_color_inactive'>
					Вспомнили пароль? <Link to='/login'>Войти</Link>
				</p>
			</div>
		</section>
	);
};
