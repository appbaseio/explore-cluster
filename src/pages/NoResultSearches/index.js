import React from 'react';
import get from 'lodash/get';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Overlay from '../../components/Overlay';
import Container from '../../components/Container';
import Banner from '../../batteries/components/shared/UpgradePlan/Banner';
import NoResultSearch from '../../batteries/components/analytics/components/NoResultsSearch';

const bannerMessagesAnalytics = {
	free: {
		title: 'Unlock the ROI impact of your search',
		description:
			'Get a paid plan to see actionable analytics on search volume, popular searches, no results, track clicks and conversions.',
		buttonText: 'Upgrade Now',
		href: 'billing',
	},
	bootstrap: {
		title: 'No Result Searches',
		description: 'Understand which user searches are yielding no results.',
		buttonText: 'Upgrade To Growth',
		href: 'billing',
	},
	growth: {
		title: 'No Result Searches',
		description: 'Understand which user searches are yielding no results.',
		buttonText: 'Read Docs',
		href: 'https://docs.appbase.io/docs/analytics/overview/#identify-content-gaps',
	},
};

const NoResultSearchWrapper = ({ appName, plan, isPaidUser }) => (
	<React.Fragment>
		{isPaidUser ? (
			<React.Fragment>
				{bannerMessagesAnalytics[plan] && <Banner {...bannerMessagesAnalytics[plan]} />}
				<Container>
					<NoResultSearch
						filterId="no_results_page"
						displayReplaySearch={window.location.pathname.startsWith('/app')}
						appName={appName}
						plan={plan}
					/>
				</Container>
			</React.Fragment>
		) : (
			<React.Fragment>
				<Banner {...bannerMessagesAnalytics.free} />
				<Overlay src="/static/images/analytics/NoResults.png" alt="no results searches" />
			</React.Fragment>
		)}
	</React.Fragment>
);

NoResultSearchWrapper.propTypes = {
	appName: PropTypes.string.isRequired,
	plan: PropTypes.string.isRequired,
	isPaidUser: PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => ({
	appName: get(state, '$getCurrentApp.name'),
	plan: get(state, '$getAppPlan.results.plan'),
	isPaidUser: get(state, '$getAppPlan.results.isPaid'),
});
export default connect(mapStateToProps)(NoResultSearchWrapper);
