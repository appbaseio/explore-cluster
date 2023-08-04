import React, { useEffect, useState } from 'react';
import { FieldControl } from 'react-reactive-form';
import { connect } from 'react-redux';
import get from 'lodash/get';
import { InfoCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Switch, Radio, Button, InputNumber, Input, Popover, Form, Divider } from 'antd';
import { bool, array, object, string, func, any } from 'prop-types';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { ReactiveBase } from '@appbaseio/reactivesearch';
import DataFieldSelector from '../../../../../../components/Form/DataFieldSelector';
import FusionDatafieldSelector from '../../../../../../components/Form/FusionDatafieldSelector';
import PriceUnit from './PriceUnit';
import SortOptionSelector from './SortOptionSelector';
import DefaultResults from './Results/DefaultResults';
import { getRawMappingsByAppName } from '../../../../../../batteries/modules/selectors';

import DocType from './Results/DocType';
import TabLayout from './Results/TabLayout';
import { getURL } from '../../../../../../constants/config';
import { traverseMapping } from '../../../../../../batteries/utils/mappings';
import { BACKENDS } from '../../../../../../batteries/utils';
import { getAppMappings } from '../../../../../../batteries/modules/actions';

const NormalizedDataField = ({ isFusion, form, pipeline, name, value, onChange }) =>
	isFusion ? (
		<FusionDatafieldSelector form={form} value={value} onChange={onChange} />
	) : (
		<DataFieldSelector pipeline={pipeline} name={name} />
	);

NormalizedDataField.propTypes = {
	isFusion: bool.isRequired,
	form: any.isRequired,
	pipeline: string.isRequired,
	name: string.isRequired,
	value: any.isRequired,
	onChange: func.isRequired,
};

const Results = ({
	form,
	mappings,
	fetchMappings,
	credentials,
	appName,
	getPreferencesPayload,
	backend,
	secondaryPipeline,
	isRecommendation,
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
		if (credentials && !isFusion && !isRecommendation) {
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

	return (
		<Form
			style={{ border: '1px solid rgba(5, 5, 5, 0.06)', paddingTop: 20 }}
			colon={false}
			layout="horizontal"
			labelWrap
			labelCol={{ span: 14 }}
			labelAlign="left"
		>
			{themeType === 'geo' ? (
				<>
					<FieldControl name="mapLayout">
						{(control) => (
							<Form.Item
								label={
									<b
										style={{
											padding: '12px 24px',
										}}
									>
										Show results as
										<Popover content="Pick the primary layout for showing search results">
											<InfoCircleOutlined style={{ marginLeft: '5px' }} />
										</Popover>
									</b>
								}
								name="mapLayout"
							>
								<Radio.Group
									{...control.handler()}
									onChange={(value) => {
										control.markAsTouched();
										control.handler().onChange(value);
									}}
								>
									<Radio value="map">Map</Radio>
									<Radio value="list">List</Radio>
								</Radio.Group>
							</Form.Item>
						)}
					</FieldControl>
					<Divider />
					<FieldControl name="viewSwitcher">
						{({ value, onChange }) => (
							<Form.Item
								label={
									<b
										style={{
											padding: '12px 24px',
										}}
									>
										Show results view switcher
										<Popover content="Show a search results layout switcher to your end-users">
											<InfoCircleOutlined style={{ marginLeft: '5px' }} />
										</Popover>
									</b>
								}
								name="viewSwitcher"
							>
								<Switch checked={value} onChange={onChange} />
							</Form.Item>
						)}
					</FieldControl>
					<Divider />
					<FieldControl name="mapComponent">
						{(control) => (
							<Form.Item
								label={
									<b
										style={{
											padding: '12px 24px',
										}}
									>
										Pick your map component
										<Popover content="Choose a map component: OpenStreetMap is free (no API key needed) whereas GoogleMap offers more features (clustering, places search)">
											<InfoCircleOutlined style={{ marginLeft: '5px' }} />
										</Popover>
									</b>
								}
								name="mapComponent"
							>
								<Radio.Group
									{...control.handler()}
									value={control.handler().value || 'googleMap'}
									onChange={(value) => {
										control.markAsTouched();
										control.handler().onChange(value);
									}}
								>
									<Radio value="openStreetMap">OpenStreetMap</Radio>
									<Radio value="googleMap">Google Map</Radio>
								</Radio.Group>
							</Form.Item>
						)}
					</FieldControl>
					<Divider />
					<FieldControl name="mapsAPIKey">
						{({ value, onChange }) => (
							<Form.Item
								label={
									<b
										style={{
											padding: '12px 24px',
										}}
									>
										Maps API Key
										<Popover content="Enter your Google Maps API key over here (leave blank for OpenStreetMap)">
											<InfoCircleOutlined style={{ marginLeft: '5px' }} />
										</Popover>
									</b>
								}
								name="mapsAPIKey"
							>
								<Input style={{ width: 300 }} value={value} onChange={onChange} />
							</Form.Item>
						)}
					</FieldControl>
					<Divider />
					<FieldControl name="defaultZoom">
						{({ value, onChange }) => (
							<Form.Item
								label={
									<b
										style={{
											padding: '12px 24px',
										}}
									>
										Set default zoom level
										<Popover content="Preset map's zoom level, accepts integer values between [0, 20]. 0 is the minimum zoom level, where you can see the entire globe. 20 is the maximum zoom level">
											<InfoCircleOutlined style={{ marginLeft: '5px' }} />
										</Popover>
									</b>
								}
								name="defaultZoom"
							>
								<InputNumber
									value={value || 13}
									onChange={onChange}
									min={0}
									max={20}
								/>
							</Form.Item>
						)}
					</FieldControl>
					<Divider />
					<FieldControl name="showSearchAsMove">
						{({ value, onChange }) => (
							<Form.Item
								label={
									<b
										style={{
											padding: '12px 24px',
										}}
									>
										Show Search As Move
										<Popover content="Show a search as move checkbox on the map for end-users to decide when to update the search">
											<InfoCircleOutlined style={{ marginLeft: '5px' }} />
										</Popover>
									</b>
								}
								name="showSearchAsMove"
							>
								<Switch checked={value} onChange={onChange} />
							</Form.Item>
						)}
					</FieldControl>
					<Divider />
					<FieldControl name="showMarkerClusters">
						{({ value, onChange }) => (
							<Form.Item
								label={
									<b
										style={{
											padding: '12px 24px',
										}}
									>
										Enable Clustering
										<Popover content="Cluster nearby map markers together (only works with Google Maps)">
											<InfoCircleOutlined style={{ marginLeft: '5px' }} />
										</Popover>
									</b>
								}
								name="showMarkerClusters"
							>
								<Switch checked={value} onChange={onChange} />
							</Form.Item>
						)}
					</FieldControl>
					<Divider />
					<FieldControl name="locationDataField">
						{({ value, onChange }) => (
							<Form.Item
								name="locationDataField"
								label={
									<b
										style={{
											padding: '12px 24px',
										}}
									>
										Set <strong>location value</strong> for the result item
										<Popover
											content={
												<>
													The schema for this field should be geo point or
													similar
												</>
											}
										>
											<InfoCircleOutlined style={{ marginLeft: '5px' }} />
										</Popover>
									</b>
								}
							>
								<NormalizedDataField
									isFusion={isFusion}
									form={form}
									value={value}
									onChange={onChange}
									pipeline={secondaryPipeline || pipeline}
									name="locationDataField"
								/>
							</Form.Item>
						)}
					</FieldControl>
					<Divider />
					<FieldControl name="resultTitle">
						{({ value, onChange }) => (
							<Form.Item
								name="resultTitle"
								label={
									<b
										style={{
											padding: '12px 24px',
										}}
									>
										Set the <strong>title</strong> for the result item
									</b>
								}
							>
								<NormalizedDataField
									isFusion={isFusion}
									form={form}
									value={value}
									onChange={onChange}
									pipeline={secondaryPipeline || pipeline}
									name="resultTitle"
								/>
							</Form.Item>
						)}
					</FieldControl>
					<Divider />
					<FieldControl name="resultDescription">
						{({ value, onChange }) => (
							<Form.Item
								name="resultDescription"
								label={
									<b
										style={{
											padding: '12px 24px',
										}}
									>
										Set the <strong>description</strong> for the result item
									</b>
								}
							>
								<NormalizedDataField
									isFusion={isFusion}
									form={form}
									value={value}
									onChange={onChange}
									pipeline={secondaryPipeline || pipeline}
									name="resultDescription"
								/>
							</Form.Item>
						)}
					</FieldControl>
					<Divider />
					<FieldControl name="resultPrice">
						{({ value, onChange }) => (
							<Form.Item
								name="resultPrice"
								label={
									<b
										style={{
											padding: '12px 24px',
										}}
									>
										Set a <strong>numeric value</strong> for the result item
										<Popover content="This can be price, dates, or any other significant value">
											<InfoCircleOutlined style={{ marginLeft: '5px' }} />
										</Popover>
									</b>
								}
							>
								<div>
									<PriceUnit name="priceUnit" />

									<NormalizedDataField
										isFusion={isFusion}
										form={form}
										value={value}
										onChange={onChange}
										pipeline={secondaryPipeline || pipeline}
										name="resultPrice"
									/>
								</div>
							</Form.Item>
						)}
					</FieldControl>
					<Divider />
					<FieldControl name="resultImage">
						{({ value, onChange }) => (
							<Form.Item
								name="resultImage"
								label={
									<b
										style={{
											padding: '12px 24px',
										}}
									>
										Set an <strong>image</strong> for the result item
										<Popover content="The value should be of a URL type for the image content to be displayed correctly">
											<InfoCircleOutlined style={{ marginLeft: '5px' }} />
										</Popover>
									</b>
								}
							>
								<NormalizedDataField
									isFusion={isFusion}
									form={form}
									value={value}
									onChange={onChange}
									pipeline={secondaryPipeline || pipeline}
									name="resultImage"
								/>
							</Form.Item>
						)}
					</FieldControl>
					<Divider />
					<FieldControl name="resultHandle">
						{({ value, onChange }) => (
							<Form.Item
								name="resultHandle"
								label={
									<b
										style={{
											padding: '12px 24px',
										}}
									>
										Set a <strong>redirection URL</strong> for the result item
									</b>
								}
							>
								<NormalizedDataField
									isFusion={isFusion}
									form={form}
									value={value}
									onChange={onChange}
									pipeline={secondaryPipeline || pipeline}
									name="resultHandle"
								/>
							</Form.Item>
						)}
					</FieldControl>
					<Divider />
					<FieldControl name="resultHandleViewer">
						{({ value, onChange }) => (
							<Form.Item
								name="resultHandleViewer"
								label={
									<b
										style={{
											padding: '12px 24px',
										}}
									>
										Show Redirection URL as
										<Popover content="When choosing a link, full redirection URL will be displayed. When choosing a CTA button, you can customize the CTA text in the Custom Messages Section.">
											<InfoCircleOutlined style={{ marginLeft: '5px' }} />
										</Popover>
									</b>
								}
							>
								<NormalizedDataField
									isFusion={isFusion}
									form={form}
									value={value}
									onChange={onChange}
									pipeline={secondaryPipeline || pipeline}
									name="resultHandleViewer"
								/>
							</Form.Item>
						)}
					</FieldControl>
					<Divider />
					<FieldControl name="cssSelector" strict={false}>
						{/* eslint-disable-next-line */}
						{({ value, onChange }) => {
							return (
								<Form.Item
									name="cssSelector"
									label={
										<b
											style={{
												padding: '12px 24px',
												borderBottom: '1px solid #e8e8e8',
											}}
										>
											You can change the default value of the CSS selector.
											Based on the selector, you can style this result item by
											using the CSS selector from{' '}
											<strong>Theme &gt; Custom CSS</strong> section
										</b>
									}
								>
									<Input
										value={value}
										onChange={onChange}
										style={{ width: 200 }}
										placeholder="Eg: my-class-name"
									/>
								</Form.Item>
							);
						}}
					</FieldControl>
					<Divider />
				</>
			) : (
				<>
					<FieldControl name="showAIAnswer">
						{({ value, onChange }) => (
							<Form.Item
								label={
									<b
										style={{
											padding: '12px 24px',
										}}
									>
										Show AIAnswer
										<Popover content="Display an AI answer along with results">
											<InfoCircleOutlined style={{ marginLeft: '5px' }} />
										</Popover>
									</b>
								}
								name="showAIAnswer"
							>
								<Switch checked={value} onChange={onChange} />
							</Form.Item>
						)}
					</FieldControl>
					<Divider />
					<FieldControl name="showSelectedFilters">
						{({ value, onChange }) => (
							<Form.Item
								label={
									<b
										style={{
											padding: '12px 24px',
										}}
									>
										Show applied filters
										<Popover content="Show applied user filters at the top of results">
											<InfoCircleOutlined style={{ marginLeft: '5px' }} />
										</Popover>
									</b>
								}
								name="showSelectedFilters"
							>
								<Switch checked={value} onChange={onChange} />
							</Form.Item>
						)}
					</FieldControl>
					<Divider />
					<FieldControl name="layout">
						{(control) => (
							<Form.Item
								name="layout"
								label={
									<b
										style={{
											padding: '12px 24px',
										}}
									>
										Show results as
										<Popover content="Pick the primary layout for showing search results">
											<InfoCircleOutlined style={{ marginLeft: '5px' }} />
										</Popover>
									</b>
								}
							>
								<Radio.Group
									{...control.handler()}
									onChange={(value) => {
										control.markAsTouched();
										control.handler().onChange(value);
									}}
								>
									<Radio value="grid">Grid</Radio>
									<Radio value="list">List</Radio>
								</Radio.Group>
							</Form.Item>
						)}
					</FieldControl>
					<Divider />
					<FieldControl name="viewSwitcher">
						{({ value, onChange }) => (
							<Form.Item
								label={
									<b
										style={{
											padding: '12px 24px',
										}}
									>
										Show results view switcher
										<Popover content="Show a search results layout switcher to your end-users">
											<InfoCircleOutlined style={{ marginLeft: '5px' }} />
										</Popover>
									</b>
								}
								name="viewSwitcher"
							>
								<Switch checked={value} onChange={onChange} />
							</Form.Item>
						)}
					</FieldControl>
					<Divider />

					<FieldControl name="showPagination">
						{({ value, onChange }) => (
							<Form.Item
								label={
									<b
										style={{
											padding: '12px 24px',
										}}
									>
										{value
											? 'Pagination is enabled. Toggle to use an infinite scroll'
											: 'Infinite scroll is enabled. Toggle to use pagination'}
									</b>
								}
								name="showPagination"
							>
								<Switch checked={value} onChange={onChange} />
							</Form.Item>
						)}
					</FieldControl>
					<Divider />

					<FieldControl name="sortOptionSelector" strict={false}>
						{({ value = [], onChange }) => {
							return (
								<div
									style={{
										padding: '12px 24px',
									}}
								>
									<span>
										Set sort option selector for results
										<Popover content="Set sort options picker to allow your end-users to sort search results by">
											<InfoCircleOutlined style={{ marginLeft: '5px' }} />
										</Popover>
									</span>
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
															backgroundColor: snapshot.isDraggingOver
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
																		onChange={onChange}
																		value={value}
																		onError={onError}
																		form={form}
																		fieldPicker={getDatafields()}
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
											<PlusOutlined style={{ margin: '0.25rem' }} />
											Add Sort Option
										</Button>
									</div>
								</div>
							);
						}}
					</FieldControl>
					<Divider />

					<FieldControl name="resultHighlight">
						{({ value, onChange }) => (
							<Form.Item
								label={
									<b
										style={{
											padding: '12px 24px',
										}}
									>
										Enable results highlighting
										<Popover content="Show highlighting of matching content in the search results">
											<InfoCircleOutlined style={{ marginLeft: '5px' }} />
										</Popover>
									</b>
								}
								name="resultHighlight"
							>
								<Switch checked={value} onChange={onChange} />
							</Form.Item>
						)}
					</FieldControl>
					<Divider />
					<FieldControl name="categoryField" strict={false}>
						{/* eslint-disable-next-line */}
						{({ value, onChange }) => {
							return (
								<Form.Item
									name="categoryField"
									label={
										<b
											style={{
												padding: '12px 24px',
											}}
										>
											Customize result display by{' '}
											<strong>document type</strong>
										</b>
									}
								>
									{isFusion ? (
										<FusionDatafieldSelector
											form={form}
											value={value}
											onChange={onChange}
											handleReload={handleReload}
										/>
									) : (
										<DataFieldSelector
											pipeline={secondaryPipeline || pipeline}
											name="categoryField"
											isAggFields
											handleReload={handleReload}
										/>
									)}
								</Form.Item>
							);
						}}
					</FieldControl>
					<Divider />
					{form &&
					form.get('categoryField') &&
					form.get('categoryField').value &&
					preferences?.pipeline ? (
						<FieldControl name="categoryFieldValue" strict={false}>
							{({ value, onChange }) => {
								return (
									<>
										<Form.Item
											name="categoryFieldValue"
											label={
												<b
													style={{
														padding: '12px 24px',
														borderBottom: '1px solid #e8e8e8',
													}}
												>
													Select <strong>document type value</strong>
												</b>
											}
										>
											{!isLoading ? (
												<ReactiveBase
													app={preferences?.pipeline || ''}
													url={getURL()}
													credentials={
														preferences?.exportSettings?.credentials ||
														''
													}
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
																? form.get('profile').value
																: '',
															suggestion_profile: form.get(
																'searchProfile',
															)
																? form.get('searchProfile').value
																: '',
														};

														// eslint-disable-next-line
														props.body = JSON.stringify(newBody);

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
											)}
										</Form.Item>
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
					)}
				</>
			)}
		</Form>
	);
};

Results.defaultProps = {
	withoutForm: false,
	appName: undefined,
	dataSource: [],
	mappings: {},
	form: null,
	secondaryPipeline: '',
	backend: BACKENDS.ELASTICSEARCH.name,
	isRecommendation: false,
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
	isRecommendation: bool,
};

const mapStateToProps = (state, props) => {
	const appName = props.secondaryPipeline || props.pipeline || get(state, '$getCurrentApp.name');
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
