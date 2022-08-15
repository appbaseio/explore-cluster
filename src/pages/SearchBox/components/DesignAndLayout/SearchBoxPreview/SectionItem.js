import { css } from 'emotion';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { Button, Empty, Icon, Input, Tooltip } from 'antd';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import RenderSuggestions from './RenderSuggestions';
import { validateHtmlStr } from '../../../utils';

const container = css`
	background: white;
	padding-bottom: 10px;
	border-bottom: 1px solid #f9f9f9;
	.section-header {
		display: flex;
		align-items: center;
		padding: 10px;
		font-size: 12px;
		color: rgb(127, 124, 124);
		background: rgb(249, 249, 249);

		&__title {
			display: flex;
			align-items: center;
			gap: 5px;
			flex: 1 1 0%;
			margin-right: 15px;
			input {
				width: 50px;
				flex: 1 1 0%;
				height: 24px;
			}
			&--value {
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}
		}
		.section-delete-icon {
			transform: scale(1.3);
			margin-left: 8px;

			svg {
				path:first-child {
					fill: white;
				}
			}
		}
		.add-suggestion-btn {
			margin-left: auto;
			font-size: 11px;
		}
	}

	.suggestions-container {
		min-height: 10px;
		&.dragging-over {
			box-shadow: 0px 0px 8px #1890ff;
		}
	}
`;
const dragIconWrapper = css`
	height: max-content;
	.drag-icon {
		width: max-content;
		transition: all ease 0.2s;
		margin-right: 5px;
		&:hover {
			background: #f5f5f5;
		}
	}
`;

const SectionItem = (props) => {
	const {
		section,
		suggestions,
		sectionIndex,
		applySectionLabel,
		triggerAddSuggestionModal,
		onDelete,
		onSuggestionDelete,
		onSuggestionEdit,
	} = props;
	const { title } = section;
	const [editMode, setEditMode] = useState(false);
	const [editError, setEditError] = useState(false);
	const [inputValue, setInputValue] = useState(title);

	const handleAddSuggestion = () => {
		triggerAddSuggestionModal(section.id);
	};

	const handleInputChange = (e) => {
		setInputValue(e.target.value);
	};

	const handleSaveSectionTitle = () => {
		if (validateHtmlStr(inputValue)) {
			applySectionLabel(section.id, inputValue);
			setEditMode(false);
			if (editError) setEditError(false);
		} else {
			setEditError(true);
		}
	};
	return (
		<Draggable draggableId={section.id} index={sectionIndex}>
			{(sectionProvided) => (
				<div
					className={container}
					{...sectionProvided.draggableProps}
					ref={sectionProvided.innerRef}
				>
					<div className="section-header">
						<Tooltip title="Drag to reorder the section">
							<div className={dragIconWrapper} {...sectionProvided.dragHandleProps}>
								<Icon type="drag" className="drag-icon" />
							</div>
						</Tooltip>
						<div className="section-header__title">
							{editMode ? (
								<Input
									style={
										editError
											? {
													border: '1px solid red',
											  }
											: {}
									}
									placeholder="Accepts valid HTML"
									value={inputValue}
									onChange={handleInputChange}
									onPressEnter={handleSaveSectionTitle}
								/>
							) : (
								<div
									className="section-header__title--value"
									// eslint-disable-next-line react/no-danger
									dangerouslySetInnerHTML={{
										__html: title,
									}}
								/>
							)}
							<Tooltip
								title={
									editMode
										? 'Click to save the Section Label'
										: 'Click to edit the Section Label.'
								}
							>
								{editMode ? (
									<Icon
										type="check-circle"
										theme="twoTone"
										onClick={handleSaveSectionTitle}
									/>
								) : (
									<Icon
										type="edit"
										theme="twoTone"
										onClick={() => {
											setEditMode(true);
										}}
									/>
								)}
							</Tooltip>
						</div>{' '}
						{suggestions.length !== 0 && (
							<Button
								className="add-suggestion-btn"
								type="primary"
								onClick={handleAddSuggestion}
								icon="plus"
								size="small"
							>
								Add Suggestion
							</Button>
						)}
						<Tooltip title="Delete Section">
							<Icon
								type="delete"
								theme="twoTone"
								twoToneColor="red"
								onClick={onDelete}
								className="section-delete-icon"
							/>
						</Tooltip>
					</div>

					<Droppable droppableId={section.id} type="suggestion">
						{(provided, snapshot) => (
							<div
								ref={provided.innerRef}
								{...provided.droppableProps}
								className={`suggestions-container ${
									snapshot.isDraggingOver ? 'dragging-over' : ''
								}`}
							>
								{
									<RenderSuggestions
										suggestions={suggestions}
										onSuggestionDelete={(suggestionId) =>
											onSuggestionDelete(suggestionId, section.id)
										}
										onSuggestionEdit={(suggestionId) =>
											onSuggestionEdit(suggestionId, section.id)
										}
									/>
								}
								{suggestions.length === 0 ? (
									<Empty
										image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
										imageStyle={{
											height: 40,
										}}
										description={null}
										style={{ margin: '14px 8px' }}
									>
										<Button
											type="primary"
											onClick={handleAddSuggestion}
											icon="plus"
											size="small"
										>
											Add Suggestion
										</Button>
									</Empty>
								) : null}
								{provided.placeholder}
							</div>
						)}
					</Droppable>
				</div>
			)}
		</Draggable>
	);
};

SectionItem.propTypes = {
	section: PropTypes.object.isRequired,
	suggestions: PropTypes.array.isRequired,
	sectionIndex: PropTypes.number.isRequired,
	applySectionLabel: PropTypes.func.isRequired,
	triggerAddSuggestionModal: PropTypes.func.isRequired,
	onDelete: PropTypes.func.isRequired,
	onSuggestionDelete: PropTypes.func.isRequired,
	onSuggestionEdit: PropTypes.func.isRequired,
};
SectionItem.defaultProps = {};

export default SectionItem;
