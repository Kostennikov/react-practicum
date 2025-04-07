import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import s from './reset-password.module.scss';
import {
	Input,
	PasswordInput,
	Button,
} from '@ya.praktikum/react-developer-burger-ui-components';

export const ResetPassword = () => {
	const [password, setPassword] = useState('');
	const [token, setToken] = useState('');
	const [error, setError] = useState(null);
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
				'https://norma.nomoreparties.space/api/password-reset/reset',
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ password, token }),
				}
			);
			const data = await response.json();
			if (!response.ok || !data.success) {
				throw new Error(data.message || 'Ошибка сброса пароля');
			}
			navigate('/sign-in');
		} catch (error) {
			setError(error.message);
		}
	};

	return (
		<section className={clsx(s.reset_password)}>
			<div className={clsx(s.reset_password__wrapper)}>
				<h1 className='text text_type_main-large mb-6'>
					Восстановление пароля
				</h1>
				<form onSubmit={handleSubmit}>
					<PasswordInput
						placeholder={'Введите новый пароль'}
						onChange={(e) => setPassword(e.target.value)}
						value={password}
						name={'password'}
						extraClass='mb-6'
						required
					/>
					<Input
						type={'text'}
						placeholder={'Введите код из письма'}
						onChange={(e) => setToken(e.target.value)}
						value={token}
						name={'token'}
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
						Сохранить
					</Button>
				</form>
				{error && (
					<p className='text text_type_main-default text_color_error'>
						{error}
					</p>
				)}
				<p className='text text_type_main-default text_color_inactive'>
					Вспомнили пароль? <Link to='/sign-in'>Войти</Link>
				</p>
			</div>
		</section>
	);
};
