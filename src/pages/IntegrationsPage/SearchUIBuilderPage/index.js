/*
	route: /cluster/search-builder
	meta: wrapper around UIBuildersList.js
*/
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import UIBuildersList from './UIBuildersList/UIBuildersList';
import Banner from '../../../batteries/components/shared/UpgradePlan/Banner';
import { event, timingEvent } from '../../../utils/gtag';
import moment from '../../../utils/moment';

const bannerDetailsPaid = {
	title: 'Search UI Builder',
	description:
		'Create an entire search UI experience with no-code. Ship to the global edge in a single-click. Extend the search UI with low-code (or your favorite IDE) and manage via dashboard.',
	buttonText: 'Read Docs',
	href: 'http://docs.reactivesearch.io/docs/reactivesearch/ui-builder/search/',
};

const SearchIntegrationsPage = () => {
	useEffect(() => {
		const startTime = moment();
		// triggering custom event for google analytics
		event({
			action: 'Search Builder',
			category: 'UI Builder',
			label: 'visit',
			value: null,
		});

		return () => {
			// Sends the timing event to Google Analytics.
			timingEvent({
				action: 'timing_complete',
				category: 'UI Builder',
				label: 'search-builder-time',
				name: 'time',
				value: startTime.fromNow(),
			});
		};
	}, []);

	return (
		<>
			<Banner {...bannerDetailsPaid} />
			<UIBuildersList />
		</>
	);
};

SearchIntegrationsPage.defaultProps = {};

SearchIntegrationsPage.propTypes = {};

const mapStateToProps = () => ({});

export default connect(mapStateToProps, null)(SearchIntegrationsPage);
