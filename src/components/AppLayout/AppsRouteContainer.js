import React from 'react';
import PropTypes from 'prop-types';
import Loadable from 'react-loadable';
import { Switch, Route } from 'react-router-dom';
import get from 'lodash/get';
import Loader from '../Loader';
import AppPageContainer from '../AppPageContainer';
import ErrorPage from '../../pages/ErrorPage';
import AppsAnalyticsRoutes from './AppsAnalyticsRoutes';

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

const IntegrationsPage = Loadable({
	loader: () => import(/* webpackChunkName: "IntegrationsPage" */ '../../pages/IntegrationsPage'),
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
						path="/app/:appName"
						component={(props) => (
							<AppPageContainer {...props} component={OverviewPage} />
						)}
					/>
					<Route
						exact
						path="/app/:appName/overview"
						component={(props) => (
							<AppPageContainer {...props} component={OverviewPage} />
						)}
					/>
					<Route
						exact
						path="/app/:appName/credentials"
						component={(props) => (
							<AppPageContainer {...props} component={CredentialsPage} />
						)}
					/>
					<Route
						exact
						path="/app/:appName/import"
						render={(props) => (
							<AppPageContainer
								{...props}
								component={ImporterPage}
								shouldFetchAppInfo={false}
								shouldFetchAppPlan={false}
							/>
						)}
					/>
					<Route
						exact
						path="/app/:appName/settings"
						render={(props) => (
							<AppPageContainer
								{...props}
								component={MappingsPage}
								shouldFetchAppInfo={false}
							/>
						)}
					/>
					<Route
						exact
						path="/app/:appName/share-settings"
						component={(props) => (
							<AppPageContainer {...props} component={ShareSettings} />
						)}
					/>
					<Route
						exact
						path="/app/:appName/billing"
						component={(props) => (
							<AppPageContainer {...props} component={BillingPage} />
						)}
					/>
					<Route
						exact
						path="/app/:appName/browse"
						render={(props) => (
							<AppPageContainer
								{...props}
								component={BrowserPage}
								shouldFetchAppInfo={false}
								shouldFetchAppPlan={false}
							/>
						)}
					/>
					<Route
						exact
						path="/app/:appName/query"
						render={(props) => (
							<AppPageContainer
								{...props}
								component={QueryExplorerPage}
								shouldFetchAppInfo={false}
								shouldFetchAppPlan={false}
							/>
						)}
					/>
					<Route
						exact
						path="/app/:appName/search-templates"
						render={(props) => (
							<AppPageContainer
								{...props}
								component={SearchTemplatesPage}
								shouldFetchAppInfo={false}
								shouldFetchAppPlan={false}
							/>
						)}
					/>
					<Route
						exact
						path="/app/:appName/query-suggestions"
						render={(props) => (
							<AppPageContainer {...props} component={QuerySuggestionsPage} />
						)}
					/>
					<Route
						exact
						path="/app/:appName/search-preview"
						render={(props) => (
							<AppPageContainer
								{...props}
								component={SandboxPage}
								shouldFetchAppInfo={false}
								shouldFetchAppPlan={false}
							/>
						)}
					/>
					<Route
						exact
						path="/app/:appName/integrations"
						render={(props) => (
							<AppPageContainer {...props} component={IntegrationsPage} />
						)}
					/>

					<Route
						exact
						path="/app/:appName/aggs"
						render={(props) => (
							<AppPageContainer
								{...props}
								component={AggsPage}
								shouldFetchAppInfo={false}
								shouldFetchAppPlan={false}
							/>
						)}
					/>
					<Route
						exact
						path="/app/:appName/results"
						render={(props) => (
							<AppPageContainer
								{...props}
								component={ResultsPage}
								shouldFetchAppInfo={false}
								shouldFetchAppPlan={false}
							/>
						)}
					/>
					<Route
						exact
						path="/app/:appName/index-settings"
						render={(props) => (
							<AppPageContainer
								{...props}
								component={IndexSettingsPage}
								shouldFetchAppInfo={false}
								shouldFetchAppPlan={false}
							/>
						)}
					/>
					<Route
						exact
						path="/app/:appName/languages"
						render={(props) => (
							<AppPageContainer
								{...props}
								component={LanguagePage}
								shouldFetchAppInfo={false}
								shouldFetchAppPlan={false}
							/>
						)}
					/>

					<Route
						exact
						path="/app/:appName/search"
						render={(props) => (
							<AppPageContainer
								{...props}
								component={SearchSettingsPage}
								shouldFetchAppInfo={false}
								shouldFetchAppPlan={false}
							/>
						)}
					/>

					<Route
						exact
						path="/app/:appName/synonyms"
						render={(props) => (
							<AppPageContainer
								{...props}
								component={SynonymsPage}
								shouldFetchAppInfo={false}
								shouldFetchAppPlan={false}
							/>
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
};

export default RouteContainer;
