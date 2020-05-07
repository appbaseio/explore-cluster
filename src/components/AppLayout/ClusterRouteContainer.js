import React from 'react';
import PropTypes from 'prop-types';
import { Switch, Route } from 'react-router-dom';
import Loadable from 'react-loadable';

import Loader from '../Loader';
import AppPageContainer from '../AppPageContainer';
import ErrorPage from '../../pages/ErrorPage';

const AnalyticsPage = Loadable({
	loader: () => import(/* webpackChunkName: "AnalyticsPage" */ '../../pages/AnalyticsPage'),
	loading: Loader,
});
const ProfilePage = Loadable({
	loader: () => import(/* webpackChunkName: "ProfilePage" */ '../../pages/ProfilePage'),
	loading: Loader,
});
const SearchTemplatesPage = Loadable({
	loader: () =>
		import(/* webpackChunkName: "SearchTemplatesPage" */ '../../pages/SearchTemplatesPage'),
	loading: Loader,
});
const QuerySuggestionsPage = Loadable({
	loader: () =>
		import(/* webpackChunkName: "QuerySuggestionsPage" */ '../../pages/QuerySuggestionsPage'),
	loading: Loader,
});
const QueryRulesPage = Loadable({
	loader: () => import(/* webpackChunkName: "QueryRules" */ '../../pages/QueryRules'),
	loading: Loader,
});

const QueryRulesForm = Loadable({
	loader: () =>
		import(/* webpackChunkName: "QueryRulesForm" */ '../../pages/QueryRules/QueryRulesForm'),
	loading: Loader,
});
const GeoDistributionPage = Loadable({
	loader: () =>
		import(/* webpackChunkName: "GeoDistributionPage" */ '../../pages/GeoDistributionPage'),
	loading: Loader,
});
const SearchLatency = Loadable({
	loader: () => import(/* webpackChunkName: "SearchLatency" */ '../../pages/SearchLatency'),
	loading: Loader,
});

const BillingPage = Loadable({
	loader: () => import(/* webpackChunkName: "BillingPage" */ '../../pages/BillingPage'),
	loading: Loader,
});

const Functions = Loadable({
	loader: () => import(/* webpackChunkName: "Functions" */ '../../pages/Functions'),
	loading: Loader,
});

const CredentialsPage = Loadable({
	loader: () => import(/* webpackChunkName: "CredentialsPage" */ '../../pages/CredentialsPage'),
	loading: Loader,
});

const UserManagementPage = Loadable({
	loader: () =>
		import(/* webpackChunkName: "UserManagementPage" */ '../../pages/UserManagementPage'),
	loading: Loader,
});

const OverviewPage = Loadable({
	loader: () => import(/* webpackChunkName: "OverviewPage" */ '../../pages/OverviewPage'),
	loading: Loader,
});

const ImporterPage = Loadable({
	loader: () => import(/* webpackChunkName: "ImporterPage" */ '../../pages/ImporterPage'),
	loading: Loader,
});

const MappingsPage = Loadable({
	loader: () => import(/* webpackChunkName: "MappingsPage" */ '../../pages/MappingsPage'),
	loading: Loader,
});

const BrowserPage = Loadable({
	loader: () => import(/* webpackChunkName: "BrowserPage" */ '../../pages/BrowserPage'),
	loading: Loader,
});

const SandboxPage = Loadable({
	loader: () => import(/* webpackChunkName: "SandboxPage" */ '../../pages/SandboxPage'),
	loading: Loader,
});

const PopularSearches = Loadable({
	loader: () => import(/* webpackChunkName: "PopularSearches" */ '../../pages/PopularSearches'),
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
const ShareSettings = Loadable({
	loader: () =>
		import(/* webpackChunkName: "ShareSettingsPage" */ '../../pages/ShareSettingsPage'),
	loading: Loader,
});

const RequestLogs = Loadable({
	loader: () => import(/* webpackChunkName: "RequestLogs" */ '../../pages/RequestLogs'),
	loading: Loader,
});
const RequestDistributionPage = Loadable({
	loader: () =>
		import(
			/* webpackChunkName: "RequestDistributionPage" */ '../../pages/RequestDistributionPage'
		),
	loading: Loader,
});

const RoleBaseAccess = Loadable({
	loader: () => import(/* webpackChunkName: "RoleBaseAccess" */ '../../pages/RoleBaseAccess'),
	loading: Loader,
});

const ClusterInsights = Loadable({
	loader: () => import(/* webpackChunkName: "ClusterInsights" */ '../../pages/ClusterInsights'),
	loading: Loader,
});

class ClusterRouteContainer extends React.Component {
	shouldComponentUpdate(nextProps) {
		const { location } = this.props;

		return nextProps && nextProps.location && nextProps.location.pathname !== location.pathname;
	}

	render() {
		return (
			<ErrorPage {...this.props}>
				<Switch>
					<Route
						exact
						path="/cluster/overview"
						component={(props) => (
							<AppPageContainer {...props} component={OverviewPage} />
						)}
					/>
					<Route
						exact
						path="/cluster/search-templates"
						component={(props) => (
							<AppPageContainer {...props} component={SearchTemplatesPage} />
						)}
					/>
					<Route
						exact
						path="/cluster/query-suggestions"
						component={(props) => (
							<AppPageContainer {...props} component={QuerySuggestionsPage} />
						)}
					/>
					<Route
						exact
						path="/cluster/analytics/:tab?/:subTab?"
						component={(props) => (
							<AppPageContainer {...props} component={AnalyticsPage} />
						)}
					/>
					<Route
						exact
						path="/cluster/popular-searches"
						component={(props) => (
							<AppPageContainer {...props} component={PopularSearches} />
						)}
					/>
					<Route
						exact
						path="/cluster/credentials"
						component={(props) => (
							<AppPageContainer {...props} component={CredentialsPage} />
						)}
					/>
					<Route
						exact
						path="/cluster/user-management"
						component={(props) => (
							<AppPageContainer {...props} component={UserManagementPage} />
						)}
					/>
					<Route
						exact
						path="/cluster/popular-results"
						component={(props) => (
							<AppPageContainer {...props} component={PopularResults} />
						)}
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
						component={(props) => (
							<AppPageContainer {...props} component={SearchLatency} />
						)}
					/>
					<Route
						exact
						path="/cluster/popular-filters"
						component={(props) => (
							<AppPageContainer {...props} component={PopularFilters} />
						)}
					/>
					<Route
						exact
						path="/cluster/request-logs/:tab?"
						component={(props) => (
							<AppPageContainer {...props} component={RequestLogs} />
						)}
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
						component={(props) => (
							<AppPageContainer {...props} component={NoResultSearches} />
						)}
					/>
					<Route
						exact
						path="/cluster/import"
						render={(props) => <AppPageContainer {...props} component={ImporterPage} />}
					/>

					<Route
						exact
						path="/cluster/rules"
						render={(props) => (
							<AppPageContainer {...props} component={QueryRulesPage} />
						)}
					/>
					<Route
						exact
						path="/cluster/rules/new"
						render={(props) => (
							<AppPageContainer {...props} component={QueryRulesForm} />
						)}
					/>

					<Route
						exact
						path="/cluster/rules/:id"
						render={(props) => (
							<AppPageContainer {...props} component={QueryRulesForm} />
						)}
					/>
					<Route
						exact
						path="/cluster/mappings"
						render={(props) => <AppPageContainer {...props} component={MappingsPage} />}
					/>
					<Route
						exact
						path="/cluster/share-settings"
						component={(props) => (
							<AppPageContainer {...props} component={ShareSettings} />
						)}
					/>
					<Route
						exact
						path="/cluster/profile"
						component={(props) => (
							<AppPageContainer {...props} component={ProfilePage} />
						)}
					/>
					<Route
						exact
						path="/cluster/billing"
						component={(props) => (
							<AppPageContainer {...props} component={BillingPage} />
						)}
					/>
					<Route
						exact
						path="/cluster/browse"
						render={(props) => (
							<AppPageContainer {...props} component={BrowserPage} isCluster />
						)}
					/>
					<Route
						exact
						path="/cluster/search-preview"
						render={(props) => <AppPageContainer {...props} component={SandboxPage} />}
					/>
					<Route
						exact
						path="/cluster/role-based-access"
						component={(props) => (
							<AppPageContainer {...props} component={RoleBaseAccess} />
						)}
					/>

					<Route
						exact
						path="/cluster/functions"
						component={(props) => <AppPageContainer {...props} component={Functions} />}
					/>

					<Route
						exact
						path="/cluster/curated-insights"
						component={(props) => (
							<AppPageContainer {...props} component={ClusterInsights} />
						)}
					/>
				</Switch>
			</ErrorPage>
		);
	}
}

ClusterRouteContainer.propTypes = {
	history: PropTypes.object.isRequired,
	match: PropTypes.object.isRequired,
	location: PropTypes.object.isRequired,
};

export default ClusterRouteContainer;
