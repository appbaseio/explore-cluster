import React from 'react';
import PropTypes from 'prop-types';
import { Switch, Route, Redirect } from 'react-router-dom';
import Loadable from 'react-loadable';
import { connect } from 'react-redux';
import get from 'lodash/get';
import isEqual from 'lodash/isEqual';
import Loader from '../Loader';
import AppPageContainer from '../AppPageContainer';
import ErrorPage from '../../pages/ErrorPage';
import ClusterAnalyticsRoutes from './ClusterAnalyticsRoutes';
import UnauthorizedPage from '../../pages/UnauthorizedPage';
import { getAuthorizedRoutes } from '../../utils';

const ProfilePage = Loadable({
	loader: () => import(/* webpackChunkName: "ProfilePage" */ '../../pages/ProfilePage'),
	loading: Loader,
});

const CachePreferences = Loadable({
	loader: () => import(/* webpackChunkName: "CachePreferences" */ '../../pages/CachePreferences'),
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

const StoredQueriesPage = Loadable({
	loader: () =>
		import(/* webpackChunkName: "StoredQueriesPage" */ '../../pages/StoredQueriesPage'),
	loading: Loader,
});

const SearchIntegrationsPage = Loadable({
	loader: () =>
		import(
			/* webpackChunkName: "SearchIntegrationsPage" */ '../../pages/IntegrationsPage/Search'
		),
	loading: Loader,
});

const RecommendationsIntegrationsPage = Loadable({
	loader: () =>
		import(
			/* webpackChunkName: "RecommendationsIntegrationsPage" */ '../../pages/IntegrationsPage/Recommendations'
		),
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

const SuggestionsPage = Loadable({
	loader: () =>
		import(/* webpackChunkName: "LanguageSettings" */ '../../pages/SuggestionSettings'),
	loading: Loader,
});

class ClusterRouteContainer extends React.Component {
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
			<ErrorPage {...this.props}>
				<Switch>
					<Route
						exact
						path="/cluster/overview"
						component={(props) => (
							<>
								{get(allowedRoutes, '/') ? (
									<AppPageContainer {...props} component={OverviewPage} />
								) : (
									<Redirect to={Object.keys(allowedRoutes)[0]} />
								)}
							</>
						)}
					/>
					<Route
						exact
						path="/cluster/cache"
						component={(props) => (
							<>
								{get(allowedRoutes, '/cluster/cache') ? (
									<AppPageContainer {...props} component={CachePreferences} />
								) : (
									<UnauthorizedPage />
								)}
							</>
						)}
					/>
					<Route
						exact
						path="/cluster/credentials"
						component={(props) => (
							<>
								{get(allowedRoutes, '/cluster/credentials') ? (
									<AppPageContainer {...props} component={CredentialsPage} />
								) : (
									<UnauthorizedPage />
								)}
							</>
						)}
					/>
					<Route
						exact
						path="/cluster/user-management"
						component={(props) => (
							<>
								{get(allowedRoutes, '/cluster/user-management') ? (
									<AppPageContainer {...props} component={UserManagementPage} />
								) : (
									<UnauthorizedPage />
								)}
							</>
						)}
					/>

					<Route
						exact
						path="/cluster/import"
						render={(props) => (
							<>
								{get(allowedRoutes, '/cluster/import') ? (
									<AppPageContainer {...props} component={ImporterPage} />
								) : (
									<UnauthorizedPage />
								)}
							</>
						)}
					/>
					<Route
						exact
						path="/cluster/suggestions"
						render={(props) => (
							<>
								{get(allowedRoutes, 'suggestions') ? (
									<AppPageContainer
										{...props}
										component={SuggestionsPage}
										shouldFetchAppInfo={false}
										shouldFetchAppPlan={false}
									/>
								) : (
									<UnauthorizedPage />
								)}
							</>
						)}
					/>
					<Route
						exact
						path="/cluster/rules"
						render={(props) => (
							<>
								{get(allowedRoutes, '/cluster/rules') ? (
									<AppPageContainer {...props} component={QueryRulesPage} />
								) : (
									<UnauthorizedPage />
								)}
							</>
						)}
					/>
					<Route
						exact
						path="/cluster/rules/new"
						render={(props) => (
							<>
								{get(allowedRoutes, '/cluster/rules') ? (
									<AppPageContainer {...props} component={QueryRulesForm} />
								) : (
									<UnauthorizedPage />
								)}
							</>
						)}
					/>

					<Route
						exact
						path="/cluster/rules/:id"
						render={(props) => (
							<>
								{get(allowedRoutes, '/cluster/rules') ? (
									<AppPageContainer {...props} component={QueryRulesForm} />
								) : (
									<UnauthorizedPage />
								)}
							</>
						)}
					/>
					<Route
						exact
						path="/cluster/mappings"
						render={(props) => (
							<>
								{get(allowedRoutes, '/cluster/mappings') ? (
									<AppPageContainer {...props} component={MappingsPage} />
								) : (
									<UnauthorizedPage />
								)}
							</>
						)}
					/>
					<Route
						exact
						path="/cluster/share-settings"
						component={(props) => (
							<>
								{get(allowedRoutes, '/cluster/share-settings') ? (
									<AppPageContainer {...props} component={ShareSettings} />
								) : (
									<UnauthorizedPage />
								)}
							</>
						)}
					/>
					<Route
						exact
						path="/cluster/profile"
						component={(props) => (
							<>
								{get(allowedRoutes, '/cluster/profile') ? (
									<AppPageContainer {...props} component={ProfilePage} />
								) : (
									<UnauthorizedPage />
								)}
							</>
						)}
					/>
					<Route
						exact
						path="/cluster/billing"
						component={(props) => (
							<>
								{get(allowedRoutes, '/cluster/billing') ? (
									<AppPageContainer {...props} component={BillingPage} />
								) : (
									<UnauthorizedPage />
								)}
							</>
						)}
					/>
					<Route
						exact
						path="/cluster/browse"
						component={(props) => (
							<>
								{get(allowedRoutes, '/cluster/browse') ? (
									<AppPageContainer {...props} component={BrowserPage} />
								) : (
									<UnauthorizedPage />
								)}
							</>
						)}
					/>
					<Route
						exact
						path="/cluster/search-preview"
						component={(props) => (
							<>
								{get(allowedRoutes, '/cluster/search-preview') ? (
									<AppPageContainer {...props} component={SandboxPage} />
								) : (
									<UnauthorizedPage />
								)}
							</>
						)}
					/>
					<Route
						exact
						path="/cluster/stored-queries"
						render={(props) => (
							<>
								{get(allowedRoutes, '/cluster/stored-queries') ? (
									<AppPageContainer {...props} component={StoredQueriesPage} />
								) : (
									<UnauthorizedPage />
								)}
							</>
						)}
					/>
					<Route
						exact
						path="/cluster/search-builder"
						render={(props) => (
							<AppPageContainer {...props} component={SearchIntegrationsPage} />
						)}
					/>
					<Route
						exact
						path="/cluster/recommendations-builder"
						render={(props) => (
							<AppPageContainer
								{...props}
								component={RecommendationsIntegrationsPage}
							/>
						)}
					/>
					<Route
						exact
						path="/cluster/role-based-access"
						component={(props) => (
							<>
								{get(allowedRoutes, '/cluster/role-based-access') ? (
									<AppPageContainer {...props} component={RoleBaseAccess} />
								) : (
									<UnauthorizedPage />
								)}
							</>
						)}
					/>

					<Route
						exact
						path="/cluster/curated-insights"
						component={(props) => (
							<>
								{get(allowedRoutes, '/cluster/curated-insights') ? (
									<AppPageContainer {...props} component={ClusterInsights} />
								) : (
									<UnauthorizedPage />
								)}
							</>
						)}
					/>

					<Route
						exact
						path="/cluster/grade-evaluation"
						component={(props) => (
							<>
								{get(allowedRoutes, '/cluster/grade-evaluation') ? (
									<AppPageContainer {...props} component={GradeEvaluation} />
								) : (
									<UnauthorizedPage />
								)}
							</>
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
	allowedRoutes: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => {
	return {
		allowedRoutes: getAuthorizedRoutes(get(state, 'clusterRoutes')),
	};
};

export default connect(mapStateToProps)(ClusterRouteContainer);
