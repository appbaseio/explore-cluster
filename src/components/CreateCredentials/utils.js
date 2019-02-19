import isEqual from 'lodash/isEqual';
import sortBy from 'lodash/sortBy';
import get from 'lodash/get';

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
		description: 'Read-only',
		ops: ['read'],
	},
	write: {
		description: 'Write-only',
		ops: ['write'],
	},
	admin: {
		description: 'Admin',
		ops: ['read', 'write', 'delete'],
	},
};
export const defaultRateLimits = {
	docs: 0,
	search: 0,
	indices: 0,
	cat: 0,
	clusters: 0,
	misc: 0,
};
// Acl options
export const aclOptions = ['docs', 'search', 'indices', 'cat', 'clusters', 'misc'];
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

const filterCategories = (value) => {
	const limits = value.ip_limit ? { ip_limit: parseFloat(value.ip_limit, 10) } : undefined;
	const categories = [];
	get(value, 'categories', []).forEach((category) => {
		if (category.tag) {
			if (category.rateLimit !== undefined) {
				limits[`${category.acl}_limit`] = parseFloat(category.rateLimit, 10);
			}
			categories.push(category.acl);
		}
	});
	return {
		limits,
		categories,
	};
};

const getCategories = (value) => {
	const categories = [];
	aclOptions.forEach((category) => {
		const obj = {
			acl: category,
			tag: get(value, 'categories', []).includes(category),
		};
		if (value.limits) {
			obj.rateLimit = value.limits[`${category}_limit`];
		}
		categories.push(obj);
	});
	return categories;
};

export const getOperationType = (value) => {
	let operationType;
	Object.keys(Types).every((k) => {
		const type = Types[k];
		if (isEqual(sortBy(value.ops), sortBy(type.ops))) {
			operationType = type;
			return false;
		}
		return true;
	});
	return operationType;
};

export const mapFormToValues = (value, hasLimits) => {
	const filteredCategories = filterCategories(value);
	return {
		indices: value.indices,
		description: value.description,
		ops: value.operationType.ops,
		referers: value.referers,
		sources: value.sources,
		limits: filteredCategories.limits,
		ttl: parseInt(value.ttl, 10) || undefined,
		username: value.username,
		password: value.password,
		email: value.email,
		is_admin: value.isAdmin,
		categories: hasLimits ? filteredCategories.categories : value.categories,
	};
};

export const mapValuesToForm = (value, hasLimits) => ({
	...value,
	operationType: getOperationType(value),
	ip_limit: get(value, 'limits.ip_limit'),
	ttl: parseInt(value.ttl, 10),
	isAdmin: value.is_admin,
	...(hasLimits && { categories: getCategories(value) }),
});
