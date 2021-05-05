import React from 'react';
import PropTypes from 'prop-types';
import { css } from 'emotion';
import { Icon, Popover, List, Row, Col, Tooltip } from 'antd';
import { Draggable } from 'react-beautiful-dnd';
import get from 'lodash/get';
import JsonView from '../../../../../components/JsonView';

const popoverContent = css`
	overflow-y: auto;
	overflow-x: auto;
	word-wrap: break-word;
	max-width: 300px;
	max-height: 300px;
`;

const dragIcon = css`
	transition: all ease 0.2s;
	&:hover {
		background: #f5f5f5;
	}
`;

function getItemStyle(isDragging, draggableStyle) {
	return {
		border: isDragging ? '1px solid #d2d2d2' : null,
		background: isDragging ? '#ffffff' : 'transparent',
		boxShadow: isDragging ? '0px 0px 2px 0px rgba(0,0,0,0.5)' : null,
		...draggableStyle,
	};
}

const overflow = { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' };

export default function PromoteDataTable({ dataSource, handleDelete }) {
	return (
		<List
			size="small"
			style={{ background: '#fff', maxHeight: 400, overflowY: 'scroll', overflowX: 'hidden' }}
			header={<HeaderData />}
			bordered
			dataSource={dataSource.sort((item1, item2) =>
				item1.position > item2.position ? 1 : -1,
			)}
			renderItem={(item, index) => (
				<RowData item={item} index={index} handleDelete={handleDelete} />
			)}
		/>
	);
}

PromoteDataTable.propTypes = {
	dataSource: PropTypes.array,
	handleDelete: PropTypes.func.isRequired,
};

PromoteDataTable.defaultProps = {
	dataSource: [],
};
function PromoteJSONView({ record }) {
	return (
		<>
			<Popover
				content={
					<div css={popoverContent}>
						<JsonView json={record.doc} />
					</div>
				}
				trigger="click"
			>
				<div
					css={{
						cursor: 'pointer',
						margin: '0 7px',
						maxWidth: '95%',
						...overflow,
					}}
				>
					{` {...} `}
					{get(record, 'doc._suggestion_display_value') || get(record, 'doc._id')}
				</div>
			</Popover>
		</>
	);
}

PromoteJSONView.propTypes = {
	record: PropTypes.object,
};

PromoteJSONView.defaultProps = {
	record: {},
};

function PromoteActions({ onClick }) {
	return (
		<Icon
			style={{
				color: '#ff4d4f',
				cursor: 'pointer',
				marginLeft: '40%',
			}}
			type="delete"
			onClick={onClick}
		/>
	);
}

PromoteActions.propTypes = {
	onClick: PropTypes.func.isRequired,
};

function HeaderData() {
	return (
		<Row gutter={[16, 2]}>
			<Col span={4}>Position</Col>
			<Col span={16}>
				<Popover
					content={
						<div css={popoverContent}>
							Clicking on {`{...}`} displays the JSON data.
						</div>
					}
					trigger="click"
				>
					<span
						css={{
							cursor: 'pointer',
							margin: '0 7px',
						}}
					>
						{` {...} `} Display Data
					</span>
				</Popover>
			</Col>
			<Col span={4}>Action</Col>
		</Row>
	);
}

function RowData({ item, index, handleDelete }) {
	const { position, doc } = item;
	return (
		<Draggable key={doc._id} draggableId={doc._id} index={index}>
			{(provided, snapshot) => (
				<div
					ref={provided.innerRef}
					{...provided.draggableProps}
					style={getItemStyle(snapshot.isDragging, provided.draggableProps.style)}
				>
					<Row gutter={8}>
						<Col xs={24}>
							<div key={doc._id} id={doc._id}>
								<List.Item key={doc._id}>
									<Col xs={1}>
										<Tooltip title="Drag to update the ordering of promoted products">
											<div {...provided.dragHandleProps}>
												<Icon type="drag" className={dragIcon} />
											</div>
										</Tooltip>
									</Col>
									<Col xs={3}>{position}</Col>
									<Col xs={16}>
										<PromoteJSONView record={item} />
									</Col>
									<Col xs={4}>
										<PromoteActions onClick={() => handleDelete(position)} />
									</Col>
								</List.Item>
							</div>
						</Col>
					</Row>
				</div>
			)}
		</Draggable>
	);
}

RowData.propTypes = {
	item: PropTypes.object,
	index: PropTypes.number.isRequired,
	handleDelete: PropTypes.func.isRequired,
};

RowData.defaultProps = {
	item: {},
};
