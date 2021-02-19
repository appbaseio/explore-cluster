import React from 'react';
import get from 'lodash/get';
import { Breadcrumb } from 'antd';
import PropTypes from 'prop-types';
import Loadable from 'react-loadable';
import { connect } from 'react-redux';
import { Route, Switch, Link } from 'react-router-dom';
import Overlay from '../../components/Overlay';
import Container from '../../components/Container';
import Filter from '../../batteries/components/analytics/components/Filter';
import FilterInitializer from '../../batteries/components/analytics/components/Filter/FilterInitializer';
import Banner from '../../batteries/components/shared/UpgradePlan/Banner';
import Loader from '../../components/Loader';

const QueryOverview = Loadable({
	loader: () =>
		import(
			/* webpackChunkName: "PopularSearches" */ '../../batteries/components/analytics/components/QueryOverview'
		),
	loading: Loader,
});

const PopularSearches = Loadable({
	loader: () =>
		import(
			/* webpackChunkName: "PopularSearches" */ '../../batteries/components/analytics/components/PopularSearches'
		),
	loading: Loader,
});

const bannerMessagesAnalytics = {
	free: {
		title: 'Unlock the ROI impact of your search',
		description:
			'Get a paid plan to see actionable analytics on search volume, popular searches, no results, track clicks and conversions.',
		buttonText: 'Upgrade Now',
		href: 'billing',
	},
	bootstrap: {
		title: 'Get richer analytics on clicks and conversions',
		description:
			'By upgrading to the Growth plan, you can track clicks and conversions, get a 30-day retention on analytics along with being able to view actionable analytics on popular filters, popular results, search latency and geo distribution.',
		buttonText: 'Upgrade To Growth',
		href: 'billing',
	},
	growth: {
		title: 'Learn how to track click analytics',
		description:
			'See our docs on how to track search, filters, click events, conversions and add your own custom events.',
		buttonText: 'Read Docs',
		href: 'https://docs.appbase.io/docs/analytics/overview/#popular-searches',
	},
};

const filterId = 'popular_searches_page';

const PopularSearchesWrapper = ({ appName, plan, isPaidUser }) => (
	<React.Fragment>
		{isPaidUser ? (
			<FilterInitializer filterId={filterId}>
				<React.Fragment>
					{bannerMessagesAnalytics[plan] && <Banner {...bannerMessagesAnalytics[plan]} />}
					<Container>
						<Filter filterId={filterId} />
						<Route
							component={({ match }) => {
								const splitedURL = window.location.href.split('query-overview/');
								return (
									<React.Fragment>
										{window.location.href.includes('query-overview') ? (
											<Breadcrumb
												style={{
													marginBottom: 20,
												}}
											>
												<Breadcrumb.Item>
													<Link to={`${match.url}`}>
														Popular Searches
													</Link>
												</Breadcrumb.Item>
												<Breadcrumb.Item>
													{splitedURL && splitedURL[1]
														? decodeURIComponent(splitedURL[1])
														: '<empty_query>'}
												</Breadcrumb.Item>
											</Breadcrumb>
										) : null}
										<Switch>
											<Route
												exact
												path={match.path}
												component={() => (
													<PopularSearches
														filterId={filterId}
														displayReplaySearch={window.location.pathname.startsWith(
															'/app',
														)}
														appName={appName}
														plan={plan}
														displaySummaryStats
													/>
												)}
											/>
											<Route
												exact
												path={`${match.path}/query-overview/:query`}
												component={(props) => (
													<QueryOverview
														{...props}
														query={get(props, 'match.params.query')}
														filterId={filterId}
													/>
												)}
											/>
										</Switch>
									</React.Fragment>
								);
							}}
						/>
					</Container>
				</React.Fragment>
			</FilterInitializer>
		) : (
			<React.Fragment>
				<Banner {...bannerMessagesAnalytics.free} />
				<Overlay
					src="/static/images/analytics/PopularSearches.png"
					alt="popular searches"
				/>
			</React.Fragment>
		)}
	</React.Fragment>
);
PopularSearchesWrapper.defaultProps = {
	appName: undefined,
};

PopularSearchesWrapper.propTypes = {
	appName: PropTypes.string,
	plan: PropTypes.string.isRequired,
	isPaidUser: PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => ({
	appName: get(state, '$getCurrentApp.name'),
	plan: get(state, '$getAppPlan.results.plan'),
	isPaidUser: get(state, '$getAppPlan.results.isPaid'),
});
export default connect(mapStateToProps)(PopularSearchesWrapper);
