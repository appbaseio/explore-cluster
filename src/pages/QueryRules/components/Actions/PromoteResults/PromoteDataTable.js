import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { css } from 'emotion';
import { CheckCircleTwoTone, DeleteOutlined, DragOutlined, EditTwoTone } from '@ant-design/icons';
import { Popover, List, Row, Col, Tooltip, Input } from 'antd';
import { Draggable } from 'react-beautiful-dnd';
import get from 'lodash/get';
import JsonView from '../../../../../components/JsonView';
import { setSearchState } from '../../../../../batteries/modules/actions';

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

function PromoteDataTable({ dataSource, handleDelete, onChange, saveState, rule }) {
	useEffect(() => {
		saveState({ promotedData: dataSource, rule });
	}, [dataSource]);

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
				<RowData
					item={item}
					index={index}
					handleDelete={handleDelete}
					onChange={onChange}
				/>
			)}
		/>
	);
}

PromoteDataTable.propTypes = {
	dataSource: PropTypes.array,
	handleDelete: PropTypes.func.isRequired,
	onChange: PropTypes.func.isRequired,
	saveState: PropTypes.func.isRequired,
	rule: PropTypes.object.isRequired,
};

PromoteDataTable.defaultProps = {
	dataSource: [],
};
function PromoteJSONView({ record, isEdit, onChange }) {
	const displayData = get(record, 'doc._suggestion_display_value') || get(record, 'doc._id');

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
				{isEdit ? (
					<div style={{ display: 'flex', alignItems: 'center' }}>
						<Input
							style={{ width: '100%', marginBottom: 0 }}
							value={displayData}
							onChange={(e) => {
								onChange(
									{ _suggestion_display_value: e.target.value },
									record.position,
								);
							}}
						/>
					</div>
				) : (
					<div
						css={{
							cursor: 'pointer',
							margin: '0 7px',
							maxWidth: '95%',
							...overflow,
						}}
					>
						{` {...} `}
						{displayData}
					</div>
				)}
			</Popover>
		</>
	);
}

PromoteJSONView.propTypes = {
	record: PropTypes.object,
	isEdit: PropTypes.bool,
	onChange: PropTypes.func.isRequired,
};

PromoteJSONView.defaultProps = {
	record: {},
	isEdit: false,
};

function PromoteActions({ onDelete, onEdit }) {
	const [isEdit, setIsEdit] = useState(false);

	function handleEditChange() {
		onEdit(!isEdit);
		setIsEdit(!isEdit);
	}

	return (
		<div
			style={{
				cursor: 'pointer',
				display: 'flex',
				justifyContent: 'center',
				gap: '10%',
			}}
		>
			{isEdit ? (
				// eslint-disable-next-line
				<CheckCircleTwoTone onClick={handleEditChange} />
			) : (
				// eslint-disable-next-line
				<EditTwoTone onClick={handleEditChange} />
			)}
			<DeleteOutlined
				style={{
					color: '#ff4d4f',
				}}
				onClick={onDelete}
			/>
		</div>
	);
}

PromoteActions.propTypes = {
	onDelete: PropTypes.func.isRequired,
	onEdit: PropTypes.func.isRequired,
};

function HeaderData() {
	return (
		<Row gutter={[16, 2]}>
			<Col span={4}>Position</Col>
			<Col span={10}>
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
			<Col span={6}>URL</Col>
			<Col span={4}>Action</Col>
		</Row>
	);
}

function RowData({ item, index, handleDelete, onChange }) {
	const [isEdit, setIsEdit] = useState(false);
	const { position, doc } = item;

	const url = get(item, 'doc._suggestion_url') || '';

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
												<DragOutlined className={dragIcon} />
											</div>
										</Tooltip>
									</Col>
									<Col xs={3}>{position}</Col>
									<Col xs={10}>
										<PromoteJSONView
											record={item}
											isEdit={isEdit}
											onChange={onChange}
										/>
									</Col>
									<Col xs={6}>
										{isEdit ? (
											<div style={{ display: 'flex', alignItems: 'center' }}>
												<Input
													style={{ width: '100%', marginBottom: 0 }}
													value={url}
													onChange={(e) => {
														// handleUrlChange(e.target.value);
														onChange(
															{ _suggestion_url: e.target.value },
															position,
														);
													}}
												/>
											</div>
										) : (
											<div css={{ maxWidth: '95%', ...overflow }}>{url}</div>
										)}
									</Col>
									<Col xs={4}>
										<PromoteActions
											position={position}
											onDelete={() => handleDelete(position)}
											onEdit={(status) => {
												setIsEdit(status);
											}}
										/>
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
	onChange: PropTypes.func.isRequired,
};

RowData.defaultProps = {
	item: {},
};

const mapDispatchToProps = (dispatch) => ({
	saveState: (state) => dispatch(setSearchState(state)),
});

export default connect(null, mapDispatchToProps)(PromoteDataTable);
