import React, { useEffect } from 'react';
import get from 'lodash/get';
import { connect } from 'react-redux';
import { bool, string } from 'prop-types';
import { features, isValidPlan } from '../../../batteries/utils';
import Overlay from '../../../components/Overlay';
import Banner from '../../../batteries/components/shared/UpgradePlan/Banner';
import Main from './Main';
import { event, timingEvent } from '../../../utils/gtag';
import moment from '../../../utils/moment';

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
	useEffect(() => {
		const startTime = moment();
		// triggering custom event for google analytics
		event({
			action: 'Recommendations Builder',
			category: 'UI Builder',
			label: 'visit',
			value: null,
		});

		return () => {
			// Sends the timing event to Google Analytics.
			timingEvent({
				action: 'timing_complete',
				category: 'UI Builder',
				label: 'recommendations-builder-time',
				name: 'time',
				value: startTime.fromNow(),
			});
		};
	}, []);

	if (!isValidPlan(tier, featureEcommerce, features.UI_BUILDER)) {
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
					src="https://i.imgur.com/EUDyu6a.png"
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
