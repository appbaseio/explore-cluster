import React from 'react';
import Loadable from 'react-loadable';
import { Route } from 'react-router-dom';
import AnalyticsContainer from '../AnalyticsContainer';
import AppPageContainer from '../AppPageContainer';

import Loader from '../Loader';

const PopularResults = Loadable({
	loader: () => import('../../pages/PopularResults'),
	loading: Loader,
});

const AnalyticsPage = Loadable({
	loader: () => import('../../pages/AnalyticsPage'),
	loading: Loader,
});

const PopularFilters = Loadable({
	loader: () => import('../../pages/PopularFilters'),
	loading: Loader,
});

const NoResultSearches = Loadable({
	loader: () => import('../../pages/NoResultSearches'),
	loading: Loader,
});

const RequestLogs = Loadable({
	loader: () => import('../../pages/RequestLogs'),
	loading: Loader,
});

const RequestDistributionPage = Loadable({
	loader: () => import('../../pages/RequestDistributionPage'),
	loading: Loader,
});

const GeoDistributionPage = Loadable({
	loader: () => import('../../pages/GeoDistributionPage'),
	loading: Loader,
});

const SearchLatency = Loadable({
	loader: () => import('../../pages/SearchLatency'),
	loading: Loader,
});

const PopularSearches = Loadable({
	loader: () => import('../../pages/PopularSearches'),
	loading: Loader,
});

const ClusterAnalyticsRoutes = () => (
	<AnalyticsContainer>
		<Route
			exact
			path="/cluster/analytics/:tab?/:subTab?"
			component={(props) => <AppPageContainer {...props} component={AnalyticsPage} />}
		/>
		<Route
			exact
			path="/cluster/popular-searches"
			component={(props) => <AppPageContainer {...props} component={PopularSearches} />}
		/>
		<Route
			exact
			path="/cluster/popular-results"
			component={(props) => <AppPageContainer {...props} component={PopularResults} />}
		/>
		<Route
			exact
			path="/cluster/geo-distribution"
			component={(props) => (
				<AppPageContainer {...props} cluster component={GeoDistributionPage} />
			)}
		/>
		<Route
			exact
			path="/cluster/search-latency"
			component={(props) => <AppPageContainer {...props} component={SearchLatency} />}
		/>
		<Route
			exact
			path="/cluster/popular-filters"
			component={(props) => <AppPageContainer {...props} component={PopularFilters} />}
		/>
		<Route
			exact
			path="/cluster/request-logs/:tab?"
			component={(props) => <AppPageContainer {...props} component={RequestLogs} />}
		/>
		<Route
			exact
			path="/cluster/requests-per-minute"
			component={(props) => (
				<AppPageContainer {...props} component={RequestDistributionPage} />
			)}
		/>
		<Route
			exact
			path="/cluster/no-results-searches"
			component={(props) => <AppPageContainer {...props} component={NoResultSearches} />}
		/>
	</AnalyticsContainer>
);

export default ClusterAnalyticsRoutes;
