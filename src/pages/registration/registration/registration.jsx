import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import s from './registration.module.scss';
import {
	CurrencyIcon,
	Counter,
	Input,
	PasswordInput,
	Button,
} from '@ya.praktikum/react-developer-burger-ui-components';

import { registerUser } from '../../../services/auth/reducer';

export const Registration = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [name, setName] = useState('');
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const { loading, error, isAuthenticated } = useSelector(
		(state) => state.auth
	);

	const inputRef = useRef(null);
	const onIconClick = () => {
		setTimeout(() => inputRef.current.focus(), 0);
		alert('Icon Click Callback');
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		dispatch(registerUser({ email, password, name })).then((result) => {
			if (result.type === registerUser.fulfilled.type) {
				navigate('/login'); // После регистрации перенаправлем на страницу входа
			}
		});
	};

	return (
		<section className={clsx(s.registration)}>
			<div className={clsx(s.registration__wrapper)}>
				<h1 className='text text_type_main-large mb-6'>Регистрация</h1>
				<form onSubmit={handleSubmit}>
					<Input
						type={'text'}
						placeholder={'Имя'}
						value={name}
						onChange={(e) => setName(e.target.value)}
						name={'name'}
						error={false}
						ref={inputRef}
						onIconClick={onIconClick}
						errorText={'Ошибка'}
						size={'default'}
						extraClass='mb-6'
					/>

					<Input
						type={'email'}
						placeholder={'E-mail'}
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						name={'email'}
						error={false}
						ref={inputRef}
						onIconClick={onIconClick}
						errorText={'Ошибка'}
						size={'default'}
						extraClass='mb-6'
					/>

					<PasswordInput
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						name={'password'}
						extraClass='mb-6'
					/>

					<Button
						htmlType='submit'
						type='primary'
						size='large'
						extraClass='mb-20'
						onChange={(e) => setPassword(e.target.value)}
						disabled={loading}>
						{loading ? 'Регистрация...' : 'Зарегистрироваться'}
					</Button>
				</form>

				{error && <p style={{ color: 'red' }}>{error}</p>}
				{isAuthenticated && <p>Вы успешно зарегистрированы!</p>}

				<p className='text text_type_main-default text_color_inactive'>
					Уже зарегистрированы? <Link to='/login'>Войти</Link>
				</p>
			</div>
		</section>
	);
};
