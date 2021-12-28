import React from 'react';
import PropTypes from 'prop-types';
import Loadable from 'react-loadable';
import { Switch, Route } from 'react-router-dom';
import { connect } from 'react-redux';
import get from 'lodash/get';
import isEqual from 'lodash/isEqual';
import Loader from '../Loader';
import AppPageContainer from '../AppPageContainer';
import ErrorPage from '../../pages/ErrorPage';
import AppsAnalyticsRoutes from './AppsAnalyticsRoutes';
import { versionCompare } from '../../batteries/utils/helpers';
import UnauthorizedPage from '../../pages/UnauthorizedPage';
import { getAuthorizedRoutes } from '../../utils';
import { ALLOWED_ACTIONS } from '../../constants';

const BillingPage = Loadable({
	loader: () => import(/* webpackChunkName: "BillingPage" */ '../../pages/BillingPage'),
	loading: Loader,
});

const CredentialsPage = Loadable({
	loader: () => import(/* webpackChunkName: "CredentialsPage" */ '../../pages/CredentialsPage'),
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

const SynonymsPage = Loadable({
	loader: () => import(/* webpackChunkName: "Synonyms" */ '../../pages/Synonyms'),
	loading: Loader,
});

const SandboxPage = Loadable({
	loader: () => import(/* webpackChunkName: "SandboxPage" */ '../../pages/SandboxPage'),
	loading: Loader,
});

const SearchIntegrationsPage = Loadable({
	loader: () =>
		import(
			/* webpackChunkName: "SearchIntegrationsPage" */ '../../pages/IntegrationsPage/SearchN'
		),
	loading: Loader,
});

const StoredQueriesPage = Loadable({
	loader: () =>
		import(/* webpackChunkName: "StoredQueriesPage" */ '../../pages/StoredQueriesPage'),
	loading: Loader,
});

const RecommendationsIntegrationsPage = Loadable({
	loader: () =>
		import(
			/* webpackChunkName: "RecommendationsIntegrationsPage" */ '../../pages/IntegrationsPage/RecommendationsN'
		),
	loading: Loader,
});

const ShareSettings = Loadable({
	loader: () =>
		import(/* webpackChunkName: "ShareSettingsPage" */ '../../pages/ShareSettingsPage'),
	loading: Loader,
});

const QueryExplorerPage = Loadable({
	loader: () => import(/* webpackChunkName: "QueryExplorer" */ '../../pages/QueryExplorer'),
	loading: Loader,
});

const AggsPage = Loadable({
	loader: () => import(/* webpackChunkName: "AggsPage" */ '../../pages/AggsPage'),
	loading: Loader,
});

const ResultsPage = Loadable({
	loader: () => import(/* webpackChunkName: "ResultsPage" */ '../../pages/ResultsPage'),
	loading: Loader,
});

const LanguagePage = Loadable({
	loader: () => import(/* webpackChunkName: "LanguageSettings" */ '../../pages/LanguageSettings'),
	loading: Loader,
});

const SearchSettingsPage = Loadable({
	loader: () =>
		import(/* webpackChunkName: "SearchSettingsPage" */ '../../pages/SearchSettingsPage'),
	loading: Loader,
});

const IndexSettingsPage = Loadable({
	loader: () => import(/* webpackChunkName: "IndexSettings" */ '../../pages/IndexSettings'),
	loading: Loader,
});

class RouteContainer extends React.Component {
	shouldComponentUpdate(nextProps) {
		const { location, allowedRoutes } = this.props;
		return (
			get(nextProps, 'location.pathname') !== get(location, 'pathname') ||
			get(nextProps, 'location.search') !== get(location, 'search') ||
			!isEqual(get(nextProps, 'allowedRoutes'), allowedRoutes)
		);
	}

	render() {
		const { allowedRoutes, allowedActions, arcVersion } = this.props;
		const hasSearchRelevancy = allowedActions.includes(ALLOWED_ACTIONS.SEARCH_RELEVANCY);
		const hasUIBuilder = allowedActions.includes(ALLOWED_ACTIONS.UI_BUILDER);

		return (
			<ErrorPage {...this.props}>
				<Switch>
					<Route
						exact
						path="/app/:appName"
						component={(props) => (
							<>
								{get(allowedRoutes, '/') ? (
									<AppPageContainer {...props} component={OverviewPage} />
								) : (
									<UnauthorizedPage />
								)}
							</>
						)}
					/>
					<Route
						exact
						path="/app/:appName/overview"
						component={(props) => (
							<>
								{get(allowedRoutes, '/') ? (
									<AppPageContainer {...props} component={OverviewPage} />
								) : (
									<UnauthorizedPage />
								)}
							</>
						)}
					/>
					<Route
						exact
						path="/app/:appName/credentials"
						component={(props) => (
							<>
								{get(allowedRoutes, 'credentials') ? (
									<AppPageContainer {...props} component={CredentialsPage} />
								) : (
									<UnauthorizedPage />
								)}
							</>
						)}
					/>
					<Route
						exact
						path="/app/:appName/import"
						render={(props) => (
							<>
								{get(allowedRoutes, 'import') ? (
									<AppPageContainer
										{...props}
										component={ImporterPage}
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
						path="/app/:appName/schema"
						render={(props) => (
							<>
								{get(allowedRoutes, 'schema') ? (
									<AppPageContainer
										{...props}
										component={MappingsPage}
										shouldFetchAppInfo={false}
									/>
								) : (
									<UnauthorizedPage />
								)}
							</>
						)}
					/>
					<Route
						exact
						path="/app/:appName/share-settings"
						component={(props) => (
							<>
								{get(allowedRoutes, 'share-settings') ? (
									<AppPageContainer {...props} component={ShareSettings} />
								) : (
									<UnauthorizedPage />
								)}
							</>
						)}
					/>
					<Route
						exact
						path="/app/:appName/billing"
						component={(props) => (
							<>
								{get(allowedRoutes, 'billing') ? (
									<AppPageContainer {...props} component={BillingPage} />
								) : (
									<UnauthorizedPage />
								)}
							</>
						)}
					/>
					<Route
						exact
						path="/app/:appName/browse"
						render={(props) => (
							<>
								{get(allowedRoutes, 'browse') ? (
									<AppPageContainer
										{...props}
										component={BrowserPage}
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
						path="/app/:appName/query"
						render={(props) => (
							<>
								{get(allowedRoutes, 'query') ? (
									<AppPageContainer
										{...props}
										component={QueryExplorerPage}
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
						path="/app/:appName/search-preview"
						render={(props) => (
							<>
								{get(allowedRoutes, 'search-preview') &&
								(hasSearchRelevancy || hasUIBuilder) ? (
									<AppPageContainer
										{...props}
										component={SandboxPage}
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
						path="/app/:appName/stored-queries"
						render={(props) => (
							<>
								{get(allowedRoutes, 'stored-queries') ? (
									<AppPageContainer
										{...props}
										component={StoredQueriesPage}
										shouldFetchAppInfo={false}
										shouldFetchAppPlan={false}
									/>
								) : (
									<UnauthorizedPage />
								)}
							</>
						)}
					/>
					{versionCompare(arcVersion, '7.54.0') === -1 ? (
						<Route
							exact
							path="/app/:appName/search-builder"
							render={(props) => (
								<AppPageContainer {...props} component={SearchIntegrationsPage} />
							)}
						/>
					) : null}
					{versionCompare(arcVersion, '7.54.0') === -1 ? (
						<Route
							exact
							path="/app/:appName/recommendations-builder"
							render={(props) => (
								<AppPageContainer
									{...props}
									component={RecommendationsIntegrationsPage}
								/>
							)}
						/>
					) : null}
					<Route
						exact
						path="/app/:appName/aggs"
						render={(props) => (
							<>
								{get(allowedRoutes, 'aggs') ? (
									<AppPageContainer
										{...props}
										component={AggsPage}
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
						path="/app/:appName/results"
						render={(props) => (
							<>
								{get(allowedRoutes, 'results') ? (
									<AppPageContainer
										{...props}
										component={ResultsPage}
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
						path="/app/:appName/index-settings"
						render={(props) => (
							<>
								{get(allowedRoutes, 'index-settings') ? (
									<AppPageContainer
										{...props}
										component={IndexSettingsPage}
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
						path="/app/:appName/languages"
						render={(props) => (
							<>
								{get(allowedRoutes, 'languages') ? (
									<AppPageContainer
										{...props}
										component={LanguagePage}
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
						path="/app/:appName/search"
						render={(props) => (
							<>
								{get(allowedRoutes, 'search') ? (
									<AppPageContainer
										{...props}
										component={SearchSettingsPage}
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
						path="/app/:appName/synonyms"
						render={(props) => (
							<>
								{get(allowedRoutes, 'synonyms') ? (
									<AppPageContainer
										{...props}
										component={SynonymsPage}
										shouldFetchAppInfo={false}
										shouldFetchAppPlan={false}
									/>
								) : (
									<UnauthorizedPage />
								)}
							</>
						)}
					/>

					<AppsAnalyticsRoutes />
				</Switch>
			</ErrorPage>
		);
	}
}

RouteContainer.propTypes = {
	location: PropTypes.object.isRequired,
	allowedRoutes: PropTypes.object.isRequired,
	arcVersion: PropTypes.string.isRequired,
	allowedActions: PropTypes.array.isRequired,
};

const mapStateToProps = (state) => {
	return {
		allowedRoutes: getAuthorizedRoutes(get(state, 'appRoutes')),
		allowedActions: get(state, 'user.data.allowedActions'),
		arcVersion: get(state, '$getAppPlan.results.version'),
	};
};

export default connect(mapStateToProps)(RouteContainer);
