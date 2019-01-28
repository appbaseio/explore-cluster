export const Suggestions = {
	1: {
		prefix: '',
		suffix: '',
		description: 'Matches exactly',
	},
	2: {
		prefix: '',
		suffix: '*',
		description: 'Matches referers starting with',
	},
	3: {
		prefix: '*',
		suffix: '',
		description: 'Matches referers ending with',
	},
	4: {
		prefix: '*',
		suffix: '*',
		description: 'Matches referers containing',
	},
};
export const getSuggestionCode = (str) => {
	if (str === '*') {
		return 'Matches All';
	}
	if (str.startsWith('*') && str.endsWith('*')) {
		return Suggestions[4].description;
	}
	if (str.startsWith('*')) {
		return Suggestions[3].description;
	}
	if (str.endsWith('*')) {
		return Suggestions[2].description;
	}
	return Suggestions[1].description;
};
export const ipValidator = (value) => {
	const splitIp = value && value.split('/');
	if (
		splitIp
		&& /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(
			splitIp[0],
		)
	) {
		const parsedNumber = parseInt(splitIp[1], 10);
		if (parsedNumber > -1 && parsedNumber < 33) {
			return true;
		}
		return false;
	}
	return false;
};
export const isNegative = (control) => {
	if (control.value && parseInt(control.value, 10) < 0) {
		return { isNegative: true };
	}
	return undefined;
};
// Operation types
export const Types = {
	read: {
		description: 'Read-only key',
		read: true,
		write: false,
		delete: false,
	},
	write: {
		description: 'Write-only key',
		read: false,
		delete: false,
		write: true,
	},
	admin: {
		description: 'Admin key',
		read: true,
		write: true,
		delete: true,
	},
};
export const defaultRateLimits = {
	docs: 0,
	search: 0,
	indices: 0,
	cat: 0,
	clusters: 0,
	misc: 0,
	user: 0,
	permission: 0,
	analytics: 0,
	streams: 0,
};
// Acl options
export const aclOptions = [
	'docs',
	'search',
	'indices',
	'cat',
	'clusters',
	'misc',
	'user',
	'permission',
	'analytics',
	'streams',
];
// Default Selected Acl
export const defaultAclOptions = aclOptions;
/**
 * To get acl options according to the users plan
 * @param {string} plan
 */
export const getAclOptionsByPlan = () => aclOptions;
/**
 * To get default selected acl options according to the users plan
 * @param {string} plan
 */
export const getDefaultAclOptionsByPlan = () => aclOptions;
// Acl options label
export const aclOptionsLabel = {
	docs: 'docs',
	search: 'search',
	indices: 'indices',
	cat: 'cat',
	clusters: 'clusters',
	misc: 'misc',
	user: 'user',
	permission: 'permission',
	analytics: 'analytics',
	streams: 'streams',
};
