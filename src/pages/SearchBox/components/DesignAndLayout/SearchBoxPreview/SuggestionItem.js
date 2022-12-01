import { DeleteTwoTone, DragOutlined, EditTwoTone } from '@ant-design/icons';
import { Tooltip } from 'antd';
import { css } from 'emotion';
import PropTypes from 'prop-types';
import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import Flex from '../../../../../batteries/components/shared/Flex';

const container = css`
	display: flex;
	-webkit-box-pack: justify;
	justify-content: space-between;
	cursor: pointer;
	padding: 10px;
	user-select: none;
	justify-content: flex-start;
	align-items: center;
	transition: background-color 0.3s ease-in 0s, color 0.3s ease-in 0s, fill 0.3s ease-in 0s;
	position: relative;
	background-color: rgb(255, 255, 255);

	&:hover {
		background-color: rgb(45, 132, 246) !important;
		* {
			color: rgb(255, 255, 255) !important;
		}

		mark {
			background-color: #000000 !important;
		}
	}

	&.drag-active {
		filter: brightness(1.2);
	}

	.icon-wrapper {
		display: flex;
		max-width: 30px;
		overflow: hidden;
		box-sizing: border-box;
		height: 30px;
		margin-right: 10px;
		min-width: 30px;
		img {
			width: 100%;
		}
	}

	.trim {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		line-height: 20px;
	}

	.suggestion-label {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.suggestion-description {
		margin-top: 5px;
		opacity: 0.7;
		font-size: 12px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.suggestion-delete-icon,
	.suggestion-edit-icon {
		transform: scale(1);
		margin-left: auto;
		opacity: 0;
	}
	.suggestion-edit-icon {
		svg {
			path {
				fill: white;
			}
		}
	}
	.suggestion-delete-icon {
		margin-left: 8px;
		svg {
			path:first-child {
				fill: white;
			}
		}
	}

	&:hover {
		.suggestion-delete-icon,
		.suggestion-edit-icon {
			opacity: 1;
		}
	}
`;
const dragIcon = css`
	width: max-content;
	transition: all ease 0.2s;
	margin-right: 5px;
	&:hover {
		background: #f5f5f5;
	}
`;

const SuggestionItem = (props) => {
	const { suggestion, index, onDelete, onEdit } = props;
	const { id, label, description } = suggestion;
	const getIcon = () => {
		if (suggestion.icon) {
			return (
				<div
					style={{ display: 'flex' }}
					// eslint-disable-next-line react/no-danger
					dangerouslySetInnerHTML={{
						__html: suggestion.icon,
					}}
				/>
			);
		}
		if (suggestion.iconURL) {
			return <img src={suggestion.iconURL} alt={suggestion.value} />;
		}
		return null;
	};
	return (
		<Draggable draggableId={id} index={index}>
			{(provided, snapshot) => (
				<div
					{...provided.draggableProps}
					ref={provided.innerRef}
					className={`${container} ${snapshot.isDragging ? 'drag-active' : ''}`}
				>
					<Tooltip title="Drag to update the ordering">
						<div {...provided.dragHandleProps}>
							<DragOutlined className={dragIcon} />
						</div>
					</Tooltip>{' '}
					<div className="icon-wrapper">{getIcon()}</div>
					<div className="trim">
						<Flex flexDirection="column">
							{label && (
								<div
									className="suggestion-label"
									// eslint-disable-next-line react/no-danger
									dangerouslySetInnerHTML={{
										__html: label,
									}}
								/>
							)}
							{description && (
								<div
									className="suggestion-description"
									// eslint-disable-next-line react/no-danger
									dangerouslySetInnerHTML={{
										__html: description,
									}}
								/>
							)}
						</Flex>
					</div>{' '}
					<Tooltip title="Edit Suggestion">
						<EditTwoTone onClick={onEdit} className="suggestion-edit-icon" />
					</Tooltip>
					<Tooltip title="Delete Suggestion">
						<DeleteTwoTone
							twoToneColor="red"
							onClick={onDelete}
							className="suggestion-delete-icon"
						/>
					</Tooltip>
				</div>
			)}
		</Draggable>
	);
};

SuggestionItem.propTypes = {
	suggestion: PropTypes.object.isRequired,
	index: PropTypes.number.isRequired,
	onDelete: PropTypes.func.isRequired,
	onEdit: PropTypes.func.isRequired,
};
SuggestionItem.defaultProps = {};

export default SuggestionItem;
