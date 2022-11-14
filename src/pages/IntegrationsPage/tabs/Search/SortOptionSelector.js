import React, { useEffect, useState } from 'react';
import PropTypes, { object, string } from 'prop-types';
import get from 'lodash/get';
import { connect } from 'react-redux';
import { DeleteOutlined, DragOutlined } from '@ant-design/icons';
import { AutoComplete, Row, Col, Tooltip, Input, Radio } from 'antd';
import { css } from 'emotion';
import { Draggable } from 'react-beautiful-dnd';
import apisMapper from '../../utils/apisMapper';
import { getApiGeneralization } from '../../utils/be-apis';
import { BACKENDS } from '../../../../batteries/utils';
import { transformGeneralMappingsToFusionArrayFormat } from '../../utils/fusion-apis';

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

function SortOptionSelector({
	index,
	item,
	value,
	onChange,
	onError,
	form,
	fieldPicker: dataFields,
	backend,
	endpoints,
}) {
	const [fieldPicker, setFieldPicker] = useState([{ name: '_score' }]);
	const [isInitial, setIsInitial] = useState(true);
	const isFusion = backend === BACKENDS.FUSION.name;

	useEffect(() => {
		getDatafields(item?.dataField);
	}, [dataFields]);

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

	const getDatafields = (query, state = 'initial') => {
		const profile = form.get('profile') ? form.get('profile').value : 'appbase';
		const indexSettings = form.get('indexSettings') ? form.get('indexSettings').value : {};
		const secondaryProfile = get(indexSettings, 'fusionSettings.profile', '');
		if (isFusion) {
			const schemaConfig = endpoints.schema || apisMapper[backend].schema || {};
			getApiGeneralization(schemaConfig, { index: secondaryProfile || profile, q: query })
				.then((res) => res.json())
				.then((res) => {
					if (Array.isArray(res)) setFieldPicker([{ name: '_score' }, ...res]);
					else {
						const transformedResponse = transformGeneralMappingsToFusionArrayFormat(
							res[secondaryProfile || profile],
						);
						setFieldPicker([{ name: '_score' }, ...transformedResponse]);
					}
				})
				.catch((err) => {
					console.error('Error to fetch search query profiles', err);
				});
		} else {
			setFieldPicker(dataFields);
		}

		if (state !== 'initial') setIsInitial(false);
	};

	const fieldsArr = fieldPicker.map((i) => i.name || i);

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
							<Col xs={1} style={{ display: 'flex' }}>
								<Tooltip title="Drag to update the ordering">
									<span {...provided.dragHandleProps}>
										<DragOutlined className={dragIcon} />
									</span>
								</Tooltip>
								{item?.dataField &&
								isInitial &&
								(!fieldPicker.length ||
									(fieldPicker.length &&
										!fieldsArr.includes(item?.dataField))) ? (
									<Tooltip title="The provided field has no corresponding mappings with the pipeline">
										<span
											style={{ color: 'orange', marginLeft: 5 }}
											role="img"
											aria-label="warning"
										>
											⚠️
										</span>
									</Tooltip>
								) : null}
							</Col>
							<Col xs={8}>
								<AutoComplete
									filterOption={(inputValue, option) => {
										if (
											option.props.children &&
											typeof option.props.children === 'object'
										) {
											const newOption = { ...option.props.children };
											const newInputVal =
												typeof inputValue === 'object' &&
												inputValue.props.children
													? inputValue.props.children
													: inputValue;
											return (
												newOption.props.children
													.toUpperCase()
													.indexOf(newInputVal.toUpperCase()) !== -1
											);
										}
										return (
											option.props.children
												.toUpperCase()
												.indexOf(inputValue.toUpperCase()) !== -1
										);
									}}
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
									onSearch={(val) => {
										const newArr = value;
										newArr[index].dataField = val;
										onChange(newArr);
										if (!val) {
											onError(true);
										} else {
											onError(false);
										}
										getDatafields(val, 'fetching');
									}}
									optionLabelProp="text"
								>
									{/* eslint-disable-next-line */}
									{isFusion ? (
										item?.dataField === '_score' ? (
											<AutoComplete.Option
												key="empty-query"
												value="empty-query"
												disabled
											>
												Enter a character to see field suggestions
											</AutoComplete.Option>
										) : (
											fieldPicker.map((field) => (
												<AutoComplete.Option
													text={field.name}
													key={field.name}
												>
													{field.name}
												</AutoComplete.Option>
											))
										)
									) : (
										fieldPicker.map((field) => (
											<AutoComplete.Option text={field} key={field}>
												<Tooltip title={field}>{field}</Tooltip>
											</AutoComplete.Option>
										))
									)}
								</AutoComplete>
							</Col>
							<Col xs={8}>
								<Input
									value={item.label}
									style={{ marginLeft: 10 }}
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
							<Col xs={5} style={{ marginLeft: 30 }}>
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
									<DeleteOutlined
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
	form: PropTypes.object,
	value: PropTypes.array,
	onChange: PropTypes.func.isRequired,
	onError: PropTypes.func.isRequired,
	backend: string,
	endpoints: object,
};

SortOptionSelector.defaultProps = {
	form: {},
	value: [],
	fieldPicker: [],
	backend: BACKENDS.ELASTICSEARCH.name,
	endpoints: {},
};

const mapStateToProps = (state) => ({
	backend: get(state, '$getAppPlan.results.backend'),
	endpoints: get(state, 'endpoints.data'),
});

export default connect(mapStateToProps, null)(SortOptionSelector);
