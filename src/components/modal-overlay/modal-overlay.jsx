import { clsx } from 'clsx';
import s from './modal-overlay.module.scss';
import PropTypes from 'prop-types';

export const ModalOverlay = (props) => {
	const { onClose } = props;

	const handleKeyDown = (event) => {
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
			tabIndex={0}></div>
	);
};

ModalOverlay.propTypes = {
	onClose: PropTypes.func.isRequired,
};
