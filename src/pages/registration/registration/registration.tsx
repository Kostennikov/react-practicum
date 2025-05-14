import React, { FC, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { useDispatch, useSelector } from 'react-redux';
import s from './registration.module.scss';
import {
	Input,
	PasswordInput,
	Button,
} from '@ya.praktikum/react-developer-burger-ui-components';
import { registerUser } from '../../../services/auth/reducer';
import { RootState, AppDispatch } from '../../../types/types';

interface RegistrationProps {}

type InputRef = React.RefObject<HTMLInputElement>;

interface RegisterUserPayload {
	email: string;
	password: string;
	name: string;
}

export const Registration: FC<RegistrationProps> = () => {
	const [email, setEmail] = useState<string>('');
	const [password, setPassword] = useState<string>('');
	const [name, setName] = useState<string>('');
	const dispatch = useDispatch<AppDispatch>();
	const navigate = useNavigate();
	const { loading, error } = useSelector((state: RootState) => state.auth);

	const nameInputRef = useRef<HTMLInputElement>(null);
	const emailInputRef = useRef<HTMLInputElement>(null);

	const onIconClick = (ref: InputRef) => {
		setTimeout(() => ref.current?.focus(), 0);
	};

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		dispatch(registerUser({ email, password, name })).then((result: any) => {
			if (result.type === registerUser.fulfilled.type) {
				navigate('/login');
			}
		});
	};

	return (
		<section className={clsx(s.registration)}>
			<div className={clsx(s.registration__wrapper)}>
				<h1 className='text text_type_main-large mb-6'>Регистрация</h1>
				<form onSubmit={handleSubmit}>
					<Input
						type='text'
						placeholder='Имя'
						value={name}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
							setName(e.target.value)
						}
						name='name'
						error={!!error}
						ref={nameInputRef}
						onIconClick={() => onIconClick(nameInputRef)}
						errorText={error || undefined}
						size='default'
						extraClass='mb-6'
					/>
					<Input
						type='email'
						placeholder='E-mail'
						value={email}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
							setEmail(e.target.value)
						}
						name='email'
						error={!!error}
						ref={emailInputRef}
						onIconClick={() => onIconClick(emailInputRef)}
						errorText={error || undefined}
						size='default'
						extraClass='mb-6'
					/>
					<PasswordInput
						value={password}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
							setPassword(e.target.value)
						}
						name='password'
						extraClass='mb-6'
					/>
					<Button
						htmlType='submit'
						type='primary'
						size='large'
						extraClass='mb-20'
						disabled={loading}>
						{loading ? 'Регистрация...' : 'Зарегистрироваться'}
					</Button>
				</form>
				{error && <p style={{ color: 'red' }}>{error}</p>}
				<p className='text text_type_main-default text_color_inactive'>
					Уже зарегистрированы? <Link to='/login'>Войти</Link>
				</p>
			</div>
		</section>
	);
};
