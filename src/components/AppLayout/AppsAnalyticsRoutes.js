import React from 'react';
import { Route } from 'react-router-dom';
import Loadable from 'react-loadable';
import AnalyticsContainer from '../AnalyticsContainer';
import AppPageContainer from '../AppPageContainer';

import Loader from '../Loader';

const AnalyticsPage = Loadable({
	loader: () => import('../../pages/AnalyticsPage'),
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

const PopularResults = Loadable({
	loader: () => import('../../pages/PopularResults'),
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

const AppsAnalyticsRoutes = () => (
	<AnalyticsContainer>
		<Route
			exact
			path="/app/:appName/analytics/:tab?/:subTab?"
			component={(props) => <AppPageContainer {...props} component={AnalyticsPage} />}
		/>
		<Route
			exact
			path="/app/:appName/popular-searches"
			component={(props) => <AppPageContainer {...props} component={PopularSearches} />}
		/>
		<Route
			exact
			path="/app/:appName/requests-per-minute"
			component={(props) => (
				<AppPageContainer {...props} component={RequestDistributionPage} />
			)}
		/>
		<Route
			exact
			path="/app/:appName/popular-results"
			component={(props) => <AppPageContainer {...props} component={PopularResults} />}
		/>
		<Route
			exact
			path="/app/:appName/geo-distribution"
			component={(props) => <AppPageContainer {...props} component={GeoDistributionPage} />}
		/>
		<Route
			exact
			path="/app/:appName/search-latency"
			component={(props) => <AppPageContainer {...props} component={SearchLatency} />}
		/>
		<Route
			exact
			path="/app/:appName/popular-filters"
			component={(props) => <AppPageContainer {...props} component={PopularFilters} />}
		/>
		<Route
			exact
			path="/app/:appName/request-logs/:tab?"
			component={(props) => <AppPageContainer {...props} component={RequestLogs} />}
		/>
		<Route
			exact
			path="/app/:appName/no-results-searches"
			component={(props) => (
				<AppPageContainer
					{...props}
					shouldFetchAppInfo={false}
					shouldFetchAppPlan={false}
					component={NoResultSearches}
				/>
			)}
		/>
	</AnalyticsContainer>
);

export default AppsAnalyticsRoutes;
