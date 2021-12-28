import { ALLOWED_ACTIONS } from '.';

export const APP_ROUTES = {
	'App Overview': {
		icon: 'home',
		link: '',
	},
	Develop: {
		icon: 'dashboard',
		action: ALLOWED_ACTIONS.DEVELOP,
		menu: [
			{ label: 'Import Data', link: 'import' },
			{ label: 'Browse Data', link: 'browse' },
			{ label: 'Request Logs', link: 'request-logs' },
			{ label: 'Search Preview', link: 'search-preview', tag: 'Beta' },
			{ label: 'Stored Queries', link: 'stored-queries', tag: 'Beta' },
		],
	},
	'Search Relevancy': {
		icon: 'search',
		action: ALLOWED_ACTIONS.SEARCH_RELEVANCY,
		menu: [
			{ label: 'Language Settings', link: 'languages', tag: 'Beta' },
			{ label: 'Search Settings', link: 'search', tag: 'Beta' },
			{
				label: 'Suggestions Settings',
				link: '/cluster/suggestions',
				tag: 'Beta',
				hasExactPath: true,
			},
			{ label: 'Aggregation Settings', link: 'aggs', tag: 'Beta' },
			{ label: 'Result Settings', link: 'results', tag: 'Beta' },
			{ label: 'Index Settings', link: 'index-settings', tag: 'Beta' },
			{ label: 'Schema', link: 'schema', tag: 'Beta' },
			{ label: 'Synonyms', link: 'synonyms', tag: 'Beta' },
			{
				label: 'Query Rules',
				link: '/cluster/rules',
				tag: 'Beta',
				hasExactPath: true,
			},
			{
				label: 'Grade Evaluation',
				link: '/cluster/grade-evaluation',
				tag: 'Beta',
				hasExactPath: true,
			},
		],
	},
	Analytics: {
		icon: 'line-chart',
		action: ALLOWED_ACTIONS.ANALYTICS,
		menu: [
			{ label: 'Overview', link: 'analytics' },
			{ label: 'Popular Searches', link: 'popular-searches' },
			{ label: 'No Result Searches', link: 'no-results-searches' },
			{ label: 'Popular Filters', link: 'popular-filters' },
			{ label: 'Popular Results', link: 'popular-results' },
			{ label: 'Recent Searches', link: 'recent-searches' },
			{ label: 'Recent Results', link: 'recent-results' },
			{ label: 'Geo Distribution', link: 'geo-distribution' },
			{ label: 'Requests Per Minute', link: 'requests-per-minute' },
			{ label: 'Search Latency', link: 'search-latency' },
			{ label: 'Cluster Monitoring', link: '/cluster/monitoring', hasExactPath: true },
		],
	},
	Speed: {
		icon: 'thunderbolt',
		action: ALLOWED_ACTIONS.SPEED,
		menu: [{ label: 'Cache', link: '/cluster/cache', tag: 'Beta', hasExactPath: true }],
	},
	'Curated Insights': {
		icon: 'rise',
		link: '/cluster/curated-insights',
		hasExactPath: true,
		action: ALLOWED_ACTIONS.CURATED_INSIGHTS,
	},
	'UI Builder': {
		icon: 'control',
		action: ALLOWED_ACTIONS.UI_BUILDER,
		menu: [
			{ label: 'Search', link: 'search-builder' },
			{ label: 'Recommendations', link: 'recommendations-builder' },
		],
		tag: 'Beta',
	},
	'Access Control': {
		icon: 'key',
		action: ALLOWED_ACTIONS.ACCESS_CONTROL,
		menu: [
			{ label: 'API Credentials', link: 'credentials' },
			{
				label: 'Role Based Access',
				link: '/cluster/role-based-access',
				tag: 'Beta',
				hasExactPath: true,
			},
			{
				label: 'Node Sync Preferences',
				link: '/cluster/sync-preferences',
				tag: 'Beta',
				hasExactPath: true,
			},
		],
	},
	'User Management': {
		icon: 'user',
		action: ALLOWED_ACTIONS.USER_MANAGEMENT,
		link: '/cluster/user-management',
		hasExactPath: true,
	},
	Billing: {
		action: ALLOWED_ACTIONS.BILLING,
		icon: 'credit-card',
		link: 'billing',
	},
};

export const CLUSTER_ROUTES = {
	'Cluster Overview': {
		icon: 'cluster',
		link: '/',
	},
	Develop: {
		icon: 'dashboard',
		action: ALLOWED_ACTIONS.DEVELOP,
		menu: [
			{ label: 'Import Data', link: 'import', openIndexMenu: true },
			{ label: 'Browse Data', link: '/cluster/browse' },
			{ label: 'Request Logs', link: '/cluster/request-logs' },
			{
				label: 'Search Preview',
				link: 'search-preview',
				tag: 'Beta',
				openIndexMenu: true,
			},
			{ label: 'Stored Queries', link: '/cluster/stored-queries', tag: 'Beta' },
		],
	},
	'Search Relevancy': {
		icon: 'search',
		action: ALLOWED_ACTIONS.SEARCH_RELEVANCY,
		menu: [
			{
				label: 'Language Settings',
				link: 'languages',
				tag: 'Beta',
				openIndexMenu: true,
			},
			{ label: 'Search Settings', link: 'search', tag: 'Beta', openIndexMenu: true },
			{
				label: 'Suggestions Settings',
				link: '/cluster/suggestions',
				tag: 'Beta',
			},
			{
				label: 'Aggregation Settings',
				link: 'aggs',
				tag: 'Beta',
				openIndexMenu: true,
			},
			{ label: 'Result Settings', link: 'results', tag: 'Beta', openIndexMenu: true },
			{
				label: 'Index Settings',
				link: 'index-settings',
				tag: 'Beta',
				openIndexMenu: true,
			},
			{ label: 'Schema', link: 'schema', tag: 'Beta', openIndexMenu: true },
			{ label: 'Synonyms', link: 'synonyms', tag: 'Beta', openIndexMenu: true },
			{ label: 'Query Rules', link: '/cluster/rules', tag: 'Beta' },
			{ label: 'Grade Evaluation', link: '/cluster/grade-evaluation', tag: 'Beta' },
		],
	},
	Analytics: {
		icon: 'line-chart',
		action: ALLOWED_ACTIONS.ANALYTICS,
		menu: [
			{ label: 'Overview', link: '/cluster/analytics' },
			{ label: 'Popular Searches', link: '/cluster/popular-searches' },
			{ label: 'No Result Searches', link: '/cluster/no-results-searches' },
			{ label: 'Popular Filters', link: '/cluster/popular-filters' },
			{ label: 'Popular Results', link: '/cluster/popular-results' },
			{ label: 'Recent Searches', link: '/cluster/recent-searches' },
			{ label: 'Recent Results', link: '/cluster/recent-results' },
			{ label: 'Geo Distribution', link: '/cluster/geo-distribution' },
			{ label: 'Requests Per Minute', link: '/cluster/requests-per-minute' },
			{ label: 'Search Latency', link: '/cluster/search-latency' },
			{ label: 'Cluster Monitoring', link: '/cluster/monitoring' },
		],
	},
	Speed: {
		icon: 'thunderbolt',
		action: ALLOWED_ACTIONS.SPEED,
		menu: [{ label: 'Cache', link: '/cluster/cache', tag: 'Beta' }],
	},
	'Curated Insights': {
		icon: 'rise',
		action: ALLOWED_ACTIONS.CURATED_INSIGHTS,
		link: '/cluster/curated-insights',
	},
	'UI Builder': {
		icon: 'control',
		action: ALLOWED_ACTIONS.UI_BUILDER,
		menu: [
			{ label: 'Search', link: 'search-builder', openIndexMenu: true },
			{
				label: 'Recommendations',
				link: 'recommendations-builder',
				openIndexMenu: true,
			},
		],
		tag: 'Beta',
	},
	'Access Control': {
		icon: 'key',
		action: ALLOWED_ACTIONS.ACCESS_CONTROL,
		menu: [
			{ label: 'API Credentials', link: '/cluster/credentials' },
			{ label: 'Role Based Access', link: '/cluster/role-based-access', tag: 'Beta' },
			{
				label: 'Node Sync Preferences',
				link: '/cluster/sync-preferences',
				tag: 'Beta',
			},
		],
	},
	'User Management': {
		icon: 'user',
		link: '/cluster/user-management',
		action: ALLOWED_ACTIONS.USER_MANAGEMENT,
		hasExactPath: true,
	},
	Billing: {
		icon: 'credit-card',
		action: ALLOWED_ACTIONS.BILLING,
		link: '/cluster/billing',
	},
};
