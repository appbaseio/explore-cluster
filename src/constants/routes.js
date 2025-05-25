import { ALLOWED_ACTIONS } from '.';

export const APP_ROUTES = {
	'App Overview': {
		icon: 'home',
		link: '',
		action: ALLOWED_ACTIONS.OVERVIEW,
	},
	'UI Builder': {
		icon: 'control',
		action: ALLOWED_ACTIONS.UI_BUILDER,
		menu: [
			{ label: 'Search', link: '/cluster/search-builder', hasExactPath: true },
			{
				label: 'Recommendations',
				link: '/cluster/recommendations-builder',
				hasExactPath: true,
			},
			{
				label: 'Searchbox',
				link: '/cluster/searchboxes',
				hasExactPath: true,
			},
			{
				label: 'End-user Authentication',
				link: '/cluster/search-auth-settings',
				hasExactPath: true,
			},
		],
	},
	Data: {
		icon: 'dashboard',
		action: ALLOWED_ACTIONS.DEVELOP,
		menu: [
			{ label: 'Import Data', link: 'import' },
			{ label: 'Browse Data', link: 'browse' },
			{ label: 'Request Logs', link: 'request-logs' },
			{ label: 'Search Preview', link: 'search-preview' },
			{ label: 'Stored Queries', link: 'stored-queries' },
		],
	},
	'Search Relevance': {
		icon: 'search',
		action: ALLOWED_ACTIONS.SEARCH_RELEVANCY,
		menu: [
			{ label: 'Language Settings', link: 'languages' },
			{ label: 'Search Settings', link: 'search' },
			{
				label: 'Suggestions Settings',
				link: '/cluster/suggestions',
				hasExactPath: true,
			},
			{ label: 'Aggregation Settings', link: 'aggs' },
			{ label: 'Result Settings', link: 'results' },
			{ label: 'Index Settings', link: 'index-settings' },
			{ label: 'Schema', link: 'schema' },
			{ label: 'Synonyms', link: 'synonyms' },
			{
				label: 'Query Rules',
				link: '/cluster/rules',
				hasExactPath: true,
			},
		],
	},
	'AI Search': {
		icon: 'robot',
		action: ALLOWED_ACTIONS.UI_BUILDER,
		menu: [
			{
				label: 'AI Preferences',
				link: '/cluster/ai-preferences',
				hasExactPath: true,
			},
			{
				label: 'FAQs',
				link: '/cluster/ai-faqs',
				hasExactPath: true,
			},
		],
	},
	Pipelines: {
		icon: 'deployment-unit',
		action: ALLOWED_ACTIONS.PIPELINES,
		menu: [
			{
				label: 'View All Pipelines',
				link: '/cluster/pipelines',
				hasExactPath: true,
			},
			{
				label: 'Global Envs',
				link: '/cluster/global-envs',
				hasExactPath: true,
			},
			{
				label: 'Search Engine Backend',
				link: '/cluster/configure-search-engine-backend',
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
			{
				label: 'AI Insights',
				link: '/cluster/ai-insights',
				hasExactPath: true,
			},
			{
				label: 'Pipelines Insights',
				link: '/cluster/pipeline-insights',
				hasExactPath: true,
			},
			{ label: 'Cluster Monitoring', link: '/cluster/monitoring', hasExactPath: true },
			{
				label: 'Data Usage',
				link: '/cluster/data-usage',
				hasExactPath: true,
			},
		],
	},
	Speed: {
		icon: 'thunderbolt',
		action: ALLOWED_ACTIONS.SPEED,
		menu: [{ label: 'Cache', link: '/cluster/cache', hasExactPath: true }],
	},
	'Access Control': {
		icon: 'key',
		action: ALLOWED_ACTIONS.ACCESS_CONTROL,
		menu: [
			{
				label: 'User Management',
				link: '/cluster/user-management',
				hasExactPath: true,
			},
			{ label: 'API Credentials', link: 'credentials' },
			{
				label: 'Role Based Access',
				link: '/cluster/role-based-access',
				hasExactPath: true,
			},
			{
				label: 'Node Sync Preferences',
				link: '/cluster/sync-preferences',
				hasExactPath: true,
			},
		],
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
		action: ALLOWED_ACTIONS.OVERVIEW,
	},
	'UI Builder': {
		icon: 'control',
		action: ALLOWED_ACTIONS.UI_BUILDER,
		menu: [
			{ label: 'Search', link: '/cluster/search-builder' },
			{
				label: 'Recommendations',
				link: '/cluster/recommendations-builder',
			},
			{
				label: 'Searchbox',
				link: '/cluster/searchboxes',
			},
			{ label: 'End-user Authentication', link: '/cluster/search-auth-settings' },
		],
	},
	Data: {
		icon: 'dashboard',
		action: ALLOWED_ACTIONS.DEVELOP,
		menu: [
			{ label: 'Import Data', link: 'import', openIndexMenu: true },
			{ label: 'Browse Data', link: 'browse', openIndexMenu: true },
			{ label: 'Request Logs', link: '/cluster/request-logs' },
			{
				label: 'Search Preview',
				link: 'search-preview',
				openIndexMenu: true,
			},
			{ label: 'Stored Queries', link: '/cluster/stored-queries' },
		],
	},
	'Search Relevance': {
		icon: 'search',
		action: ALLOWED_ACTIONS.SEARCH_RELEVANCY,
		menu: [
			{
				label: 'Language Settings',
				link: 'languages',
				openIndexMenu: true,
			},
			{ label: 'Search Settings', link: 'search', openIndexMenu: true },
			{
				label: 'Suggestions Settings',
				link: '/cluster/suggestions',
			},
			{
				label: 'Aggregation Settings',
				link: 'aggs',
				openIndexMenu: true,
			},
			{ label: 'Result Settings', link: 'results', openIndexMenu: true },
			{
				label: 'Index Settings',
				link: 'index-settings',
				openIndexMenu: true,
			},
			{ label: 'Schema', link: 'schema', openIndexMenu: true },
			{ label: 'Synonyms', link: 'synonyms', openIndexMenu: true },
			{ label: 'Query Rules', link: '/cluster/rules' },
		],
	},
	'AI Search': {
		icon: 'robot',
		action: ALLOWED_ACTIONS.UI_BUILDER,
		menu: [
			{
				label: 'AI Preferences',
				link: '/cluster/ai-preferences',
			},
			{
				label: 'FAQs',
				link: '/cluster/ai-faqs',
			},
		],
	},
	Pipelines: {
		icon: 'deployment-unit',
		action: ALLOWED_ACTIONS.PIPELINES,
		menu: [
			{
				label: 'View All Pipelines',
				link: '/cluster/pipelines',
			},
			{
				label: 'Global Envs',
				link: '/cluster/global-envs',
			},
			{
				label: 'Search Engine Backend',
				link: '/cluster/configure-search-engine-backend',
			},
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
			{
				label: 'AI Insights',
				link: '/cluster/ai-insights',
			},
			{
				label: 'Pipelines Insights',
				link: '/cluster/pipeline-insights',
			},
			{ label: 'Cluster Monitoring', link: '/cluster/monitoring' },
			{
				label: 'Data Usage',
				link: '/cluster/data-usage',
				hasExactPath: true,
			},
		],
	},
	Speed: {
		icon: 'thunderbolt',
		action: ALLOWED_ACTIONS.SPEED,
		menu: [{ label: 'Cache', link: '/cluster/cache' }],
	},
	'Access Control': {
		icon: 'key',
		action: ALLOWED_ACTIONS.ACCESS_CONTROL,
		menu: [
			{
				label: 'User Management',
				link: '/cluster/user-management',
			},
			{ label: 'API Credentials', link: '/cluster/credentials' },
			{ label: 'Role Based Access', link: '/cluster/role-based-access' },
			{
				label: 'Node Sync Preferences',
				link: '/cluster/sync-preferences',
			},
		],
	},
	Billing: {
		icon: 'credit-card',
		action: ALLOWED_ACTIONS.BILLING,
		link: '/cluster/billing',
	},
};
