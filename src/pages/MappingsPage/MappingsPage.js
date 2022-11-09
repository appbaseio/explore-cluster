import React, { Fragment, useEffect } from 'react';

import MappingComponent from './components/MappingComponent';
import Banner from '../../batteries/components/shared/UpgradePlan/Banner';
import ErrorToaster from '../../batteries/components/shared/ErrorToaster';
import { event, timingEvent } from '../../utils/gtag';
import moment from '../../utils/moment';

const bannerMessage = {
	title: 'Schema Settings',
	buttonText: 'Read Docs',
	videoLink: 'https://youtu.be/ejk2wybEwoc',
	description: 'View mappings, edit use-case and data types, add or delete fields',
	href: 'https://docs.reactivesearch.io/docs/search/relevancy/#schema',
};

const MappingsPage = () => {
	useEffect(() => {
		const startTime = moment();
		// triggering custom event for google analytics
		event({
			action: 'Schema Settings',
			category: 'Search Relevancy',
			label: 'visit',
			value: null,
		});

		return () => {
			// Sends the timing event to Google Analytics.
			timingEvent({
				action: 'timing_complete',
				category: 'Search Relevancy',
				label: 'schema-settings-time',
				name: 'time',
				value: startTime.fromNow(),
			});
		};
	}, []);

	return (
		<Fragment>
			<Banner {...bannerMessage} />
			<section style={{ padding: 50 }}>
				<ErrorToaster>
					<MappingComponent />
				</ErrorToaster>
			</section>
		</Fragment>
	);
};

export default MappingsPage;
