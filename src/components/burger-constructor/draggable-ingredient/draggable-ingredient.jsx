import { useRef } from 'react';
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

export const DraggableIngredient = ({ key, item, index }) => {
	const ref = useRef(null);
	const dispatch = useDispatch();

	// Поддержка drop
	const [, drop] = useDrop({
		accept: 'ingredient',
		collect(monitor) {
			return {
				handlerId: monitor.getHandlerId(),
			};
		},
		hover: (item, monitor) => {
			if (!ref.current) {
				return;
			}
			// if (item.index !== index) {
			// 	dispatch(moveIngredient({ fromIndex: item.index, toIndex: index }));
			// 	// item.index = index;
			// }

			if (!ref.current) {
				return;
			}
			const dragIndex = item.index;
			const hoverIndex = index;
			// Don't replace items with themselves
			if (dragIndex === hoverIndex) {
				return;
			}
			// Determine rectangle on screen
			const hoverBoundingRect = ref.current?.getBoundingClientRect();
			// Get vertical middle
			const hoverMiddleY =
				(hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
			// Determine mouse position
			const clientOffset = monitor.getClientOffset();
			// Get pixels to the top
			const hoverClientY = clientOffset.y - hoverBoundingRect.top;
			// Only perform the move when the mouse has crossed half of the items height
			// When dragging downwards, only move when the cursor is below 50%
			// When dragging upwards, only move when the cursor is above 50%
			// Dragging downwards
			if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
				return;
			}
			// Dragging upwards
			if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
				return;
			}
			// Time to actually perform the action

			// dispatch(moveIngredient({ dragIndex, hoverIndex }));
			dispatch(moveIngredient({ fromIndex: dragIndex, toIndex: hoverIndex }));
			// Note: we're mutating the monitor item here!
			// Generally it's better to avoid mutations,
			// but it's good here for the sake of performance
			// to avoid expensive index searches.
			item.index = hoverIndex;
		},

		// hover(item) {
		// 	if (item.index !== index) {
		// 		moveCard(item.index, index);
		// 		item.index = index;
		// 	}
		// },
	});
	// Поддержка drag
	// const [{ isDragging }, drag] = useDrag({
	// 	type: 'ingredient',
	// 	item: { index, ingredient: item },
	// 	collect: (monitor) => ({
	// 		isDragging: monitor.isDragging(),
	// 	}),
	// 	end: () => dispatch(clearSingleIngredient()),
	// });
	const [{ isDragging }, drag] = useDrag({
		type: 'ingredient',
		item: () => {
			dispatch(setSingleIngredient(item)); // Устанавливаем текущий ингредиент
			// return { index, ingredient: item };
			return { ingredient: item, index };
		},
		collect: (monitor) => ({
			isDragging: monitor.isDragging(),
		}),
		end: () => dispatch(clearSingleIngredient()), // Очищаем после завершения перетаскивания
	});

	drag(drop(ref)); // Соединяем Drag & Drop

	return (
		<li
			ref={ref}
			className={clsx(s.constructor__item)}
			style={{ opacity: isDragging ? 0.5 : 1 }}>
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
