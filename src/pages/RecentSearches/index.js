import React, { useEffect } from 'react';
import get from 'lodash/get';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Overlay from '../../components/Overlay';
import Container from '../../components/Container';
import Banner from '../../batteries/components/shared/UpgradePlan/Banner';
import RecentSearches from '../../batteries/components/analytics/components/RecentSearches';
import FilterInitializer from '../../batteries/components/analytics/components/Filter/FilterInitializer';
import { allowedTiers } from '../../utils/prop-types';
import { isValidPlan } from '../../batteries/utils';
import { event, timingEvent } from '../../utils/gtag';
import moment from '../../utils/moment';

const bannerMessagesAnalytics = {
	free: {
		title: 'Unlock the ROI impact of your search',
		description:
			'Get a Production or Enterprise plan to see actionable analytics on recent searches and results.',
		buttonText: 'Upgrade Now',
		href: 'billing',
	},
	paid: {
		title: 'Recent Searches',
		description: 'Understand the recent search patterns of users.',
		buttonText: 'Read Docs',
		href: 'https://docs.reactivesearch.io/docs/analytics/overview/#recent-searches',
	},
};

const filterId = 'recent_searches_page';

const RecentSearchesWrapper = ({ appName, tier }) => {
	const startTime = moment();
	useEffect(() => {
		// triggering custom event for google analytics
		event({
			action: 'Recent Searches',
			category: 'Analytics',
			label: 'visit',
			value: null,
		});

		return () => {
			// Sends the timing event to Google Analytics.
			timingEvent({
				action: 'timing_complete',
				category: 'Analytics',
				label: 'recent-searches-time',
				name: 'time',
				value: startTime.fromNow(),
			});
		};
	}, []);
	return (
		<React.Fragment>
			{isValidPlan(tier) ? (
				<FilterInitializer filterId={filterId}>
					<React.Fragment>
						<Banner {...bannerMessagesAnalytics.paid} />
						<Container>
							<RecentSearches filterId={filterId} appName={appName} />
						</Container>
					</React.Fragment>
				</FilterInitializer>
			) : (
				<React.Fragment>
					<Banner {...bannerMessagesAnalytics.free} />
					<Overlay
						src="/static/images/analytics/RecentSearches.png"
						alt="recent searches"
					/>
				</React.Fragment>
			)}
		</React.Fragment>
	);
};

RecentSearchesWrapper.defaultProps = {
	appName: undefined,
	tier: undefined,
};

RecentSearchesWrapper.propTypes = {
	appName: PropTypes.string,
	tier: allowedTiers,
};

const mapStateToProps = (state) => ({
	appName: get(state, '$getCurrentApp.name'),
	tier: get(state, '$getAppPlan.results.tier'),
});
export default connect(mapStateToProps)(RecentSearchesWrapper);
