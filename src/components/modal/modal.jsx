import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { clsx } from 'clsx';
import PropTypes from 'prop-types';
import { CloseIcon } from '@ya.praktikum/react-developer-burger-ui-components';
import s from './modal.module.scss';

import { ModalOverlay } from '../modal-overlay/modal-overlay';

const modalRoot = document.getElementById('react-modals');

export const Modal = (props) => {
	const { onClose, children } = props;

	useEffect(() => {
		const handleEscPress = (event) => {
			if (event.key === 'Escape') {
				onClose();
			}
		};

		document.addEventListener('keydown', handleEscPress);
		return () => document.removeEventListener('keydown', handleEscPress);
	}, [onClose]);

	// const handleOverlayClick = (event) => {
	// 	if (event.target === event.currentTarget) {
	// 		onClose();
	// 	}
	// };

	return createPortal(
		<>
			<ModalOverlay onClose={onClose} />
			<section className={clsx(s.modal)}>
				<div className={clsx(s.modal__wrapper)}>
					<div className={clsx(s.modal__header)}>
						<CloseIcon
							type='primary'
							className={clsx(s.modal__close)}
							onClick={onClose}
							role='button'
							tabIndex={0}
						/>
					</div>
					<div>{children}</div>
					{/* <div className={clsx(s.modal__content)}>
						<div className={clsx(s.modal__img)}>
							<img src={item.image} alt={item.name} />
						</div>

						<p
							className={clsx(
								s.modal__price,
								'text text_type_digits-default mb-2'
							)}>
							{item.price}
							<CurrencyIcon type='primary' />
						</p>
						<p className={clsx(s.modal__text, 'text text_type_main-small')}>
							{item.name}
						</p>
					</div> */}
				</div>
			</section>
		</>,
		modalRoot
	);
};

Modal.propTypes = {
	onClose: PropTypes.func.isRequired,
	children: PropTypes.oneOfType([
		PropTypes.node,
		PropTypes.string,
		PropTypes.number,
	]).isRequired,
};
