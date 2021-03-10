export const GA_TRACKING_ID = 'UA-54082612-12';

// https://developers.google.com/analytics/devguides/collection/gtagjs/events
export const event = ({ action, category, label, value }) => {
	window.gtag('event', action, {
		send_to: GA_TRACKING_ID,
		event_category: category,
		event_label: label,
		value,
	});
};

// https://developers.google.com/analytics/devguides/collection/gtagjs/user-timings
export const timingEvent = ({ action, category, name, label, value }) => {
	window.gtag('event', action, {
		send_to: GA_TRACKING_ID,
		event_category: category,
		event_label: label,
		name,
		value,
	});
};

export const getAnalyticsAction = () => {
	switch (true) {
		case window.location.pathname.endsWith('/languages') ||
			window.location.pathname.endsWith('/languages/'):
			return 'Language Settings';
		case window.location.pathname.endsWith('/search') ||
			window.location.pathname.endsWith('/search/'):
			return 'Search Settings';
		case window.location.pathname.endsWith('/aggs') ||
			window.location.pathname.endsWith('/aggs/'):
			return 'Aggregation Settings';
		case window.location.pathname.endsWith('/results') ||
			window.location.pathname.endsWith('/results/'):
			return 'Result Settings';
		case window.location.pathname.endsWith('/index-settings') ||
			window.location.pathname.endsWith('/index-settings/'):
			return 'Index Settings';
		case window.location.pathname.endsWith('/schema') ||
			window.location.pathname.endsWith('/schema/'):
			return 'Schema Settings';
		case window.location.pathname.endsWith('/synonyms') ||
			window.location.pathname.endsWith('/synonyms/'):
			return 'Synonyms Settings';
		case window.location.pathname.endsWith('/popular-suggestions') ||
			window.location.pathname.endsWith('/popular-suggestions/'):
			return 'Popular Suggestions';
		default:
			return 'Settings';
	}
};
