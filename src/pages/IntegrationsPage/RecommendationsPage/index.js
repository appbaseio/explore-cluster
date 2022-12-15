/*
	route: /cluster/recommendations-builder
	meta: wrapper around RecommendationsUIsList.js
*/

import React, { useEffect } from 'react';
import RecommendationsUIsList from './RecommendationsUIsList';

import Banner from '../../../batteries/components/shared/UpgradePlan/Banner';

import { event, timingEvent } from '../../../utils/gtag';
import moment from '../../../utils/moment';

const bannerDetailsPaid = {
	title: 'Recommendations UI Builder',
	description:
		'Build a WYSIWYG recommendations UI that can be installed to any E-Commerce platform or to your own site.',
	buttonText: 'Read Docs',
	href: 'http://docs.reactivesearch.io/docs/reactivesearch/ui-builder/recommendations/',
};

const RecommendationsIntegrationsPage = () => {
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
			<RecommendationsUIsList />
		</>
	);
};

RecommendationsIntegrationsPage.defaultProps = {};

RecommendationsIntegrationsPage.propTypes = {};

export default RecommendationsIntegrationsPage;
