import React from 'react';
import Loadable from 'react-loadable';
import { Route } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import get from 'lodash/get';
import isEqual from 'lodash/isEqual';
import AnalyticsContainer from '../AnalyticsContainer';
import AppPageContainer from '../AppPageContainer';
import PopularSearches from '../../pages/PopularSearches';
import UnauthorizedPage from '../../pages/UnauthorizedPage';
import { getAuthorizedRoutes } from '../../utils';

import Loader from '../Loader';

const PopularResults = Loadable({
	loader: () => import(/* webpackChunkName: "PopularResults" */ '../../pages/PopularResults'),
	loading: Loader,
});

const AnalyticsPage = Loadable({
	loader: () => import(/* webpackChunkName: "AnalyticsPage" */ '../../pages/AnalyticsPage'),
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

const RequestLogDetails = Loadable({
	loader: () =>
		import(
			/* webpackChunkName: "RequestLogDetails" */ '../../pages/RequestLogs/RequestLogDetails'
		),
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

class ClusterAnalyticsRoutes extends React.Component {
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
					path="/cluster/analytics/:tab?/:subTab?"
					component={(props) => (
						<>
							{get(allowedRoutes, '/cluster/analytics') ? (
								<AppPageContainer {...props} component={AnalyticsPage} />
							) : (
								<UnauthorizedPage />
							)}
						</>
					)}
				/>
				<Route
					path="/cluster/popular-searches"
					component={(props) => (
						<>
							{get(allowedRoutes, '/cluster/popular-searches') ? (
								<AppPageContainer {...props} component={PopularSearches} />
							) : (
								<UnauthorizedPage />
							)}
						</>
					)}
				/>
				<Route
					exact
					path="/cluster/popular-results"
					component={(props) => (
						<>
							{get(allowedRoutes, '/cluster/popular-results') ? (
								<AppPageContainer {...props} component={PopularResults} />
							) : (
								<UnauthorizedPage />
							)}
						</>
					)}
				/>
				<Route
					exact
					path="/cluster/geo-distribution"
					component={(props) => (
						<>
							{get(allowedRoutes, '/cluster/geo-distribution') ? (
								<AppPageContainer {...props} component={GeoDistributionPage} />
							) : (
								<UnauthorizedPage />
							)}
						</>
					)}
				/>
				<Route
					exact
					path="/cluster/search-latency"
					component={(props) => (
						<>
							{get(allowedRoutes, '/cluster/search-latency') ? (
								<AppPageContainer {...props} component={SearchLatency} />
							) : (
								<UnauthorizedPage />
							)}
						</>
					)}
				/>
				<Route
					exact
					path="/cluster/popular-filters"
					component={(props) => (
						<>
							{get(allowedRoutes, '/cluster/popular-filters') ? (
								<AppPageContainer {...props} component={PopularFilters} />
							) : (
								<UnauthorizedPage />
							)}
						</>
					)}
				/>{' '}
				<Route
					exact
					path="/cluster/request-logs"
					component={(props) => (
						<>
							{get(allowedRoutes, '/cluster/request-logs') ? (
								<AppPageContainer {...props} component={RequestLogs} />
							) : (
								<UnauthorizedPage />
							)}
						</>
					)}
				/>
				<Route
					exact
					path="/cluster/request-logs/:logId"
					component={(props) => (
						<>
							{get(allowedRoutes, '/cluster/request-logs') ? (
								<AppPageContainer {...props} component={RequestLogDetails} />
							) : (
								<UnauthorizedPage />
							)}
						</>
					)}
				/>
				<Route
					exact
					path="/cluster/requests-per-minute"
					component={(props) => (
						<>
							{get(allowedRoutes, '/cluster/requests-per-minute') ? (
								<AppPageContainer {...props} component={RequestDistributionPage} />
							) : (
								<UnauthorizedPage />
							)}
						</>
					)}
				/>
				<Route
					exact
					path="/cluster/no-results-searches"
					component={(props) => (
						<>
							{get(allowedRoutes, '/cluster/no-results-searches') ? (
								<AppPageContainer {...props} component={NoResultSearches} />
							) : (
								<UnauthorizedPage />
							)}
						</>
					)}
				/>
				<Route
					exact
					path="/cluster/recent-searches"
					component={(props) => (
						<>
							{get(allowedRoutes, '/cluster/recent-searches') ? (
								<AppPageContainer {...props} component={RecentSearches} />
							) : (
								<UnauthorizedPage />
							)}
						</>
					)}
				/>
				<Route
					exact
					path="/cluster/recent-results"
					component={(props) => (
						<>
							{get(allowedRoutes, '/cluster/recent-results') ? (
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

ClusterAnalyticsRoutes.propTypes = {
	allowedRoutes: PropTypes.object.isRequired,
	location: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => {
	return {
		allowedRoutes: getAuthorizedRoutes(get(state, 'clusterRoutes')),
	};
};

export default connect(mapStateToProps)(ClusterAnalyticsRoutes);
