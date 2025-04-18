import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import styles from './not-found.module.scss';

interface NotFound404Props {}

export const NotFound404: FC<NotFound404Props> = () => {
	return (
		<div className={styles.wrapper}>
			<div className={styles.container}>
				<div className={styles.content}>
					<h1>Oops! 404 Error</h1>
					<p>Запрошенная вами страница не существует.</p>
					<p>
						Проверьте адрес или перейдите на{' '}
						<Link to='/' className={styles.link}>
							главную страницу
						</Link>
						.
					</p>
				</div>
			</div>
		</div>
	);
};
