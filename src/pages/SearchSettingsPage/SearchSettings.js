import React from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';
import { css } from 'emotion';
import {
	Card,
	Select,
	Affix,
	Row,
	Col,
	Icon,
	InputNumber,
	Switch,
	notification,
	message,
	Tooltip,
	Skeleton,
} from 'antd';

import {
	getDefaultSettings,
	getSettings,
	putSettings,
	getAppMappings,
	deleteSettings,
} from '../../batteries/modules/actions';
import { getURL } from '../../constants/config';
import Mappings from '../../batteries/components/Mappings/Mappings';
import { getRawMappingsByAppName } from '../../batteries/modules/selectors';
import Banner from '../../batteries/components/shared/UpgradePlan/Banner';
import { getAggsMappings } from '../../batteries/utils/mappings';
import { ReviewAndSave } from '../../components/ReviewAndSave';
import { SettingsFooter } from '../../components/SettingsFooter';
import { container } from '../ResultsPage/styles';
import { getReIndexedName, getSubFields } from '../../utils';
import { settingsMap } from '../../components/ReviewAndSave/helper';
import { isEqual } from '../../batteries/utils';

const { Option } = Select;

const bannerMessage = {
	title: 'Search Settings',
	buttonText: 'Read Docs',
};

const cardStyle = css`
	label {
		display: block;
		font-weight: 500;
		margin-bottom: 5px;
		color: rgba(0, 0, 0, 0.85);
	}

	.ant-switch {
		margin-bottom: 15px;
	}
`;

class SearchSettingsPage extends React.Component {
	state = {
		aggsMappings: [],
		dataField: {},
		hasSearchOperators: undefined,
		hasTypoTolerance: false,
		isDirty: false,
		visible: false,
	};

	mappingsRef = React.createRef(null);

	componentDidMount() {
		const {
			appName,
			credentials,
			fetchMappings,
			getSettingsAction,
			mappings,
			isFetchingMapping,
			settings,
			getDefaultSettingsAction,
			defaultSettings,
		} = this.props;
		const url = getURL();

		if (settings) {
			this.initData(settings);
		} else {
			getSettingsAction(appName);
		}
		if (!mappings && !isFetchingMapping) {
			fetchMappings(appName, credentials, url);
		} else if (mappings) {
			const aggsMappings = this.getAggsMappings(mappings);

			// eslint-disable-next-line
			this.setState({
				aggsMappings,
			});
		}

		if (!defaultSettings) {
			getDefaultSettingsAction();
		}
	}

	componentDidUpdate(prevProps) {
		const { mappings, settings, isLoading } = this.props;
		if (mappings && JSON.stringify(prevProps.mappings) !== JSON.stringify(mappings)) {
			const aggsMappings = this.getAggsMappings(mappings);

			// eslint-disable-next-line
			this.setState({
				aggsMappings,
			});
		}

		if (prevProps.isLoading !== isLoading && !isLoading && settings && settings.search) {
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
		const dataField =
			settings && settings.search
				? settings.search.dataField.reduce(
						(agg, field, index) => ({
							...agg,
							[field]: settings.search.fieldWeights[index],
						}),
						{},
				  )
				: {};
		this.setState({
			typoTolerance: get(settings, 'search.fuzziness'),
			hasTypoTolerance: !!get(settings, 'search.fuzziness', false),
			hasSearchOperators: get(settings, 'search.searchOperators', false),
			dataField,
		});
	};

	getAggsMappings = mappings => {
		const aggsResponse = getAggsMappings(mappings, true);
		const parsedMappings = Array.isArray(aggsResponse)
			? aggsResponse
			: Object.keys(aggsResponse);
		const aggsMappings = parsedMappings.filter
			? parsedMappings
					.filter(mapping => mapping.usecase === 'aggs' || mapping.usecase === 'none')
					.map(mapping => ({
						_address: `${mapping.type}.${mapping.address
							.split('.')
							.join('.properties.')}`,
						address: mapping.address,
						fields: mapping.fields,
					}))
			: {};
		return aggsMappings;
	};

	handleMappingChange = mappings => {
		const aggsMappings = this.getAggsMappings(mappings);
		let isDirty = false;
		if (get(this.mappingsRef, 'current.wrappedInstance', null)) {
			isDirty = get(this.mappingsRef, 'current.wrappedInstance.state.dirty');
		}

		this.setState({
			aggsMappings,
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

	handleSearchWeight = ({ address, value, settings }) => {
		const fields = getSubFields({ fields: settings.fields, weight: value, address });
		this.setState(prevState => ({
			dataField: {
				...prevState.dataField,
				...fields,
			},
		}));
	};

	handleChange = (name, value) => {
		this.setState({
			[name]: value,
		});
	};

	handleSave = () => {
		const {
			isDirty,
			dataField,
			typoTolerance,
			hasTypoTolerance,
			hasSearchOperators,
		} = this.state;
		const { updateSettingsAction, appName, settings } = this.props;
		const nonZeroFields = Object.keys(dataField).reduce((agg, field) => {
			if (dataField[field]) {
				return {
					...agg,
					[field]: dataField[field],
				};
			}
			return agg;
		}, {});

		updateSettingsAction(appName, {
			...settings,
			search: {
				...settings.search,
				fuzziness: hasTypoTolerance ? typoTolerance : 0,
				dataField: Object.keys(nonZeroFields),
				fieldWeights: Object.values(nonZeroFields),
				searchOperators: hasSearchOperators,
			},
		})
			.then(res => {
				if (res && res.error) {
					notification.error({
						message: 'Failed to save Search Settings',
						description: res.error.message,
					});
				} else {
					message.success(`Search settings for ${appName} saved successfully`);

					if (isDirty) {
						this.reIndex();
					}
				}
			})
			.catch(e => {
				notification.error({
					message: 'Failed to save Search Settings',
					description: e.message,
				});
			});
	};

	resetChanges = () => {
		const cancelChanges = get(this.mappingsRef, 'current.wrappedInstance.cancelChanges');
		const { settings } = this.props;
		this.initData(settings);
		cancelChanges();
		this.toggleVisible();
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

	reIndex = async () => {
		const reIndex = get(this.mappingsRef, 'current.wrappedInstance.reIndex');
		const { dataField, typoTolerance, hasTypoTolerance, hasSearchOperators } = this.state;
		const { updateSettingsAction, appName, settings, deleteSettingsAction } = this.props;

		deleteSettingsAction(appName);
		reIndex(() =>
			updateSettingsAction(getReIndexedName(appName), {
				...settings,
				search: {
					...settings.search,
					fuzziness: hasTypoTolerance ? typoTolerance : 0,
					dataField: Object.keys(dataField),
					fieldWeights: Object.values(dataField),
					searchOperators: hasSearchOperators,
				},
			}),
		);
	};

	render() {
		const {
			dataField,
			aggsMappings,
			hasSearchOperators,
			hasTypoTolerance,
			typoTolerance,
			visible,
			isReset,
		} = this.state;
		const {
			isUpdating,
			settings,
			appName,
			resetState,
			defaultSettings,
			isLoading,
		} = this.props;
		const toleranceOptions = ['AUTO', 1, 2];

		return (
			<React.Fragment>
				<Banner {...bannerMessage} />
				<div className={container}>
					{isLoading ? (
						<Card>
							<Skeleton />
						</Card>
					) : null}
					<Card>
						<Mappings
							showSynonyms={false}
							showShards={false}
							ref={this.mappingsRef}
							showReplicas={false}
							showMappingInfo={false}
							showCardWrapper={false}
							hideAggsType
							hideNoType
							hideDelete
							hideDataType
							hidePropertiesType
							onChange={this.handleMappingChange}
							column={{
								title: (
									<React.Fragment>
										{settingsMap.field_weight.title}
										<Tooltip title={settingsMap.field_weight.description}>
											<span style={{ marginLeft: 5 }}>
												<Icon type="info-circle" />
											</span>
										</Tooltip>
									</React.Fragment>
								),
								render: ({ address, settings: mappingSettings }) => {
									const parsedAddress = address
										.split('.')
										.reduce((agg, key, index) => {
											if (index % 2 !== 0) {
												return agg ? `${agg}.${key}` : key;
											}
											return agg;
										}, '');
									return (
										<InputNumber
											min={0}
											style={{ minWidth: 150, marginLeft: 12 }}
											value={dataField[parsedAddress]}
											onChange={value =>
												this.handleSearchWeight({
													address: parsedAddress,
													value,
													settings: mappingSettings,
												})
											}
											placeholder="Enter field weight"
										/>
									);
								},
							}}
							renderFooter={() =>
								aggsMappings.length ? (
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
													key={aggsMappings.length}
													showSearch
													placeholder="Add new search field"
													optionFilterProp="children"
													style={{ minWidth: 200 }}
													onChange={this.handleAddField}
													filterOption={(input, option) =>
														option.props.children
															.toLowerCase()
															.indexOf(input.toLowerCase()) >= 0
													}
												>
													{aggsMappings.map(mapping => (
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
							Search Operators{' '}
							<Tooltip title={settingsMap.searchOperators.description}>
								<Icon type="info-circle" />
							</Tooltip>
						</label>
						<Switch
							checked={hasSearchOperators}
							onChange={value => this.handleChange('hasSearchOperators', value)}
						/>

						<label>
							Enable Typo Tolerance{' '}
							<Tooltip title="Enable this to return documents that contain terms similar to the search term.">
								<Icon type="info-circle" />
							</Tooltip>
						</label>
						<Switch
							checked={hasTypoTolerance}
							onChange={value => this.handleChange('hasTypoTolerance', value)}
						/>

						{hasTypoTolerance && (
							<React.Fragment>
								<label>
									Typo Tolerance{' '}
									<Tooltip
										title={`Sets a maximum edit distance on the search parameters, can be 1, 2 or "AUTO".`}
									>
										<Icon type="info-circle" />
									</Tooltip>
								</label>
								<Select
									placeholder="Select typo tolerance"
									value={typoTolerance}
									optionFilterProp="children"
									style={{ minWidth: 200, marginBottom: '15px' }}
									onChange={value => this.handleChange('typoTolerance', value)}
									filterOption={(input, option) =>
										option.props.children
											.toLowerCase()
											.indexOf(input.toLowerCase()) >= 0
									}
								>
									{toleranceOptions.map(option => (
										<Option key={option} value={option}>
											{option}
										</Option>
									))}
								</Select>
							</React.Fragment>
						)}
					</Card>
					<SettingsFooter
						loading={isUpdating}
						resetState={resetState}
						onReset={this.resetToDefault}
						showSearchPreview
						app={appName}
						showReset={
							!isEqual(get(settings, 'search'), get(defaultSettings, 'search'))
						}
						reviewAndSave={() => (
							<ReviewAndSave
								loading={isUpdating}
								isReset={isReset}
								oldValues={get(settings, 'search')}
								newValues={{
									fuzziness: hasTypoTolerance ? typoTolerance : 0,
									searchOperators: hasSearchOperators,
									dataField: Object.keys(dataField),
									fieldWeights: Object.values(dataField),
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
		defaultSettings: get(state, '$getAppSettings.defaultSettings'),
		isFetchingMapping: get(state, '$getAppMappings.isFetching'),
		appName,
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

export default connect(mapStateToProps, mapDispatchToProps)(SearchSettingsPage);
