import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import FunctionsComponent from './Functions';
import Banner from '../../batteries/components/shared/UpgradePlan/Banner';
import Overlay from '../../components/Overlay';

const bannerMessagesFunctions = {
	free: {
		title: 'Unlock Functions',
		description: 'Get a paid plan to use Functions.',
		buttonText: 'Upgrade Now',
		href: 'billing',
	},
};

const FunctionsPage = ({ isPaidUser }) => {
	return (
		<React.Fragment>
			{isPaidUser ? (
				<FunctionsComponent />
			) : (
				<React.Fragment>
					<Banner {...bannerMessagesFunctions.free} />
					<Overlay
						style={{
							maxWidth: '70%',
						}}
						src="https://i.imgur.com/4LPHTlw.png"
						alt="functions"
					/>
				</React.Fragment>
			)}
		</React.Fragment>
	);
};

FunctionsPage.propTypes = {
	isPaidUser: PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => ({
	isPaidUser: get(state, '$getAppPlan.results.isPaid'),
});

export default connect(mapStateToProps)(FunctionsPage);
