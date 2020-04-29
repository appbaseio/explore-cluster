import React from 'react';
import PropTypes from 'prop-types';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { children as childrenProp } from '../../utils/prop-types';

class DNDWrapper extends React.Component {
	onDragStart = () => {
		if (window.navigator.vibrate) {
			window.navigator.vibrate(100);
		}
	};

	render() {
		const { dropId, indexKey, idKey, items, onDragEnd, children } = this.props;
		return (
			<DragDropContext onDragStart={this.onDragStart} onDragEnd={onDragEnd}>
				<Droppable droppableId={dropId}>
					{(provided, snapshot) => (
						<div
							ref={provided.innerRef}
							style={{
								// Ref: If want to add bgColor introduce a prop
								backgroundColor: snapshot.isDraggingOver
									? 'transparent'
									: 'transparent',
							}}
							{...provided.droppableProps}
						>
							{items &&
								items.map((item, index) => (
									<Draggable
										key={item[idKey]}
										draggableId={item[idKey]}
										index={indexKey ? item[indexKey] : index}
									>
										{(dragProvided, dragSnapshot) => (
											<div
												ref={dragProvided.innerRef}
												{...dragProvided.draggableProps}
											>
												{children({
													item,
													dragProvided,
													dragSnapshot,
													index,
												})}
											</div>
										)}
									</Draggable>
								))}
							{provided.placeholder}
						</div>
					)}
				</Droppable>
			</DragDropContext>
		);
	}
}

DNDWrapper.propTypes = {
	dropId: PropTypes.string.isRequired,
	indexKey: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
	idKey: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
	items: PropTypes.array,
	onDragEnd: PropTypes.func.isRequired,
	children: PropTypes.oneOfType([PropTypes.func, childrenProp]).isRequired,
};

DNDWrapper.defaultProps = {
	indexKey: undefined,
	idKey: undefined,
	items: [],
};

export default DNDWrapper;
