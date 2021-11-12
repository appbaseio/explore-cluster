import React from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import get from 'lodash/get';
import { css } from 'react-emotion';
import PropTypes from 'prop-types';
import { Button } from 'antd';
import { mediaKey } from '../../utils/media';
import SearchVolumeChart from '../../batteries/components/shared/Chart/SearchVolume';
import Flex from '../../batteries/components/shared/Flex';
import DemoCards from '../../components/DemoCard';
import Container from '../../components/Container';
import { getAppAnalyticsByName } from '../../batteries/modules/selectors';
import { exampleConfig } from '../../constants/config';
import { loadApps } from '../../actions';
import { getAppAnalytics } from '../../batteries/modules/actions';
import { getFilteredResults } from '../../batteries/utils/helpers';
import StatsBox from '../../components/AppCard/StatsBox';
import Searches from '../../batteries/components/analytics/components/Searches';
import RequestLogs from '../../batteries/components/analytics/components/RequestLogs';
import { ALLOWED_ACTIONS } from '../../constants';

const main = css`
	${mediaKey.small} {
		flex-direction: column;
	}
`;
const usage = css`
	margin-right: 10px;
	${mediaKey.small} {
		margin-right: 0;
	}
`;
const results = css`
	width: 100%;
	margin-top: 20px;
	${mediaKey.small} {
		flex-direction: column;
	}
`;
const searchCls = css`
	flex: 50%;
	margin-right: 10px;
	${mediaKey.small} {
		margin-right: 0;
	}
`;
const noResultsCls = css`
	flex: 50%;
	margin-left: 10px;
	${mediaKey.small} {
		margin-left: 0;
		margin-top: 20px;
	}
`;

const routesMapper = {
	'/cluster/rules': 'Query Rules',
	'/cluter/suggestions': 'Suggestion Settings',
	'/cluster/stores-queries': 'Stored Queries',
	'/': 'Cluster',
};
class PaidUserOverview extends React.Component {
	componentDidMount() {
		const { fetchAppAnalytics, stats, fetchApps } = this.props;
		fetchAppAnalytics();

		if (!Object.keys(stats).length) fetchApps();
	}

	redirectTo = (url) => {
		window.location = url;
	};

	routeMapper = (route) => {
		console.log(route, routesMapper[route], routesMapper.route);
		const routeArr = route.split('/');
		if (routesMapper[route]) {
			return routesMapper[route];
		}
		if (routeArr[routeArr?.length - 1]) {
			return routeArr[routeArr?.length - 1];
		}
		return 'Cluster';
	};

	render() {
		const {
			// prettier-ignore
			// isFetching,
			popularSearches,
			noResults,
			appName,
			searchVolume,
			allowedActions,
			appsData,
			history,
			recentRoute,
		} = this.props;
		const hasAnalytics = allowedActions.includes(ALLOWED_ACTIONS.ANALYTICS);

		return (
			<Container>
				<Button
					size="small"
					style={{ margin: 10 }}
					onClick={() => {
						history.push('/');
						history.push(recentRoute);
					}}
				>
					{`Go Back to ${this.routeMapper(recentRoute) || 'Cluster'} View`}
				</Button>
				<Flex css={main} justifyContent="space-between">
					<div css={usage}>
						<StatsBox
							style={{
								minWidth: 320,
								minHeight: '100%',
								paddingBottom: '15px',
								overflow: 'hidden',
							}}
							showDelete={false}
							title="Overview"
							data={appsData ? appsData[appName] : {}}
						/>
					</div>
					{hasAnalytics && (
						<SearchVolumeChart
							width={
								window.innerWidth > 670
									? window.innerWidth - 690
									: window.innerWidth - 150
							}
							height={210}
							data={searchVolume}
						/>
					)}
				</Flex>
				<Flex css={results}>
					<div css={searchCls}>
						{hasAnalytics && (
							<Searches
								css="height: 100%"
								href="popular-searches"
								dataSource={getFilteredResults(popularSearches)}
								title="Popular Searches"
							/>
						)}
					</div>
					<div css={noResultsCls}>
						{hasAnalytics && (
							<Searches
								css="height: 100%"
								href="no-results-searches"
								dataSource={getFilteredResults(noResults)}
								title="No Result Searches"
							/>
						)}
					</div>
				</Flex>
				<div css="margin-top: 20px">
					<RequestLogs pageSize={5} changeUrlOnTabChange={false} appName={appName} />
				</div>
				<DemoCards cardConfig={exampleConfig} />
			</Container>
		);
	}
}
PaidUserOverview.defaultProps = {
	searchVolume: [],
	popularSearches: [],
	noResults: [],
	appsData: {},
};
PaidUserOverview.propTypes = {
	fetchAppAnalytics: PropTypes.func.isRequired,
	appName: PropTypes.string.isRequired,
	appsData: PropTypes.object,
	searchVolume: PropTypes.array,
	popularSearches: PropTypes.array,
	noResults: PropTypes.array,
	stats: PropTypes.object.isRequired,
	fetchApps: PropTypes.func.isRequired,
	allowedActions: PropTypes.array.isRequired,
	history: PropTypes.object.isRequired,
	recentRoute: PropTypes.string.isRequired,
};
const mapStateToProps = (state) => {
	const analyticsArr = getAppAnalyticsByName(state) || [];
	let analytics = {};
	if (Array.isArray(analyticsArr)) {
		analyticsArr.forEach((item) => {
			analytics = {
				...analytics,
				...item,
			};
		});
	}
	const appName = get(state, '$getCurrentApp.name');
	return {
		appName,
		appsData: get(state, 'apps.data', {}),
		stats: get(state, ['apps.data', appName], {}),
		popularSearches: get(analytics, 'popular_searches'),
		noResults: get(analytics, 'no_results_searches'),
		searchVolume: get(analytics, 'search_histogram'),
		allowedActions: get(state, 'user.data.allowedActions'),
		recentRoute: get(state, 'recentRoutes.recentRoute', '/'),
	};
};
const mapDispatchToProps = (dispatch) => ({
	fetchAppAnalytics: (appName, plan) => dispatch(getAppAnalytics(appName, plan)),
	fetchApps: () => dispatch(loadApps()),
});

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(PaidUserOverview));
