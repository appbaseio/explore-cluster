import React from 'react';
import get from 'lodash/get';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Overlay from '../../components/Overlay';
import Container from '../../components/Container';
import Banner from '../../batteries/components/shared/UpgradePlan/Banner';
import RecentResults from '../../batteries/components/analytics/components/RecentResults';
import { allowedTiers } from '../../utils/prop-types';
import { isValidPlan } from '../../batteries/utils';

const bannerMessagesAnalytics = {
	free: {
		title: 'Unlock the ROI impact of your search',
		description:
			'Get a paid plan to see actionable analytics on search volume, popular searches, no results, recent searches & results, track clicks and conversions.',
		buttonText: 'Upgrade Now',
		href: 'billing',
	},
	paid: {
		title: 'Recent Results',
		description: 'Understand how to make the most of the recent results analytics.',
		buttonText: 'Read Docs',
		href: 'https://docs.appbase.io/docs/analytics/overview/',
	},
};

const RecentResultsWrapper = ({ appName, tier }) => (
	<React.Fragment>
		{isValidPlan(tier) ? (
			<React.Fragment>
				<Banner {...bannerMessagesAnalytics.paid} />
				<Container>
					<RecentResults filterId="recent_results_page" appName={appName} />
				</Container>
			</React.Fragment>
		) : (
			<React.Fragment>
				<Banner {...bannerMessagesAnalytics.free} />
				<Overlay src="/static/images/analytics/RecentResults.png" alt="recent results" />
			</React.Fragment>
		)}
	</React.Fragment>
);

RecentResultsWrapper.defaultProps = {
	appName: undefined,
	tier: undefined,
};

RecentResultsWrapper.propTypes = {
	appName: PropTypes.string,
	tier: allowedTiers,
};

const mapStateToProps = (state) => ({
	appName: get(state, '$getCurrentApp.name'),
	tier: get(state, '$getAppPlan.results.tier'),
});
export default connect(mapStateToProps)(RecentResultsWrapper);
