import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';
import { useDispatch, useSelector } from 'react-redux';
import s from './forgot-password.module.scss';
import {
	CurrencyIcon,
	Counter,
	Input,
	PasswordInput,
	Button,
} from '@ya.praktikum/react-developer-burger-ui-components';

export const ForgotPassword = () => {
	const [value, setValue] = useState('');

	const inputRef = useRef(null);
	const onIconClick = () => {
		setTimeout(() => inputRef.current.focus(), 0);
		alert('Icon Click Callback');
	};

	return (
		<section className={clsx(s.forgot_password)}>
			<div className={clsx(s.forgot_password__wrapper)}>
				<h1 className='text text_type_main-large mb-6'>
					Восстановление пароля
				</h1>
				<Input
					type={'email'}
					placeholder={'Укажите e-mail'}
					onChange={(e) => setValue(e.target.value)}
					// icon={'CurrencyIcon'}
					value={value}
					name={'email'}
					error={false}
					ref={inputRef}
					onIconClick={onIconClick}
					errorText={'Ошибка'}
					size={'default'}
					extraClass='mb-6'
				/>

				<Button
					htmlType='button'
					type='primary'
					size='large'
					extraClass='mb-20'>
					Восстановить
				</Button>

				<p className='text text_type_main-default text_color_inactive'>
					Вспомнили пароль? <Link to='/sign-in'>Войти</Link>
				</p>
			</div>
		</section>
	);
};
