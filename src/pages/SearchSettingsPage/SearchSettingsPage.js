import React from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';

import { connect } from 'react-redux';
import { Card, Divider, Skeleton, Button, Tooltip, Icon } from 'antd';
import {
	getDefaultSettings,
	putSettings,
	deleteSettings,
	getSettings as getSearchRelevancy,
	setLocalRelevancyState,
} from '../../batteries/modules/actions';
import { getSubFields } from '../../utils';
import { allowedTiers } from '../../utils/prop-types';
import { getMappingsByPath, getMappingsInfo } from '../../utils/mappings';
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
		const { settings, mappings, localRelevancy } = this.props;

		if (
			JSON.stringify(settings) !== JSON.stringify(prevProps.settings) ||
			JSON.stringify(mappings) !== JSON.stringify(prevProps.mappings)
		) {
			this.init({ ...(localRelevancy || settings) });
		}
	}

	handleChange = (name, value, mappingWrapperProps) => {
		const { localRelevancy, updateLocalRelevancy, appName } = this.props;
		const searchSettings = get(localRelevancy, `search`);
		const updatedDataField = [...get(searchSettings, 'dataField')];
		const updatedFieldWeights = [...get(searchSettings, 'fieldWeights')];
		const { flattenUsecase, mappings } = mappingWrapperProps;
		if (name === 'enableSynonyms') {
			const [newDataFields, newFieldWeights] = Object.keys(flattenUsecase).reduce(
				(agg, item) => {
					if (
						updatedDataField.includes(item) &&
						(flattenUsecase[item] === 'search' || flattenUsecase[item] === 'searchaggs')
					) {
						const { enableNgram } = get(localRelevancy, `indexSettings`);
						const { language } = get(localRelevancy, `language`);
						const fieldIndex = updatedDataField.findIndex((x) => x === item);

						const fields = getSubFields({
							fields: get(
								getMappingsByPath({
									mappings,
									path: item,
								}),
								'fields',
							),
							weight: updatedFieldWeights[fieldIndex],
							address: item,
							skipSearch: enableNgram === false,
							skipLang: !language,
							skipSynonyms: value === false,
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
			const [newDataFields, newFieldWeights] = Object.keys(flattenUsecase).reduce(
				(agg, item) => {
					if (
						updatedDataField.includes(item) &&
						(flattenUsecase[item] === 'search' || flattenUsecase[item] === 'searchaggs')
					) {
						const { enabled: enableSynonyms } = get(localRelevancy, `synonyms`);
						const { language } = get(localRelevancy, `language`);
						const fieldIndex = updatedDataField.findIndex((x) => x === item);
						const fields = getSubFields({
							fields: get(
								getMappingsByPath({
									mappings,
									path: item,
								}),
								'fields',
							),
							weight: updatedFieldWeights[fieldIndex],
							address: item,
							skipSearch: value === false,
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
			const fieldDataTuple = Object.keys(flattenUsecase).reduce(
				(agg, item) => {
					if (
						flattenUsecase[item] === 'search' ||
						flattenUsecase[item] === 'searchaggs'
					) {
						const { enableNgram } = get(localRelevancy || settings, `indexSettings`);
						const { enabled: enableSynonyms } = get(
							localRelevancy || settings,
							`synonyms`,
						);
						const { language } = get(localRelevancy || settings, `language`);

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

		const { fuzziness, queryFormat, queryString, searchOperators } = get(
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
										>
											<Icon type="reload" />
											Reload Mappings
										</Button>
									</Tooltip>
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
											this.handleChange(name, value, mappingWrapperProps)
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
