import React from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';
import { css } from 'emotion';
import {
	Card,
	Select,
	Affix,
	Row,
	Button,
	Col,
	Dropdown,
	Icon,
	Menu,
	InputNumber,
	Switch,
	notification,
	message,
	Tooltip,
} from 'antd';

import {
	getAppMappings,
	putSettings,
	getDefaultSettings,
	getSettings,
	deleteSettings,
} from '../../batteries/modules/actions';
import { getURL } from '../../constants/config';
import Mappings from '../../batteries/components/Mappings/Mappings';
import { getRawMappingsByAppName } from '../../batteries/modules/selectors';
import { getAggsMappings } from '../../batteries/utils/mappings';
import { dropdown } from '../../batteries/components/Mappings/styles';
import Banner from '../../batteries/components/shared/UpgradePlan/Banner';
import { SettingsFooter } from '../../components/SettingsFooter';
import { ReviewAndSave } from '../../components/ReviewAndSave';
import { container } from '../ResultsPage/styles';
import { getReIndexedName } from '../../utils';
import { settingsMap } from '../../components/ReviewAndSave/helper';
import { isEqual } from '../../batteries/utils';

const { Option } = Select;

const bannerMessage = {
	title: 'Aggregations Settings',
	buttonText: 'Read Docs',
};

const cardStyle = css`
	label {
		display: block;
		font-weight: 500;
		margin-bottom: 5px;
		color: rgba(0, 0, 0, 0.85);
	}

	.input {
		margin-bottom: 15px;
		min-width: 200px;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.input.no-bottom {
		margin-bottom: 0;
	}
`;

class AggsPage extends React.Component {
	state = {
		searchableMappings: [],
		dataField: {},
		count: '',
		sort: undefined,
		includeNullValue: false,
		isDirty: false,
		visible: false,
	};

	mappingsRef = React.createRef(null);

	async componentDidMount() {
		const {
			appName,
			credentials,
			fetchMappings,
			getSettingsAction,
			getDefaultSettingsAction,
		} = this.props;
		const url = getURL();

		getSettingsAction(appName);
		fetchMappings(appName, credentials, url);
		getDefaultSettingsAction();
	}

	componentDidUpdate(prevProps) {
		const { mappings, settings, isLoading } = this.props;
		if (mappings && JSON.stringify(prevProps.mappings) !== JSON.stringify(mappings)) {
			const searchableMappings = this.getSearchableMappings(mappings);

			// eslint-disable-next-line
			this.setState({
				searchableMappings,
			});
		}

		if (prevProps.isLoading !== isLoading && !isLoading && settings && settings.aggregations) {
			this.initData(settings);
		}
	}

	toggleVisible = (isReset = false) => {
		this.setState(prevState => ({
			visible: !prevState.visible,
			isReset,
		}));
	};

	initData = settings => {
		this.setState({
			count: settings.aggregations.size,
			sort: settings.aggregations.sortBy,
			includeNullValue: settings.aggregations.includeNullValues,
			dataField: settings.aggregations.dataField,
		});
	};

	getSearchableMappings = mappings => {
		const aggsResponse = getAggsMappings(mappings, true);
		const parsedMappings = Array.isArray(aggsResponse)
			? aggsResponse
			: Object.keys(aggsResponse);
		const searchableMappings = parsedMappings
			.filter(mapping => mapping.usecase === 'search')
			.map(mapping => ({
				_address: `${mapping.type}.${mapping.address.split('.').join('.properties.')}`,
				address: mapping.address,
			}));

		return searchableMappings;
	};

	handleMappingChange = mappings => {
		const searchableMappings = this.getSearchableMappings(mappings);

		let isDirty = false;
		if (get(this.mappingsRef, 'current.wrappedInstance', null)) {
			isDirty = get(this.mappingsRef, 'current.wrappedInstance.state.dirty');
		}
		this.setState({
			searchableMappings,
			isDirty,
		});
	};

	handleAddField = value => {
		if (get(this.mappingsRef, 'current.wrappedInstance', null)) {
			const esVersion = get(this.mappingsRef, 'current.wrappedInstance.state.esVersion');
			const setMapping = get(this.mappingsRef, 'current.wrappedInstance.setMapping');

			if (esVersion && setMapping) {
				const address = +esVersion > 6 ? `properties.${value}` : value;

				setMapping(address, 'text', 'searchaggs');
			}
		}
	};

	handleAggType = (address, value) => {
		this.setState(prevState => ({
			dataField: { ...prevState.dataField, [address]: value },
		}));
	};

	handleChange = (name, value) => {
		this.setState({
			[name]: value,
		});
	};

	handleSave = () => {
		const { isDirty, dataField, sort, count, includeNullValue } = this.state;
		const { updateSettingsAction, appName, settings } = this.props;

		updateSettingsAction(appName, {
			...settings,
			aggregations: {
				...settings.aggregations,
				dataField,
				size: count,
				sortBy: sort,
				includeNullValues: includeNullValue,
			},
		})
			.then(res => {
				if (res && res.error) {
					notification.error({
						message: 'Failed to save Aggregation Settings',
						description: res.error.message,
					});
				} else {
					message.success(`Aggregation settings for ${appName} saved successfully`);

					if (isDirty) {
						this.reIndex();
					}
				}
			})
			.catch(e => {
				notification.error({
					message: 'Failed to save Aggregation Settings',
					description: e.message,
				});
			});
	};

	reIndex = async () => {
		const reIndex = get(this.mappingsRef, 'current.wrappedInstance.reIndex');
		const { dataField, sort, count, includeNullValue } = this.state;
		const { updateSettingsAction, appName, settings, deleteSettingsAction } = this.props;

		deleteSettingsAction(appName);
		reIndex(() =>
			updateSettingsAction(getReIndexedName(appName), {
				...settings,
				aggregations: {
					...settings.aggregations,
					dataField,
					size: count,
					sortBy: sort,
					includeNullValues: includeNullValue,
				},
			}),
		);
	};

	resetChanges = () => {
		const cancelChanges = get(this.mappingsRef, 'current.wrappedInstance.cancelChanges');
		const { settings } = this.props;
		this.initData(settings);
		this.toggleVisible();
		cancelChanges();
	};

	resetToDefault = () => {
		const { getDefaultSettingsAction, defaultSettings } = this.props;
		if (defaultSettings) this.initData(defaultSettings);
		else
			getDefaultSettingsAction().then(res => {
				if (res && res.payload) {
					this.initData(res.payload);
				}
			});
		this.toggleVisible(true);
	};

	render() {
		const {
			searchableMappings,
			dataField,
			sort,
			count,
			includeNullValue,
			visible,
			isReset,
		} = this.state;
		const { isUpdating, settings, resetState, appName, defaultSettings } = this.props;
		const sortOptions = [
			{ name: 'Count', value: 'count' },
			{ name: 'Ascending', value: 'asc' },
			{ name: 'Descending', value: 'desc' },
		];
		const { size: savedSize, ...restSavedAggs } = get(settings, 'aggregations', {});
		return (
			<React.Fragment>
				<Banner {...bannerMessage} />
				<div className={container}>
					<Card>
						<Mappings
							showSynonyms={false}
							showShards={false}
							ref={this.mappingsRef}
							showReplicas={false}
							showMappingInfo={false}
							showCardWrapper={false}
							hideSearchType
							hideDelete
							hideDataType
							hidePropertiesType
							onChange={this.handleMappingChange}
							column={{
								title: 'Aggregation Type',
								render: ({ fields, field, address }) => {
									const hasKeyword = !!get(
										fields,
										`${field}.fields.keyword`,
										false,
									);
									let options = ['term', 'range'];
									if (hasKeyword) {
										options = ['term'];
									}

									const parsedAddress = address
										.split('.')
										.reduce((agg, key, index) => {
											if (index % 2 !== 0) {
												return agg ? `${agg}.${key}` : key;
											}
											return agg;
										}, '');
									const menu = (
										<Menu
											onClick={e => this.handleAggType(parsedAddress, e.key)}
										>
											{options.map(option => (
												<Menu.Item key={option}>{option}</Menu.Item>
											))}
										</Menu>
									);
									return (
										<Dropdown overlay={menu}>
											<Button className={dropdown}>
												{dataField[parsedAddress] || 'Select Type'}
												<Icon type="down" />
											</Button>
										</Dropdown>
									);
								},
							}}
							renderFooter={() =>
								searchableMappings.length ? (
									<Affix offsetBottom={73}>
										<Row
											style={{
												padding: 10,
												border: '1px solid #e8e8e8',
												background: 'white',
												width: '100%',
											}}
											type="flex"
											justify="space-between"
										>
											<Col>
												<Select
													key={searchableMappings.length}
													showSearch
													placeholder="Add new aggregation field"
													optionFilterProp="children"
													style={{ minWidth: 200 }}
													onChange={this.handleAddField}
													filterOption={(input, option) =>
														option.props.children
															.toLowerCase()
															.indexOf(input.toLowerCase()) >= 0
													}
												>
													{searchableMappings.map(mapping => (
														<Option
															key={mapping._address}
															value={mapping._address}
														>
															{mapping.address}
														</Option>
													))}
												</Select>
											</Col>
										</Row>
									</Affix>
								) : null
							}
						/>
					</Card>
					<Card className={cardStyle}>
						<label>
							Default Size For Aggregations{' '}
							<Tooltip title={settingsMap.agg_size.description}>
								<Icon type="info-circle" />
							</Tooltip>
						</label>
						<InputNumber
							onChange={value => this.handleChange('count', value)}
							value={count}
							min={10}
							placeholder="Enter default aggs size"
							className="input"
						/>
						<label>
							Default Sort{' '}
							<Tooltip title={settingsMap.sortBy.description}>
								<Icon type="info-circle" />
							</Tooltip>
						</label>
						<Select
							placeholder="Select default Sort"
							value={sort}
							optionFilterProp="children"
							style={{ minWidth: 200, marginBottom: '15px' }}
							onChange={value => this.handleChange('sort', value)}
							filterOption={(input, option) =>
								option.props.children.toLowerCase().indexOf(input.toLowerCase()) >=
								0
							}
						>
							{sortOptions.map(sortOption => (
								<Option key={sortOption.value} value={sortOption.value}>
									{sortOption.name}
								</Option>
							))}
						</Select>
						<label>
							Include Null Values{' '}
							<Tooltip title={settingsMap.includeNullValues.description}>
								<Icon type="info-circle" />
							</Tooltip>
						</label>
						<Switch
							checked={includeNullValue}
							onChange={value => this.handleChange('includeNullValue', value)}
						/>
					</Card>
					<SettingsFooter
						loading={isUpdating}
						resetState={resetState}
						onReset={this.resetToDefault}
						showReset={
							!isEqual(
								get(settings, 'aggregations'),
								get(defaultSettings, 'aggregations'),
							)
						}
						showSearchPreview
						app={appName}
						reviewAndSave={() => (
							<ReviewAndSave
								loading={isUpdating}
								isReset={isReset}
								oldValues={{
									...restSavedAggs,
									agg_size: savedSize,
								}}
								newValues={{
									agg_size: count,
									sortBy: sort,
									includeNullValues: includeNullValue,
									dataField,
								}}
								onClick={() => this.toggleVisible(false)}
								visible={visible}
								onRevert={this.resetChanges}
								onSave={() => {
									this.handleSave();
									this.toggleVisible();
								}}
							/>
						)}
					/>
				</div>
			</React.Fragment>
		);
	}
}

const mapStateToProps = state => {
	const mappings = getRawMappingsByAppName(state) || null;

	const { username, password } = get(state, 'user.data', {});
	const appName = get(state, '$getCurrentApp.name');
	return {
		isLoading: get(state, '$getAppSettings.isFetching'),
		settings: get(state, ['$getAppSettings', 'settings', appName]),
		isUpdating: get(state, '$getAppSettings.isUpdating'),
		resetState: get(state, '$getAppSettings.default', {}),
		credentials: username ? `${username}:${password}` : null,
		mappings,
		isFetchingMapping: get(state, '$getAppMappings.isFetching'),
		appName,
		defaultSettings: get(state, '$getAppSettings.defaultSettings'),
	};
};

const mapDispatchToProps = dispatch => ({
	fetchMappings: (appName, credentials, url) =>
		dispatch(getAppMappings(appName, credentials, url)),
	getDefaultSettingsAction: () => dispatch(getDefaultSettings()),
	getSettingsAction: name => dispatch(getSettings(name)),
	updateSettingsAction: (name, payload) => dispatch(putSettings(name, payload)),
	deleteSettingsAction: name => dispatch(deleteSettings(name)),
});

export default connect(mapStateToProps, mapDispatchToProps)(AggsPage);
