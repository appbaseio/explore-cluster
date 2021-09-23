import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import SynonymsComponent from './Synonyms';
import Banner from '../../batteries/components/shared/UpgradePlan/Banner';
import Overlay from '../../components/Overlay';
import { isValidPlan } from '../../batteries/utils';
import { allowedTiers } from '../../utils/prop-types';

const bannerMessagesSynonyms = {
	free: {
		title: 'Manage Synonyms',
		description:
			'Manage synonyms for your search index. Once set, you can enable searching with synonyms.',
		buttonText: 'Upgrade Now',
		href: 'billing',
	},
};

const SynonymsPage = ({ isPaidUser, tier, featureSynonyms }) => {
	return (
		<React.Fragment>
			{isPaidUser && isValidPlan(tier, featureSynonyms) ? (
				<SynonymsComponent />
			) : (
				<React.Fragment>
					<Banner {...bannerMessagesSynonyms.free} />
					<Overlay
						style={{
							maxWidth: '70%',
						}}
						src="https://i.imgur.com/fO0Zomn.png"
						alt="Synonyms"
					/>
				</React.Fragment>
			)}
		</React.Fragment>
	);
};

SynonymsPage.defaultProps = {
	tier: undefined,
	featureSynonyms: false,
};

SynonymsPage.propTypes = {
	isPaidUser: PropTypes.bool.isRequired,
	tier: allowedTiers,
	featureSynonyms: PropTypes.bool,
};

const mapStateToProps = (state) => ({
	isPaidUser: get(state, '$getAppPlan.results.isPaid'),
	tier: get(state, '$getAppPlan.results.tier'),
	featureSynonyms: get(state, '$getAppPlan.results.feature_search_relevancy', false),
});

export default connect(mapStateToProps)(SynonymsPage);
