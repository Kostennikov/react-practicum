import React from 'react';
import { clsx } from 'clsx';
import s from './preloader.module.scss';

export const Preloader = () => {
	return (
		<div className={clsx(s.preloader)}>
			<div className={clsx(s.spinner)} />
			<p className='text text_type_main-default'>Загрузка...</p>
		</div>
	);
};
