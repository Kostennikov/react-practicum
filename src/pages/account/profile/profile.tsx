import React, { FC, useEffect, useState, useRef } from 'react';
import { clsx } from 'clsx';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux';
import s from './profile.module.scss';
import {
	Input,
	Button,
} from '@ya.praktikum/react-developer-burger-ui-components';
import { ProfileMenu } from '../../../components/profile-menu/profile-menu';
import { getUser, updateUser } from '../../../services/auth/reducer';
import { RootState, User, AppDispatch } from '../../../types/types';

interface ProfileProps {}

type InputRef = React.RefObject<HTMLInputElement>;

interface UpdateUserPayload {
	name: string;
	email: string;
	password?: string;
}

export const Profile: FC<ProfileProps> = () => {
	const dispatch = useAppDispatch();
	const { user, loading, error } = useAppSelector(
		(state: RootState) => state.auth
	);

	// Состояние для редактируемых полей
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [isEditingName, setIsEditingName] = useState(false);
	const [isEditingEmail, setIsEditingEmail] = useState(false);
	const [isEditingPassword, setIsEditingPassword] = useState(false);

	// Исходные данные для сброса
	const [initialName, setInitialName] = useState('');
	const [initialEmail, setInitialEmail] = useState('');

	const nameInputRef = useRef<HTMLInputElement>(null);
	const emailInputRef = useRef<HTMLInputElement>(null);
	const passwordInputRef = useRef<HTMLInputElement>(null);

	// Загружаем данные пользователя при монтировании
	useEffect(() => {
		if (!user) {
			dispatch(getUser());
		}
	}, [dispatch, user]);

	// Синхронизируем поля с данными пользователя
	useEffect(() => {
		if (user) {
			setName(user.name || '');
			setEmail(user.email || '');
			setInitialName(user.name || '');
			setInitialEmail(user.email || '');
		}
	}, [user]);

	const handleEditName = () => {
		setIsEditingName(true);
		setTimeout(() => nameInputRef.current?.focus(), 0);
	};

	const handleEditEmail = () => {
		setIsEditingEmail(true);
		setTimeout(() => emailInputRef.current?.focus(), 0);
	};

	const handleEditPassword = () => {
		setIsEditingPassword(true);
		setTimeout(() => passwordInputRef.current?.focus(), 0);
	};

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		dispatch(updateUser({ name, email, password: password || undefined })).then(
			() => {
				setIsEditingName(false);
				setIsEditingEmail(false);
				setIsEditingPassword(false);
				setInitialName(name);
				setInitialEmail(email);
				setPassword('');
			}
		);
	};

	const handleCancel = () => {
		setName(initialName);
		setEmail(initialEmail);
		setPassword('');
		setIsEditingName(false);
		setIsEditingEmail(false);
		setIsEditingPassword(false);
	};

	return (
		<section className={clsx(s.profile)}>
			<div className={clsx(s.container)}>
				<div className={clsx(s.profile__wrapper)}>
					<ProfileMenu />
					<div className={clsx(s.profile__content, 'mt-30')}>
						{user ? (
							<form onSubmit={handleSubmit}>
								<Input
									type='text'
									placeholder='Имя'
									value={name}
									onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
										setName(e.target.value)
									}
									name='name'
									disabled={!isEditingName}
									ref={nameInputRef}
									onIconClick={handleEditName}
									icon='EditIcon'
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
									disabled={!isEditingEmail}
									ref={emailInputRef}
									onIconClick={handleEditEmail}
									icon='EditIcon'
									size='default'
									extraClass='mb-6'
								/>
								<Input
									type='password'
									placeholder='Пароль'
									value={password}
									onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
										setPassword(e.target.value)
									}
									name='password'
									disabled={!isEditingPassword}
									ref={passwordInputRef}
									onIconClick={handleEditPassword}
									icon='EditIcon'
									extraClass='mb-6'
								/>
								{(isEditingName || isEditingEmail || isEditingPassword) && (
									<div className='mb-6'>
										<Button
											htmlType='submit'
											type='primary'
											size='medium'
											extraClass='mr-4'
											disabled={loading}>
											{loading ? 'Загрузка...' : 'Сохранить'}
										</Button>
										<Button
											htmlType='button'
											type='secondary'
											size='medium'
											onClick={handleCancel}
											disabled={loading}>
											Отмена
										</Button>
									</div>
								)}
							</form>
						) : (
							<p>Загрузка данных пользователя...</p>
						)}
						{error && <p style={{ color: 'red' }}>{error}</p>}
					</div>
				</div>
			</div>
		</section>
	);
};
