export const deployStatusMapper = {
	success: '✅',
	failure: '❌',
	timeout: '🕓',
};

export function timeDifference(current, previous) {
	const msPerMinute = 60 * 1000;
	const msPerHour = msPerMinute * 60;
	const msPerDay = msPerHour * 24;
	const msPerMonth = msPerDay * 30;
	const msPerYear = msPerDay * 365;

	const elapsed = current - previous;

	if (elapsed < msPerMinute) {
		return `${
			Math.round(elapsed / 1000) === 1 ? '1 second' : `${Math.round(elapsed / 1000)} seconds`
		} ago`;
	}
	if (elapsed < msPerHour) {
		return `${
			Math.round(elapsed / msPerMinute) === 1
				? '1 minute'
				: `${Math.round(elapsed / msPerMinute)} minutes`
		} ago`;
	}
	if (elapsed < msPerDay) {
		return `${
			Math.round(elapsed / msPerHour) === 1
				? '1 hour'
				: `${Math.round(elapsed / msPerHour)} hours`
		} ago`;
	}
	if (elapsed < msPerMonth) {
		return `${
			Math.round(elapsed / msPerDay) === 1
				? '1 day'
				: `${Math.round(elapsed / msPerDay)} days`
		} ago`;
	}
	if (elapsed < msPerYear) {
		return `${
			Math.round(elapsed / msPerMonth) === 1
				? '1 month'
				: `${Math.round(elapsed / msPerMonth)} months`
		} ago`;
	}
	return `${
		Math.round(elapsed / msPerYear) === 1
			? '1 year'
			: `${Math.round(elapsed / msPerYear)} years`
	} ago`;
}

export const getAuthToken = () => {
	let token = null;
	try {
		token = localStorage.getItem('authToken');
	} catch (e) {
		// eslint-disable-next-line
		console.error(e);
	}
	return token;
};

export const updateConstantsWithPreferences = (preferences) => {
	return `
const appbasePrefs = ${JSON.stringify(JSON.stringify(preferences))};

export default appbasePrefs;
	`;
};
