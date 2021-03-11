import React, { useEffect } from 'react';
import get from 'lodash/get';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Overlay from '../../components/Overlay';
import Container from '../../components/Container';
import Banner from '../../batteries/components/shared/UpgradePlan/Banner';
import RequestLogs from '../../batteries/components/analytics/components/RequestLogs';
import { event, timingEvent } from '../../utils/gtag';
import moment from '../../utils/moment';

const bannerMessagesAnalytics = {
	free: {
		title: 'Request Logs',
		description:
			"View the last 100 request logs to glean insights into your app's behavior. Get a paid plan to view 10x more request logs.",
		buttonText: 'Upgrade Now',
		href: 'billing',
	},
	bootstrap: {
		title: 'Request Logs',
		description:
			"View the last 1,000 request logs to glean insights into your app's behaviors.",
		buttonText: 'Read More',
		href: 'https://docs.appbase.io',
	},
	growth: {
		title: 'Request Logs',
		description: "View the last 1,000 request logs to glean insights into your app's behavior.",
		buttonText: 'Read More',
		href: 'https://docs.appbase.io',
	},
};

const RequestLogsWrapper = ({ appName, plan, isPaidUser }) => {
	useEffect(() => {
		const startTime = moment();
		// triggering custom event for google analytics
		event({
			action: 'Request Logs',
			category: 'Develop',
			label: 'visit',
			value: null,
		});
		return () => {
			// Sends the timing event to Google Analytics.
			timingEvent({
				action: 'timing_complete',
				category: 'Develop',
				label: 'request-logs-time',
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
						<RequestLogs appName={appName} />
					</Container>
				</React.Fragment>
			) : (
				<React.Fragment>
					<Banner {...bannerMessagesAnalytics.free} />
					<Overlay
						style={{
							maxWidth: '100%',
						}}
						lockSectionStyle={{
							marginTop: '10%',
						}}
						src="/static/images/analytics/LastOperations.png"
						alt="request logs"
					/>
				</React.Fragment>
			)}
		</React.Fragment>
	);
};

RequestLogsWrapper.propTypes = {
	appName: PropTypes.string.isRequired,
	plan: PropTypes.string.isRequired,
	isPaidUser: PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => ({
	appName: get(state, '$getCurrentApp.name'),
	plan: get(state, '$getAppPlan.results.plan'),
	isPaidUser: get(state, '$getAppPlan.results.isPaid'),
});
export default connect(mapStateToProps)(RequestLogsWrapper);
