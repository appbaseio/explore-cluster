import React, { useEffect, useState } from 'react';
import { FieldControl } from 'react-reactive-form';
import { connect } from 'react-redux';
import get from 'lodash/get';
import { Switch, Form, List, Radio, Button, Icon, InputNumber, Input, Popover } from 'antd';
import { bool, array, object, string, func } from 'prop-types';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { ReactiveBase } from '@appbaseio/reactivesearch';
import DataFieldSelector from '../../../../components/Form/DataFieldSelector';
import FusionDatafieldSelector from '../../SearchN/Wizard/FusionDatafieldSelector';
import PriceUnit from './PriceUnit';
import SortOptionSelector from './SortOptionSelector';
import DefaultResults from './Results/DefaultResults';
import { getRawMappingsByAppName } from '../../../../batteries/modules/selectors';
import { getAppMappings } from '../../../../batteries/modules/actions';
import DocType from './Results/DocType';
import TabLayout from './Results/TabLayout';
import { getURL } from '../../../../constants/config';
import { getTemplate } from '../../utils/index';
import { geoDefaultFields } from './Results/constants';
import { traverseMapping } from '../../../../batteries/utils/mappings';
import { BACKENDS } from '../../../../batteries/utils';

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
	'resultHandleViewer',
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
	'resultHandleViewer',
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
	backend,
	secondaryPipeline,
}) => {
	const [error, setError] = useState(false);
	// eslint-disable-next-line
	const [categoryField, setCategoryField] = useState(
		form && form.get('categoryField') ? form.get('categoryField').value : '',
	);
	const [isLoading, setIsLoading] = useState(false);
	const pipeline = form && form.get('pipeline') ? form.get('pipeline').value : undefined;
	const themeType = form && form.get('themeType') ? form.get('themeType').value : 'classic';
	const preferences = getPreferencesPayload?.();
	const isFusion = backend === BACKENDS.FUSION.name;

	useEffect(() => {
		if (credentials && !Object.keys(mappings).length && !isFusion) {
			// Fetch Mappings if permissions are present
			fetchMappings(appName, credentials, backend);
		}

		if (form && form.get('categoryField')) {
			form.get('categoryField').valueChanges.subscribe((value) => {
				setCategoryField((prevValue) => {
					if (prevValue !== value) {
						const categoryFieldValueControl = form.get('categoryFieldValue');
						categoryFieldValueControl.reset([]);
						return value;
					}
					return prevValue;
				});
			});
		}
	}, []);

	useEffect(() => {
		if (credentials && !isFusion) {
			// Fetch Mappings if permissions are present
			fetchMappings(secondaryPipeline, credentials, backend);
		}
	}, [secondaryPipeline]);

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
							if (item.id === 'cssSelector') {
								return (
									<FieldControl name={item.id} strict={false}>
										{/* eslint-disable-next-line */}
										{({ value, onChange }) => {
											return (
												<Item
													actions={[
														<Input
															value={value}
															onChange={onChange}
															style={{ width: 200 }}
															placeholder="Eg: my-class-name"
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
																	{isFusion ? (
																		<FusionDatafieldSelector
																			form={form}
																			value={value}
																			onChange={onChange}
																		/>
																	) : (
																		<DataFieldSelector
																			pipeline={
																				secondaryPipeline ||
																				pipeline
																			}
																			name={item.id}
																		/>
																	)}
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
																						onChange={
																							onChange
																						}
																						value={
																							value
																						}
																						onError={
																							onError
																						}
																						form={form}
																						fieldPicker={getDatafields()}
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
								<FieldControl name={item.id} strict={false}>
									{/* eslint-disable-next-line */}
									{({ value, onChange }) => {
										return (
											<Item
												actions={[
													isFusion ? (
														<FusionDatafieldSelector
															form={form}
															value={value}
															onChange={onChange}
															handleReload={handleReload}
														/>
													) : (
														<DataFieldSelector
															pipeline={secondaryPipeline || pipeline}
															name={item.id}
															isAggFields
															handleReload={handleReload}
														/>
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
								preferences?.pipeline ? (
								<FieldControl name={item.id} strict={false}>
									{({ value, onChange }) => {
										return (
											<>
												<Item
													actions={[
														!isLoading ? (
															<ReactiveBase
																app={preferences?.pipeline || ''}
																url={getURL()}
																credentials={
																	preferences?.exportSettings
																		?.credentials || ''
																}
																enableAppbase
																transformRequest={(props) => {
																	const newBody = JSON.parse(
																		// eslint-disable-next-line
																		props.body,
																	);
																	newBody.metadata = {
																		app: form.get('app')
																			? form.get('app').value
																			: '',
																		profile: form.get('profile')
																			? form.get('profile')
																					.value
																			: '',
																		suggestion_profile:
																			form.get(
																				'searchProfile',
																			)
																				? form.get(
																						'searchProfile',
																				  ).value
																				: '',
																	};

																	// eslint-disable-next-line
																	props.body =
																		JSON.stringify(newBody);

																	return props;
																}}
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
								<DefaultResults
									pipeline={secondaryPipeline || pipeline}
									form={form}
									fieldPicker={getDatafields()}
								/>
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
															{isFusion ? (
																<FusionDatafieldSelector
																	form={form}
																	value={value}
																	onChange={onChange}
																/>
															) : (
																<DataFieldSelector
																	pipeline={
																		secondaryPipeline ||
																		pipeline
																	}
																	name={item.id}
																/>
															)}
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
	form: null,
	secondaryPipeline: '',
	backend: BACKENDS.ELASTICSEARCH.name,
};

Results.propTypes = {
	withoutForm: bool,
	dataSource: array,
	mappings: object,
	appName: string,
	credentials: string.isRequired,
	fetchMappings: func.isRequired,
	getPreferencesPayload: func.isRequired,
	form: object,
	backend: string,
	secondaryPipeline: string,
};

const mapStateToProps = (state, props) => {
	const appName = props.secondaryPipeline || get(state, '$getCurrentApp.name');
	const mappings = getRawMappingsByAppName(state, appName);
	const { username, password } = get(state, 'user.data', {});
	const backend = get(state, '$getAppPlan.results.backend');
	return {
		appName,
		mappings,
		credentials: `${username}:${password}`,
		backend,
	};
};

const mapDispatchToProps = (dispatch) => ({
	fetchMappings: (appName, credentials, backend) =>
		dispatch(getAppMappings(appName, credentials, undefined, backend)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Results);
