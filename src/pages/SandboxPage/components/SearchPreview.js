/* eslint-disable jsx-a11y/label-has-associated-control,jsx-a11y/label-has-for */
import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Switch, Tooltip, Spin, Button, Icon, Empty } from 'antd';
import { css } from 'emotion';
import { connect } from 'react-redux';
import get from 'lodash/get';
import { ReactiveBase } from '@appbaseio/reactivesearch';
import Filter from './Filter';
import {
	getPopularSuggestionsPreferences,
	getIndexSuggestionsPreferences,
	getRecentSuggestionsPreferences,
	getSettings,
	getAppMappings,
	getRules,
	clearSearchState,
} from '../../../batteries/modules/actions';
import Search from './Search';
import Result from './Result/index';
import { generateQuery, getQueryGrades } from '../utils';
import { getAggsMappings } from '../../../batteries/utils/mappings';
import { getURL } from '../../../constants/config';
import { getSubFields } from '../../../utils';
import { isValidPlan } from '../../../batteries/utils';
import generateSandboxURL from '../utils/sandbox-generator';
import { allowedTiers } from '../../../utils/prop-types';
import ErrorToaster from '../../../batteries/components/shared/ErrorToaster';
import { withErrorToaster } from '../../../batteries/components/shared/ErrorToaster/ErrorToaster';
import SandboxContext from './SandboxContext';
import { versionCompare } from '../../../batteries/utils/helpers';
import IndexSwitcher from '../../../components/IndexSwitcher';

const container = css`
	padding: 16px;

	.my-16 {
		margin-bottom: 16px;
	}
`;

let config = {};
const getDataFieldsWithWeights = (searchableMappings = {}, appbaseVersion) => {
	// apply dataField new format for appbase version >= 7.47.0
	const versionComparison = versionCompare(appbaseVersion, '7.47.0');
	if ([0, 1].includes(versionComparison)) {
		return {
			dataField: Object.keys(searchableMappings).map((field) => ({
				field,
				weight: Number(searchableMappings[field]),
			})),
		};
	}
	return {
		dataField: Object.keys(searchableMappings),
		fieldWeights: Object.values(searchableMappings).map((i) => Number(i)),
	};
};

class SearchPreview extends React.Component {
	state = {
		settings: null,
		searchableMappings: {},
		isAnalyticsEnabled: localStorage.getItem('enableAnalytics')
			? localStorage.getItem('enableAnalytics') === 'true'
			: true,
		isParsedStateApplied: false,
		isGradingEnabled: localStorage.getItem('enableGrading')
			? localStorage.getItem('enableGrading') === 'true'
			: false,
		isTypeahead: localStorage.getItem('enableTypeahead')
			? localStorage.getItem('enableTypeahead') === 'true'
			: false,
		queryGrades: {},
	};

	componentDidMount = async () => {
		const {
			app,
			fetchSearchSettings,
			fetchMappings,
			credentials,
			url,
			mappings,
			settings,
			hasTestSettings,
			testSettings,
			rules,
			fetchRules,
			tier,
			featureRules,
			featureGrade,
			searchState,
		} = this.props;

		/*
			Fetch rules only if the user is on valid Plan.
		*/
		if (isValidPlan(tier, featureRules)) {
			if (!rules) {
				fetchRules();
			}
		}

		/*
			Update Grading to be false if not a valid plan.
		*/
		if (isValidPlan(tier, featureGrade)) {
			const search = (searchState || []).find((component) => component.id === 'search');
			const searchValue = get(search, 'value', get(search, 'defaultValue', ''));
			this.setQueryGrades(searchValue);
		} else {
			this.toggleGrading(false);
		}

		/*
			Fetch Settings if not present in redux store.
		*/
		if (searchState) {
			this.setState({
				settings: searchState,
			});
		} else if (!settings) {
			fetchSearchSettings(app);
		} else {
			this.setState({
				settings: generateQuery(hasTestSettings ? testSettings : settings),
			});
		}

		if (mappings) {
			const searchableMappings = this.getSearchableMappings(mappings);

			// eslint-disable-next-line
			this.setState({
				searchableMappings,
			});
		} else {
			fetchMappings(app, credentials, url);
		}

		const popularSuggestionsConfig = await this.fetchPopularPreferences();
		const recentSuggestionsConfig = await this.fetchRecentPreferences();
		const indexSuggestionsConfig = await this.fetchIndexPreferences();
		config = {
			enablePopularSuggestions: true,
			popularSuggestionsConfig,
			enableRecentSuggestions: true,
			recentSuggestionsConfig,
			...Object.fromEntries(
				Object.entries(indexSuggestionsConfig).filter(([_, v]) => v != null), // eslint-disable-line
			),
		};
	};

	componentDidUpdate(prevProps) {
		const { mappings, isFetchingMappings, hasTestSettings, settings, searchState } = this.props;
		/*
			Update the searchable mappings state whenever there is a change in mappings.
		*/
		if (
			!isFetchingMappings &&
			mappings &&
			JSON.stringify(prevProps.mappings) !== JSON.stringify(mappings)
		) {
			const searchableMappings = this.getSearchableMappings(mappings);

			// eslint-disable-next-line
			this.setState({
				searchableMappings,
			});
		}

		/*
			Once the Search Relevancy API gets resolves we need to populate the state
		 	with the components query.
		*/
		if (
			!hasTestSettings &&
			!searchState &&
			JSON.stringify(settings) !== JSON.stringify(prevProps.settings)
		) {
			// eslint-disable-next-line
			this.setState({
				settings: generateQuery(settings),
			});
		}
	}

	componentWillUnmount() {
		const { clearState, page } = this.props;
		const { settings } = this.state;

		if (settings && page !== 'suggestions') {
			clearState();
		}
	}

	getSearchableMappings = (mappings) => {
		const aggsResponse = getAggsMappings(mappings, true);
		const parsedMappings = Array.isArray(aggsResponse)
			? aggsResponse
			: Object.keys(aggsResponse);
		const searchableMappings = parsedMappings
			.filter((mapping) => mapping.usecase === 'search' || mapping.usecase === 'searchaggs')
			.reduce(
				(agg, item) => ({
					...agg,
					...getSubFields({ address: item.address, weight: 1, fields: item.fields }),
				}),
				{},
			);

		return searchableMappings;
	};

	static getDerivedStateFromProps(props, state) {
		const searchSettings =
			state && state.settings ? state.settings.find((item) => item.id === 'search') : {};
		const isGradingAllowed = isValidPlan(props.tier, props.featureGrade);
		if (!isGradingAllowed && state.isGradingEnabled) {
			return {
				isGradingEnabled: false,
			};
		}

		if (props.searchState) {
			const searchQuery = get(props, 'searchState', []).find(
				(component) => component.id === 'search',
			);
			// If parsedState doesnt contains search dataField we prefill with all searchable mappings
			if (
				!state.isParsedStateApplied &&
				get(searchQuery, 'dataField.length', 0) === 0 &&
				state.searchableMappings &&
				Object.keys(state.searchableMappings).length > 0
			) {
				return {
					isParsedStateApplied: true,
					settings: [
						...get(props, 'searchState', []).filter(
							(component) => component.id !== 'search',
						),
						{
							...searchQuery,
							...getDataFieldsWithWeights(
								state.searchableMappings,
								props.appbaseVersion,
							),
						},
					],
				};
			}

			return state;
		}

		/*
			We need to prefill the datasearch with all searchable mappings
			if the search relevancy API gives no fields.

			Firstly check if props.mappings has values resolved and than prefill
			with all searchable mappings.
		*/
		if (
			!props.hasTestSettings &&
			!props.isFetchingMappings &&
			props.mappings &&
			state.searchableMappings &&
			Object.keys(state.searchableMappings).length > 0 &&
			state.settings &&
			get(searchSettings, 'dataField', []).length === 0
		) {
			return {
				settings: generateQuery({
					...props.settings,
					search: {
						...get(props, 'settings.search', {}),
						...getDataFieldsWithWeights(state.searchableMappings, props.appbaseVersion),
					},
				}),
			};
		}

		/*
			To make search preview work even after SearchRelevancy API gives 402 error status code
			we need to add the default Props to all the components.
		*/
		if (
			!props.settings &&
			!state.settings &&
			state.searchableMappings &&
			Object.keys(state.searchableMappings).length > 0 &&
			props.mappings &&
			props.settingsErrorCode === 402
		) {
			return {
				settings: generateQuery({
					search: {
						...getDataFieldsWithWeights(state.searchableMappings, props.appbaseVersion),
					},
					results: {
						dataField: '_score',
					},
				}),
			};
		}

		return state;
	}

	// eslint-disable-next-line consistent-return
	fetchIndexPreferences = async () => {
		const { getIndexPreferences, app, searchStateSuggestions } = this.props;
		if (searchStateSuggestions && searchStateSuggestions.indexSuggestions) {
			return {
				applyStopwords: searchStateSuggestions.indexSuggestions.applyStopwords || false,
				customStopwords: searchStateSuggestions.indexSuggestions.customStopwords || [],
				maxPredictedWords:
					parseInt(searchStateSuggestions.indexSuggestions.maxPredictedWords, 10) || 0,
				includeFields: searchStateSuggestions.indexSuggestions.includeFields || ['*'],
				excludeFields: searchStateSuggestions.indexSuggestions.excludeFields || [],
				categoryField: searchStateSuggestions.indexSuggestions.categoryField,
				urlField: searchStateSuggestions.indexSuggestions.urlField,
				showDistinctSuggestions:
					searchStateSuggestions.indexSuggestions.showDistinctSuggestions || false,
				enablePredictiveSuggestions:
					searchStateSuggestions.indexSuggestions.enablePredictiveSuggestions || false,
				enableSynonyms: searchStateSuggestions.indexSuggestions.enableSynonyms || false,
				size: parseInt(searchStateSuggestions.indexSuggestions.size, 10) || 3,
				index: this.validateIndex(searchStateSuggestions.indexSuggestions.indices),
			};
		}
		try {
			const data = await getIndexPreferences();
			if (data.payload) {
				return {
					applyStopwords: data.payload.applyStopwords || false,
					customStopwords: data.payload.customStopwords || [],
					maxPredictedWords: parseInt(data.payload.maxPredictedWords, 10) || 0,
					includeFields: data.payload.includeFields || ['*'],
					excludeFields: data.payload.excludeFields || [],
					categoryField: data.payload.categoryField,
					urlField: data.payload.urlField,
					showDistinctSuggestions: data.payload.showDistinctSuggestions || false,
					enablePredictiveSuggestions: data.payload.enablePredictiveSuggestions || false,
					enableSynonyms: data.payload.enableSynonyms || false,
					size: parseInt(data.payload.size, 10) || 3,
					index: this.validateIndex(data.payload.indices),
				};
			}
			return {
				applyStopwords: false,
				customStopwords: [],
				maxPredictedWords: 0,
				includeFields: ['*'],
				excludeFields: [],
				categoryField: '',
				urlField: '',
				showDistinctSuggestions: false,
				enablePredictiveSuggestions: false,
				enableSynonyms: false,
				size: 3,
				index: app,
			};
		} catch (err) {
			// eslint-disable-next-line no-console
			console.error(err);
		}
	};

	// eslint-disable-next-line consistent-return
	fetchRecentPreferences = async () => {
		const { getRecentPreferences, app, searchStateSuggestions } = this.props;
		if (searchStateSuggestions && searchStateSuggestions.recentSuggestions) {
			return {
				minHits: parseInt(searchStateSuggestions.recentSuggestions.minHits, 10) || 1,
				size: parseInt(searchStateSuggestions.recentSuggestions.size, 10) || 3,
				minChars: parseInt(searchStateSuggestions.recentSuggestions.minChars, 10) || 3,
				index: this.validateIndex(searchStateSuggestions.recentSuggestions.indices),
			};
		}
		try {
			const data = await getRecentPreferences();
			if (data.payload) {
				return {
					minHits: parseInt(data.payload.minHits, 10) || 1,
					size: parseInt(data.payload.size, 10) || 3,
					minChars: parseInt(data.payload.minChars, 10) || 3,
					index: this.validateIndex(data.payload.indices),
				};
			}
			return {
				minHits: 1,
				size: 3,
				minChars: 3,
				index: app,
			};
		} catch (err) {
			// eslint-disable-next-line no-console
			console.error(err);
		}
	};

	// eslint-disable-next-line consistent-return
	fetchPopularPreferences = async () => {
		const { getPopularPreferences, app, searchStateSuggestions } = this.props;
		if (searchStateSuggestions && searchStateSuggestions.popularSuggestions) {
			return {
				index: this.validateIndex(searchStateSuggestions.popularSuggestions.indices),
				minCount: parseInt(searchStateSuggestions.popularSuggestions.minCount, 10) || 5,
				minChars: parseInt(searchStateSuggestions.popularSuggestions.minChars, 10) || 3,
				size: parseInt(searchStateSuggestions.popularSuggestions.size, 10) || 3,
			};
		}
		try {
			const data = await getPopularPreferences();
			if (data.payload) {
				return {
					index: this.validateIndex(data.payload.indices),
					minCount: parseInt(data.payload.minCount, 10) || 5,
					minChars: parseInt(data.payload.minChars, 10) || 3,
					size: parseInt(data.payload.size, 10) || 3,
				};
			}
			return {
				index: app,
				minCount: 5,
				minChars: 3,
				size: 3,
			};
		} catch (err) {
			// eslint-disable-next-line no-console
			console.error(err);
		}
	};

	validateIndex = (indices) => {
		const { app } = this.props;
		if (indices?.length && indices[0] !== '*') {
			return indices.join(',');
		}
		return app;
	};

	handleSettingsChange = (settings) => {
		this.setState({
			settings,
		});
	};

	toggleAnalytics = (value) => {
		localStorage.setItem('enableAnalytics', JSON.stringify(value));
		this.setState({
			isAnalyticsEnabled: value,
		});
	};

	toggleTypeahead = (value) => {
		localStorage.setItem('enableTypeahead', JSON.stringify(value));
		this.setState({
			isTypeahead: value,
		});
	};

	toggleGrading = (value) => {
		localStorage.setItem('enableGrading', JSON.stringify(value));
		this.setState({
			isGradingEnabled: value,
		});
	};

	handleValueChange = (id, value) => {
		this.setState(({ settings }) => ({
			settings: settings.map((item) =>
				item.id === id
					? {
							...item,
							value,
					  }
					: item,
			),
		}));
	};

	generateCodeSandbox = () => {
		const { settings } = this.state;
		const { app, credentials, url } = this.props;
		const codesandboxURL = generateSandboxURL({ settings, app, credentials, url });

		window.open(codesandboxURL, '_blank');
	};

	onSelected = (query) => {
		this.setQueryGrades(query);
	};

	setQueryGrades = (query) => {
		getQueryGrades({ query }).then((res) => {
			this.setState({
				queryGrades: res,
			});
		});
	};

	render() {
		const {
			settings,
			app,
			credentials,
			url,
			fetchingDefaultSettings,
			rules,
			isFetchingMappings,
			mappings,
			handleModal,
			showFeaturedProducts,
			onChange,
			value,
			selectButtonLabel,
			page,
			withRule,
			showIndexSwitcher,
			filteredApps,
			onSelect,
		} = this.props;

		const {
			settings: stateSettings,
			isAnalyticsEnabled,
			isGradingEnabled,
			isTypeahead,
			queryGrades,
		} = this.state;

		if (fetchingDefaultSettings) {
			return (
				<div className={container} style={{ textAlign: 'center' }}>
					<Spin />
					<p>Fetching default Settings</p>
				</div>
			);
		}

		if (settings && settings.isFetching) {
			return (
				<div className={container} style={{ textAlign: 'center' }}>
					<Spin />
					<p>Fetching Settings</p>
				</div>
			);
		}

		if (isFetchingMappings) {
			return (
				<div className={container} style={{ textAlign: 'center' }}>
					<Spin />
					<p>Fetching Mappings</p>
				</div>
			);
		}

		if (isFetchingMappings && !mappings) {
			return <Empty description="No data found" />;
		}

		if (!stateSettings) {
			return null;
		}

		if (!stateSettings && !settings) {
			return <Empty description="Settings not found" />;
		}

		const aggregations = stateSettings.filter((item) => item.id.startsWith('list'));
		const search = stateSettings.find((item) => item.id === 'search');
		const result = stateSettings.find((item) => item.id === 'result');

		return (
			<Row className={container} gutter={16}>
				<Col xs={24}>
					{!showFeaturedProducts && (
						<Row className="my-16" type="flex" align="middle" justify="space-between">
							<div>
								<Tooltip title="Toggle to record search and click analytics events from the search relevancy view.">
									<label htmlFor="analytics">
										Record Analytics
										<Switch
											checked={isAnalyticsEnabled}
											style={{ marginLeft: 5, marginRight: 10 }}
											onChange={this.toggleAnalytics}
											id="analytics"
										/>
									</label>
								</Tooltip>
								<Tooltip title="Toggle to enable autosuggestions">
									<label htmlFor="suggestions">
										Enable Autosuggestion
										<Switch
											checked={isTypeahead}
											style={{ marginLeft: 5, marginRight: 10 }}
											onChange={this.toggleTypeahead}
											id="suggestions"
										/>
									</label>
								</Tooltip>
								{showIndexSwitcher && (
									<IndexSwitcher
										filteredApps={filteredApps}
										onSelect={onSelect}
										indexChooser
									/>
								)}
							</div>
							<Button onClick={this.generateCodeSandbox} size="large" type="primary">
								<Icon type="code-sandbox" />
								Open in Codesandbox
							</Button>
						</Row>
					)}
				</Col>
				<ReactiveBase
					app={app}
					enableAppbase
					credentials={credentials}
					url={url}
					appbaseConfig={{
						recordAnalytics: showFeaturedProducts ? false : isAnalyticsEnabled,
						enableQueryRules: page !== 'rules',
						userId: 'appbase.io dashboard',
					}}
				>
					<Col md={6}>
						<ErrorToaster>
							<Filter
								handleValueChange={this.handleValueChange}
								app={app}
								aggs={aggregations}
								handleModal={handleModal}
								page={page}
							/>
						</ErrorToaster>
					</Col>
					<Col md={18}>
						<ErrorToaster
							inline
							title="Something went wrong while displaying Search UI"
						>
							<Search
								handleValueChange={this.handleValueChange}
								app={app}
								onValueChange={this.onSelected}
								search={{
									...search,
									...config,
								}}
								isTypeahead={isTypeahead}
								handleModal={handleModal}
								page={page}
							/>
						</ErrorToaster>

						<ErrorToaster>
							<SandboxContext.Provider
								value={{
									app,
									credentials,
									url,
									queryGrades: get(queryGrades, 'docs', {}),
									recordAnalytics: isAnalyticsEnabled,
									isGradingEnabled,
									searchTerm: get(search, 'value', get(search, 'defaultValue')),
									query: stateSettings,
									toggleAnalytics: this.toggleAnalytics,
									onSettingsChange: this.handleSettingsChange,
								}}
							>
								<Result
									result={result}
									app={app}
									rules={rules}
									showFeaturedProducts={showFeaturedProducts}
									selectButtonLabel={selectButtonLabel}
									onChange={onChange}
									value={value}
									page={page}
									withRule={withRule}
								/>
							</SandboxContext.Provider>
						</ErrorToaster>
					</Col>
				</ReactiveBase>
			</Row>
		);
	}
}

const mapStateToProps = (state, props) => {
	const { username, password } = get(state, 'user.data', {});
	const defaultSettings = get(state.$getAppSettings, `defaultSettings`);
	return {
		settings: get(state.$getAppSettings, `settings.${props.app}`, defaultSettings),
		settingsErrorCode: get(state.$getAppSettings, `error.actual.code`, null),
		fetchingDefaultSettings: get(state.$getAppSettings, `default.loading`),
		mappings: get(state, `$getAppMappings.rawMappings.${props.app}`, null),
		isFetchingMappings: get(state, `$getAppMappings.isFetching`, false),
		credentials: username ? `${username}:${password}` : null,
		url: getURL(),
		rules: get(state, '$getAppRules.results'),
		tier: get(state, '$getAppPlan.results.tier'),
		featureGrade: get(state, '$getAppPlan.results.feature_search_grader'),
		searchState: get(state, '$getSearchState.parsedSearchState', null),
		featureRules: get(state, '$getAppPlan.results.feature_rules', false),
		appbaseVersion: get(state, '$getAppPlan.results.version'),
		searchStateSuggestions: get(state, '$getSearchState.searchState.suggestions', null),
	};
};

const mapDispatchToProps = (dispatch) => ({
	fetchRules: () => dispatch(getRules()),
	fetchSearchSettings: (appName) => dispatch(getSettings(appName)),
	fetchMappings: (appName, credentials, url) =>
		dispatch(getAppMappings(appName, credentials, url)),
	clearState: () => dispatch(clearSearchState()),
	getPopularPreferences: () => dispatch(getPopularSuggestionsPreferences()),
	getRecentPreferences: () => dispatch(getRecentSuggestionsPreferences()),
	getIndexPreferences: () => dispatch(getIndexSuggestionsPreferences()),
});

SearchPreview.propTypes = {
	app: PropTypes.string.isRequired,
	credentials: PropTypes.string.isRequired,
	url: PropTypes.string.isRequired,
	settings: PropTypes.object,
	fetchRules: PropTypes.func.isRequired,
	fetchSearchSettings: PropTypes.func.isRequired,
	fetchMappings: PropTypes.func.isRequired,
	hasTestSettings: PropTypes.bool,
	testSettings: PropTypes.object,
	rules: PropTypes.array,
	tier: allowedTiers,
	featureRules: PropTypes.bool,
	featureGrade: PropTypes.bool,
	fetchingDefaultSettings: PropTypes.bool,
	isFetchingMappings: PropTypes.bool,
	mappings: PropTypes.object,
	searchState: PropTypes.array,
	clearState: PropTypes.func,
	handleModal: PropTypes.func,
	showFeaturedProducts: PropTypes.bool,
	onChange: PropTypes.func,
	value: PropTypes.array,
	selectButtonLabel: PropTypes.string,
	appbaseVersion: PropTypes.string.isRequired, // eslint-disable-line
	getPopularPreferences: PropTypes.func.isRequired,
	getRecentPreferences: PropTypes.func.isRequired,
	getIndexPreferences: PropTypes.func.isRequired,
	searchStateSuggestions: PropTypes.object,
	page: PropTypes.string,
	withRule: PropTypes.bool,
	showIndexSwitcher: PropTypes.bool,
	onSelect: PropTypes.func,
	filteredApps: PropTypes.array,
};

SearchPreview.defaultProps = {
	settings: null,
	hasTestSettings: false,
	testSettings: {},
	rules: null,
	tier: undefined,
	featureRules: false,
	featureGrade: false,
	fetchingDefaultSettings: false,
	isFetchingMappings: false,
	mappings: null,
	searchState: null,
	showFeaturedProducts: false,
	clearState: () => {},
	handleModal: () => {},
	onChange: () => {},
	value: [],
	selectButtonLabel: undefined,
	searchStateSuggestions: null,
	page: '',
	withRule: false,
	showIndexSwitcher: false,
	onSelect: () => {},
	filteredApps: [],
};

export default withErrorToaster(connect(mapStateToProps, mapDispatchToProps)(SearchPreview));
