import React from 'react';
import get from 'lodash/get';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Overlay from '../../components/Overlay';
import Container from '../../components/Container';
import Banner from '../../batteries/components/shared/UpgradePlan/Banner';
import RecentSearches from '../../batteries/components/analytics/components/RecentSearches';
import { allowedTiers } from '../../utils/prop-types';
import { isValidPlan } from '../../batteries/utils';

const bannerMessagesAnalytics = {
	free: {
		title: 'Unlock the ROI impact of your search',
		description:
			'Get a PRODUCTIOM_1 plan or above to see actionable analytics on recent searches and results.',
		buttonText: 'Upgrade Now',
		href: 'billing',
	},
	paid: {
		title: 'Recent Searches',
		description: 'Understand the recent search patterns of users.',
		buttonText: 'Read Docs',
		href: 'https://docs.appbase.io/docs/analytics/overview/',
	},
};

const RecentSearchesWrapper = ({ appName, tier }) => (
	<React.Fragment>
		{isValidPlan(tier) ? (
			<React.Fragment>
				<Banner {...bannerMessagesAnalytics.paid} />
				<Container>
					<RecentSearches filterId="recent_searches_page" appName={appName} />
				</Container>
			</React.Fragment>
		) : (
			<React.Fragment>
				<Banner {...bannerMessagesAnalytics.free} />
				<Overlay src="/static/images/analytics/RecentSearches.png" alt="recent searches" />
			</React.Fragment>
		)}
	</React.Fragment>
);

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
