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
	},
	write: {
		description: 'Write-only key',
		read: false,
		write: true,
	},
	admin: {
		description: 'Admin key',
		read: true,
		write: true,
	},
};
// Acl options
export const aclOptions = [
	'reindex',
	'termvectors',
	'update',
	'create',
	'mtermvectors',
	'bulk',
	'delete',
	'source',
	'delete_by_query',
	'get',
	'mget',
	'update_by_query',
	'index',
	'exists',
	'field_caps',
	'msearch',
	'validate',
	'rank_eval',
	'render',
	'search_shards',
	'search',
	'count',
	'explain',
	'upgrade',
	'settings',
	'indices',
	'split',
	'aliases',
	'stats',
	'template',
	'open',
	'mapping',
	'recovery',
	'analyze',
	'cache',
	'forcemerge',
	'alias',
	'refresh',
	'segments',
	'close',
	'flush',
	'shrink',
	'shard_stores',
	'rollover',
	'cat',
	'remote',
	'nodes',
	'tasks',
	'cluster',
	'scripts',
	'ingest',
	'snapshot',
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
	reindex: 'Reindex',
	termvectors: 'Termvectors',
	update: 'Update',
	create: 'Create',
	mtermvectors: 'Mtermvectors',
	bulk: 'Bulk',
	delete: 'Delete',
	source: 'Source',
	delete_by_query: 'Delete by query',
	get: 'Get',
	mget: 'Mget',
	update_by_query: 'Update by query',
	index: 'Index',
	exists: 'Exists',
	field_caps: 'Field caps',
	msearch: 'Msearch',
	validate: 'Validate',
	rank_eval: 'Rank eval',
	render: 'Render',
	search_shards: 'Search shards',
	search: 'Search',
	count: 'Count',
	explain: 'Explain',
	upgrade: 'Upgrade',
	settings: 'Settings',
	indices: 'Indices',
	split: 'Split',
	aliases: 'Aliases',
	stats: 'Stats',
	template: 'Template',
	open: 'Open',
	mapping: 'Mapping',
	recovery: 'Recovery',
	analyze: 'Analyze',
	cache: 'Cache',
	forcemerge: 'Forcemerge',
	alias: 'Alias',
	refresh: 'Refresh',
	segments: 'Segments',
	close: 'Close',
	flush: 'Flush',
	shrink: 'Shrink',
	shard_stores: 'Shard stores',
	rollover: 'Rollover',
	cat: 'Cat',
	remote: 'Remote',
	nodes: 'Nodes',
	tasks: 'Tasks',
	cluster: 'Cluster',
	scripts: 'Scripts',
	ingest: 'Ingest',
	snapshot: 'Snapshot',
};
