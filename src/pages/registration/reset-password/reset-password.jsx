import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';
import { useDispatch, useSelector } from 'react-redux';
import s from './reset-password.module.scss';
import {
	CurrencyIcon,
	Counter,
	Input,
	PasswordInput,
	Button,
} from '@ya.praktikum/react-developer-burger-ui-components';

export const ResetPassword = () => {
	const [value, setValue] = useState('');
	const [passwordValue, setPasswordValue] = useState('');

	const inputRef = useRef(null);
	const onIconClick = () => {
		setTimeout(() => inputRef.current.focus(), 0);
		alert('Icon Click Callback');
	};

	const onChange = (e) => {
		setPasswordValue(e.target.value);
	};

	return (
		<section className={clsx(s.reset_password)}>
			<div className={clsx(s.reset_password__wrapper)}>
				<h1 className='text text_type_main-large mb-6'>
					Восстановление пароля
				</h1>

				<PasswordInput
					placeholder={'Введите новый пароль'}
					onChange={onChange}
					value={passwordValue}
					name={'password'}
					extraClass='mb-6'
				/>

				<Input
					type={'text'}
					placeholder={'Введите код из письма'}
					onChange={(e) => setValue(e.target.value)}
					// icon={'CurrencyIcon'}
					value={value}
					name={'code'}
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
					Сохранить
				</Button>

				<p className='text text_type_main-default text_color_inactive'>
					Вспомнили пароль? <Link to='/sign-in'>Войти</Link>
				</p>
			</div>
		</section>
	);
};
