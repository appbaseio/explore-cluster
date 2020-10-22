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
import { getMappingsByPath } from '../../utils/mappings';
import { isValidPlan } from '../../batteries/utils';
import { container } from '../ResultsPage/styles';

import Banner from '../../batteries/components/shared/UpgradePlan/Banner';
import Overlay from '../../components/Overlay';
import SettingsOptions from './components/SettingsOptions';
import FieldWeights from './components/FieldsWeight';
import MappingWrapper from '../../components/MappingsWrapper';

const bannerDetails = {
	title: 'Search Settings',
	buttonText: 'Read More',
	description: 'Search Settings allow you to control your search query settings.',
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

		if (settings && !get(localRelevancy, appName)) {
			this.init(settings);
		} else {
			getSettingsAction(appName);
		}

		if (!defaultSettings) {
			getDefaultSettingsAction();
		}
	}

	componentDidUpdate(prevProps) {
		const { settings, isLoading } = this.props;

		if (!isLoading && JSON.stringify(settings) !== JSON.stringify(prevProps.settings)) {
			this.init(settings);
		}
	}

	handleChange = (name, value) => {
		const { localRelevancy, updateLocalRelevancy, appName } = this.props;
		if (name === 'enableSynonyms') {
			updateLocalRelevancy(appName, {
				...get(localRelevancy, appName),
				synonyms: {
					...get(localRelevancy, `${appName}.synonyms`, {}),
					enabled: value,
				},
			});
		} else if (name === 'enableNgram') {
			updateLocalRelevancy(appName, {
				...get(localRelevancy, appName),
				indexSettings: {
					...get(localRelevancy, `${appName}.indexSettings`, {}),
					enableNgram: value,
				},
			});
		} else if (name === 'queryType') {
			updateLocalRelevancy(appName, {
				...get(localRelevancy, appName),
				search: {
					...get(localRelevancy, `${appName}.search`, {}),
					queryString: value === 'queryString',
					searchOperators: value === 'searchOperators',
				},
			});
		} else {
			updateLocalRelevancy(appName, {
				...get(localRelevancy, appName),
				search: {
					...get(localRelevancy, `${appName}.search`, {}),
					[name]: value,
				},
			});
		}
	};

	init = (settings) => {
		const { appName, updateLocalRelevancy } = this.props;

		updateLocalRelevancy(appName, { ...settings });
	};

	handleFieldWeights = ({ field, weight, mapping }) => {
		const { localRelevancy, appName, updateLocalRelevancy } = this.props;
		const { dataField, fieldWeights } = get(localRelevancy, `${appName}.search`);

		const { enableNgram } = get(localRelevancy, `${appName}.indexSettings`);
		const { enabled: enableSynonyms } = get(localRelevancy, `${appName}.synonyms`);
		const { language } = get(localRelevancy, `${appName}.language`);
		const updatedFields = getSubFields({
			fields: get(mapping, 'fields'),
			weight,
			address: field,
			skipSearch: !enableNgram,
			skipLang: !language,
			skipSynonyms: !enableSynonyms,
		});
		const updatedDataFields = Object.keys(updatedFields);
		updatedDataFields.forEach((item) => {
			const fieldIndex = dataField.findIndex((x) => x === item);
			fieldWeights[fieldIndex] = updatedFields[item];
		});

		updateLocalRelevancy(appName, {
			...get(localRelevancy, appName),
			search: {
				...get(localRelevancy, `${appName}.search`, {}),
				fieldWeights,
			},
		});
	};

	// ref to older version: https://github.com/appbaseio-confidential/arc-dashboard/blob/72869b13cf6daf78af7d91eafc480c6894a4f36c/src/pages/SearchSettingsPage/SearchSettings.js#L473
	handleRemoveFromSearch = ({ setMapping, field, flattenUsecase, mappings }) => {
		const { appName, localRelevancy, updateLocalRelevancy } = this.props;
		const { fieldWeights, dataField } = get(localRelevancy, `${appName}.search`);

		const { enableNgram } = get(localRelevancy, `${appName}.indexSettings`);
		const { enabled: enableSynonyms } = get(localRelevancy, `${appName}.synonyms`);
		const nestedFields = Object.keys(flattenUsecase).filter((i) => i.indexOf(`${field}.`) > -1);
		const { language } = get(localRelevancy, `${appName}.language`);
		let newMappings = [];
		if (nestedFields.length) {
			newMappings = nestedFields.map((i) => {
				if (flattenUsecase[i] === 'search' || flattenUsecase[i] === 'searchaggs') {
					return {
						usecase: 'aggs',
						path: i,
						type: 'text',
					};
				}
				return null;
			});
			newMappings = newMappings.filter((i) => Boolean(i));
		} else {
			newMappings = [
				{
					usecase: 'aggs',
					path: field,
					type: 'text',
				},
			];
		}

		const fields = nestedFields.length ? nestedFields : [field];

		const fiedsWithSubFields = fields.reduce((agg, f) => {
			const subFields = getSubFields({
				fields: get(getMappingsByPath({ mappings, path: f }), 'fields'),
				weight: 1,
				address: f,
				skipSearch: !enableNgram,
				skipLang: !language,
				skipSynonyms: !enableSynonyms,
			});
			return {
				...agg,
				...subFields,
			};
		}, {});

		const fieldNames = Object.keys(fiedsWithSubFields);

		let updatedDataField = [...dataField];
		let updatedFieldWeights = [...fieldWeights];
		const indices = [];
		updatedDataField = updatedDataField.filter((f, i) => {
			if (fieldNames.includes(f)) {
				indices.push(i);
				return false;
			}

			return true;
		});

		updatedFieldWeights = updatedFieldWeights.filter((w, i) => {
			return indices.indexOf(i) === -1;
		});

		updateLocalRelevancy(appName, {
			...get(localRelevancy, appName),
			search: {
				...get(localRelevancy, `${appName}.search`, {}),
				dataField: updatedDataField,
				fieldWeights: updatedFieldWeights,
			},
		});
		setMapping(newMappings);
		// remove all this fields from dataField + fieldWeights
	};

	updateToSearchField = ({ field, setMapping, mapping }) => {
		const { localRelevancy, appName, updateLocalRelevancy } = this.props;
		const { fieldWeights, dataField } = get(localRelevancy, `${appName}.search`);
		const { enableNgram } = get(localRelevancy, `${appName}.indexSettings`);
		const { enabled: enableSynonyms } = get(localRelevancy, `${appName}.synonyms`);
		const { language } = get(localRelevancy, `${appName}.language`);

		setMapping([
			{
				usecase: 'searchaggs',
				path: field,
				type: 'text',
			},
		]);

		// add to dataField & fieldWeights
		const newFields = getSubFields({
			fields: get(mapping, `${field}.fields`),
			weight: 0,
			address: field,
			skipSearch: !enableNgram,
			skipLang: !language,
			skipSynonyms: !enableSynonyms,
		});

		updateLocalRelevancy(appName, {
			...get(localRelevancy, appName),
			search: {
				...get(localRelevancy, `${appName}.search`, {}),
				dataField: [...dataField, ...Object.keys(newFields)],
				fieldWeights: [...fieldWeights, ...Object.values(newFields)],
			},
		});
	};

	render() {
		const { isLoading, appName, tier, featureSearchRelevancy, localRelevancy } = this.props;

		if (isLoading || !localRelevancy || !get(localRelevancy, `${appName}.search`, null)) {
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

		const {
			dataField,
			fieldWeights,
			fuzziness,
			queryFormat,
			queryString,
			searchOperators,
		} = get(localRelevancy, `${appName}.search`);

		const { enableNgram } = get(localRelevancy, `${appName}.indexSettings`);
		const { enabled: enableSynonyms } = get(localRelevancy, `${appName}.synonyms`);

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
												fieldWeights={fieldWeights}
												dataField={dataField}
												handleFieldWeights={this.handleFieldWeights}
												handleDelete={this.handleRemoveFromSearch}
												updateToSearchField={this.updateToSearchField}
												mappingWrapperProps={mappingWrapperProps}
											/>
										)}
									</div>
								</>
							)}
						</MappingWrapper>

						<Divider />
						<SettingsOptions
							handleChange={this.handleChange}
							queryFormat={queryFormat}
							fuzziness={fuzziness}
							enableSynonyms={enableSynonyms}
							enableNgram={enableNgram}
							queryType={getqueryFormat({ queryString, searchOperators })}
						/>
					</Card>
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
};

const mapStateToProps = (state) => {
	const defaultSettings = get(state.$getAppSettings, `defaultSettings`);
	const errorCode = get(state, '$getAppSettings.error.actual.code');
	const defaultSearchSettings = errorCode === 404 ? defaultSettings : null;
	const appName = get(state, '$getCurrentApp.name');
	const localRelevancy = get(state, `$getLocalRelevancy`);
	return {
		isLoading: get(state, '$getAppSettings.isFetching'),
		settings: get(state, ['$getAppSettings', 'settings', appName], defaultSearchSettings),
		isUpdating: get(state, '$getAppSettings.isUpdating'),
		defaultSettings: get(state, '$getAppSettings.defaultSettings'),
		appName,
		resetState: get(state, '$getAppSettings.default', {}),
		tier: get(state, '$getAppPlan.results.tier'),
		featureSearchRelevancy: get(state, '$getAppPlan.results.feature_search_relevancy', false),
		localRelevancy,
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
