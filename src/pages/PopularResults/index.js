import React, { useEffect } from 'react';
import get from 'lodash/get';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Overlay from '../../components/Overlay';
import Container from '../../components/Container';
import Banner from '../../batteries/components/shared/UpgradePlan/Banner';
import PopularResults from '../../batteries/components/analytics/components/PopularResults';
import FilterInitializer from '../../batteries/components/analytics/components/Filter/FilterInitializer';
import { event, timingEvent } from '../../utils/gtag';
import moment from '../../utils/moment';

const bannerMessagesAnalytics = {
	free: {
		title: 'Unlock the ROI impact of your search',
		description: 'Understand how to make the most of the recent results analytics.',
		buttonText: 'Upgrade Now',
		href: 'billing',
	},
	bootstrap: {
		title: 'Get popular results analytics with Growth plan',
		description:
			'By upgrading to the Growth plan, you can get analytics on popular results, including impressions and clicks each result gets.',
		buttonText: 'Upgrade To Growth',
		href: 'billing',
	},
	growth: {
		title: 'Popular Results',
		description: 'Understand how to make the most of the popular results analytics.',
		buttonText: 'Read Docs',
		href: 'https://docs.appbase.io/docs/analytics/overview/#popular-results',
	},
};

const filterId = 'popular_results_page';

const PopularResultsWrapper = ({ appName, plan, isGrowth }) => {
	useEffect(() => {
		const startTime = moment();
		// triggering custom event for google analytics
		event({
			action: 'Popular Results',
			category: 'Analytics',
			label: 'visit',
			value: null,
		});

		return () => {
			// Sends the timing event to Google Analytics.
			timingEvent({
				action: 'timing_complete',
				category: 'Analytics',
				label: 'popular-results-time',
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
							<PopularResults
								filterId={filterId}
								displayReplaySearch={window.location.pathname.startsWith('/app')}
								appName={appName}
								plan={plan}
								displaySummaryStats
							/>
						</Container>
					</React.Fragment>
				</FilterInitializer>
			) : (
				<React.Fragment>
					<Banner {...bannerMessagesAnalytics[plan]} />
					<Overlay
						src="/static/images/analytics/PopularResults.png"
						alt="popular results"
					/>
				</React.Fragment>
			)}
		</React.Fragment>
	);
};

PopularResultsWrapper.propTypes = {
	appName: PropTypes.string.isRequired,
	plan: PropTypes.string.isRequired,
	isGrowth: PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => ({
	appName: get(state, '$getCurrentApp.name'),
	plan: get(state, '$getAppPlan.results.plan'),
	isGrowth: get(state, '$getAppPlan.results.isPaid'),
});
export default connect(mapStateToProps)(PopularResultsWrapper);
