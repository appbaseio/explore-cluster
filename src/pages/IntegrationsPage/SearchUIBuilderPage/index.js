/*
	route: /cluster/search-builder
	meta: wrapper around UiBuildersList.js
*/
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import UiBuildersList from './UiBuildersList';
import Banner from '../../../batteries/components/shared/UpgradePlan/Banner';
import { event, timingEvent } from '../../../utils/gtag';
import moment from '../../../utils/moment';

const bannerDetailsPaid = {
	title: 'Search UI Builder',
	description:
		'Build a WYSIWYG storefront search preview that can be installed to your favorite E-Commerce platform.',
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
			<UiBuildersList />
		</>
	);
};

SearchIntegrationsPage.defaultProps = {};

SearchIntegrationsPage.propTypes = {};

const mapStateToProps = () => ({});

export default connect(mapStateToProps, null)(SearchIntegrationsPage);
