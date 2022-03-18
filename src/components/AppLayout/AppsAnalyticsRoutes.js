import React from 'react';
import { Route } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Loadable from 'react-loadable';
import get from 'lodash/get';
import isEqual from 'lodash/isEqual';
import AnalyticsContainer from '../AnalyticsContainer';
import AppPageContainer from '../AppPageContainer';
import PopularSearches from '../../pages/PopularSearches';
import UnauthorizedPage from '../../pages/UnauthorizedPage';

import { getAuthorizedRoutes } from '../../utils';

import Loader from '../Loader';

const AnalyticsPage = Loadable({
	loader: () => import(/* webpackChunkName: "AnalyticsPage" */ '../../pages/AnalyticsPage'),
	loading: Loader,
});

const RequestDistributionPage = Loadable({
	loader: () =>
		import(/* webpackChunkName: "RequestDistribution" */ '../../pages/RequestDistributionPage'),
	loading: Loader,
});
const GeoDistributionPage = Loadable({
	loader: () =>
		import(/* webpackChunkName: "GeoDistribution" */ '../../pages/GeoDistributionPage'),
	loading: Loader,
});
const SearchLatency = Loadable({
	loader: () => import(/* webpackChunkName: "SearchLatency" */ '../../pages/SearchLatency'),
	loading: Loader,
});

const PopularResults = Loadable({
	loader: () => import(/* webpackChunkName: "PopularResults" */ '../../pages/PopularResults'),
	loading: Loader,
});

const PopularFilters = Loadable({
	loader: () => import(/* webpackChunkName: "PopularFilters" */ '../../pages/PopularFilters'),
	loading: Loader,
});

const NoResultSearches = Loadable({
	loader: () => import(/* webpackChunkName: "NoResultSearches" */ '../../pages/NoResultSearches'),
	loading: Loader,
});

const RequestLogs = Loadable({
	loader: () => import(/* webpackChunkName: "RequestLogs" */ '../../pages/RequestLogs'),
	loading: Loader,
});

const MonitoringPage = Loadable({
	loader: () => import(/* webpackChunkName: "SearchLatency" */ '../../pages/MonitoringPage'),
	loading: Loader,
});

const RecentSearches = Loadable({
	loader: () => import(/* webpackChunkName: "RecentSearches" */ '../../pages/RecentSearches'),
	loading: Loader,
});

const RecentResults = Loadable({
	loader: () => import(/* webpackChunkName: "RecentResults" */ '../../pages/RecentResults'),
	loading: Loader,
});

class AppsAnalyticsRoutes extends React.Component {
	shouldComponentUpdate(nextProps) {
		const { location, allowedRoutes } = this.props;
		return (
			get(nextProps, 'location.pathname') !== get(location, 'pathname') ||
			get(nextProps, 'location.search') !== get(location, 'search') ||
			!isEqual(get(nextProps, 'allowedRoutes'), allowedRoutes)
		);
	}

	render() {
		const { allowedRoutes } = this.props;
		return (
			<AnalyticsContainer>
				<Route
					exact
					path="/app/:appName/analytics/:tab?/:subTab?"
					component={(props) => (
						<>
							{get(allowedRoutes, 'analytics') ? (
								<AppPageContainer {...props} component={AnalyticsPage} />
							) : (
								<UnauthorizedPage />
							)}
						</>
					)}
				/>
				<Route
					path="/app/:appName/popular-searches"
					component={(props) => (
						<>
							{get(allowedRoutes, 'popular-searches') ? (
								<AppPageContainer {...props} component={PopularSearches} />
							) : (
								<UnauthorizedPage />
							)}
						</>
					)}
				/>
				<Route
					exact
					path="/app/:appName/requests-per-minute"
					component={(props) => (
						<>
							{get(allowedRoutes, 'requests-per-minute') ? (
								<AppPageContainer {...props} component={RequestDistributionPage} />
							) : (
								<UnauthorizedPage />
							)}
						</>
					)}
				/>
				<Route
					exact
					path="/app/:appName/popular-results"
					component={(props) => (
						<>
							{get(allowedRoutes, 'popular-results') ? (
								<AppPageContainer {...props} component={PopularResults} />
							) : (
								<UnauthorizedPage />
							)}
						</>
					)}
				/>
				<Route
					exact
					path="/app/:appName/geo-distribution"
					component={(props) => (
						<>
							{get(allowedRoutes, 'geo-distribution') ? (
								<AppPageContainer {...props} component={GeoDistributionPage} />
							) : (
								<UnauthorizedPage />
							)}
						</>
					)}
				/>
				<Route
					exact
					path="/app/:appName/search-latency"
					component={(props) => (
						<>
							{get(allowedRoutes, 'search-latency') ? (
								<AppPageContainer {...props} component={SearchLatency} />
							) : (
								<UnauthorizedPage />
							)}
						</>
					)}
				/>
				<Route
					exact
					path="/app/:appName/popular-filters"
					component={(props) => (
						<>
							{get(allowedRoutes, 'popular-filters') ? (
								<AppPageContainer {...props} component={PopularFilters} />
							) : (
								<UnauthorizedPage />
							)}
						</>
					)}
				/>
				<Route
					exact
					path="/app/:appName/request-logs"
					component={(props) => (
						<>
							{get(allowedRoutes, 'request-logs') ? (
								<AppPageContainer {...props} component={RequestLogs} />
							) : (
								<UnauthorizedPage />
							)}
						</>
					)}
				/>{' '}
				<Route
					exact
					path="/app/:appName/no-results-searches"
					component={(props) => (
						<>
							{get(allowedRoutes, 'no-results-searches') ? (
								<AppPageContainer
									{...props}
									shouldFetchAppInfo={false}
									shouldFetchAppPlan={false}
									component={NoResultSearches}
								/>
							) : (
								<UnauthorizedPage />
							)}
						</>
					)}
				/>
				<Route
					exact
					path="/app/:appName/recent-searches"
					component={(props) => (
						<>
							{get(allowedRoutes, 'recent-searches') ? (
								<AppPageContainer {...props} component={RecentSearches} />
							) : (
								<UnauthorizedPage />
							)}
						</>
					)}
				/>
				<Route
					exact
					path="/app/:appName/recent-results"
					component={(props) => (
						<>
							{get(allowedRoutes, 'recent-results') ? (
								<AppPageContainer {...props} component={RecentResults} />
							) : (
								<UnauthorizedPage />
							)}
						</>
					)}
				/>
				<Route
					exact
					path="/cluster/monitoring"
					component={(props) => (
						<>
							<MonitoringPage {...props} />
						</>
					)}
				/>
			</AnalyticsContainer>
		);
	}
}
AppsAnalyticsRoutes.propTypes = {
	allowedRoutes: PropTypes.object.isRequired,
	location: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => {
	return {
		allowedRoutes: getAuthorizedRoutes(get(state, 'appRoutes')),
	};
};

export default connect(mapStateToProps)(AppsAnalyticsRoutes);
