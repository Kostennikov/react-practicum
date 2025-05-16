declare module '@ya.praktikum/react-developer-burger-ui-components' {
	import { FC } from 'react';

	interface InputProps {
		type?: string;
		placeholder?: string;
		value: string;
		onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
		name?: string;
		error?: boolean;
		ref?: React.RefObject<HTMLInputElement>;
		onIconClick?: () => void;
		errorText?: string;
		size?: 'default' | 'small' | 'large';
		extraClass?: string;
		required?: boolean;
		disabled?: boolean;
		icon?: string;
	}

	interface LogoProps {
		className?: string;
	}

	interface BurgerIconProps {
		className?: string;
		type?: string;
	}
	interface ListIconProps {
		className?: string;
		type?: string;
	}
	interface ProfileIconProps {
		className?: string;
		type?: string;
	}

	interface PasswordInputProps {
		value: string;
		onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
		name?: string;
		extraClass?: string;
		required?: boolean;
		placeholder?: string;
	}

	interface ButtonProps {
		htmlType?: 'button' | 'submit' | 'reset';
		type?: 'primary' | 'secondary';
		size?: 'small' | 'medium' | 'large';
		extraClass?: string;
		disabled?: boolean;
		children: React.ReactNode;
		className?: string;
		onClick?: () => void;
	}

	interface CloseIconProps {
		type?: 'primary' | 'secondary';
		className?: string;
		size?: 'small' | 'medium' | 'large';
		extraClass?: string;
		onClick?: () => void;
		role?: string;
		tabIndex: number;
	}

	interface ConstructorElementProps {
		type?: 'top' | 'bottom';
		text?: string;
		className?: string;
		price?: number;
		isLocked?: boolean;
		extraClass?: string;
		handleClose?: () => void;
		thumbnail?: string;
	}

	interface CurrencyIconProps {
		type?: 'primary' | 'secondary';
		onClick?: () => void;
	}

	interface DragIconProps {
		type?: 'primary' | 'secondary';
		value?: string;
		onClick?: () => void;
	}

	interface TabProps {
		value: string;
		active: boolean;
		onClick: (value: string) => void;
		children: React.ReactNode;
	}

	interface CounterProps {
		count?: number;
		size?: 'default' | 'small';
		extraClass?: string;
	}

	interface FormattedDateProps {
		date: Date;
		className?: string;
	}

	export const Input: FC<InputProps>;
	export const Logo: FC<LogoProps>;
	export const BurgerIcon: FC<BurgerIconProps>;
	export const ListIcon: FC<ListIconProps>;
	export const ProfileIcon: FC<ProfileIconProps>;
	export const PasswordInput: FC<PasswordInputProps>;
	export const Button: FC<ButtonProps>;
	export const CloseIcon: FC<CloseIconProps>;
	export const ConstructorElement: FC<ConstructorElementProps>;
	export const CurrencyIcon: FC<CurrencyIconProps>;
	export const DragIcon: FC<DragIconProps>;
	export const Tab: FC<TabProps>;
	export const Counter: FC<CounterProps>;
	export const FormattedDate: FC<FormattedDateProps>;
}
