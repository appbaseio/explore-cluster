import React, { useEffect, useState } from 'react';
import { FieldControl } from 'react-reactive-form';
import { connect } from 'react-redux';
import get from 'lodash/get';
import { Switch, Form, List, Radio, Button, Icon, InputNumber, Input, Popover } from 'antd';
import { bool, array, object, string, func } from 'prop-types';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { ReactiveBase } from '@appbaseio/reactivesearch';
import DataFieldSelector from '../../../../components/Form/DataFieldSelector';
import PriceUnit from './PriceUnit';
import SortOptionSelector from './SortOptionSelector';
import DefaultResults from './Results/DefaultResults';
import { traverseMapping } from '../../../../batteries/utils/mappings';
import { getRawMappingsByAppName } from '../../../../batteries/modules/selectors';
import { getAppMappings } from '../../../../batteries/modules/actions';
import DocType from './Results/DocType';
import TabLayout from './Results/TabLayout';
import { getURL } from '../../../../constants/config';
import { getTemplate } from '../../utils/index';
import { geoDefaultFields } from './Results/constants';

const defaultSettings = [
	{
		id: 'showSelectedFilters',
		label: (
			<span>
				Show applied filters
				<Popover content="Show applied user filters at the top of results">
					<Icon type="info-circle" style={{ marginLeft: '5px' }} />
				</Popover>
			</span>
		),
		value: true,
	},
	{
		id: 'layout',
		label: (
			<span>
				Show results as
				<Popover content="Pick the primary layout for showing search results">
					<Icon type="info-circle" style={{ marginLeft: '5px' }} />
				</Popover>
			</span>
		),
		value: true,
	},
	{
		id: 'viewSwitcher',
		label: (
			<span>
				Show results view switcher
				<Popover content="Show a search results layout switcher to your end-users">
					<Icon type="info-circle" style={{ marginLeft: '5px' }} />
				</Popover>
			</span>
		),
		value: true,
	},
	{
		id: 'showPagination',
		label: (value) => (
			<span>
				{value
					? 'Pagination is enabled. Toggle to use an infinite scroll'
					: 'Infinite scroll is enabled. Toggle to use pagination'}
			</span>
		),
		value: false,
	},
	{
		id: 'sortOptionSelector',
		label: (
			<span>
				Set sort option selector for results
				<Popover content="Set sort options picker to allow your end-users to sort search results by">
					<Icon type="info-circle" style={{ marginLeft: '5px' }} />
				</Popover>
			</span>
		),
		value: false,
	},
	{
		id: 'resultHighlight',
		label: (
			<span>
				Enable results highlighting
				<Popover content="Show highlighting of matching content in the search results">
					<Icon type="info-circle" style={{ marginLeft: '5px' }} />
				</Popover>
			</span>
		),
		value: false,
	},
	{
		id: 'categoryField',
		label: (
			<span>
				Customize result display by <strong>document type</strong>
			</span>
		),
		value: false,
	},
	{
		id: 'categoryFieldValue',
		label: (
			<span>
				Select <strong>document type value</strong>
			</span>
		),
		value: false,
	},
];

const geoDefaultSettings = [
	{
		id: 'mapLayout',
		label: (
			<span>
				Show results as
				<Popover content="Pick the primary layout for showing search results">
					<Icon type="info-circle" style={{ marginLeft: '5px' }} />
				</Popover>
			</span>
		),
		value: true,
	},
	{
		id: 'viewSwitcher',
		label: (
			<span>
				Show results view switcher
				<Popover content="Show a search results layout switcher to your end-users">
					<Icon type="info-circle" style={{ marginLeft: '5px' }} />
				</Popover>
			</span>
		),
		value: true,
	},
	{
		id: 'mapComponent',
		label: (
			<span>
				Pick your map component
				<Popover content="Choose a map component: OpenStreetMap is free (no API key needed) whereas GoogleMap offers more features (clustering, places search)">
					<Icon type="info-circle" style={{ marginLeft: '5px' }} />
				</Popover>
			</span>
		),
		value: true,
	},
	{
		id: 'mapsAPIkey',
		label: (
			<span>
				Maps API Key
				<Popover content="Enter your Google Maps API key over here (leave blank for OpenStreetMap)">
					<Icon type="info-circle" style={{ marginLeft: '5px' }} />
				</Popover>
			</span>
		),
		value: false,
	},
	{
		id: 'defaultZoom',
		label: (
			<span>
				Set default zoom level
				<Popover content="Preset map's zoom level, accepts integer values between [0, 20]. 0 is the minimum zoom level, where you can see the entire globe. 20 is the maximum zoom level">
					<Icon type="info-circle" style={{ marginLeft: '5px' }} />
				</Popover>
			</span>
		),
		value: true,
	},
	{
		id: 'showSearchAsMove',
		label: (
			<span>
				Show Search As Move
				<Popover content="Show a search as move checkbox on the map for end-users to decide when to update the search">
					<Icon type="info-circle" style={{ marginLeft: '5px' }} />
				</Popover>
			</span>
		),
		value: true,
	},
	{
		id: 'showMarkerClusters',
		label: (
			<span>
				Enable Clustering
				<Popover content="Cluster nearby map markers together (only works with Google Maps)">
					<Icon type="info-circle" style={{ marginLeft: '5px' }} />
				</Popover>
			</span>
		),
		value: true,
	},
	...geoDefaultFields,
];

const fieldSelectorIds = [
	'resultTitle',
	'resultDescription',
	'resultPrice',
	'resultImage',
	'resultHandle',
	'locationDataField',
];

const geoOptions = [
	'mapLayout',
	'mapComponent',
	'mapsAPIkey',
	'viewSwitcher',
	'defaultZoom',
	'showSearchAsMove',
	'showMarkerClusters',
	'locationDataField',
	'resultTitle',
	'resultDescription',
	'resultPrice',
	'resultImage',
	'resultHandle',
];

const { Item } = List;

const Results = ({
	form,
	withoutForm,
	dataSource,
	mappings,
	fetchMappings,
	credentials,
	appName,
	getPreferencesPayload,
}) => {
	const [error, setError] = useState(false);
	const [categoryField, setCategoryField] = useState(
		form && form.get('categoryField') ? form.get('categoryField').value : '',
	);
	const [isLoading, setIsLoading] = useState(false);
	const pipeline = form && form.get('pipeline') ? form.get('pipeline').value : undefined;
	const indexSettings = form && form.get('indexSettings') ? form.get('indexSettings').value : {};
	const secondaryPipeline = get(indexSettings, 'index', '');
	const themeType = form && form.get('themeType') ? form.get('themeType').value : 'classic';
	const preferences = getPreferencesPayload?.();

	useEffect(() => {
		if (credentials && !Object.keys(mappings).length) {
			// Fetch Mappings if permissions are present
			fetchMappings(appName, credentials);
		}

		if (form && form.get('categoryField')) {
			form.get('categoryField').valueChanges.subscribe((value) => {
				if (categoryField !== value) {
					const categoryFieldValueControl = form.get('categoryFieldValue');
					categoryFieldValueControl.reset([]);
					setCategoryField(value);
				}
			});
		}
	}, []);

	const handleReload = () => {
		setIsLoading(true);

		setTimeout(() => {
			setIsLoading(false);
		}, 1);
	};

	const getDataSource = () => {
		if (!dataSource.length) {
			if (themeType === 'geo') return geoDefaultSettings;
			return defaultSettings;
		}
		return dataSource;
	};

	const getDatafields = () => {
		const traversedMappings = traverseMapping(mappings || {}, undefined, {
			isAggFields: true,
			includeMappings: undefined,
			includeTypes: undefined,
		});
		if (Array.isArray(traversedMappings)) {
			return ['_score', ...traversedMappings];
		}
		const newTraversedMappings = traversedMappings[secondaryPipeline || pipeline];
		if (Array.isArray(newTraversedMappings)) return ['_score', ...newTraversedMappings];

		return ['_score'];
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

	const component = () => {
		const templateObj = getTemplate(themeType);
		return (
			<>
				<List
					dataSource={getDataSource()}
					bordered
					renderItem={(item) => {
						if (themeType === 'geo') {
							if (item.id === 'mapLayout') {
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
														<Radio value="map">Map</Radio>
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
							if (item.id === 'mapComponent') {
								return (
									<FieldControl name={item.id}>
										{(control) => (
											<Item
												actions={[
													<Radio.Group
														{...control.handler()}
														value={
															control.handler().value || 'googleMap'
														}
														onChange={(value) => {
															control.markAsTouched();
															control.handler().onChange(value);
														}}
													>
														<Radio value="openStreetMap">
															OpenStreetMap
														</Radio>
														<Radio value="googleMap">Google Map</Radio>
													</Radio.Group>,
												]}
											>
												<Item.Meta title={item.label} />
											</Item>
										)}
									</FieldControl>
								);
							}
							if (item.id === 'defaultZoom') {
								return (
									<FieldControl name={item.id}>
										{({ value, onChange }) => (
											<Item
												actions={[
													<InputNumber
														value={value || 13}
														onChange={onChange}
														min={0}
														max={20}
													/>,
												]}
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
							}
							if (item.id === 'mapsAPIkey') {
								return (
									<FieldControl name={item.id}>
										{({ value, onChange }) => (
											<Item
												actions={[
													<Input
														style={{ width: 300 }}
														value={value}
														onChange={onChange}
													/>,
												]}
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
							}
							if (geoOptions.includes(item.id)) {
								return (
									<FieldControl name={item.id}>
										{({ value, onChange }) => (
											<Item
												actions={
													fieldSelectorIds.includes(item.id)
														? [
																<div>
																	{item?.showPriceUnitInput ? (
																		<PriceUnit name="priceUnit" />
																	) : null}
																	<DataFieldSelector
																		pipeline={
																			secondaryPipeline ||
																			pipeline
																		}
																		name={item.id}
																	/>
																</div>,
														  ]
														: [
																<Switch
																	checked={value}
																	onChange={onChange}
																/>,
														  ]
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
							}
							return null;
						}
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
																		? value.map(
																				(ele, index) => (
																					<SortOptionSelector
																						item={ele}
																						index={
																							index
																						}
																						fieldPicker={getDatafields()}
																						onChange={
																							onChange
																						}
																						value={
																							value
																						}
																						onError={
																							onError
																						}
																					/>
																				),
																		  )
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

						if (item.id === 'categoryField') {
							return templateObj?.name !== 'geo' ? (
								<FieldControl name={item.id}>
									{/* eslint-disable-next-line */}
									{({ value, onChange }) => {
										return (
											<Item
												actions={[
													<DataFieldSelector
														pipeline={secondaryPipeline || pipeline}
														name={item.id}
														isAggFields
														handleReload={handleReload}
													/>,
												]}
											>
												<Item.Meta
													title={
														typeof item.label === 'function'
															? item.label(value)
															: item.label
													}
												/>
											</Item>
										);
									}}
								</FieldControl>
							) : (
								<></>
							);
						}
						if (item.id === 'categoryFieldValue') {
							return form &&
								form.get('categoryField') &&
								form.get('categoryField').value &&
								(secondaryPipeline || preferences?.pipeline) ? (
								<FieldControl name={item.id} strict={false}>
									{({ value, onChange }) => {
										return (
											<>
												<Item
													actions={[
														!isLoading ? (
															<ReactiveBase
																app={
																	secondaryPipeline ||
																	preferences?.pipeline ||
																	''
																}
																url={getURL()}
																credentials={
																	preferences?.exportSettings
																		?.credentials || ''
																}
																enableAppbase
															>
																<DocType
																	value={value}
																	onChange={onChange}
																	form={form}
																/>
															</ReactiveBase>
														) : (
															<></>
														),
													]}
												>
													<Item.Meta
														title={
															typeof item.label === 'function'
																? item.label(value)
																: item.label
														}
													/>
												</Item>
												{form.get('categoryField').value ? (
													<TabLayout
														values={value}
														form={form}
														pipeline={secondaryPipeline || pipeline}
													/>
												) : null}
											</>
										);
									}}
								</FieldControl>
							) : (
								<DefaultResults pipeline={secondaryPipeline || pipeline} />
							);
						}

						return (
							<FieldControl name={item.id}>
								{({ value, onChange }) => (
									<Item
										actions={
											fieldSelectorIds.includes(item.id)
												? [
														<div>
															{item?.showPriceUnitInput ? (
																<PriceUnit name="priceUnit" />
															) : null}
															<DataFieldSelector
																pipeline={
																	secondaryPipeline || pipeline
																}
																name={item.id}
															/>
														</div>,
												  ]
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
			</>
		);
	};

	if (withoutForm) {
		return component();
	}
	return <Form layout="inline">{component()}</Form>;
};

Results.defaultProps = {
	withoutForm: false,

	appName: undefined,
	dataSource: [],
	mappings: {},
};

Results.propTypes = {
	withoutForm: bool,
	dataSource: array,
	mappings: object,

	appName: string,
	credentials: string.isRequired,
	fetchMappings: func.isRequired,

	getPreferencesPayload: func.isRequired,
	form: object.isRequired,
};

const mapStateToProps = (state, props) => {
	const appName = props.pipeline || get(state, '$getCurrentApp.name');
	const mappings = getRawMappingsByAppName(state, appName);
	const { username, password } = get(state, 'user.data', {});

	return {
		appName,
		mappings,
		credentials: `${username}:${password}`,
	};
};

const mapDispatchToProps = (dispatch) => ({
	fetchMappings: (appName, credentials) => dispatch(getAppMappings(appName, credentials)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Results);
