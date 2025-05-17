import { clsx } from 'clsx';
import s from './modal-overlay.module.scss';

interface ModalOverlayProps {
	onClose: () => void;
}

export const ModalOverlay: React.FC<ModalOverlayProps> = ({ onClose }) => {
	const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
		if (event.key === 'Enter' || event.key === ' ') {
			onClose();
		}
	};

	return (
		<div
			className={clsx(s.modal__overlay)}
			onClick={onClose}
			onKeyDown={handleKeyDown}
			role='button'
			tabIndex={0}
			data-testid='modal-overlay'
		/>
	);
};
