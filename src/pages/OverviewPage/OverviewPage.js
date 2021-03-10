import React, { useEffect } from 'react';
import PaidUserOverview from './PaidUserOverview';
import { event, timingEvent } from '../../utils/gtag';
import moment from '../../utils/moment';

const OverviewPage = () => {
	useEffect(() => {
		const startTime = moment();
		// triggering custom event for google analytics
		event({
			action: 'Overview',
			category: 'Overview',
			label: 'visit',
			value: null,
		});

		return () => {
			// Sends the timing event to Google Analytics.
			timingEvent({
				action: 'timing_complete',
				category: 'Overview',
				label: 'overview-time',
				name: 'time',
				value: startTime.fromNow(),
			});
		};
	}, []);
	return <PaidUserOverview />;
};

export default OverviewPage;
