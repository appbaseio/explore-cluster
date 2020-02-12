import React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

class DNDWrapper extends React.Component {
	onDragStart = () => {
		if (window.navigator.vibrate) {
			window.navigator.vibrate(100);
		}
	};

	render() {
		const { dropId, indexKey, idKey, items, onDragEnd } = this.props;
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
												{this.props.children({
													item,
													dragProvided,
													dragSnapshot,
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

export default DNDWrapper;
