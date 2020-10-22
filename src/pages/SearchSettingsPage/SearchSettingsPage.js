import React from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import { connect } from 'react-redux';
import { Card, Divider, Skeleton } from 'antd';
import {
	getDefaultSettings,
	putSettings,
	deleteSettings,
	getSettings as getSearchRelevancy,
	setLocalRelevancyState,
} from '../../batteries/modules/actions';
import { getFieldWeight, getSubFields } from '../../utils';
import { allowedTiers } from '../../utils/prop-types';
import { isValidPlan } from '../../batteries/utils';
import { container } from '../ResultsPage/styles';

import Banner from '../../batteries/components/shared/UpgradePlan/Banner';
import Overlay from '../../components/Overlay';
import SettingsOptions from './components/SettingsOptions';
import FieldWeights from './components/FieldsWeight';

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
		const searchSettings = get(settings, 'search', {});

		const fields = get(searchSettings, 'dataField', []);
		const weights = get(searchSettings, 'fieldWeights', []);

		const fieldWeights = fields.reduce((agg, item, index) => {
			return {
				...agg,
				[item]: get(weights, index, getFieldWeight(item.split('.').pop(), 1)),
			};
		}, {});

		updateLocalRelevancy(appName, {
			...settings,
			search: {
				...searchSettings,
				fieldWeights,
			},
		});
	};

	handleFieldWeights = ({ field, weight, mapping }) => {
		const { localRelevancy, appName, updateLocalRelevancy } = this.props;
		const { fieldWeights, enableSynonyms, enableNgram, hasLanguage } = get(
			localRelevancy,
			`${appName}.search`,
		);
		const updatedFields = getSubFields({
			fields: get(mapping, 'fields'),
			weight,
			address: field,
			skipSearch: enableNgram,
			skipLang: !hasLanguage,
			skipSynonyms: !enableSynonyms,
		});

		updateLocalRelevancy(appName, {
			...get(localRelevancy, appName),
			search: {
				...get(localRelevancy, `${appName}.search`, {}),
				fieldWeights: {
					...fieldWeights,
					...updatedFields,
				},
			},
		});
	};

	// ref to older version: https://github.com/appbaseio-confidential/arc-dashboard/blob/72869b13cf6daf78af7d91eafc480c6894a4f36c/src/pages/SearchSettingsPage/SearchSettings.js#L473
	handleRemoveFromSearch = ({ setMapping, field, flattenUsecase }) => {
		const nestedFields = Object.keys(flattenUsecase).filter((i) => i.indexOf(`${field}.`) > -1);

		if (nestedFields.length) {
			const newMappings = nestedFields.map((i) => {
				if (flattenUsecase[i] === 'search' || flattenUsecase[i] === 'searchaggs') {
					return {
						usecase: 'aggs',
						path: i,
						type: 'text',
					};
				}
				return null;
			});
			setMapping(newMappings.filter((i) => Boolean(i)));
		} else {
			setMapping([
				{
					usecase: 'aggs',
					path: field,
					type: 'text',
				},
			]);
		}
	};

	updateToSearchField = ({ field, setMapping }) => {
		setMapping([
			{
				usecase: 'searchaggs',
				path: field,
				type: 'text',
			},
		]);
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

		const { fieldWeights, fuzziness, queryFormat, queryString, searchOperators } = get(
			localRelevancy,
			`${appName}.search`,
		);

		const { enableNgram } = get(localRelevancy, `${appName}.indexSettings`);
		const { enabled: enableSynonyms } = get(localRelevancy, `${appName}.synonyms`);

		return (
			<div>
				<Banner {...bannerDetails} />
				<div className={container}>
					<Card>
						<FieldWeights
							fieldWeights={fieldWeights}
							handleFieldWeights={this.handleFieldWeights}
							handleDelete={this.handleRemoveFromSearch}
							updateToSearchField={this.updateToSearchField}
						/>
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
