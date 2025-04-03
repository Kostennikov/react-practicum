import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';
import { useDispatch, useSelector } from 'react-redux';
import s from './registration.module.scss';
import {
	CurrencyIcon,
	Counter,
	Input,
	PasswordInput,
	Button,
} from '@ya.praktikum/react-developer-burger-ui-components';

export const Registration = () => {
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
		<section className={clsx(s.registration)}>
			<div className={clsx(s.registration__wrapper)}>
				<h1 className='text text_type_main-large mb-6'>Вход</h1>
				<Input
					type={'text'}
					placeholder={'Имя'}
					onChange={(e) => setValue(e.target.value)}
					// icon={'CurrencyIcon'}
					value={value}
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

				<PasswordInput
					onChange={onChange}
					value={passwordValue}
					name={'password'}
					extraClass='mb-6'
				/>

				<Button
					htmlType='button'
					type='primary'
					size='large'
					extraClass='mb-20'>
					Зарегистрироваться
				</Button>

				<p className='text text_type_main-default text_color_inactive'>
					Уже зарегистрированы? <Link to='/sign-in'>Войти</Link>
				</p>
			</div>
		</section>
	);
};
