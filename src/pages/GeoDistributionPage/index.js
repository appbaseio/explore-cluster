import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import get from 'lodash/get';
import Overlay from '../../components/Overlay';
import Container from '../../components/Container';
import Banner from '../../batteries/components/shared/UpgradePlan/Banner';
import FilterInitializer from '../../batteries/components/analytics/components/Filter/FilterInitializer';
import GeoDistributionPage from '../../batteries/components/analytics/components/GeoDistribution';
import { event, timingEvent } from '../../utils/gtag';
import moment from '../../utils/moment';

const bannerMessagesAnalytics = {
	free: {
		title: 'Unlock the ROI impact of your search',
		description:
			'Get a paid plan to see actionable analytics on search volume, popular searches, no results, track clicks and conversions.',
		buttonText: 'Upgrade Now',
		href: 'billing',
	},
	bootstrap: {
		title: 'Get geo distribution analytics with Growth plan',
		description:
			'By upgrading to the Growth plan, you can visualize where your search traffic is coming from.',
		buttonText: 'Upgrade To Growth',
		href: 'billing',
	},
	growth: {
		title: 'Geo Distribution',
		description:
			'Understand where you search traffic is coming from. Learn how to make the most of geo distribution insights.',
		buttonText: 'Read Docs',
		href: 'https://docs.appbase.io/docs/analytics/overview/#geography-visualization',
	},
};

const filterId = 'geo_distribution_page';

const PopularResultsWrapper = ({ plan, isGrowth }) => {
	useEffect(() => {
		const startTime = moment();
		// triggering custom event for google analytics
		event({
			action: 'Geo Distribution',
			category: 'Analytics',
			label: 'visit',
			value: null,
		});

		return () => {
			// Sends the timing event to Google Analytics.
			timingEvent({
				action: 'timing_complete',
				category: 'Analytics',
				label: 'geo-distribution-time',
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
							<GeoDistributionPage displaySummaryStats filterId={filterId} />
						</Container>
					</React.Fragment>
				</FilterInitializer>
			) : (
				<React.Fragment>
					<Banner {...bannerMessagesAnalytics[plan]} />
					<Overlay
						style={{
							maxWidth: '70%',
						}}
						src="/static/images/analytics/GeoDistribution.png"
						alt="analytics"
					/>
				</React.Fragment>
			)}
		</React.Fragment>
	);
};

PopularResultsWrapper.propTypes = {
	plan: PropTypes.string.isRequired,
	isGrowth: PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => ({
	plan: get(state, '$getAppPlan.results.plan'),
	isGrowth: get(state, '$getAppPlan.results.isPaid'),
});
export default connect(mapStateToProps)(PopularResultsWrapper);
