/* eslint-disable jsx-a11y/label-has-associated-control,jsx-a11y/label-has-for */
import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Switch, Tooltip, Spin, Button, Icon, Empty } from 'antd';
import { css } from 'emotion';
import { connect } from 'react-redux';
import { get } from 'lodash';
import { ReactiveBase } from '@appbaseio/reactivesearch';

import Filter from './Filter';

import {
	getSettings,
	getAppMappings,
	getRules,
	clearSearchState,
} from '../../../batteries/modules/actions';
import Search from './Search';
import Result from './Result/index';
import { generateQuery } from '../utils';
import { getAggsMappings } from '../../../batteries/utils/mappings';
import { getURL } from '../../../constants/config';
import { getSubFields } from '../../../utils';
import { isValidPlan } from '../../../batteries/utils';
import generateSandboxURL from '../utils/sandbox-generator';
import { allowedTiers } from '../../../utils/prop-types';

const container = css`
	padding: 16px;

	.my-16 {
		margin-bottom: 16px;
	}
`;

class SearchPreview extends React.Component {
	state = {
		settings: null,
		searchableMappings: {},
		isAnalyticsEnabled: true,
		isParsedStateApplied: false,
		isGradingEnabled: false,
	};

	componentDidMount() {
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
	}

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
		const { clearState } = this.props;
		const { settings } = this.state;

		if (settings) {
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
							dataField: Object.keys(state.searchableMappings),
							fieldWeights: Object.values(state.searchableMappings),
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
						dataField: Object.keys(state.searchableMappings),
						fieldWeights: Object.values(state.searchableMappings),
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
						dataField: Object.keys(state.searchableMappings),
						fieldWeights: Object.values(state.searchableMappings),
					},
					results: {
						dataField: '_score',
					},
				}),
			};
		}

		return state;
	}

	handleSettingsChange = (settings) => {
		this.setState({
			settings,
		});
	};

	toggleAnalytics = (value) => {
		this.setState({
			isAnalyticsEnabled: value,
		});
	};

	toggleGrading = (value) => {
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
		} = this.props;
		const { settings: stateSettings, isAnalyticsEnabled, isGradingEnabled } = this.state;

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
							<Tooltip title="Toggle to enable (or disable) grading of search results.">
								<label htmlFor="grading">
									Grade Search
									<Switch
										checked={isGradingEnabled}
										style={{ marginLeft: 5 }}
										onChange={this.toggleGrading}
										id="grading"
									/>
								</label>
							</Tooltip>
						</div>
						<Button onClick={this.generateCodeSandbox} size="large" type="primary">
							<Icon type="code-sandbox" />
							Open in Codesandbox
						</Button>
					</Row>
				</Col>
				<ReactiveBase
					app={app}
					enableAppbase
					credentials={credentials}
					url={url}
					appbaseConfig={{
						recordAnalytics: isAnalyticsEnabled,
					}}
				>
					<Col md={6}>
						<Filter
							handleValueChange={this.handleValueChange}
							app={app}
							aggs={aggregations}
							handleModal={handleModal}
						/>
					</Col>
					<Col md={18}>
						<Search
							handleValueChange={this.handleValueChange}
							app={app}
							search={search}
							handleModal={handleModal}
						/>
						<Result
							result={result}
							query={stateSettings}
							app={app}
							url={url}
							searchTerm={get(search, 'value')}
							toggleAnalytics={this.toggleAnalytics}
							recordAnalytics={isAnalyticsEnabled}
							rules={rules}
							onChange={this.handleSettingsChange}
							credentials={credentials}
							isGradingEnabled={isGradingEnabled}
						/>
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
		searchState: get(state, '$getSearchState.parsedSearchState', null),
		featureRules: get(state, '$getAppPlan.results.feature_rules', false),
	};
};

const mapDispatchToProps = (dispatch) => ({
	fetchRules: () => dispatch(getRules()),
	fetchSearchSettings: (appName) => dispatch(getSettings(appName)),
	fetchMappings: (appName, credentials, url) =>
		dispatch(getAppMappings(appName, credentials, url)),
	clearState: () => dispatch(clearSearchState()),
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
	fetchingDefaultSettings: PropTypes.bool,
	isFetchingMappings: PropTypes.bool,
	mappings: PropTypes.object,
	searchState: PropTypes.object,
	clearState: PropTypes.func,
	handleModal: PropTypes.func,
};

SearchPreview.defaultProps = {
	settings: null,
	hasTestSettings: false,
	testSettings: {},
	rules: null,
	tier: undefined,
	featureRules: false,
	fetchingDefaultSettings: false,
	isFetchingMappings: false,
	mappings: null,
	searchState: null,
	clearState: () => {},
	handleModal: () => {},
};

export default connect(mapStateToProps, mapDispatchToProps)(SearchPreview);
