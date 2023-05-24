import React, { useEffect } from 'react';
import get from 'lodash/get';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Container from '../../components/Container';
import Overlay from '../../components/Overlay';
import Banner from '../../batteries/components/shared/UpgradePlan/Banner';
import Analytics from '../../batteries/components/analytics';
import { ANALYTICS_ROOT_FILTER_ID } from '../../batteries/components/analytics/utils';
import { event, timingEvent } from '../../utils/gtag';
import moment from '../../utils/moment';

const bannerMessagesAnalytics = {
	free: {
		title: 'Unlock the ROI impact of your search',
		description:
			'Get a paid plan to see actionable analytics on search volume, popular searches, no results, track clicks and conversions.',
		buttonText: 'Upgrade Now',
		videoLink: 'https://youtu.be/o3ewnIrVE3o',
		href: 'billing',
	},
	bootstrap: {
		title: 'Get richer analytics on clicks and conversions',
		description:
			'By upgrading to the Growth plan, you can track clicks and conversions, get a 30-day retention on analytics along with being able to view actionable analytics on popular filters, popular results, search latency and geo distribution.',
		videoLink: 'https://youtu.be/cjGSWj9LehM',
		buttonText: 'Upgrade To Growth',
		href: 'billing',
	},
	growth: {
		title: 'Learn how to track click analytics',
		description:
			'See our docs on how to track search, filters, click events, conversions and add your own custom events.',
		buttonText: 'Read Docs',
		videoLink: 'https://youtu.be/cjGSWj9LehM',
		href: 'https://docs.reactivesearch.io/docs/analytics/Overview/#getting-insights-from-analytics',
	},
};

const AnalyticsView = ({ appName, isPaidUser, plan, history }) => {
	useEffect(() => {
		const startTime = moment();
		// triggering custom event for google analytics
		event({
			action: 'Overview',
			category: 'Analytics',
			label: 'visit',
			value: null,
		});

		return () => {
			// Sends the timing event to Google Analytics.
			timingEvent({
				action: 'timing_complete',
				category: 'Analytics',
				label: 'overview-time',
				name: 'time',
				value: startTime.fromNow(),
			});
		};
	}, []);
	return (
		<React.Fragment>
			{isPaidUser ? (
				<React.Fragment>
					{bannerMessagesAnalytics[plan] && <Banner {...bannerMessagesAnalytics[plan]} />}
					<Container>
						<Analytics
							filterId={ANALYTICS_ROOT_FILTER_ID}
							displayReplaySearch={window.location.pathname.startsWith('/app')}
							chartWidth={window.innerWidth - 400}
							appName={appName}
							history={history}
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
};
AnalyticsView.propTypes = {
	appName: PropTypes.string.isRequired,
	isPaidUser: PropTypes.bool.isRequired,
	plan: PropTypes.string.isRequired,
	history: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
	appName: get(state, '$getCurrentApp.name'),
	plan: get(state, '$getAppPlan.results.plan'),
	isPaidUser: get(state, '$getAppPlan.results.isPaid'),
});

export default connect(mapStateToProps)(AnalyticsView);
