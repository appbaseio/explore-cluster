import React from 'react';
import get from 'lodash/get';
import { connect } from 'react-redux';
import { bool, string } from 'prop-types';
import { isValidPlan } from '../../../batteries/utils';
import Overlay from '../../../components/Overlay';
import Banner from '../../../batteries/components/shared/UpgradePlan/Banner';
import Main from './Main';

const bannerDetails = {
	title: 'Recommendations UI Builder',
	description:
		'Build a WYSIWYG recommendations UI that can be installed to any E-Commerce platform or to your own site.',
	icon: 'pencil',
};

const bannerDetailsPaid = {
	title: 'Recommendations UI Builder',
	description:
		'Build a WYSIWYG recommendations UI that can be installed to any E-Commerce platform or to your own site.',
	buttonText: 'Read Docs',
	href: 'http://docs.appbase.io/docs/reactivesearch/ui-builder/recommendations/',
};

const RecommendationsIntegrationsPage = ({ tier, featureEcommerce }) => {
	if (!isValidPlan(tier, featureEcommerce)) {
		return (
			<React.Fragment>
				<Banner {...bannerDetails} />
				<Overlay
					style={{
						maxWidth: '80%',
					}}
					lockSectionStyle={{
						marginTop: '20%',
					}}
					src="https://i.imgur.com/sHVZWTq.png"
					alt="integrations"
				/>
			</React.Fragment>
		);
	}
	return (
		<>
			<Banner {...bannerDetailsPaid} />
			<Main />
		</>
	);
};

RecommendationsIntegrationsPage.defaultProps = {
	featureEcommerce: false,
};

RecommendationsIntegrationsPage.propTypes = {
	tier: string.isRequired,
	featureEcommerce: bool,
};

const mapStateToProps = (state) => ({
	tier: get(state, '$getAppPlan.results.tier'),
	featureEcommerce: get(state, '$getAppPlan.results.feature_ecommerce', false),
});

export default connect(mapStateToProps, null)(RecommendationsIntegrationsPage);
