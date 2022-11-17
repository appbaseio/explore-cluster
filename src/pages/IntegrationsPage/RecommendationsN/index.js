import React, { useEffect } from 'react';
import get from 'lodash/get';
import { connect } from 'react-redux';
import { bool, string } from 'prop-types';
import List from './List';
import { versionCompare } from '../../../batteries/utils/helpers';
import Banner from '../../../batteries/components/shared/UpgradePlan/Banner';
import Main from './Main';
import { event, timingEvent } from '../../../utils/gtag';
import moment from '../../../utils/moment';

const bannerDetailsPaid = {
	title: 'Recommendations UI Builder',
	description:
		'Build a WYSIWYG recommendations UI that can be installed to any E-Commerce platform or to your own site.',
	buttonText: 'Read Docs',
	href: 'http://docs.reactivesearch.io/docs/reactivesearch/ui-builder/recommendations/',
};

const RecommendationsIntegrationsPage = ({ arcVersion }) => {
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

	return (
		<>
			<Banner {...bannerDetailsPaid} />
			{versionCompare(arcVersion, '7.54.0') === -1 ? <Main /> : <List />}
		</>
	);
};

RecommendationsIntegrationsPage.defaultProps = {
	featureEcommerce: false,
};

RecommendationsIntegrationsPage.propTypes = {
	tier: string.isRequired,
	featureEcommerce: bool,
	// System props
	arcVersion: string.isRequired,
};

const mapStateToProps = (state) => ({
	arcVersion: get(state, '$getAppPlan.results.version'),
	tier: get(state, '$getAppPlan.results.tier'),
	featureEcommerce: get(state, '$getAppPlan.results.feature_ecommerce', false),
});

export default connect(mapStateToProps, null)(RecommendationsIntegrationsPage);
