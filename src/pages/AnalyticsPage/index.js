import React from 'react';
import get from 'lodash/get';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button } from 'antd';
import Container from '../../components/Container';
import Overlay from '../../components/Overlay';
import Banner from '../../batteries/components/shared/UpgradePlan/Banner';
import Analytics from '../../batteries/components/analytics';
import { toggleInsightsSidebar } from '../../batteries/modules/actions';

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
		href: 'https://docs.appbase.io/docs/analytics/Overview/#getting-insights-from-analytics',
	},
};

const AnalyticsView = ({ appName, isPaidUser, plan, toggleInsights }) => (
	<React.Fragment>
		{isPaidUser ? (
			<React.Fragment>
				{bannerMessagesAnalytics[plan] && <Banner {...bannerMessagesAnalytics[plan]} />}
				<Container>
					<Button onClick={toggleInsights}>Toggle Insights</Button>
					<Analytics
						filterId="analytics_page"
						displayReplaySearch
						chartWidth={window.innerWidth - 400}
						appName={appName}
					/>
				</Container>
			</React.Fragment>
		) : (
			<React.Fragment>
				<Banner {...bannerMessagesAnalytics.free} />
				<Overlay
					style={{
						maxWidth: '70%',
					}}
					src="/static/images/analytics/Analytics.png"
					alt="analytics"
				/>
			</React.Fragment>
		)}
	</React.Fragment>
);
AnalyticsView.propTypes = {
	appName: PropTypes.string.isRequired,
	isPaidUser: PropTypes.bool.isRequired,
	plan: PropTypes.string.isRequired,
};

const mapStateToProps = (state) => ({
	appName: get(state, '$getCurrentApp.name'),
	plan: get(state, '$getAppPlan.results.plan'),
	isPaidUser: get(state, '$getAppPlan.results.isPaid'),
});

const mapDispatchToProps = (dispatch) => ({
	toggleInsights: () => dispatch(toggleInsightsSidebar()),
});

export default connect(mapStateToProps, mapDispatchToProps)(AnalyticsView);
