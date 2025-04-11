import { useRef, FC } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { clsx } from 'clsx';
import {
	ConstructorElement,
	DragIcon,
} from '@ya.praktikum/react-developer-burger-ui-components';
import { useDispatch } from 'react-redux';
import {
	removeIngredient,
	moveIngredient,
} from '../../../services/burger-constructor/reducer';
import {
	setSingleIngredient,
	clearSingleIngredient,
} from '../../../services/single-ingredient/reducer';
import s from './draggable-ingredient.module.scss';

// Типизация пропсов компонента
interface DraggableIngredientProps {
	uid: string;
	index: number;
	item: {
		name: string;
		price: number;
		image: string;
		[key: string]: any; // Для остальных свойств Ingredient
	};
}

export const DraggableIngredient: FC<DraggableIngredientProps> = ({
	uid,
	index,
	item,
}) => {
	const ref = useRef<HTMLLIElement>(null);
	const dispatch = useDispatch();

	// Поддержка drop
	const [, drop] = useDrop({
		accept: 'constructor-ingredient',
		hover: (draggedItem: { uid: string; index: number }, monitor) => {
			if (!ref.current) {
				return;
			}

			const dragUid = draggedItem.uid; // Уникальный ID перетаскиваемого элемента
			const hoverUid = uid; // Уникальный ID текущего элемента

			// Не заменяем элемент сам на себя
			if (dragUid === hoverUid) {
				return;
			}

			// Определяем координаты текущего элемента
			const hoverBoundingRect = ref.current.getBoundingClientRect();
			const hoverMiddleY =
				(hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
			const clientOffset = monitor.getClientOffset();
			if (!clientOffset) return;
			const hoverClientY = clientOffset.y - hoverBoundingRect.top;

			// Определяем индексы для перемещения
			const dragIndex = draggedItem.index;
			const hoverIndex = index;

			// Условия для перемещения
			if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
				return;
			}
			if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
				return;
			}

			// Выполняем перемещение
			dispatch(moveIngredient({ fromIndex: dragIndex, toIndex: hoverIndex }));
			draggedItem.index = hoverIndex; // Обновляем индекс перетаскиваемого элемента
		},
	});

	// Поддержка drag
	const [{ isDragging }, drag] = useDrag({
		type: 'constructor-ingredient',
		item: () => {
			dispatch(setSingleIngredient(item));
			return { uid, index, ingredient: item }; // Передаем uid и index
		},
		collect: (monitor) => ({
			isDragging: monitor.isDragging(),
		}),
		end: () => dispatch(clearSingleIngredient()), // Очищаем после завершения перетаскивания
	});

	drag(drop(ref)); // Соединяем Drag & Drop

	const opacity = isDragging ? 0.4 : 1;
	const dragCursor = isDragging ? 'grabbing' : 'grab';

	return (
		<li
			ref={ref}
			className={clsx(s.constructor__item)}
			style={{ opacity: opacity, cursor: dragCursor }}>
			<DragIcon type='primary' />
			<ConstructorElement
				text={item.name}
				price={item.price}
				thumbnail={item.image}
				handleClose={() => dispatch(removeIngredient(index))}
			/>
		</li>
	);
};
