import React from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';

import { connect } from 'react-redux';
import { Card, Divider, Skeleton, Button, Tooltip, Icon, Modal } from 'antd';
import {
	getDefaultSettings,
	putSettings,
	deleteSettings,
	getSettings as getSearchRelevancy,
	setLocalRelevancyState,
} from '../../batteries/modules/actions';
import { getSubFields, getFieldWeight } from '../../utils';
import { allowedTiers } from '../../utils/prop-types';
import { getMappingsByPath, getMappingsInfo, getTopLevelFields } from '../../utils/mappings';
import { isValidPlan } from '../../batteries/utils';
import { container } from '../ResultsPage/styles';

import Banner from '../../batteries/components/shared/UpgradePlan/Banner';
import Overlay from '../../components/Overlay';
import SettingsOptions from './components/SettingsOptions';
import FieldWeights from './components/FieldsWeight';
import MappingWrapper from '../../components/MappingsWrapper';
import SettingsFooter from '../../components/SettingsFooter';
import RankFeature from './components/RankFeature';
import { getRawMappingsByAppName } from '../../batteries/modules/selectors';

const { confirm } = Modal;

const bannerDetails = {
	title: 'Search Settings',
	buttonText: 'Read More',
	description: `Search Settings enables you to control search query and relevance settings.`,
	icon: 'pencil',
	videoLink: 'https://youtu.be/moxJ2ZB4owI',
	href: 'https://docs.appbase.io/docs/search/relevancy/#search-settings',
};

const getqueryFormat = ({ queryString, searchOperators }) => {
	if (queryString) {
		return 'queryString';
	}

	if (searchOperators) {
		return 'searchOperators';
	}

	return 'default';
};

class SearchSettingsPage extends React.Component {
	componentDidMount() {
		const {
			appName,
			getSettingsAction,
			settings,
			getDefaultSettingsAction,
			defaultSettings,
			localRelevancy,
		} = this.props;

		if (settings && !localRelevancy) {
			this.init({ ...settings });
		} else {
			getSettingsAction(appName);
		}

		if (!defaultSettings) {
			getDefaultSettingsAction();
		}
	}

	componentDidUpdate(prevProps) {
		const { settings, mappings, localRelevancy, isLoading, defaultSettings } = this.props;

		if (
			JSON.stringify(settings) !== JSON.stringify(prevProps.settings) ||
			JSON.stringify(mappings) !== JSON.stringify(prevProps.mappings)
		) {
			this.init({ ...(localRelevancy || settings) });
		}

		if (
			!settings &&
			!localRelevancy &&
			!isLoading &&
			JSON.stringify(defaultSettings) !== JSON.stringify(prevProps.defaultSettings)
		) {
			this.init({ ...defaultSettings });
		}
	}

	handleChange = (name, value) => {
		const { localRelevancy, updateLocalRelevancy, appName } = this.props;
		const searchSettings = get(localRelevancy, `search`);
		const updatedDataField = [...get(searchSettings, 'dataField')];
		const updatedFieldWeights = [...get(searchSettings, 'fieldWeights')];
		if (name === 'enableSynonyms') {
			let newDataFields = [...updatedDataField];
			let newFieldWeights = [...updatedFieldWeights];

			if (value) {
				const topLevelFields = getTopLevelFields({ dataField: newDataFields });
				Object.keys(topLevelFields).forEach((f) => {
					const newField = `${f}.synonyms`;
					if (!newDataFields.includes(newField)) {
						newDataFields.push(newField);
						newFieldWeights.push(
							getFieldWeight('synonyms', updatedFieldWeights[topLevelFields[f]]),
						);
					}
				});
			} else {
				const indices = [];
				newDataFields = newDataFields.filter((f, i) => {
					if (f.indexOf('.synonyms') > -1) {
						indices.push(i);
						return false;
					}

					return true;
				});

				newFieldWeights = newFieldWeights.filter((_, i) => !indices.includes(i));
			}
			updateLocalRelevancy(appName, {
				...localRelevancy,
				search: {
					...searchSettings,
					dataField: newDataFields,
					fieldWeights: newFieldWeights,
				},
				synonyms: {
					...get(localRelevancy, `synonyms`, {}),
					enabled: value,
				},
			});
		} else if (name === 'enableNgram') {
			let newDataFields = [...updatedDataField];
			let newFieldWeights = [...updatedFieldWeights];

			if (value) {
				const topLevelFields = getTopLevelFields({ dataField: newDataFields });
				Object.keys(topLevelFields).forEach((f) => {
					const newField = `${f}.search`;

					if (!newDataFields.includes(newField)) {
						newDataFields.push(newField);
						newFieldWeights.push(
							getFieldWeight('search', updatedFieldWeights[topLevelFields[f]]),
						);
					}
				});
			} else {
				const indices = [];
				newDataFields = newDataFields.filter((f, i) => {
					if (f.indexOf('.search') > -1) {
						indices.push(i);
						return false;
					}

					return true;
				});

				newFieldWeights = newFieldWeights.filter((_, i) => !indices.includes(i));
			}

			updateLocalRelevancy(appName, {
				...localRelevancy,
				search: {
					...searchSettings,
					dataField: newDataFields,
					fieldWeights: newFieldWeights,
				},
				indexSettings: {
					...get(localRelevancy, `indexSettings`, {}),
					enableNgram: value,
				},
			});
		} else if (name === 'queryType') {
			updateLocalRelevancy(appName, {
				...localRelevancy,
				search: {
					...get(localRelevancy, `search`, {}),
					queryString: value === 'queryString',
					searchOperators: value === 'searchOperators',
				},
			});
		} else {
			updateLocalRelevancy(appName, {
				...localRelevancy,
				search: {
					...get(localRelevancy, `search`, {}),
					[name]: value,
				},
			});
		}
	};

	init = (settings) => {
		const { appName, updateLocalRelevancy, localRelevancy } = this.props;

		if (!localRelevancy) {
			updateLocalRelevancy(appName, {
				...settings,
			});
		}

		// initialFieldWeights for searchable fields initially if the no search fields are set!
		this.initialFieldWeights();
	};

	initialFieldWeights = () => {
		const {
			settings,
			isLoading,
			isFetchingMapping,
			appName,
			localRelevancy,
			updateLocalRelevancy,
			mappings,
		} = this.props;

		const synonymsSettings = get(settings, 'synonyms');
		const indexSettings = get(settings, 'indexSettings');
		const languageSettings = get(settings, 'language');
		const { flattenUsecase } = getMappingsInfo({
			mappings,
			enableNgram: indexSettings.enableNgram,
			enableSynonyms: synonymsSettings.enabled,
			language: languageSettings.language,
		});

		const { dataField, fieldWeights } = get(settings, `search`);
		const hasSearchFields = flattenUsecase
			? Object.values(flattenUsecase).some((i) => i === 'search' || 'searchaggs')
			: false;
		if (
			!fieldWeights.length &&
			!dataField.length &&
			!isFetchingMapping &&
			!isLoading &&
			hasSearchFields
		) {
			const { enableNgram } = get(localRelevancy || settings, `indexSettings`);
			const { language } = get(localRelevancy || settings, `language`);
			const { enabled: enableSynonyms } = get(localRelevancy || settings, `synonyms`);

			const fieldDataTuple = Object.keys(flattenUsecase).reduce(
				(agg, item) => {
					if (
						flattenUsecase[item] === 'search' ||
						flattenUsecase[item] === 'searchaggs'
					) {
						const fields = getSubFields({
							fields: get(
								getMappingsByPath({
									mappings,
									path: item,
								}),
								'fields',
							),
							weight: 1,
							address: item,
							skipSearch: enableNgram === false,
							skipLang: !language,
							skipSynonyms: enableSynonyms === false,
						});

						return [
							[...agg[0], ...Object.keys(fields)],
							[...agg[1], ...Object.values(fields)],
						];
					}

					return agg;
				},
				[[], []],
			);

			updateLocalRelevancy(appName, {
				...(localRelevancy || settings),
				search: {
					...get(localRelevancy || settings, `search`, {}),
					dataField: fieldDataTuple[0],
					fieldWeights: fieldDataTuple[1],
				},
			});
		}
	};

	handleFieldWeights = ({ field, weight, mapping }) => {
		const { localRelevancy, appName, updateLocalRelevancy } = this.props;
		const dataField = [...get(localRelevancy, `search.dataField`)];
		const fieldWeights = [...get(localRelevancy, `search.fieldWeights`)];
		const { enableNgram } = get(localRelevancy, `indexSettings`);
		const { enabled: enableSynonyms } = get(localRelevancy, `synonyms`);
		const { language } = get(localRelevancy, `language`);
		const updatedFields = getSubFields({
			fields: get(mapping, 'fields'),
			weight: Number(weight).toFixed(1),
			address: field,
			skipSearch: enableNgram === false,
			skipLang: !language,
			skipSynonyms: enableSynonyms === false,
		});
		const updatedDataFields = Object.keys(updatedFields);
		updatedDataFields.forEach((item) => {
			const fieldIndex = dataField.findIndex((x) => x === item);
			fieldWeights[fieldIndex] = updatedFields[item];
		});

		updateLocalRelevancy(appName, {
			...localRelevancy,
			search: {
				...get(localRelevancy, `search`, {}),
				fieldWeights: [...fieldWeights],
			},
		});
	};

	handleRemoveFromSearch = (field) => {
		const { appName, localRelevancy, updateLocalRelevancy } = this.props;
		const { fieldWeights, dataField } = get(localRelevancy, `search`);
		const fields = [field, ...dataField.filter((i) => i.indexOf(`${field}.`) > -1)];

		let updatedDataField = [...dataField];
		let updatedFieldWeights = [...fieldWeights];
		const indices = [];
		updatedDataField = updatedDataField.filter((f, i) => {
			if (fields.includes(f)) {
				indices.push(i);
				return false;
			}

			return true;
		});

		updatedFieldWeights = updatedFieldWeights.filter((w, i) => {
			return indices.indexOf(i) === -1;
		});

		updateLocalRelevancy(appName, {
			...localRelevancy,
			search: {
				...get(localRelevancy, `search`, {}),
				dataField: updatedDataField,
				fieldWeights: updatedFieldWeights,
			},
		});
	};

	showConfirmRemoveFields = (removeFieldsFunction) => {
		confirm({
			title: 'Do you want to remove all the search fields?',
			content:
				'It is recommended to have multiple search fields to increase your search efficiency. If you click OK, please consider adding it manually from the dropdown below.',
			onOk() {
				removeFieldsFunction();
			},
		});
	};

	removeAllSearchableFields = () => {
		const { appName, localRelevancy, updateLocalRelevancy } = this.props;
		updateLocalRelevancy(appName, {
			...localRelevancy,
			search: {
				...get(localRelevancy, `search`, {}),
				dataField: [],
				fieldWeights: [],
			},
		});
	};

	disableRemoveAllButton = () => {
		const { localRelevancy } = this.props;
		const { fieldWeights, dataField } = get(localRelevancy, `search`);
		if (fieldWeights.length > 0 && dataField.length > 0) return false;
		return true;
	};

	handleAddSearchField = ({ field, setMapping }) => {
		const { localRelevancy, appName, updateLocalRelevancy } = this.props;
		const { fieldWeights, dataField } = get(localRelevancy, `search`);
		const { enableNgram } = get(localRelevancy, `indexSettings`);
		const { enabled: enableSynonyms } = get(localRelevancy, `synonyms`);
		const { language } = get(localRelevancy, `language`);

		const updatedMappings = setMapping([
			{
				usecase: 'searchaggs',
				path: field,
				type: 'text',
			},
		]);

		// add to dataField & fieldWeights
		const newFields = getSubFields({
			fields: get(getMappingsByPath({ mappings: updatedMappings, path: field }), 'fields'),
			weight: 1,
			address: field,
			skipSearch: enableNgram === false,
			skipLang: !language,
			skipSynonyms: enableSynonyms === false,
		});

		updateLocalRelevancy(appName, {
			...localRelevancy,
			search: {
				...get(localRelevancy, `search`, {}),
				dataField: [...dataField, ...Object.keys(newFields)],
				fieldWeights: [...fieldWeights, ...Object.values(newFields)],
			},
		});
	};

	render() {
		const { isLoading, tier, featureSearchRelevancy, localRelevancy } = this.props;

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

		if (isLoading || !localRelevancy || !get(localRelevancy, `search`, null)) {
			return (
				<React.Fragment>
					<Banner {...bannerDetails} />
					<div className={container}>
						<Skeleton />
					</div>
				</React.Fragment>
			);
		}

		const { fuzziness, queryFormat, queryString, searchOperators, dataField } = get(
			localRelevancy,
			`search`,
		);

		const { enableNgram } = get(localRelevancy, `indexSettings`);
		const { enabled: enableSynonyms } = get(localRelevancy, `synonyms`);

		return (
			<div>
				<Banner {...bannerDetails} />
				<div className={container}>
					<Card>
						<MappingWrapper>
							{(mappingWrapperProps) => (
								<>
									<Tooltip title="Fetch latest Mappings">
										<Button
											style={{ marginRight: 8, color: '#1890ff' }}
											onClick={mappingWrapperProps.reloadMappings}
											data-cy="reload-mappings-button"
										>
											<Icon type="reload" />
											Reload Mappings
										</Button>
									</Tooltip>

									{dataField && dataField.length > 0 && (
										<Tooltip title="Clear all searchable fields">
											<Button
												style={{
													marginRight: 8,
													color: '#cf1322',
												}}
												onClick={() =>
													this.showConfirmRemoveFields(
														this.removeAllSearchableFields,
													)
												}
												disabled={this.disableRemoveAllButton()}
											>
												<Icon type="delete" />
												Remove All Fields
											</Button>
										</Tooltip>
									)}

									<div style={{ marginTop: 20 }}>
										{get(mappingWrapperProps, 'isFetchingSetting') ||
										get(mappingWrapperProps, 'isFetchingMapping') ? (
											<Skeleton />
										) : (
											<FieldWeights
												handleFieldWeights={this.handleFieldWeights}
												handleDelete={this.handleRemoveFromSearch}
												handleAddSearchField={this.handleAddSearchField}
												mappingWrapperProps={mappingWrapperProps}
											/>
										)}
									</div>
									<Divider />
									{!get(mappingWrapperProps, 'isFetchingSetting') &&
										!get(mappingWrapperProps, 'isFetchingMapping') &&
										localRelevancy && (
											<RankFeature
												mappingWrapperProps={mappingWrapperProps}
											/>
										)}

									<Divider />
									<SettingsOptions
										handleChange={(name, value) =>
											this.handleChange(name, value)
										}
										queryFormat={queryFormat}
										fuzziness={fuzziness}
										enableSynonyms={enableSynonyms}
										enableNgram={enableNgram}
										queryType={getqueryFormat({ queryString, searchOperators })}
									/>
								</>
							)}
						</MappingWrapper>
					</Card>
					<SettingsFooter />
				</div>
			</div>
		);
	}
}

SearchSettingsPage.propTypes = {
	appName: PropTypes.string.isRequired,
	defaultSettings: PropTypes.object,
	isLoading: PropTypes.bool,
	isUpdating: PropTypes.bool,
	resetState: PropTypes.object,
	settings: PropTypes.object,
	tier: allowedTiers,

	featureSearchRelevancy: PropTypes.bool,
	getDefaultSettingsAction: PropTypes.func.isRequired,
	getSettingsAction: PropTypes.func.isRequired,
	updateSettingsAction: PropTypes.func.isRequired,
	updateLocalRelevancy: PropTypes.func.isRequired,
	localRelevancy: PropTypes.object,
	isFetchingMapping: PropTypes.bool.isRequired,
	mappings: PropTypes.object,
};

SearchSettingsPage.defaultProps = {
	isUpdating: false,
	settings: null,
	resetState: {},
	defaultSettings: null,
	isLoading: false,
	tier: undefined,
	featureSearchRelevancy: false,
	localRelevancy: null,
	mappings: null,
};

const mapStateToProps = (state) => {
	const defaultSettings = get(state.$getAppSettings, `defaultSettings`);
	const errorCode = get(state, '$getAppSettings.error.actual.code');
	const defaultSearchSettings = errorCode === 404 ? defaultSettings : null;
	const appName = get(state, '$getCurrentApp.name');
	const localRelevancy = get(state, `$getLocalRelevancy.${appName}`, null);
	return {
		isLoading: get(state, '$getAppSettings.isFetching'),
		settings: get(state, ['$getAppSettings', 'settings', appName], defaultSearchSettings),
		isUpdating: get(state, '$getAppSettings.isUpdating'),
		defaultSettings: get(state, '$getAppSettings.defaultSettings'),
		appName,
		resetState: get(state, '$getAppSettings.default', {}),
		tier: get(state, '$getAppPlan.results.tier'),
		featureSearchRelevancy: get(state, '$getAppPlan.results.feature_search_relevancy', false),
		isFetchingMapping: get(state, '$getAppMappings.isFetching', false),
		localRelevancy,
		mappings: getRawMappingsByAppName(state) || null,
	};
};

const mapDispatchToProps = (dispatch) => ({
	getDefaultSettingsAction: () => dispatch(getDefaultSettings()),
	getSettingsAction: (name) => dispatch(getSearchRelevancy(name)),
	updateSettingsAction: (name, payload) => dispatch(putSettings(name, payload)),
	deleteSettingsAction: (name) => dispatch(deleteSettings(name)),
	updateLocalRelevancy: (name, data) => dispatch(setLocalRelevancyState(name, data)),
});

export default connect(mapStateToProps, mapDispatchToProps)(SearchSettingsPage);
