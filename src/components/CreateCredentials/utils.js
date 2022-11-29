import isEqual from 'lodash/isEqual';
import sortBy from 'lodash/sortBy';
import get from 'lodash/get';
import isCidr from 'is-cidr';
import filter from 'lodash/filter';
import find from 'lodash/find';
import { getDefaultAllowedActions } from '../../utils/allowedActions';
import { versionCompare } from '../../batteries/utils/helpers';
import { ALLOWED_ACTIONS } from '../../constants';
import { ALLOWED_ACTIONS_BY_BACKEND, BACKENDS } from '../../batteries/utils';

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
	return !!isCidr(value);
};
export const isNegative = (control) => {
	if (control.value && parseInt(control.value, 10) < 0) {
		return { isNegative: true };
	}
	return undefined;
};
export const isZero = (control) => {
	if (control && parseInt(control.value, 10) === 0) {
		return { isZero: true };
	}
	return undefined;
};

export const isNegativeTTL = (control) => {
	if (control.value !== -1 && control.value && parseInt(control.value, 10) < 0) {
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
		description: 'Read & Write',
		ops: ['read', 'write', 'delete'],
	},
};
export const defaultTagValues = {
	// Search related categories:
	reactivesearch: true,
	analytics: true,
	storedquery: false,
	// Elasticsearch endpoints related categories:
	search: false,
	docs: false,
	indices: false,
	clusters: false,
	cat: false,
	misc: false,
	// ReactiveSearch and appbase.io plugins related categories:
	searchrelevancy: false,
	suggestions: false,
	rules: false,
	synonyms: false,
	user: false,
	permission: false,
	logs: false,
	auth: false,
	uibuilder: false,
	// new categories
	cache: false,
};
export const defaultRateLimits = {
	// Search related categories:
	reactivesearch: 10,
	analytics: 10,
	storedquery: 10,
	// Elasticsearch endpoints related categories:
	search: 10,
	docs: 10,
	indices: 10,
	clusters: 10,
	cat: 10,
	misc: 10,
	// ReactiveSearch and appbase.io plugins related categories:
	searchrelevancy: 10,
	suggestions: 10,
	rules: 10,
	synonyms: 10,
	user: 10,
	permission: 10,
	logs: 10,
	auth: 10,
	uibuilder: 10,
	// new categories
	cache: 10,
};
// Acl options
export const aclOptions = [
	// Search related categories:
	'reactivesearch',
	'analytics',
	// Elasticsearch endpoints related categories:
	'search',
	'docs',
	'indices',
	'clusters',
	'cat',
	'misc',
	// ReactiveSearch and appbase.io plugins related categories:
	'searchrelevancy',
	'suggestions',
	'rules',
	'synonyms',
	'user',
	'permission',
	'logs',
	'auth',
	'uibuilder',
];
// New categories to appbase version map
const newCategories = {
	cache: { version: '7.42.0', insertAfter: 'searchrelevancy' },
	storedquery: { version: '7.48.1', insertAfter: 'analytics' },
};
// Default Selected Acl
export const defaultAclOptions = aclOptions;

export const getDefaultAclOptionsByVersion = (appbaseVersion) => {
	const categories = [...aclOptions];
	Object.keys(newCategories).forEach((category) => {
		if (versionCompare(appbaseVersion, newCategories[category].version) !== -1) {
			const insertAtIndex =
				newCategories[category].insertAtIndex !== undefined
					? newCategories[category].insertAtIndex
					: categories.findIndex(
							(element) => element === newCategories[category].insertAfter,
					  ) + 1;
			categories.splice(insertAtIndex, 0, category);
		}
	});
	return categories;
};

export const getAllowedActionsByVersion = (
	appbaseVersion,
	backend = BACKENDS.ELASTICSEARCH.name,
) => {
	const actions = { ...(backend ? ALLOWED_ACTIONS_BY_BACKEND[backend] : ALLOWED_ACTIONS) };
	// New scope to version map
	const newScopes = {
		SPEED: '7.42.0',
		PIPELINES: '7.58.0',
	};
	Object.keys(newScopes).forEach((action) => {
		if (versionCompare(appbaseVersion, newScopes[action]) === -1) {
			// remove scope
			delete actions[action];
		}
	});
	return actions;
};
// Acl options label
export const aclOptionsLabel = {
	// Search related categories:
	reactivesearch: 'ReactiveSearch',
	analytics: 'Analytics',
	storedquery: 'Stored Queries',
	// Elasticsearch endpoints related categories:
	search: 'Search',
	docs: 'Docs',
	indices: 'Indices',
	clusters: 'Clusters',
	cat: 'Cat',
	misc: 'Misc',
	// ReactiveSearch and appbase.io plugins related categories:
	searchrelevancy: 'Search Relevancy',
	suggestions: 'Suggestions',
	rules: 'Rules',
	synonyms: 'Synonyms',
	user: 'User',
	permission: 'Permission',
	logs: 'Logs',
	auth: 'Auth',
	uibuilder: 'UI Builder',
	// new Categories
	cache: 'Cache',
};

// Acl options Message
export const aclOptionsMessage = {
	// Search related categories:
	reactivesearch:
		'Query via the ReactiveSearch API, a declarative opensource API to query Elasticsearch',
	analytics:
		'Track analytics and impressions, typically used together with the ReactiveSearch API',
	storedquery:
		'Allow white-listed queries, think parameterized Elasticsearch DSL to be used directly or in conjunction with ReactiveSearch API',
	// Elasticsearch endpoints related categories:
	search: 'Allow searching via the Elasticsearch Query DSL using _search, _msearch and similar actions',
	docs: 'Allow CRUD operations on documents such as create, index, update, get, and delete',
	indices: 'Allow index specific actions such as settings, mappings, open, close',
	clusters: 'All cluster specific actions such as cluster nodes, tasks, remote, cat',
	cat: 'All cat actions specifcally',
	misc: 'Actions such as script, get, ingest, and snapshot',
	// ReactiveSearch and appbase.io plugins related categories:
	searchrelevancy: 'Allow search relevancy related actions',
	suggestions: 'Allow suggestions related actions',
	rules: 'Allow query rules related actions',
	synonyms: 'Allow synonyms related actions',
	user: 'Allow user related actions',
	permission: 'Allow API credentials (aka permissions) related actions',
	logs: ' Allow log related actions',
	auth: 'Allow getting / setting public keys (for JWT auth)',
	uibuilder: 'Allow UI builder related actions',
	// new Categories
	cache: 'Allow cache related actions',
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

const getCategories = (value, appbaseVersion) => {
	const valueCategories = get(value, 'categories', []);
	const categories = [];
	getDefaultAclOptionsByVersion(appbaseVersion).forEach((category) => {
		const obj = {
			acl: category,
			tag: valueCategories.includes(category),
		};
		if (value.limits) {
			obj.rateLimit = value.limits[`${category}_limit`] || defaultRateLimits[category];
		} else {
			obj.rateLimit = defaultRateLimits[category];
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

export const mapFormToValues = (value, hasLimits, appbaseVersion) => {
	const filteredCategories = filterCategories(value);
	const shouldIncludeReactiveSearchConfig =
		find(value.categories, { acl: 'reactivesearch' })?.tag &&
		versionCompare(appbaseVersion, '7.48.1') !== -1;
	const submitValues = {
		indices: value.indices,
		description: value.description,
		ops: value.operationType && value.operationType.ops,
		referers: value.referers,
		sources: value.sources,
		sources_xff_value: parseInt(value.sources_xff_value, 10) || undefined,
		limits: filteredCategories.limits,
		ttl: parseInt(value.ttl, 10) || undefined,
		username: value.username,
		password: value.password,
		email: value.email,
		is_admin: value.isAdmin,
		include_fields: value.include_fields,
		exclude_fields: value.exclude_fields,
		allowed_actions: value.allowedActions,
		categories: hasLimits ? filteredCategories.categories : value.categories,
		...(shouldIncludeReactiveSearchConfig && {
			reactivesearchConfig: {
				maxSize: parseInt(value.rsApiRestrictions.maxQuerySize, 10),
				maxAggregationSize: parseInt(value.rsApiRestrictions.maxAggregationSize, 10),
				disableQueryDSL: !value.rsApiRestrictions.allowDirectDSL,
			},
		}),
	};

	if (value.isAdmin) {
		delete submitValues.allowed_actions;
	}
	return submitValues;
};

export const mapValuesToForm = (value, hasLimits, appbaseVersion) => ({
	...value,
	operationType: value.is_admin ? Types.admin : getOperationType(value),
	ip_limit: get(value, 'limits.ip_limit'),
	ttl: parseInt(value.ttl, 10),
	isAdmin: value.is_admin,
	indices: value.indices ? filter(value.indices, (o) => o !== '') : undefined,
	allowedActions: value.allowed_actions || getDefaultAllowedActions(value.is_admin),
	...(hasLimits && { categories: getCategories(value, appbaseVersion) }),
	...(value.reactivesearchConfig && {
		rsApiRestrictions: {
			maxQuerySize: get(value, 'reactivesearchConfig.maxSize'),
			maxAggregationSize: get(value, 'reactivesearchConfig.maxAggregationSize'),
			allowDirectDSL: !get(value, 'reactivesearchConfig.disableQueryDSL'),
		},
	}),
});
