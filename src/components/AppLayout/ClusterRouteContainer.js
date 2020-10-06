import React from 'react';
import PropTypes from 'prop-types';
import { Switch, Route } from 'react-router-dom';
import Loadable from 'react-loadable';
import get from 'lodash/get';
import Loader from '../Loader';
import AppPageContainer from '../AppPageContainer';
import ErrorPage from '../../pages/ErrorPage';
import ClusterAnalyticsRoutes from './ClusterAnalyticsRoutes';

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

const ShareSettings = Loadable({
	loader: () =>
		import(/* webpackChunkName: "ShareSettingsPage" */ '../../pages/ShareSettingsPage'),
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

const GradeEvaluation = Loadable({
	loader: () => import(/* webpackChunkName: "GradeEvaluation" */ '../../pages/GradeEvaluation'),
	loading: Loader,
});

class ClusterRouteContainer extends React.Component {
	shouldComponentUpdate(nextProps) {
		const { location } = this.props;
		return (
			get(nextProps, 'location.pathname') !== get(location, 'pathname') ||
			get(nextProps, 'location.search') !== get(location, 'search')
		);
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
						path="/cluster/popular-suggestions"
						component={(props) => (
							<AppPageContainer {...props} component={QuerySuggestionsPage} />
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

					<Route
						exact
						path="/cluster/grade-evaluation"
						component={(props) => (
							<AppPageContainer {...props} component={GradeEvaluation} />
						)}
					/>

					<ClusterAnalyticsRoutes />
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
