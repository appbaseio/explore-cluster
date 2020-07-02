/* eslint-disable jsx-a11y/label-has-associated-control,jsx-a11y/label-has-for */
import React from 'react';
import PropTypes from 'prop-types';
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
	Radio,
	Typography,
} from 'antd';

import {
	getDefaultSettings,
	getSettings,
	putSettings,
	getAppMappings,
	deleteSettings,
} from '../../batteries/modules/actions';
import { getURL, getVersion } from '../../constants/config';
import Mappings from '../../batteries/components/Mappings/Mappings';
import { getRawMappingsByAppName } from '../../batteries/modules/selectors';
import Banner from '../../batteries/components/shared/UpgradePlan/Banner';
import { getAggsMappings } from '../../batteries/utils/mappings';
import ReviewAndSave from '../../components/ReviewAndSave';
import SettingsFooter from '../../components/SettingsFooter';
import { container } from '../ResultsPage/styles';
import { getSubFields, reservedSearchSubFields, removeSubFields } from '../../utils';
import settingsMap from '../../components/ReviewAndSave/helper';
import { isEqual, isValidPlan } from '../../batteries/utils';
import mappingUsecase from '../../batteries/utils/mappingUsecase';
import Overlay from '../../components/Overlay';
import { highlighter } from '../SandboxPage/components/Search';
import { allowedTiers } from '../../utils/prop-types';

const { Option } = Select;

const bannerDetails = {
	title: 'Search Settings',
	buttonText: 'Read More',
	icon: 'pencil',
	href: 'https://docs.appbase.io/docs/search/relevancy/#search-settings',
};

const bannerMessage = {
	title: 'Search Settings',
	buttonText: 'Read Docs',
	href: 'https://docs.appbase.io/docs/search/relevancy/#search-settings',
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
		hasTypoTolerance: false,
		isDirty: false,
		visible: false,
		queryFormat: 'or',
		enableSynonyms: false,
		changedFields: {
			new: {},
			old: {},
		},
		changedFieldWeights: {},
		queryType: 'default',
	};

	noUseCaseMappings = [];

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
			this.initData(settings);

			// eslint-disable-next-line
			this.setState({
				aggsMappings,
			});
		}

		if (
			prevProps.isLoading !== isLoading &&
			!isLoading &&
			settings &&
			JSON.stringify(prevProps.settings) !== JSON.stringify(settings)
		) {
			this.initData(settings);
		}

		if (prevProps.isLoading !== isLoading && !isLoading && settings && settings.search) {
			this.initData(settings);
		}
	}

	toggleVisible = (isReset = false) => {
		this.setState((prevState) => ({
			visible: !prevState.visible,
			isReset,
		}));
	};

	initData = (settings) => {
		const dataField = settings && settings.search ? this.getDataFields(settings) : {};
		const hasSearchOperators = get(settings, 'search.searchOperators', false);
		const hasQueryString = get(settings, 'search.queryString', false);

		const queryType = this.getQueryType({
			queryString: hasQueryString,
			searchOperators: hasSearchOperators,
		});

		this.setState({
			typoTolerance: get(settings, 'search.fuzziness'),
			hasTypoTolerance: !!get(settings, 'search.fuzziness', false),
			queryFormat: get(settings, 'search.queryFormat', 'or'),
			dataField,
			enableSynonyms: get(settings, 'synonyms.enabled'),
			queryType,
		});
	};

	getQueryType = ({ queryString, searchOperators }) => {
		if (queryString) {
			return 'queryString';
		}

		if (searchOperators) {
			return 'searchOperators';
		}

		return 'default';
	};

	getDataFields = (settings) => {
		const { mappings } = this.props;
		let searchableFields = settings.search.dataField;

		if (mappings) {
			const aggsResponse = getAggsMappings(mappings, true);
			const parsedMappings = Array.isArray(aggsResponse)
				? aggsResponse
				: Object.keys(aggsResponse);

			const originalSearchableFields = parsedMappings.filter(
				(mapping) =>
					mapping.fieldType === 'text' &&
					(mapping.usecase === 'search' || mapping.usecase === 'searchaggs'),
			);
			if (searchableFields.length === 0) {
				searchableFields = originalSearchableFields.reduce((agg, item) => {
					return [
						...agg,
						...Object.keys(
							getSubFields({ address: item.address, weight: 1, fields: item.fields }),
						),
					];
				}, []);
			}

			const onlyTopLevelFields = removeSubFields(searchableFields);
			if (onlyTopLevelFields.length < originalSearchableFields.length) {
				const changedFields = originalSearchableFields.filter(
					(field) => !onlyTopLevelFields.includes(get(field, 'address')),
				);
				const allFields = originalSearchableFields.reduce((agg, item) => {
					return [
						...agg,
						...Object.keys(
							getSubFields({ address: item.address, weight: 1, fields: item.fields }),
						),
					];
				}, []);

				searchableFields = [...allFields, ...searchableFields];

				this.setState({
					changedFieldWeights: changedFields.reduce(
						(agg, item) => ({
							...agg,
							[get(item, 'address')]: 1,
						}),
						{},
					),
					changedFields: {
						new: changedFields.reduce(
							(agg, item) => ({
								...agg,
								[get(item, 'address')]: get(item, 'usecase'),
							}),
							{},
						),
						old: {},
					},
				});
			}
		}

		return searchableFields.reduce(
			(agg, field, index) => ({
				...agg,
				[field]: get(settings, `search.fieldWeights.${index}`, 1),
			}),
			{},
		);
	};

	getAggsMappings = (mappings) => {
		const aggsResponse = getAggsMappings(mappings, true);
		const parsedMappings = Array.isArray(aggsResponse)
			? aggsResponse
			: Object.keys(aggsResponse);
		this.noUseCaseMappings = parsedMappings.filter
			? parsedMappings.filter((mapping) => mapping.usecase === 'text')
			: [];
		const aggsMappings = parsedMappings.filter
			? parsedMappings
					.filter(
						(mapping) =>
							mapping.fieldType === 'keyword' ||
							(mapping.fieldType === 'text' &&
								(mapping.usecase === 'none' || mapping.usecase === 'aggs')),
					)
					.map((mapping) => ({
						_address: `${mapping.type}.${mapping.address
							.split('.')
							.join('.properties.')}`,
						address: mapping.address,
						fields: mapping.fields,
					}))
			: {};
		return aggsMappings;
	};

	handleMappingChange = (mappings) => {
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

	handleAddField = (value) => {
		if (get(this.mappingsRef, 'current.wrappedInstance', null)) {
			const { aggsMappings } = this.state;
			const { settings } = this.props;
			const mapping = aggsMappings.find((item) => item._address === value);

			const esVersion = get(this.mappingsRef, 'current.wrappedInstance.state.esVersion');
			const setMapping = get(this.mappingsRef, 'current.wrappedInstance.setMapping');
			const hasLanguage = get(settings, 'language.language') !== 'universal';
			if (esVersion && setMapping) {
				const address =
					+esVersion > 6
						? `properties.${value}`
						: value.replace('_doc.', '_doc.properties.');
				setMapping(address, 'text', 'searchaggs');

				if (mapping) {
					const fields = getSubFields({
						fields: hasLanguage
							? { ...mappingUsecase.searchaggs.fields, lang: {} }
							: { ...mappingUsecase.searchaggs.fields },
						weight: 1,
						address: mapping.address,
					});
					this.setState((state) => ({
						dataField: {
							...state.dataField,
							...fields,
						},
					}));
				}
			}
		}
	};

	handleSearchWeight = ({ address, value, settings }) => {
		const fields = getSubFields({ fields: settings.fields, weight: value, address });
		this.setState((prevState) => ({
			changedFieldWeights: {
				...prevState.changedFieldWeights,
				[address]: value,
			},
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
			enableSynonyms,
			queryFormat,
			queryType,
		} = this.state;
		const { updateSettingsAction, appName, settings } = this.props;

		updateSettingsAction(appName, {
			...settings,
			search: {
				...get(settings, 'search', {}),
				fuzziness: hasTypoTolerance ? typoTolerance : 0,
				dataField: Object.keys(dataField),
				fieldWeights: Object.values(dataField),
				searchOperators: queryType === 'searchOperators',
				queryString: queryType === 'queryString',
				queryFormat,
			},
			synonyms: {
				enabled: enableSynonyms,
			},
		})
			.then((res) => {
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
					this.setState({
						changedFields: {
							new: {},
							old: {},
						},
						changedFieldWeights: {},
					});
				}
			})
			.catch((e) => {
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

	handleDeleteField = ({ address }) => {
		const setMapping = get(this.mappingsRef, 'current.wrappedInstance.setMapping');

		if (setMapping) {
			setMapping(address, 'text', 'aggs');
		}
	};

	resetToDefault = () => {
		const { getDefaultSettingsAction, defaultSettings } = this.props;
		if (defaultSettings) this.initData(defaultSettings);
		else
			getDefaultSettingsAction().then((res) => {
				if (res && res.payload) {
					this.initData(res.payload);
				}
			});
		this.toggleVisible(true);
	};

	reIndex = async () => {
		const reIndex = get(this.mappingsRef, 'current.wrappedInstance.reIndex');
		reIndex();
	};

	handleUsecaseChange = (field, type, usecase, currentUsecase) => {
		const topLevelKey = +getVersion()[0] >= 7 ? `properties` : `_doc`;
		const address = field.startsWith(`${topLevelKey}.properties`)
			? field.replace(`${topLevelKey}.properties`, 'properties')
			: field;
		const parsedAddress = address.split('.').reduce((agg, key, index) => {
			if (index % 2 !== 0) {
				return agg ? `${agg}.${key}` : key;
			}
			return agg;
		}, '');
		const { dataField } = this.state;
		const fieldChanged = parsedAddress;

		this.setState((prevState) => ({
			changedFields: {
				...prevState.changedFields,
				new: {
					...prevState.changedFields.new,
					[parsedAddress]: usecase,
				},
				old: {
					...prevState.changedFields.old,
					[parsedAddress]: currentUsecase,
				},
			},
		}));

		if (usecase === 'aggs' || usecase === 'none') {
			const subFields = [
				fieldChanged,
				...reservedSearchSubFields.map((item) => `${fieldChanged}.${item}`),
			];

			const updatedFields = Object.keys(dataField).reduce((agg, item) => {
				if (subFields.includes(item)) {
					return agg;
				}
				return {
					...agg,
					[item]: dataField[item],
				};
			}, {});

			this.setState({
				dataField: updatedFields,
			});
			return;
		}

		if (usecase === 'search') {
			const subField = `${fieldChanged}.keyword`;

			const updatedFields = Object.keys(dataField).reduce((agg, item) => {
				if (subField === item) {
					return agg;
				}
				return {
					...agg,
					[item]: dataField[item],
				};
			}, {});

			this.setState({
				dataField: updatedFields,
			});
			return;
		}

		if (usecase === 'searchaggs') {
			const searchSubFields = Object.keys(mappingUsecase.searchaggs.fields);

			const subFields = [
				fieldChanged,
				...searchSubFields.map((item) => `${fieldChanged}.${item}`),
			];

			const notContainedField = subFields.filter(
				(item) => !Object.keys(dataField).includes(item),
			);

			const weight = dataField[fieldChanged] || 1;
			const updatedFields = notContainedField.reduce(
				(agg, item) => ({
					...agg,
					[item]: weight,
				}),
				{},
			);
			this.setState({
				dataField: {
					...dataField,
					...updatedFields,
				},
			});
		}
	};

	handleQueryFormat = (e) => {
		this.setState({
			queryFormat: e.target.value,
		});
	};

	render() {
		const {
			dataField,
			aggsMappings,
			hasTypoTolerance,
			typoTolerance,
			visible,
			isReset,
			enableSynonyms,
			isDirty,
			queryFormat,
			changedFieldWeights,
			changedFields,
			queryType,
		} = this.state;
		const {
			isUpdating,
			settings,
			appName,
			resetState,
			defaultSettings,
			isLoading,
			tier,
			traversedMappings,
			featureSearchRelevancy,
		} = this.props;
		const toleranceOptions = ['AUTO', 1, 2];

		if (!isValidPlan(tier, featureSearchRelevancy)) {
			return (
				<React.Fragment>
					<Banner {...bannerDetails} />
					<Overlay
						style={{
							maxWidth: '70%',
						}}
						src="https://i.imgur.com/8ENnHVv.png"
						alt="Search Settings"
					/>
				</React.Fragment>
			);
		}
		const sortedDataField = Object.keys(dataField)
			.sort()
			.reduce((agg, field) => {
				return {
					...agg,
					[field]: dataField[field],
				};
			}, {});
		const fieldWeights = get(settings, 'search.fieldWeights', []);
		const savedDataField = get(settings, 'search.dataField', []).reduce((agg, field, index) => {
			return {
				...agg,
				[field]: fieldWeights[index],
			};
		}, {});

		const sortedSavedDataField = Object.keys(savedDataField)
			.sort()
			.reduce((agg, field) => {
				return {
					...agg,
					[field]: savedDataField[field],
				};
			}, {});

		const {
			dataField: savedField,
			fieldWeights: savedWeight,
			queryString,
			searchOperators,
			...rest
		} = get(settings, 'search', {});

		const savedQueryType = this.getQueryType({ queryString, searchOperators });

		const oldFieldKeyes = removeSubFields(sortedSavedDataField);
		const newFieldKeyes = removeSubFields(sortedDataField);

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
							deleteLabel=" Remove from Search"
							ref={this.mappingsRef}
							showReplicas={false}
							showMappingInfo={false}
							showCardWrapper={false}
							hideAggsType
							hideNoType
							hideDelete
							onUsecaseChange={this.handleUsecaseChange}
							hideDataType
							isMappingsView={false}
							renderMappingInfo={() => {
								if (
									aggsMappings.length + this.noUseCaseMappings.length ===
									traversedMappings.length
								) {
									return (
										<p
											style={{
												color: '#999',
												textAlign: 'center',
												margin: 0,
											}}
										>
											Add searchable fields from dropdown.
										</p>
									);
								}
								return null;
							}}
							hidePropertiesType
							onChange={this.handleMappingChange}
							onDeleteField={this.handleDeleteField}
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
									const parsedAddress = address.replace(/properties./g, '');
									return (
										<InputNumber
											min={0}
											style={{ minWidth: 150, marginLeft: 12 }}
											value={dataField[parsedAddress]}
											onChange={(value) =>
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
													{aggsMappings.map((mapping) => (
														<Option
															key={mapping._address}
															value={mapping._address}
														>
															{mapping.address}
														</Option>
													))}
												</Select>
												{aggsMappings.length +
													this.noUseCaseMappings.length ===
												traversedMappings.length ? (
													<span className={highlighter} />
												) : null}
											</Col>
										</Row>
									</Affix>
								) : null
							}
						/>
					</Card>
					<Card className={cardStyle}>
						<label>
							Query Type
							<Tooltip title={settingsMap.queryType.description}>
								<Icon style={{ marginLeft: 5 }} type="info-circle" />
							</Tooltip>
						</label>
						<Radio.Group
							style={{ display: 'flex', marginBottom: 8 }}
							onChange={(e) => this.handleChange('queryType', e.target.value)}
							value={queryType}
						>
							<Radio value="default">ReactiveSearch</Radio>
							<Radio value="queryString">
								{settingsMap.queryString.title}{' '}
								<Tooltip title={settingsMap.queryString.description}>
									<Icon type="info-circle" />
								</Tooltip>
							</Radio>
							<Radio value="searchOperators">
								{settingsMap.searchOperators.title}{' '}
								<Tooltip title={settingsMap.searchOperators.description}>
									<Icon type="info-circle" />
								</Tooltip>
							</Radio>
						</Radio.Group>
						<label>
							Query Format
							<Tooltip title={settingsMap.queryFormat.description}>
								<Icon style={{ marginLeft: 5 }} type="info-circle" />
							</Tooltip>
						</label>
						<Radio.Group
							style={{ display: 'flex', marginBottom: 8 }}
							onChange={this.handleQueryFormat}
							value={queryFormat}
						>
							<Radio value="or">Or</Radio>
							<Radio value="and">And</Radio>
						</Radio.Group>
						<label>
							{settingsMap.enableTypoTolerance.title}{' '}
							<Tooltip title={settingsMap.enableTypoTolerance.description}>
								<Icon type="info-circle" />
							</Tooltip>
						</label>
						<Switch
							checked={hasTypoTolerance}
							onChange={(value) => this.handleChange('hasTypoTolerance', value)}
						/>

						{hasTypoTolerance && (
							<React.Fragment>
								<label>
									{settingsMap.typoToleranceValue.title}{' '}
									<Tooltip title={settingsMap.typoToleranceValue.description}>
										<Icon type="info-circle" />
									</Tooltip>
								</label>
								<Select
									placeholder="Select typo tolerance"
									value={typoTolerance}
									optionFilterProp="children"
									style={{ minWidth: 200, marginBottom: '15px' }}
									onChange={(value) => this.handleChange('typoTolerance', value)}
									filterOption={(input, option) =>
										option.props.children
											.toLowerCase()
											.indexOf(input.toLowerCase()) >= 0
									}
								>
									{toleranceOptions.map((option) => (
										<Option key={option} value={option}>
											{option}
										</Option>
									))}
								</Select>
							</React.Fragment>
						)}

						<label>
							Enable Synonyms{' '}
							<Tooltip title={settingsMap.synonyms.description}>
								<Icon type="info-circle" />
							</Tooltip>
						</label>
						<Switch
							checked={enableSynonyms}
							onChange={(value) => this.handleChange('enableSynonyms', value)}
						/>
					</Card>
					<SettingsFooter
						loading={isUpdating}
						resetState={resetState}
						onReset={this.resetToDefault}
						showSearchPreview
						searchPreviewModalProps={{
							searchPreviewProps: {
								testSettings: {
									...(settings || {}),
									search: {
										fuzziness: hasTypoTolerance ? typoTolerance : 0,
										searchOperators: queryType === 'searchOperators',
										dataField: Object.keys(dataField),
										fieldWeights: Object.values(dataField),
										queryString: queryType === 'queryString',
										queryFormat,
									},
								},
								hasTestSettings: Object.keys(dataField).length > 0,
							},
							buttonProps: {
								showTooltip: isDirty,
								tooltip: settingsMap.disable_search_settings.description,
							},
						}}
						app={appName}
						showReset={
							!isEqual(get(settings, 'search'), get(defaultSettings, 'search'))
						}
						reviewAndSave={() => (
							<ReviewAndSave
								loading={isUpdating}
								isReset={isReset}
								oldValues={{
									...rest,
									dataField: get(changedFields, 'old', {}),
									fieldWeights: Object.values(sortedSavedDataField),
									synonyms: get(settings, 'synonyms.enabled'),
									queryFormat: get(settings, 'search.queryFormat'),
									queryType: savedQueryType,
								}}
								newValues={{
									fuzziness: hasTypoTolerance ? typoTolerance : 0,
									dataField: get(changedFields, 'new', {}),
									fieldWeights: Object.values(sortedDataField),
									synonyms: enableSynonyms,
									queryFormat,
									queryType,
								}}
								renderField={({ type, record }) => {
									const fieldName = get(record, 'setting', '').toLowerCase();
									if (fieldName === 'datafield') {
										if (JSON.stringify(oldFieldKeyes) === JSON.stringify({})) {
											return type === 'old'
												? JSON.stringify(
														Object.keys(oldFieldKeyes),
														null,
														2,
												  )
												: JSON.stringify(
														Object.keys(newFieldKeyes),
														null,
														2,
												  );
										}

										return Object.keys(get(changedFields, type, {})).map(
											(field) => (
												<Typography.Paragraph>
													{field}:{' '}
													<strong>
														{get(changedFields, `${type}.${field}`)}
													</strong>
												</Typography.Paragraph>
											),
										);
									}
									if (fieldName === 'fieldweights') {
										if (JSON.stringify(oldFieldKeyes) === JSON.stringify({})) {
											return type === 'old'
												? JSON.stringify(
														Object.values(oldFieldKeyes),
														null,
														2,
												  )
												: JSON.stringify(
														Object.values(newFieldKeyes),
														null,
														2,
												  );
										}

										if (JSON.stringify(changedFieldWeights) === '{}') {
											return Object.keys(get(changedFields, type, {})).map(
												(field) => (
													<Typography.Paragraph>
														{field}:{' '}
														<strong>
															{get(
																changedFields,
																`${type}.${field}`,
																[],
															).includes('search')
																? get(newFieldKeyes, field) || 1
																: 0}
														</strong>
													</Typography.Paragraph>
												),
											);
										}
										return Object.keys(changedFieldWeights).map((field) => (
											<Typography.Paragraph>
												{field}:{' '}
												<strong>
													{type === 'old'
														? get(oldFieldKeyes, field)
														: get(changedFieldWeights, field)}
												</strong>
											</Typography.Paragraph>
										));
									}
									return JSON.stringify(get(record, `value.${type}`), null, 2);
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

SearchSettingsPage.propTypes = {
	isUpdating: PropTypes.bool,
	settings: PropTypes.object,
	appName: PropTypes.string.isRequired,
	resetState: PropTypes.object,
	defaultSettings: PropTypes.object,
	isLoading: PropTypes.bool,
	tier: allowedTiers,
	traversedMappings: PropTypes.array,
	featureSearchRelevancy: PropTypes.bool,
	credentials: PropTypes.string.isRequired,
	fetchMappings: PropTypes.func.isRequired,
	getSettingsAction: PropTypes.func.isRequired,
	mappings: PropTypes.object,
	isFetchingMapping: PropTypes.bool,
	updateSettingsAction: PropTypes.func.isRequired,
	getDefaultSettingsAction: PropTypes.func.isRequired,
};

SearchSettingsPage.defaultProps = {
	isUpdating: false,
	settings: null,
	resetState: {},
	defaultSettings: null,
	isLoading: false,
	tier: undefined,
	traversedMappings: [],
	featureSearchRelevancy: false,
	mappings: null,
	isFetchingMapping: false,
};

const mapStateToProps = (state) => {
	const mappings = getRawMappingsByAppName(state) || null;

	const { username, password } = get(state, 'user.data', {});
	const defaultSettings = get(state.$getAppSettings, `defaultSettings`);
	const errorCode = get(state, '$getAppSettings.error.actual.code');
	const defaultSearchSettings = errorCode === 404 ? defaultSettings : null;
	const appName = get(state, '$getCurrentApp.name');
	return {
		isLoading: get(state, '$getAppSettings.isFetching'),
		settings: get(state, ['$getAppSettings', 'settings', appName], defaultSearchSettings),
		isUpdating: get(state, '$getAppSettings.isUpdating'),
		resetState: get(state, '$getAppSettings.default', {}),
		credentials: username ? `${username}:${password}` : null,
		mappings,
		defaultSettings: get(state, '$getAppSettings.defaultSettings'),
		isFetchingMapping: get(state, '$getAppMappings.isFetching'),
		traversedMappings: get(state, `$getAppMappings.traversedMappings.${appName}`, []),
		appName,
		tier: get(state, '$getAppPlan.results.tier'),
		featureSearchRelevancy: get(state, '$getAppPlan.results.feature_search_relevancy', false),
	};
};

const mapDispatchToProps = (dispatch) => ({
	fetchMappings: (appName, credentials, url) =>
		dispatch(getAppMappings(appName, credentials, url)),
	getDefaultSettingsAction: () => dispatch(getDefaultSettings()),
	getSettingsAction: (name) => dispatch(getSettings(name)),
	updateSettingsAction: (name, payload) => dispatch(putSettings(name, payload)),
	deleteSettingsAction: (name) => dispatch(deleteSettings(name)),
});

export default connect(mapStateToProps, mapDispatchToProps)(SearchSettingsPage);
