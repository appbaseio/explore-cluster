import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Switch, Affix } from 'antd';
import { css } from 'emotion';
import { connect } from 'react-redux';
import { get } from 'lodash';
import { ReactiveBase } from '@appbaseio/reactivesearch';

import Filter from './Filter';

import { getSettings, getAppMappings } from '../../../batteries/modules/actions';
import Search from './Search';
import Result from './Result/index';
import { generateQuery } from '../utils';
import { getAggsMappings } from '../../../batteries/utils/mappings';
import { getRawMappingsByAppName } from '../../../batteries/modules/selectors';
import { getURL } from '../../../constants/config';

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
	};

	componentDidMount() {
		const { app, fetchSearchSettings, fetchMappings, credentials, url } = this.props;
		fetchSearchSettings(app);
		fetchMappings(app, credentials, url);
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
		const parsedMappings = getAggsMappings(mappings, true);
		const searchableMappings = parsedMappings
			.filter(mapping => mapping.usecase === 'search' || mapping.usecase === 'searchaggs')
			.map(item => item.address);

		return searchableMappings;
	};

	static getDerivedStateFromProps(props, state) {
		if (state && !state.settings && props.settings) {
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
							dataField: state.searchableMappings.reduce((agg, field) => {
								return [...agg, field, `${field}.search`];
							}, []),
							fieldWeights: new Array(state.searchableMappings.length * 2).fill(1),
						},
					}),
				};
			}
			return {
				settings: generateQuery(props.settings),
			};
		}
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
						dataField: state.searchableMappings.reduce((agg, field) => {
							return [...agg, field, `${field}.search`];
						}, []),
						fieldWeights: new Array(state.searchableMappings.length * 2).fill(1),
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

	render() {
		const { settings, app, credentials, url } = this.props;
		const { settings: stateSettings } = this.state;

		if (!settings) {
			return null;
		}

		if (settings.isFetching) {
			return null;
		}

		if (!stateSettings) {
			return null;
		}

		const aggregations = stateSettings.filter(item => item.id.startsWith('list'));
		const search = stateSettings.find(item => item.id === 'search');
		const result = stateSettings.find(item => item.id === 'result');
		return (
			<Row className={container} gutter={16}>
				<Col xs={24}>
					<Row className="my-16" type="flex" align="middle" justify="space-between">
						<div>
							<label htmlFor="analytics">
								Record analytics
								<Switch defaultChecked id="analytics" />
							</label>
						</div>
						{/* <Button size="large" type="primary">
							<Icon type="code-sandbox" />
							Open in Codesandbox
						</Button> */}
					</Row>
				</Col>
				<ReactiveBase app={app} enableAppbase credentials={credentials} url={url}>
					<Col md={6}>
						<Filter app={app} aggs={aggregations} />
					</Col>
					<Col md={18}>
						<Affix offsetTop={60}>
							<Search app={app} search={search} />
						</Affix>
						<Result
							result={result}
							query={stateSettings}
							app={app}
							url={url}
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
	return {
		settings: get(state.$getAppSettings, `settings.${props.app}`),
		mappings: getRawMappingsByAppName(state) || null,
		credentials: username ? `${username}:${password}` : null,
		url: getURL(),
	};
};

const mapDispatchToProps = dispatch => ({
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
