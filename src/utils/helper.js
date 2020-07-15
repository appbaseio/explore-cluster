import { notification } from 'antd';
import get from 'lodash/get';

const URLSearchParams = require('url-search-params');

export const keySummary = {
	admin: 'Admin credentials',
	read: 'Read credentials',
	write: 'Write credentials',
};

export const displayErrors = (nextErrors = [], prevErrors = [], showNotification = false) => {
	nextErrors.map((error, index) => {
		if (error && error !== prevErrors[index]) {
			if (showNotification || process.env.NODE_ENV === 'development') {
				notification.error({
					message: 'Error',
					description: error.message,
				});
			}
		}
		return null;
	});
};

export const isBase64 = (str) => {
	if (str === '' || str.trim() === '') {
		return false;
	}
	try {
		return btoa(atob(str)) === str;
	} catch (err) {
		return false;
	}
};

export const capitalizeFirstLetter = (string) => string.charAt(0).toUpperCase() + string.slice(1);

export const compressNumber = (amount) => {
	let mAmount = amount;
	let finalNum = null;
	try {
		let unit = '';
		if (amount > 1000000) {
			unit = 'M';
		} else if (amount > 1000) {
			unit = 'K';
		}
		if (unit === 'M') {
			mAmount = parseFloat(amount / 1000000);
			mAmount = mAmount.toFixed(0);
		} else if (unit === 'K') {
			mAmount = parseFloat(amount / 1000);
			mAmount = mAmount.toFixed(0);
		} else {
			mAmount = amount;
		}
		finalNum = mAmount + unit;
	} catch (e) {
		console.log(e);
	}
	return finalNum;
};

export const planLimits = {
	free: {
		action: 100000,
		records: 10000,
	},
	bootstrap: {
		action: 1000000,
		records: 50000,
	},
	growth: {
		action: 10000000,
		records: 1000000,
	},
};

export const planBasePrice = {
	bootstrap: 49,
	growth: 89,
};

const calcPercentage = (appStats, plan, field) => {
	let count;
	if (field === 'action') {
		count = get(appStats, 'calls', 0);
	} else {
		count = get(appStats, 'records', 0);
	}
	let percentage = (100 * count) / planLimits[plan][field];
	percentage = percentage < 100 ? percentage : 100;
	return {
		percentage,
		count,
	};
};
export const getAppCount = (appStats, plan) => {
	let obj = {
		action: {
			percentage: 0,
			count: 0,
		},
		records: {
			percentage: 0,
			count: 0,
		},
	};
	obj = {
		action: calcPercentage(appStats, plan, 'action'),
		records: calcPercentage(appStats, plan, 'records'),
	};
	return obj;
};

export const validateAppName = (name) => {
	// Contains uppercase letter
	if (name !== name.toLowerCase()) {
		return false;
	}
	const symbolsToCheck = /[\s#&*'"\\|,<>\/?]/; //eslint-disable-line
	const nameCharacters = name.split('');
	const startsWith =
		nameCharacters[0] === '+' || nameCharacters[0] === '-' || nameCharacters[0] === '_';

	if (name === '.' || name === '..' || name === '' || symbolsToCheck.test(name) || startsWith) {
		return false;
	}
	return true;
};

export const validationsList = [
	'Lowercase only',
	'Cannot include \\, /, *, ?, ", <, >, |, ` ` (space character), ,, #',
	'Cannot start with -, _, +',
	'Cannot be . or ..',
];

export function getUrlParams(url) {
	if (!url) {
		return {};
	}
	const searchParams = new URLSearchParams(url);
	return Array.from(searchParams.entries()).reduce(
		(allParams, [key, value]) => ({
			...allParams,
			[key]: value,
		}),
		{},
	);
}
