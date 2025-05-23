import React, { FC, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux';
import s from './forgot-password.module.scss';
import {
	Input,
	Button,
} from '@ya.praktikum/react-developer-burger-ui-components';
import { forgotPassword } from '../../../services/auth/reducer';
import { RootState, AppDispatch } from '../../../types/types';

interface ForgotPasswordProps {}

type InputRef = React.RefObject<HTMLInputElement>;

export const ForgotPassword: FC<ForgotPasswordProps> = () => {
	const [value, setValue] = useState<string>('');
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const { loading, error } = useAppSelector((state: RootState) => state.auth);

	const inputRef = useRef<HTMLInputElement>(null);

	const onIconClick = () => {
		setTimeout(() => inputRef.current?.focus(), 0);
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		dispatch(forgotPassword(value)).then((result: any) => {
			if (result.type === forgotPassword.fulfilled.type) {
				navigate('/reset-password', { replace: true });
			}
		});
	};

	return (
		<section className={clsx(s.forgot_password)}>
			<div className={clsx(s.forgot_password__wrapper)}>
				<h1 className='text text_type_main-large mb-6'>
					Восстановление пароля
				</h1>
				<form onSubmit={handleSubmit}>
					<Input
						type='email'
						placeholder='Укажите e-mail'
						onChange={(e) => setValue(e.target.value)}
						value={value}
						name='email'
						error={!!error}
						ref={inputRef}
						onIconClick={onIconClick}
						errorText={error || undefined}
						size='default'
						extraClass='mb-6'
						required
					/>
					<Button
						htmlType='submit'
						type='primary'
						size='large'
						extraClass='mb-20'
						disabled={loading}>
						{loading ? 'Загрузка...' : 'Восстановить'}
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
