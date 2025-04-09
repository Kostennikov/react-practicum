import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { useDispatch, useSelector } from 'react-redux';
import s from './reset-password.module.scss';
import {
	Input,
	PasswordInput,
	Button,
} from '@ya.praktikum/react-developer-burger-ui-components';
import { resetPassword } from '../../../services/auth/reducer';

export const ResetPassword = () => {
	const [password, setPassword] = useState('');
	const [token, setToken] = useState('');
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const { loading, error } = useSelector((state) => state.auth);

	const inputRef = useRef(null);
	const onIconClick = () => {
		setTimeout(() => inputRef.current.focus(), 0);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		dispatch(resetPassword({ password, token })).then((result) => {
			if (result.type === resetPassword.fulfilled.type) {
				navigate('/login', { replace: true });
			}
		});
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
						extraClass='mb-20'
						disabled={loading}>
						{loading ? 'Загрузка...' : 'Сохранить'}
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
