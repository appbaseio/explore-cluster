import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import SandboxComponent from './SandboxPage';
import Banner from '../../batteries/components/shared/UpgradePlan/Banner';
import Overlay from '../../components/Overlay';

const bannerMessagesSandbox = {
	free: {
		title: 'Search Preview',
		description: 'Test search relevance visually.',
		buttonText: 'Upgrade Now',
		href: 'billing',
	},
};

const SandboxPage = ({ isPaidUser, appName }) => {
	return (
		<React.Fragment>
			{isPaidUser ? (
				<SandboxComponent appName={appName} />
			) : (
				<React.Fragment>
					<Banner {...bannerMessagesSandbox.free} />
					<Overlay
						style={{
							maxWidth: '70%',
						}}
						src="https://i.imgur.com/mgAHMsr.png"
						alt="search preview"
					/>
				</React.Fragment>
			)}
		</React.Fragment>
	);
};

SandboxPage.propTypes = {
	appName: PropTypes.string.isRequired,
	isPaidUser: PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => ({
	appName: get(state, '$getCurrentApp.name'),
	isPaidUser: get(state, '$getAppPlan.results.isPaid'),
});

export default connect(mapStateToProps)(SandboxPage);
