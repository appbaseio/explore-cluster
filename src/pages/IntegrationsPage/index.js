import React from 'react';
import get from 'lodash/get';
import { connect } from 'react-redux';
import { bool, string } from 'prop-types';
import { isValidPlan } from '../../batteries/utils';
import Overlay from '../../components/Overlay';
import Banner from '../../batteries/components/shared/UpgradePlan/Banner';
import Main from './Main';

const bannerDetails = {
	title: 'UI Integrations',
	description:
		'Build a WYSIWG storefront search preview that can be installed to your favorite E-Commerce platform.',
	icon: 'pencil',
};

const bannerDetailsPaid = {
	title: 'UI Integrations',
	description:
		'Build a WYSIWG storefront search preview that can be installed to your favorite E-Commerce platform.',
	buttonText: 'Read Docs',
	href: 'http://docs.appbase.io/docs/reactivesearch/ui-integrations/Overview',
};

const IntegrationsPage = ({ tier, featureEcommerce }) => {
	if (!isValidPlan(tier, featureEcommerce)) {
		return (
			<React.Fragment>
				<Banner {...bannerDetails} />
				<Overlay
					style={{
						maxWidth: '70%',
					}}
					src="https://i.imgur.com/ziZMrZm.png"
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
