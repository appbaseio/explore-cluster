/* eslint-disable camelcase,no-param-reassign,jsx-a11y/label-has-associated-control,jsx-a11y/label-has-for */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { PlusOutlined } from '@ant-design/icons';
import { Card, Input, InputNumber, Select, Switch, Skeleton, Button, Form } from 'antd';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import {
	getAppMappings,
	getDefaultSettings,
	getSettings,
	putSettings,
	setLocalRelevancyState,
} from '../../batteries/modules/actions';
import Banner from '../../batteries/components/shared/UpgradePlan/Banner';
import { container, label } from './styles';
import SettingTooltip from '../../components/SettingTooltip';
import settingsMap from '../../components/ReviewAndSave/helper';
import {
	getRawMappingsByAppName,
	getTraversedMappingsByAppName,
} from '../../batteries/modules/selectors';
import { features, isValidPlan } from '../../batteries/utils';
import Overlay from '../../components/Overlay';
import { allowedTiers } from '../../utils/prop-types';
import ErrorToaster from '../../batteries/components/shared/ErrorToaster';
import { withErrorToaster } from '../../batteries/components/shared/ErrorToaster/ErrorToaster';
import SettingsFooter from '../../components/SettingsFooter';
import { event, timingEvent } from '../../utils/gtag';
import moment from '../../utils/moment';
import SortOptionSelector from '../IntegrationsPage/tabs/Search/SortOptionSelector';
import { traverseMapping } from '../../batteries/utils/mappings';

const bannerDetails = {
	title: 'Results Settings',
	buttonText: 'Read Docs',
	description:
		'Results settings allow you to control the page size, fields returned, and highlighting settings.',
	videoLink: 'https://youtu.be/EtqBS6egIfU',
	href: 'https://docs.reactivesearch.io/docs/search/relevancy/#result-settings',
};

const bannerMessage = {
	title: 'Results Settings',
	videoLink: 'https://youtu.be/EtqBS6egIfU',
	description:
		'Results settings allow you to control the page size, fields returned, and highlighting settings.',
	buttonText: 'Read Docs',
	href: 'https://docs.reactivesearch.io/docs/search/relevancy/#result-settings',
};

const getDisabled = (value) => {
	if (Array.isArray(value)) return value[0] === '*';
	return false;
};

const calculateValue = (value) => {
	const index = value.indexOf('*');
	if (index > -1) {
		if (index === 0 && value.length !== 1) {
			value.splice(index, 1);
			return value;
		}
		return ['*'];
	}
	return value;
};

class ResultsPage extends React.Component {
	constructor(props) {
		super(props);
		this.startTime = moment();
		this.state = {
			error: false,
		};
	}

	componentDidMount() {
		// triggering custom event for google analytics
		event({
			action: 'Result Settings',
			category: 'Search Relevancy',
			label: 'visit',
			value: null,
		});

		const {
			appName,
			getSettingsAction,
			getDefaultSettingsAction,
			defaultSettings,
			settings,
			localRelevancy,
		} = this.props;
		if (settings && !localRelevancy) {
			this.init({ ...settings });
		} else {
			getSettingsAction(appName);
		}
		if (!defaultSettings) getDefaultSettingsAction();
		this.getMappings();
	}

	componentDidUpdate(prevProps) {
		const { settings, isLoading, localRelevancy, defaultSettings } = this.props;

		if (!isLoading && JSON.stringify(settings) !== JSON.stringify(prevProps.settings)) {
			this.init({ ...settings });
		}

		if (
			!settings &&
			!isLoading &&
			!localRelevancy &&
			JSON.stringify(defaultSettings) !== JSON.stringify(prevProps.defaultSettings)
		) {
			this.init({ ...defaultSettings });
		}
	}

	componentWillUnmount() {
		// Sends the timing event to Google Analytics.
		timingEvent({
			action: 'timing_complete',
			category: 'Search Relevancy',
			label: 'result-settings-time',
			name: 'time',
			value: this.startTime.fromNow(),
		});
	}

	getMappings() {
		const { appName, fetchMappings, credentials, mappings } = this.props;
		if (credentials && get(mappings, 'length') === 0) {
			// Fetch Mappings if permissions are present
			fetchMappings(appName, credentials);
		}
	}

	getDatafields = () => {
		const { rawMappings } = this.props;
		const traversedMappings = traverseMapping(rawMappings || {}, undefined, {
			isAggFields: true,
			includeMappings: undefined,
			includeTypes: undefined,
		});
		return ['_score', ...traversedMappings];
	};

	init = (settings) => {
		const { appName, updateLocalRelevancy, localRelevancy } = this.props;
		if (!localRelevancy) {
			updateLocalRelevancy(appName, { ...settings });
		}
	};

	handleChange = (key, val) => {
		const { appName, localRelevancy, updateLocalRelevancy } = this.props;
		updateLocalRelevancy(appName, {
			...localRelevancy,
			results: {
				...get(localRelevancy, `results`),
				[key]: val,
			},
		});
	};

	onError = (state) => {
		this.setState({
			error: state,
		});
	};

	move = (from, to, arr) => {
		const newArr = [...arr];

		const item = newArr.splice(from, 1)[0];
		newArr.splice(to, 0, item);

		return newArr;
	};

	handleItemReOrder = (result, value) => {
		const newArr = [...value];
		const sourcePosition = result.source.index;
		const destinationPosition = result.destination.index;
		const newDataSource = this.move(sourcePosition, destinationPosition, newArr);
		this.handleChange('sortOptions', newDataSource);
	};

	handleHighlightOptionChange = (key, val) => {
		const { appName, updateLocalRelevancy, localRelevancy } = this.props;
		const data = {
			[key]: key === 'pre_tags' ? [val] : val,
		};
		if (key === 'pre_tags') {
			const post_tags = val.trim() ? `</${val.split('<')[1]}` : [];
			data.post_tags = [post_tags];
		}
		updateLocalRelevancy(appName, {
			...localRelevancy,
			results: {
				...get(localRelevancy, `results`),
				highlightOptions: {
					...get(localRelevancy, `results.highlightOptions`),
					...data,
				},
			},
		});
	};

	render() {
		const { tier, featureSearchRelevancy, localRelevancy, isLoading, mappings } = this.props;
		const { error } = this.state;

		if (!isValidPlan(tier, featureSearchRelevancy, features.SEARCH_RELEVANCY)) {
			return (
				<Card>
					<Banner {...bannerDetails} />
					<Overlay
						style={{
							maxWidth: '70%',
						}}
						src="https://i.imgur.com/14EGIG3.png"
						alt="Results Page"
					/>
				</Card>
			);
		}

		if (isLoading || !localRelevancy || !get(localRelevancy, `results`, null)) {
			return (
				<Card>
					<Banner {...bannerDetails} />
					<div className={container}>
						<Skeleton />
					</div>
				</Card>
			);
		}

		const { excludeFields, highlightFields, highlight, highlightOptions, includeFields, size } =
			get(localRelevancy, `results`);
		const sortOptions = get(localRelevancy, `results.sortOptions`, []);

		return (
			<>
				<Banner {...bannerMessage} />
				<div className={container}>
					<Form layout="vertical" className={`${label} ant-card-body-padding-bottom-0`}>
						<ErrorToaster>
							<Card>
								<Form.Item
									label={
										<>
											{settingsMap.size.title}
											<SettingTooltip title={settingsMap.size.description} />
										</>
									}
								>
									<InputNumber
										style={{ width: '15%' }}
										placeholder="Enter page size"
										min={0}
										max={1000}
										data-cy="result-page-size"
										value={size}
										onChange={(val) => this.handleChange('size', val)}
									/>
								</Form.Item>
							</Card>

							<Card style={{ marginTop: 20 }} title="Fields To Return">
								<Form.Item
									label={
										<>
											{settingsMap.includeFields.title}
											<SettingTooltip
												title={settingsMap.includeFields.description}
											/>
										</>
									}
								>
									<Select
										placeholder="Select one ore more fields"
										mode="tags"
										notFoundContent={null}
										style={{ width: '100%' }}
										tokenSeparators={[',']}
										disabled={getDisabled(excludeFields)}
										value={includeFields}
										data-cy="include-fields"
										showSearch
										onChange={(value) =>
											this.handleChange(
												'includeFields',
												calculateValue(value),
											)
										}
									>
										<Select.Option key="*">
											* (Include all fields)
										</Select.Option>
										{(mappings || []).map((v) => {
											if (!excludeFields.includes(v)) {
												return (
													<Select.Option key={v} title={v}>
														{v}
													</Select.Option>
												);
											}
											return null;
										})}
									</Select>
								</Form.Item>

								<Form.Item
									label={
										<>
											{settingsMap.excludeFields.title}
											<SettingTooltip
												title={settingsMap.excludeFields.description}
											/>
										</>
									}
								>
									<Select
										placeholder="Select one or more fields"
										mode="tags"
										notFoundContent={null}
										style={{ width: '100%' }}
										tokenSeparators={[',']}
										disabled={getDisabled(includeFields)}
										showSearch
										value={excludeFields}
										onChange={(value) =>
											this.handleChange(
												'excludeFields',
												calculateValue(value),
											)
										}
										data-cy="exclude-fields"
									>
										<Select.Option key="*">
											* (Exclude all fields)
										</Select.Option>
										{(mappings || []).map((v) => {
											if (!includeFields.includes(v)) {
												return (
													<Select.Option key={v} title={v}>
														{v}
													</Select.Option>
												);
											}
											return null;
										})}
									</Select>
								</Form.Item>
							</Card>
							<Card style={{ marginTop: 20 }} title="Result Highlight Settings">
								<div>
									<Form.Item label="Enable Highlighting">
										<Switch
											data-cy="enable-highlight"
											checked={highlight}
											onChange={(value) =>
												this.handleChange('highlight', value)
											}
										/>
									</Form.Item>
								</div>

								{highlight && (
									<>
										<Form.Item
											label={
												<>
													{settingsMap.highlightFields.title}
													<SettingTooltip
														title={
															settingsMap.highlightFields.description
														}
													/>
												</>
											}
										>
											<Select
												placeholder="Select one or more fields"
												showSearch
												mode="tags"
												notFoundContent={null}
												style={{ width: '100%' }}
												tokenSeparators={[',']}
												value={highlightFields}
												onChange={(val) => {
													this.handleChange('highlightFields', val);
												}}
												data-cy="highlight-fields"
											>
												{(mappings || []).map((v) => {
													return (
														<Select.Option key={v} title={v}>
															{v}
														</Select.Option>
													);
												})}
											</Select>
										</Form.Item>
										<Form.Item
											label={
												<>
													{settingsMap.highlightTag.title}
													<SettingTooltip
														title={settingsMap.highlightTag.description}
													/>
												</>
											}
										>
											<Input
												value={get(highlightOptions, 'pre_tags.0')}
												onChange={(e) => {
													this.handleHighlightOptionChange(
														'pre_tags',
														e.target.value,
													);
												}}
												style={{ width: '17%' }}
												placeholder="<mark>"
											/>
										</Form.Item>
										<Form.Item
											label={
												<>
													{settingsMap.highlightFragment.title}
													<SettingTooltip
														title={
															settingsMap.highlightFragment
																.description
														}
													/>
												</>
											}
										>
											<InputNumber
												style={{ width: '17%' }}
												value={get(highlightOptions, 'fragment_size')}
												onChange={(val) => {
													this.handleHighlightOptionChange(
														'fragment_size',
														val,
													);
												}}
												placeholder="100"
											/>
										</Form.Item>
										<Form.Item
											label={
												<>
													{settingsMap.highlightTotalFragments.title}
													<SettingTooltip
														title={
															settingsMap.highlightTotalFragments
																.description
														}
													/>
												</>
											}
										>
											<InputNumber
												style={{ width: '17%' }}
												placeholder="5"
												value={get(highlightOptions, 'number_of_fragments')}
												onChange={(val) => {
													this.handleHighlightOptionChange(
														'number_of_fragments',
														val,
													);
												}}
												data-cy="highlight-fragments"
											/>
										</Form.Item>
									</>
								)}
							</Card>
							<Card style={{ marginTop: 20 }} title="Sort Result Options">
								<div>
									<Form.Item>
										<div>
											<DragDropContext
												onDragEnd={(res) =>
													this.handleItemReOrder(res, sortOptions)
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
															{sortOptions && sortOptions.length
																? sortOptions.map((ele, index) => (
																		<SortOptionSelector
																			item={ele}
																			index={index}
																			fieldPicker={this.getDatafields()}
																			onChange={(val) => {
																				this.handleChange(
																					'sortOptions',
																					val,
																				);
																			}}
																			value={sortOptions}
																			onError={this.onError}
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
														...sortOptions,
														{
															label: 'Relevance',
															dataField: '_score',
															sortBy: 'desc',
														},
													];
													this.handleChange('sortOptions', newValue);
												}}
												disabled={error}
											>
												<PlusOutlined style={{ margin: "0.25rem" }}/>
												Add Sort Option
											</Button>
										</div>
									</Form.Item>
								</div>
							</Card>
						</ErrorToaster>
						<SettingsFooter />
					</Form>
				</div>
			</>
		);
	}
}

ResultsPage.propTypes = {
	isUpdating: PropTypes.bool,
	resetState: PropTypes.object,
	settings: PropTypes.object,
	appName: PropTypes.string.isRequired,
	defaultSettings: PropTypes.object,
	tier: allowedTiers,
	featureSearchRelevancy: PropTypes.bool,
	getDefaultSettingsAction: PropTypes.func.isRequired,
	getSettingsAction: PropTypes.func.isRequired,
	updateSettingsAction: PropTypes.func.isRequired,
	fetchMappings: PropTypes.func.isRequired,
	credentials: PropTypes.string.isRequired,
	mappings: PropTypes.array,
	rawMappings: PropTypes.object,
	localRelevancy: PropTypes.object,
	updateLocalRelevancy: PropTypes.func.isRequired,
	isLoading: PropTypes.bool.isRequired,
};

ResultsPage.defaultProps = {
	isUpdating: false,
	resetState: {},
	settings: null,
	defaultSettings: null,
	tier: undefined,
	featureSearchRelevancy: false,
	mappings: [],
	rawMappings: {},
	localRelevancy: null,
};

const mapStateToProps = (state) => {
	const appName = get(state, '$getCurrentApp.name');
	const mappings = getTraversedMappingsByAppName(state);
	const rawMappings = getRawMappingsByAppName(state);
	// when elasticsearch v6, mappings is an object with values corresponding to _doc key
	const parsedMappings = Array.isArray(mappings) ? mappings : get(mappings, '_doc', []);
	const { username, password } = get(state, 'user.data', {});
	const localRelevancy = get(state, ['$getLocalRelevancy', appName], null);
	return {
		appName,
		mappings: isEmpty(parsedMappings) ? [] : parsedMappings,
		rawMappings,
		credentials: `${username}:${password}`,
		isLoading: get(state, '$getAppSettings.isFetching'),
		settings: get(state, ['$getAppSettings', 'settings', appName]),
		isUpdating: get(state, '$getAppSettings.isUpdating'),
		resetState: get(state, '$getAppSettings.default', {}),
		defaultSettings: get(state, '$getAppSettings.defaultSettings'),
		tier: get(state, '$getAppPlan.results.tier'),
		featureSearchRelevancy: get(state, '$getAppPlan.results.feature_search_relevancy', false),
		localRelevancy,
	};
};

const mapDispatchToProps = (dispatch) => ({
	getDefaultSettingsAction: () => dispatch(getDefaultSettings()),
	getSettingsAction: (name) => dispatch(getSettings(name)),
	updateSettingsAction: (name, payload) => dispatch(putSettings(name, payload)),
	fetchMappings: (appName, credentials) => dispatch(getAppMappings(appName, credentials)),
	updateLocalRelevancy: (name, data) => dispatch(setLocalRelevancyState(name, data)),
});

export default withErrorToaster(connect(mapStateToProps, mapDispatchToProps)(ResultsPage));
