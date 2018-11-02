import React from 'react';
import { Layout } from 'antd';
import Loadable from 'react-loadable';
import { Switch, Route } from 'react-router-dom';
import AppHeader from '../AppHeader';
import Loader from '../Loader';
import AppPageContainer from '../AppPageContainer';
import ErrorPage from '../../pages/ErrorPage';

const AnalyticsPage = Loadable({
	loader: () => import('../../pages/AnalyticsPage'),
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

const BillingPage = Loadable({
	loader: () => import('../../pages/BillingPage'),
	loading: Loader,
});

const CredentialsPage = Loadable({
	loader: () => import('../../pages/CredentialsPage'),
	loading: Loader,
});

const OverviewPage = Loadable({
	loader: () => import('../../pages/OverviewPage'),
	loading: Loader,
});

const ImporterPage = Loadable({
	loader: () => import('../../pages/ImporterPage'),
	loading: Loader,
});

const MappingsPage = Loadable({
	loader: () => import('../../pages/MappingsPage'),
	loading: Loader,
});

const BrowserPage = Loadable({
	loader: () => import('../../pages/BrowserPage'),
	loading: Loader,
});

const SandboxPage = Loadable({
	loader: () => import('../../pages/SandboxPage'),
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
const ShareSettings = Loadable({
	loader: () => import('../../pages/ShareSettingsPage'),
	loading: Loader,
});

const RequestLogs = Loadable({
	loader: () => import('../../pages/RequestLogs'),
	loading: Loader,
});

class ClusterLayout extends React.PureComponent {
	render() {
		const { collapsed } = this.props;
		return (
			<Layout
				css={{
					minHeight: 'calc(100vh - 60px)',
				}}
			>
				<AppHeader big={collapsed} />
				<ErrorPage {...this.props}>
					<Switch>
						<Route
							exact
							path="/cluster/overview"
							component={props => (
								<AppPageContainer {...props} component={OverviewPage} />
							)}
						/>
						<Route
							exact
							path="/cluster/analytics/:tab?/:subTab?"
							component={props => (
								<AppPageContainer {...props} component={AnalyticsPage} />
							)}
						/>
						<Route
							exact
							path="/cluster/popular-searches"
							component={props => (
								<AppPageContainer {...props} component={PopularSearches} />
							)}
						/>
						<Route
							exact
							path="/cluster/credentials"
							component={props => (
								<AppPageContainer {...props} component={CredentialsPage} />
							)}
						/>
						<Route
							exact
							path="/cluster/popular-results"
							component={props => (
								<AppPageContainer {...props} component={PopularResults} />
							)}
						/>
						<Route
							exact
							path="/cluster/geo-distribution"
							component={props => (
								<AppPageContainer
									{...props}
									cluster
									component={GeoDistributionPage}
								/>
							)}
						/>
						<Route
							exact
							path="/cluster/search-latency"
							component={props => (
								<AppPageContainer {...props} component={SearchLatency} />
							)}
						/>
						<Route
							exact
							path="/cluster/popular-filters"
							component={props => (
								<AppPageContainer {...props} component={PopularFilters} />
							)}
						/>
						<Route
							exact
							path="/cluster/request-logs/:tab?"
							component={props => (
								<AppPageContainer {...props} component={RequestLogs} />
							)}
						/>
						<Route
							exact
							path="/cluster/no-results-searches"
							component={props => (
								<AppPageContainer {...props} component={NoResultSearches} />
							)}
						/>
						<Route
							exact
							path="/cluster/import"
							render={props => (
								<AppPageContainer {...props} component={ImporterPage} />
							)}
						/>
						<Route
							exact
							path="/cluster/mappings"
							render={props => (
								<AppPageContainer {...props} component={MappingsPage} />
							)}
						/>
						<Route
							exact
							path="/cluster/share-settings"
							component={props => (
								<AppPageContainer {...props} component={ShareSettings} />
							)}
						/>
						<Route
							exact
							path="/cluster/billing"
							component={props => (
								<AppPageContainer {...props} component={BillingPage} />
							)}
						/>
						<Route
							exact
							path="/cluster/browse"
							render={props => (
								<AppPageContainer {...props} component={BrowserPage} isCluster />
							)}
						/>
						<Route
							exact
							path="/cluster/search-preview"
							render={props => (
								<AppPageContainer {...props} component={SandboxPage} />
							)}
						/>
					</Switch>
				</ErrorPage>
			</Layout>
		);
	}
}

export default ClusterLayout;
