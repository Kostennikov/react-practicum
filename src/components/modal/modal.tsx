import { useEffect, PropsWithChildren } from 'react';
import { createPortal } from 'react-dom';
import { clsx } from 'clsx';
import { CloseIcon } from '@ya.praktikum/react-developer-burger-ui-components';
import { ModalOverlay } from '../modal-overlay/modal-overlay';
import s from './modal.module.scss';

interface ModalProps {
	onClose: () => void;
}

// Типизация modalRoot
const modalRoot = document.getElementById('react-modals') as HTMLElement;

export const Modal: React.FC<PropsWithChildren<ModalProps>> = ({
	onClose,
	children,
}) => {
	useEffect(() => {
		const handleEscPress = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				onClose();
			}
		};

		document.addEventListener('keydown', handleEscPress);
		return () => document.removeEventListener('keydown', handleEscPress);
	}, [onClose]);

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
				</div>
			</section>
		</>,
		modalRoot
	);
};
