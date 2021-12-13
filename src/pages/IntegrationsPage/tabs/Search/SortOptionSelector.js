import React from 'react';
import PropTypes from 'prop-types';
import { Select, Row, Col, Tooltip, Icon, Input, Radio } from 'antd';
import { css } from 'emotion';
import { Draggable } from 'react-beautiful-dnd';

const dragIcon = css`
	transition: all ease 0.2s;
	&:hover {
		background: #f5f5f5;
	}
`;

const card = css`
	.show-on-hover {
		transform: rotateX(90deg);
		opacity: 0;
		transition: all ease 0.3s;
	}
	&:hover {
		.show-on-hover {
			transform: rotateX(0deg);
			opacity: 1;
		}
	}
	.ant-row {
		display: flex;
		align-items: center;
	}
`;

function getItemStyle(isDragging, draggableStyle) {
	return {
		border: isDragging ? '1px solid #d2d2d2' : '1px solid #e8e8e8',
		background: isDragging ? '#ffffff' : 'transparent',
		boxShadow: isDragging ? '0px 0px 2px 0px rgba(0,0,0,0.5)' : null,
		...draggableStyle,
		padding: 10,
	};
}

function SortOptionSelector({ index, item, fieldPicker, value, onChange, onError }) {
	function onDelete() {
		const newArr = [...value];
		newArr.splice(index, 1);
		onChange(newArr);
	}

	function sentenceCase(text) {
		if (text) {
			return text.replace(/(?:_| |\b)(\w)/g, function ($1) {
				return $1.toUpperCase().replace('_', ' ');
			});
		}
		return text;
	}

	return (
		<Draggable key={index} draggableId={`${index}`} index={index}>
			{(provided, snapshot) => {
				return (
					<div
						ref={provided.innerRef}
						{...provided.draggableProps}
						style={getItemStyle(snapshot.isDragging, provided.draggableProps.style)}
						className={card}
					>
						<Row gutter={8}>
							<Col xs={1}>
								<Tooltip title="Drag to update the ordering">
									<div {...provided.dragHandleProps}>
										<Icon type="drag" className={dragIcon} />
									</div>
								</Tooltip>
							</Col>
							<Col xs={8}>
								<Select
									showSearch
									placeholder="Select field"
									value={item?.dataField}
									allowClear
									onSelect={(val) => {
										const newArr = value;
										newArr[index].dataField = val;
										if (val === '_score') {
											newArr[index].label = 'Relevance';
										} else {
											newArr[index].label = sentenceCase(
												val.split('.keyword')[0],
											);
										}
										onChange(newArr);
									}}
									onChange={(val) => {
										const newArr = value;
										newArr[index].dataField = val;
										onChange(newArr);
										if (!val) {
											onError(true);
										} else {
											onError(false);
										}
									}}
								>
									{fieldPicker.map((field) => (
										<Select.Option value={field} key={field}>
											{field}
										</Select.Option>
									))}
								</Select>
							</Col>
							<Col xs={6}>
								{/* Input */}
								<Input
									value={item.label}
									style={{ marginLeft: 10, width: 130 }}
									onChange={(e) => {
										const newArr = value;
										newArr[index].label = e.target.value;
										onChange(newArr);
										if (!e.target.value) {
											onError(true);
										} else {
											onError(false);
										}
									}}
								/>
							</Col>
							<Col xs={6} style={{ marginLeft: 10 }}>
								<Radio.Group
									value={item.sortBy}
									onChange={(e) => {
										const newArr = value;
										newArr[index].sortBy = e.target.value;
										onChange(newArr);
									}}
								>
									<Radio value="asc">asc</Radio>
									<Radio value="desc">desc</Radio>
								</Radio.Group>
							</Col>
							<Col xs={1}>
								<div className="show-on-hover">
									<Icon
										type="delete"
										style={{
											color: '#f5222d',
											cursor: 'pointer',
											fontSize: 18,
										}}
										onClick={() => onDelete()}
									/>
								</div>
							</Col>
						</Row>
					</div>
				);
			}}
		</Draggable>
	);
}

SortOptionSelector.propTypes = {
	item: PropTypes.object.isRequired,
	index: PropTypes.number.isRequired,
	fieldPicker: PropTypes.array,
	value: PropTypes.array,
	onChange: PropTypes.func.isRequired,
	onError: PropTypes.func.isRequired,
};

SortOptionSelector.defaultProps = {
	fieldPicker: [],
	value: [],
};

export default SortOptionSelector;
