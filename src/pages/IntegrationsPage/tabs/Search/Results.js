import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import get from 'lodash/get';
import { FieldControl } from 'react-reactive-form';
import { Switch, Form, List, Radio, Button, Icon } from 'antd';
import { bool, array, string, object, func } from 'prop-types';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import DataFieldSelector from '../../../../components/Form/DataFieldSelector';
import SortOptionSelector from './SortOptionSelector';
import { getAppMappings } from '../../../../batteries/modules/actions';
import { getRawMappingsByAppName } from '../../../../batteries/modules/selectors';

export const defaultSettings = [
	{
		id: 'showSelectedFilters',
		label: 'Show active filter tags',
		value: true,
	},
	{
		id: 'layout',
		label: 'Show results as:',
		value: true,
	},
	{
		id: 'viewSwitcher',
		label: 'Show results view switcher',
		value: true,
	},
	{
		id: 'showPagination',
		label: (value) =>
			value
				? 'Pagination is enabled. Toggle to use an infinite scroll'
				: 'Infinite scroll is enabled. Toggle to use pagination',
		value: false,
	},
	{
		id: 'sortOptionSelector',
		label: 'Set sort option selector for results',
		value: false,
	},
	{
		id: 'resultHighlights',
		label: 'Enable results highlights',
		value: false,
	},
	{
		id: 'resultTitle',
		label: (
			<span>
				Select the data field to display the <strong>title</strong> of the result item
			</span>
		),
		value: true,
	},
	{
		id: 'resultDescription',
		label: (
			<span>
				Select the data field to display the <strong>description</strong> of the result item
			</span>
		),
		value: true,
	},
	{
		id: 'resultPrice',
		label: (
			<span>
				Select the data field to display the <strong>price</strong> of the result item
			</span>
		),
		value: true,
	},
	{
		id: 'resultImage',
		label: (
			<span>
				Select the data field to display the <strong>image</strong> of the result item
			</span>
		),
		value: true,
	},
	{
		id: 'resultHandle',
		label: (
			<span>
				Select the data field to define the <strong>redirect url</strong> for the result
				item
			</span>
		),
		value: true,
	},
];

const fieldSelectorIds = [
	'resultTitle',
	'resultDescription',
	'resultPrice',
	'resultImage',
	'resultHandle',
];

const { Item } = List;

const Results = ({ withoutForm, dataSource, appName, mappings, credentials, fetchMappings }) => {
	const [dataFields, setDataFields] = useState([]);
	const [error, setError] = useState(false);

	useEffect(() => {
		if (credentials && !Object.keys(mappings).length) {
			// Fetch Mappings if permissions are present
			fetchMappings(appName, credentials);
		}
	}, []);

	useEffect(() => {
		if (mappings && Object.keys(mappings).length) {
			setDataFields(getDatafields());
		}
	}, [mappings]);

	const getDatafields = () => {
		if (mappings.properties) {
			const newDataFields = Object.keys(mappings.properties).map((field) => {
				if (mappings.properties[field].type === 'text') {
					return `${field}.keyword`;
				}
				return field;
			});
			return ['_score', ...newDataFields];
		}
		return [];
	};

	const move = (from, to, arr) => {
		const newArr = [...arr];

		const item = newArr.splice(from, 1)[0];
		newArr.splice(to, 0, item);

		return newArr;
	};

	const handleItemReOrder = (result, value, onChange) => {
		const newArr = [...value];
		const sourcePosition = result.source.index;
		const destinationPosition = result.destination.index;
		const newDataSource = move(sourcePosition, destinationPosition, newArr);
		onChange(newDataSource);
	};

	const onError = (state) => {
		setError(state);
	};

	const component = () => (
		<List
			dataSource={dataSource}
			bordered
			renderItem={(item) => {
				if (item.id === 'layout') {
					return (
						<FieldControl name={item.id}>
							{(control) => (
								<Item
									actions={[
										<Radio.Group
											{...control.handler()}
											onChange={(value) => {
												control.markAsTouched();
												control.handler().onChange(value);
											}}
										>
											<Radio value="grid">Grid</Radio>
											<Radio value="list">List</Radio>
										</Radio.Group>,
									]}
								>
									<Item.Meta title={item.label} />
								</Item>
							)}
						</FieldControl>
					);
				}
				if (item.id === 'sortOptionSelector') {
					return (
						<FieldControl name={item.id} strict={false}>
							{({ value = [], onChange }) => {
								return (
									<div
										style={{
											padding: '12px 24px',
											borderBottom: '1px solid #e8e8e8',
										}}
									>
										{item.label}
										<div>
											<DragDropContext
												onDragEnd={(res) =>
													handleItemReOrder(res, value, onChange)
												}
											>
												<Droppable droppableId="droppable">
													{(provided, snapshot) => (
														<div
															ref={provided.innerRef}
															style={{
																margin: 10,
																backgroundColor:
																	snapshot.isDraggingOver
																		? 'transparent'
																		: 'transparent',
															}}
															{...provided.droppableProps}
														>
															{value && value.length
																? value.map((ele, index) => (
																		<SortOptionSelector
																			item={ele}
																			index={index}
																			fieldPicker={dataFields}
																			onChange={onChange}
																			value={value}
																			onError={onError}
																		/>
																  ))
																: null}
															{provided.placeholder}
														</div>
													)}
												</Droppable>
											</DragDropContext>

											<Button
												style={{ marginLeft: 10 }}
												type="primary"
												size="small"
												ghost
												onClick={() => {
													const newValue = [
														...value,
														{
															label: 'Relevance',
															dataField: '_score',
															sortBy: 'desc',
														},
													];
													onChange(newValue);
												}}
												disabled={error}
											>
												<Icon type="plus" />
												Add Sort Option
											</Button>
										</div>
									</div>
								);
							}}
						</FieldControl>
					);
				}
				return (
					<FieldControl name={item.id}>
						{({ value, onChange }) => (
							<Item
								actions={
									fieldSelectorIds.includes(item.id)
										? [<DataFieldSelector name={item.id} />]
										: [<Switch checked={value} onChange={onChange} />]
								}
							>
								<Item.Meta
									title={
										typeof item.label === 'function'
											? item.label(value)
											: item.label
									}
								/>
							</Item>
						)}
					</FieldControl>
				);
			}}
		/>
	);
	if (withoutForm) {
		return component();
	}
	return <Form layout="inline">{component()}</Form>;
};

Results.defaultProps = {
	withoutForm: false,
	dataSource: defaultSettings,
	mappings: {},
	appName: undefined,
};

Results.propTypes = {
	withoutForm: bool,
	dataSource: array,
	mappings: object,
	appName: string,
	fetchMappings: func.isRequired,
	credentials: string.isRequired,
};

const mapStateToProps = (state) => {
	const mappings = getRawMappingsByAppName(state);
	const appName = get(state, '$getCurrentApp.name');
	const { username, password } = get(state, 'user.data', {});
	return {
		mappings,
		appName,
		credentials: `${username}:${password}`,
	};
};

const mapDispatchToProps = (dispatch) => ({
	fetchMappings: (appName, credentials) => dispatch(getAppMappings(appName, credentials)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Results);
