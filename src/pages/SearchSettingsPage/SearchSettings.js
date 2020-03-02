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
	Icon,
	InputNumber,
	Switch,
	notification,
	message,
} from 'antd';

import {
	getDefaultSettings,
	getSettings,
	putSettings,
	getAppMappings,
} from '../../batteries/modules/actions';
import { getURL } from '../../constants/config';
import Mappings from '../../batteries/components/Mappings/Mappings';
import { getRawMappingsByAppName } from '../../batteries/modules/selectors';
import Banner from '../../batteries/components/shared/UpgradePlan/Banner';
import { getAggsMappings } from '../../batteries/utils/mappings';

const { Option } = Select;

const container = css`
	padding: 50px;
`;

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
	};

	mappingsRef = React.createRef(null);

	componentDidMount() {
		const { appName, credentials, fetchMappings, getSettingsAction } = this.props;
		const url = getURL();
		getSettingsAction(appName);

		fetchMappings(appName, credentials, url);
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
		const parsedMappings = getAggsMappings(mappings, true);
		const aggsMappings = parsedMappings.filter
			? parsedMappings
					.filter(mapping => mapping.usecase === 'aggs' || mapping.usecase === 'none')
					.map(mapping => ({
						_address: `${mapping.type}.${mapping.address
							.split('.')
							.join('.properties.')}`,
						address: mapping.address,
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

	handleSearchWeight = (address, value) => {
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
		const {
			isDirty,
			dataField,
			typoTolerance,
			hasTypoTolerance,
			hasSearchOperators,
		} = this.state;
		const { updateSettingsAction, appName, settings } = this.props;
		const reIndex = get(this.mappingsRef, 'current.wrappedInstance.reIndex');

		updateSettingsAction(appName, {
			...settings,
			search: {
				...settings.search,
				fuzziness: hasTypoTolerance ? typoTolerance : 0,
				dataField: Object.keys(dataField),
				fieldWeights: Object.values(dataField),
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
						reIndex();
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
	};

	render() {
		const {
			dataField,
			aggsMappings,
			hasSearchOperators,
			hasTypoTolerance,
			typoTolerance,
			isDirty,
		} = this.state;
		const { isUpdating } = this.props;
		const toleranceOptions = ['auto', 1, 2];
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
							hideAggsType
							hideNoType
							hideDelete
							hideDataType
							onChange={this.handleMappingChange}
							column={{
								title: 'Field Weight',
								render: ({ address }) => {
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
											min={1}
											style={{ minWidth: 150, marginLeft: 12 }}
											value={dataField[parsedAddress]}
											onChange={value =>
												this.handleSearchWeight(parsedAddress, value)
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
							Search Operators <Icon type="info-circle" />
						</label>
						<Switch
							checked={hasSearchOperators}
							onChange={value => this.handleChange('hasSearchOperators', value)}
						/>

						<label>
							Enable Typo Tolerance <Icon type="info-circle" />
						</label>
						<Switch
							checked={hasTypoTolerance}
							onChange={value => this.handleChange('hasTypoTolerance', value)}
						/>

						{hasTypoTolerance && (
							<React.Fragment>
								<label>
									Typo Tolerance <Icon type="info-circle" />
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
					<Affix offsetBottom={0}>
						<div
							style={{
								padding: 20,
								background: 'white',
								boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.15)',
								boxSizing: 'border-box',
								border: '1px solid #e8e8e8',
							}}
						>
							<Button type="primary" loading={isUpdating} onClick={this.handleSave}>
								<Icon type={isUpdating ? 'loading' : 'save'} />
								{isDirty ? 'Apply Settings and Reindex' : 'Save Settings'}
							</Button>
							<Button
								onClick={this.resetChanges}
								style={{ marginLeft: 10 }}
								type="danger"
								ghost
							>
								Reset
							</Button>
						</div>
					</Affix>
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
	};
};

const mapDispatchToProps = dispatch => ({
	fetchMappings: (appName, credentials, url) =>
		dispatch(getAppMappings(appName, credentials, url)),
	getDefaultSettingsAction: () => dispatch(getDefaultSettings()),
	getSettingsAction: name => dispatch(getSettings(name)),
	updateSettingsAction: (name, payload) => dispatch(putSettings(name, payload)),
});

export default connect(mapStateToProps, mapDispatchToProps)(SearchSettingsPage);
