import React from 'react';
import get from 'lodash/get';
import { connect } from 'react-redux';
import { bool, string } from 'prop-types';
// import { isValidPlan } from '../../batteries/utils';
// import Overlay from '../../components/Overlay';
// import Banner from '../../batteries/components/shared/UpgradePlan/Banner';
import Main from './Main';
// TODO: Update details
// TODO: Update docs links
// const bannerDetails = {
// 	title: 'Integrations',
// 	description: 'GUI to manage preferences for appbase.io integrations.',
// 	buttonText: 'Read more',
// 	icon: 'pencil',
// 	href: 'https://docs.appbase.io/docs/integrations/',
// };

const IntegrationsPage = ({ tier, featureEcommerce }) => {
	// TODO: Enable plan validation after BE changes with update image
	// if (!isValidPlan(tier, featureEcommerce)) {
	// 	return (
	// 		<React.Fragment>
	// 			<Banner {...bannerDetails} />
	// 			<Overlay
	// 				style={{
	// 					maxWidth: '70%',
	// 				}}
	// 				// TODO: Update image
	// 				src="https://i.imgur.com/c6P8eN8.png"
	// 				alt="integrations"
	// 			/>
	// 		</React.Fragment>
	// 	);
	// }
	return (
		<React.Fragment>
			{/* <Banner {...bannerDetails} /> */}
			<Main />
		</React.Fragment>
	);
};

IntegrationsPage.defaultProps = {
	featureEcommerce: false,
};

IntegrationsPage.propTypes = {
	tier: string.isRequired,
	featureEcommerce: bool,
};

const mapStateToProps = (state) => ({
	tier: get(state, '$getAppPlan.results.tier'),
	featureEcommerce: get(state, '$getAppPlan.results.feature_ecommerce', false),
});

export default connect(mapStateToProps, null)(IntegrationsPage);
