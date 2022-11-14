import React, { useEffect } from 'react';
import get from 'lodash/get';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Overlay from '../../components/Overlay';
import Container from '../../components/Container';
import Banner from '../../batteries/components/shared/UpgradePlan/Banner';
import RequestDistribution from '../../batteries/components/analytics/components/RequestDistribution';
import FilterInitializer from '../../batteries/components/analytics/components/Filter/FilterInitializer';
import { event, timingEvent } from '../../utils/gtag';
import moment from '../../utils/moment';

const bannerMessagesAnalytics = {
	free: {
		title: 'Requests Per Minute',
		description:
			'Understand the status of your requests, Learn how to make the most of request distribution insights.',
		buttonText: 'Upgrade Now',
		href: 'billing',
	},
	bootstrap: {
		title: 'Get request distribution analytics with Growth plan',
		description:
			'By upgrading to the Growth plan, you can visualize the status of your requests.',
		buttonText: 'Upgrade To Growth',
		href: 'billing',
	},
	growth: {
		title: 'Request Distribution',
		description:
			'Understand the status of your requests, Learn how to make the most of request distribution insights.',
		buttonText: 'Read Docs',
		href: 'https://docs.reactivesearch.io/docs/analytics/Overview/#request-distribution',
	},
};

const filterId = 'request_distribution_page';
const RequestDistributionWrapper = ({ plan, isGrowth }) => {
	useEffect(() => {
		const startTime = moment();
		// triggering custom event for google analytics
		event({
			action: 'Request Distribution',
			category: 'Analytics',
			label: 'visit',
			value: null,
		});

		return () => {
			// Sends the timing event to Google Analytics.
			timingEvent({
				action: 'timing_complete',
				category: 'Analytics',
				label: 'request-distribution-time',
				name: 'time',
				value: startTime.fromNow(),
			});
		};
	}, []);
	return (
		<React.Fragment>
			{isGrowth ? (
				<FilterInitializer filterId={filterId}>
					<React.Fragment>
						{bannerMessagesAnalytics[plan] && (
							<Banner {...bannerMessagesAnalytics[plan]} />
						)}
						<Container>
							<RequestDistribution displaySummaryStats filterId={filterId} />
						</Container>
					</React.Fragment>
				</FilterInitializer>
			) : (
				<React.Fragment>
					<Banner {...bannerMessagesAnalytics[plan]} />

					<Overlay
						style={{
							maxWidth: '100%',
						}}
						lockSectionStyle={{
							marginTop: '15%',
						}}
						src="/static/images/analytics/RequestDistribution.png"
						alt="request distribution"
					/>
				</React.Fragment>
			)}
		</React.Fragment>
	);
};

RequestDistributionWrapper.propTypes = {
	plan: PropTypes.string.isRequired,
	isGrowth: PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => ({
	plan: get(state, '$getAppPlan.results.plan'),
	isGrowth: get(state, '$getAppPlan.results.isPaid'),
});
export default connect(mapStateToProps)(RequestDistributionWrapper);
