import PropTypes from 'prop-types';

// Тип для ингредиента
export const ingredientPropType = PropTypes.shape({
	_id: PropTypes.string.isRequired,
	name: PropTypes.string.isRequired,
	type: PropTypes.oneOf(['bun', 'main', 'sauce']).isRequired,
	proteins: PropTypes.number.isRequired,
	fat: PropTypes.number.isRequired,
	carbohydrates: PropTypes.number.isRequired,
	calories: PropTypes.number.isRequired,
	price: PropTypes.number.isRequired,
	image: PropTypes.string.isRequired,
	image_mobile: PropTypes.string.isRequired,
	image_large: PropTypes.string.isRequired,
});

// Тип для булочки (может быть null)
export const bunPropType = PropTypes.oneOfType([
	PropTypes.shape({
		_id: PropTypes.string.isRequired,
		name: PropTypes.string.isRequired,
		type: PropTypes.oneOf(['bun']).isRequired,
		proteins: PropTypes.number.isRequired,
		fat: PropTypes.number.isRequired,
		carbohydrates: PropTypes.number.isRequired,
		calories: PropTypes.number.isRequired,
		price: PropTypes.number.isRequired,
		image: PropTypes.string.isRequired,
		image_mobile: PropTypes.string.isRequired,
		image_large: PropTypes.string.isRequired,
	}),
	PropTypes.oneOf([null]), // Разрешаем null
]);

// Тип для ингредиентов бургера с uid
export const burgerIngredientPropType = PropTypes.shape({
	_id: PropTypes.string.isRequired,
	name: PropTypes.string.isRequired,
	type: PropTypes.oneOf(['main', 'sauce']).isRequired, // Без bun
	proteins: PropTypes.number.isRequired,
	fat: PropTypes.number.isRequired,
	carbohydrates: PropTypes.number.isRequired,
	calories: PropTypes.number.isRequired,
	price: PropTypes.number.isRequired,
	image: PropTypes.string.isRequired,
	image_mobile: PropTypes.string.isRequired,
	image_large: PropTypes.string.isRequired,
	uid: PropTypes.string.isRequired, // Уникальный идентификатор
});

// Тип для массива ингредиентов бургера
export const burgerIngredientsPropType = PropTypes.arrayOf(
	burgerIngredientPropType
);

// Тип для объекта заказа
export const orderPropType = PropTypes.shape({
	success: PropTypes.bool,
	order: PropTypes.shape({
		number: PropTypes.number.isRequired,
	}),
});

// Тип для функции (например, openModal или onClose)
export const functionPropType = PropTypes.func;
