import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Switch, Tooltip, Spin, Button, Icon } from 'antd';
import { css } from 'emotion';
import { connect } from 'react-redux';
import { get } from 'lodash';
import { ReactiveBase } from '@appbaseio/reactivesearch';

import Filter from './Filter';

import { getSettings, getAppMappings, getRules } from '../../../batteries/modules/actions';
import Search from './Search';
import Result from './Result/index';
import { generateQuery } from '../utils';
import { getAggsMappings } from '../../../batteries/utils/mappings';
import { getRawMappingsByAppName } from '../../../batteries/modules/selectors';
import { getURL } from '../../../constants/config';
import { getSubFields } from '../../../utils';
import { isValidPlan } from '../../../batteries/utils';
import generateSandboxURL from '../utils/sandbox-generator';

const container = css`
	padding: 16px;

	.my-16 {
		margin-bottom: 16px;
	}
`;

class SearchPreview extends React.Component {
	state = {
		settings: null,
		searchableMappings: [],
		hasMappingsLoaded: false,
		isAnalyticsEnabled: true,
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
		} = this.props;

		if (isValidPlan(tier, featureRules)) {
			if (!rules) {
				fetchRules();
			}
		}

		if (!settings) {
			fetchSearchSettings(app);
		} else if (hasTestSettings) {
			this.setState({
				settings: generateQuery(testSettings),
			});
		}

		if (mappings) {
			const searchableMappings = this.getSearchableMappings(mappings);

			// eslint-disable-next-line
			this.setState({
				searchableMappings,
				hasMappingsLoaded: true,
			});
		} else {
			fetchMappings(app, credentials, url);
		}
	}

	componentDidUpdate(prevProps) {
		const { mappings } = this.props;
		if (mappings && JSON.stringify(prevProps.mappings) !== JSON.stringify(mappings)) {
			const searchableMappings = this.getSearchableMappings(mappings);

			// eslint-disable-next-line
			this.setState({
				searchableMappings,
				hasMappingsLoaded: true,
			});
		}
	}

	getSearchableMappings = mappings => {
		const aggsResponse = getAggsMappings(mappings, true);
		const parsedMappings = Array.isArray(aggsResponse)
			? aggsResponse
			: Object.keys(aggsResponse);
		const searchableMappings = parsedMappings
			.filter(mapping => mapping.usecase === 'search' || mapping.usecase === 'searchaggs')
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
		if (!props.hasTestSettings && state && !state.settings && props.settings) {
			if (
				state.hasMappingsLoaded &&
				props.mappings &&
				props.settings &&
				props.settings.search &&
				props.settings.search.dataField &&
				props.settings.search.dataField.length === 0
			) {
				return {
					settings: generateQuery({
						...props.settings,
						search: {
							...props.settings.search,
							dataField: Object.keys(state.searchableMappings),
							fieldWeights: Object.values(state.searchableMappings),
						},
					}),
				};
			}
			return {
				settings: generateQuery(props.settings),
			};
		}
		if (
			!props.hasTestSettings &&
			state.hasMappingsLoaded &&
			props.mappings &&
			props.settings &&
			props.settings.search &&
			props.settings.search.dataField &&
			props.settings.search.dataField.length === 0
		) {
			return {
				settings: generateQuery({
					...props.settings,
					search: {
						...props.settings.search,
						dataField: Object.keys(state.searchableMappings),
						fieldWeights: Object.values(state.searchableMappings),
					},
				}),
			};
		}

		return state;
	}

	handleSettingsChange = settings => {
		this.setState({
			settings,
		});
	};

	toggleAnalytics = value => {
		this.setState({
			isAnalyticsEnabled: value,
		});
	};

	generateCodeSandbox = () => {
		const { settings } = this.state;
		const { app, credentials, url } = this.props;
		const codesandboxURL = generateSandboxURL({ settings, app, credentials, url });

		window.open(codesandboxURL, '_blank');
	};

	render() {
		const { settings, app, credentials, url, fetchingDefaultSettings, rules } = this.props;
		const { settings: stateSettings, isAnalyticsEnabled } = this.state;

		if (!settings) {
			return null;
		}

		if (fetchingDefaultSettings) {
			return (
				<div className={container}>
					<Spin />
					<p>Fetching default Settings</p>
				</div>
			);
		}

		if (settings.isFetching) {
			return (
				<div className={container}>
					<Spin />
					<p>Fetching Settings</p>
				</div>
			);
		}

		if (!stateSettings) {
			return <p>Settings not found.</p>;
		}

		const aggregations = stateSettings.filter(item => item.id.startsWith('list'));
		const search = stateSettings.find(item => item.id === 'search');
		const result = stateSettings.find(item => item.id === 'result');
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
										style={{ marginLeft: 5 }}
										onChange={this.toggleAnalytics}
										id="analytics"
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
						<Filter app={app} aggs={aggregations} />
					</Col>
					<Col md={18}>
						<Search app={app} search={search} />
						<Result
							result={result}
							query={stateSettings}
							app={app}
							url={url}
							rules={rules}
							onChange={this.handleSettingsChange}
							credentials={credentials}
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
		fetchingDefaultSettings: get(state.$getAppSettings, `default.loading`),
		mappings: getRawMappingsByAppName(state) || null,
		credentials: username ? `${username}:${password}` : null,
		url: getURL(),
		rules: get(state, '$getAppRules.results'),
		tier: get(state, '$getAppPlan.results.tier'),
		featureRules: get(state, '$getAppPlan.results.feature_rules', false),
	};
};

const mapDispatchToProps = dispatch => ({
	fetchRules: () => dispatch(getRules()),
	fetchSearchSettings: appName => dispatch(getSettings(appName)),
	fetchMappings: (appName, credentials, url) =>
		dispatch(getAppMappings(appName, credentials, url)),
});

SearchPreview.propTypes = {
	app: PropTypes.string.isRequired,
	credentials: PropTypes.string.isRequired,
	url: PropTypes.string.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(SearchPreview);
