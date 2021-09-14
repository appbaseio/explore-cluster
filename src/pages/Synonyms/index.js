import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import SynonymsComponent from './Synonyms';
import Banner from '../../batteries/components/shared/UpgradePlan/Banner';
import Overlay from '../../components/Overlay';

const bannerMessagesSynonyms = {
	free: {
		title: 'Unlock Synonyms',
		description: 'Get a paid plan to set Synonyms.',
		buttonText: 'Upgrade Now',
		href: 'billing',
	},
};

const SynonymsPage = ({ isPaidUser }) => {
	return (
		<React.Fragment>
			{!isPaidUser ? (
				<SynonymsComponent />
			) : (
				<React.Fragment>
					<Banner {...bannerMessagesSynonyms.free} />
					<Overlay
						style={{
							maxWidth: '70%',
						}}
						src="https://i.imgur.com/x8UMoIz.png"
						alt="manage synonyms"
					/>
				</React.Fragment>
			)}
		</React.Fragment>
	);
};

SynonymsPage.propTypes = {
	isPaidUser: PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => ({
	isPaidUser: get(state, '$getAppPlan.results.isPaid'),
});

export default connect(mapStateToProps)(SynonymsPage);
