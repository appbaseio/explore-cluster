import React from 'react';

export const relevancyTitles = {
	language: 'Language Settings',
	search: 'Search Settings',
	indexSettings: 'Index Settings',
	aggregations: 'Aggregation Settings',
	results: 'Result Settings',
	synonyms: 'Synonyms Settings',
	popularSuggestions: 'Suggestions Settings / Popular Suggestions',
	recentSuggestions: 'Suggestions Settings / Recent Suggestions',
	indexSuggestions: 'Suggestions Settings / Index Suggestions',
	ecommercePlatform: 'E-Commerce Platform',
	layoutAndDesign: 'Layout and Design',
	searchSettings: 'Search Settings',
	codeSettings: 'Code Settings',
	exportSettings: 'Export Settings',
	generalSettings: 'General Settings',
	resultSettings: 'Result Settings',
};

const settingsMap = {
	categoryFields: {
		title: 'Category Fields',
		description:
			'When specified, suggestions will show category specific suggestions based on the most frequent values based on this field.',
	},
	indices: {
		title: 'Indices',
		description: 'Only selected indices will be considered to calculate the suggestions.',
	},
	includeFields: {
		title: 'Include Fields',
		description: 'Fields to include in the search results',
	},

	rankFeature: {
		title: 'Boost search relevancy',
		description: 'Using the rank feature you can boost the search relevancy',
	},
	excludeFields: {
		title: 'Exclude Fields',
		description: 'Fields to exclude from the search results',
	},
	highlight: {
		title: 'Highlight',
		description: 'Whether highlighting should be enabled in the search results',
	},
	highlightTag: {
		title: 'Highlight Tag',
		description: 'Enter the highlight tag that should be returned, e.g. <mark> or <em>',
	},
	highlightFragment: {
		title: 'Highlight Fragment Size',
		description: 'The size of the highlighted fragment in characters',
	},
	highlightTotalFragments: {
		title: 'Number of Fragments',
		description:
			'Maximum number of fragments to return. If set to 0, no fragments are returned.',
	},
	highlightFields: {
		title: 'Highlight Fields',
		description: 'Specify the fields that should be highlighted',
	},
	highlightOptions: {
		title: 'Highlight Options',
		description:
			'Set custom options for your highlight results such as number_of_fragments, fragment_size, pre_tags and post_tags.',
	},
	sortOptions: {
		title: 'Sort Results By',
		description: `It creates a sorting view in the results list component's UI`,
	},
	language: {
		title: 'Language',
		description: 'Set the search engine language for this index. Defaults to Universal.',
	},
	applyStopwords: {
		title: 'Apply Default Stopwords',
		description: 'Enable or disable application of default stopwords. Enabled by default.',
	},
	customStopwords: {
		title: 'Set Custom Stopwords',
		description:
			'Set comma separated stopwords to be ignored during the language specifc analysis process.',
	},
	stemmingExceptions: {
		title: 'Stemming Exceptions',
		description: "Set words that are excluded from your language's stemming process.",
	},
	normalizeDiacritics: {
		title: 'Normalize Diacritics',
		description: 'Enabling this will normalize diacritics for your language.',
	},
	fieldWeights: {
		title: 'Field Weights',
		description: 'Search weight for the database fields.',
	},
	number_of_fragments: {
		title: 'Number of Fragments',
		description:
			'Maximum number of fragments to return. If set to 0, no fragments are returned.',
	},
	fragment_size: {
		title: 'Highlight Fragment Size',
		description: `The size of the highlighted fragment in characters`,
	},
	enableSynonyms: {
		title: `Synonyms`,
		description: `Enable/Disable synonyms for better searching across similar words`,
	},
	highlight_tag: {
		title: 'Highlight Tag',
		description: `Highlight tag that should be returned, e.g. <mark> or <em>`,
	},
	dataField: {
		title: 'DataField',
		description: 'Database field(s) to be queried against.',
	},
	searchOperators: {
		title: 'Search Operators',
		description:
			'Enable or disable use of search operators (e.g. +, |, *, -) for an advanced search behavior.',
	},
	includeNullValues: {
		title: 'Include Null Values',
		description:
			'Enable to show sparse data or document or items not having the value in the specified field or mapping',
	},
	enableTypoTolerance: {
		title: 'Enable Typo Tolerance',
		description: 'Enable or disable typo tolerance for search',
	},
	typoToleranceValue: {
		title: 'Typo Tolerance',
		description:
			'Set the maximum typo tolerance of characters to handle per word. Value can be set to auto, or can be specific value like 1 or 2.',
	},
	sortBy: {
		title: 'Sort By',
		description: 'Sort the results by either Count, Ascending or Descending order.',
	},
	agg_size: {
		title: 'Size',
		description: 'Number of items to show.',
	},
	field_weight: {
		title: 'Field Weight',
		description:
			'Set the search weight to boost query matches against this field. Higher weight fields imply a higher boost.',
	},
	agg_type: {
		title: 'Aggregation Type',
		description:
			'Set the aggregation type for the fields. Only fields with their type set appear in the "Test Search Relevancy" UI view.',
	},
	set_search: {
		title: 'Set Search',
		description: 'Set search settings and fields to enhance Search behavior.',
	},
	set_result: {
		title: 'Set Result View',
		description: 'Set result settings to enhance Result behavior.',
	},
	set_aggs: {
		title: 'Set Aggregations',
		description: 'Set aggregations field for better filtering of results.',
	},
	disable_search_settings: {
		description: `Certain actions require a save before they're applied in Search Preview.`,
	},
	synonyms: {
		description: 'Enable synonyms for better searching across similar words',
	},
	fuzziness: {
		title: 'Typo Tolerance',
		description:
			'Set the maximum typo tolerance of characters to handle per word. Value can be set to auto, or can be specific value like 1 or 2.',
	},
	queryString: {
		title: 'Query String',
		description: (
			<React.Fragment>
				<p style={{ fontSize: 15 }}>
					If set to <strong>true</strong> than it allows you to create a complex search
					that includes wildcard characters, searches across multiple fields, and more.{' '}
					<a
						href="https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-query-string-query.html"
						target="_blank"
						rel="noopener noreferrer"
					>
						Learn More.
					</a>
				</p>
			</React.Fragment>
		),
	},
	queryFormat: {
		title: 'Query Format',
		description: (
			<React.Fragment>
				<p style={{ fontSize: 15 }}>
					Sets the query format, can be <strong>or</strong> or <strong>and</strong>.
					Defaults to <strong>or</strong>.
				</p>
				<ul>
					<li>
						<strong>or</strong> returns all the results matching any of the search query
						text&apos;s parameters. For example, searching for &quot;bat man&quot; with
						or will return all the results matching either &quot;bat&quot; or
						&quot;man&quot;.
					</li>
					<li>
						On the other hand with <strong>and</strong>, only results matching both
						&quot;bat&quot; and &quot;man&quot; will be returned. It returns the results
						matching all of the search query text&apos;s parameters.
					</li>
				</ul>
			</React.Fragment>
		),
	},
	queryType: {
		title: 'Query Type',
		description:
			'Query type determines the query DSL to be used. It defaults to ReactiveSearch.',
	},
	enableNgram: {
		title: 'Enable N-gram (infix) search',
		description:
			'appbase.io adds an n-gram tokenizer to enable partial infix matching of search terms, but this comes with a substantial storage increase. By disabling n-gram search, you can save significant storage space.',
	},
	enableAutoSuggestion: {
		title: 'Enable Autosuggestion (prefix) search',
		description:
			'appbase.io adds an edge n-grams tokenizer to enable prefix matching of search terms, but this comes with a substantial storage increase. By disabling autosuggestions search, you can save significant storage space.',
	},
	ngramSettings: {
		title: 'N-gram settings',
		description:
			'Configure min-gram (minimum characters to index infixes for) and max-gram (maximum characters to index infixes for) values to fine tune how infix search should work.',
	},
	autosuggestionSettings: {
		title: 'Autosuggestion settings',
		description:
			'Configure min-gram (minimum characters to index prefixes for) and max-gram (maximum characters to index prefixes for) values to fine tune how autosuggestion search should work.',
	},
	distinctField: {
		title: 'Distinct Field',
		description: (
			<>
				<p style={{ fontSize: 15 }}>
					This property returns only the distinct value documents for the specified field.
					It is equivalent to the DISTINCT clause in SQL. It internally uses the collapse
					feature of Elasticsearch. You can read more about it over{' '}
					<a
						href="https://docs.appbase.io/docs/search/reactivesearch-api/reference/#distinctfield"
						target="_blank"
						rel="noopener noreferrer"
					>
						here
					</a>
					.
				</p>
			</>
		),
	},
	showDistinctSuggestions: {
		title: 'Show Distinct Suggestions',
		description:
			'When set to true, returns only up to 1 suggestion per document. When set to false, multiple suggestions can be shown when relevant from the same document.',
	},
	enablePredictiveSuggestions: {
		title: 'Enable Predictive Suggestions',
		description:
			"When set to true, it predicts the next relevant words from a fields value based on the search query typed by the user. If set to false (default), the entire field's value would be displayed.",
	},
	maxPredictedWords: {
		title: 'Max Predicted Words',
		description: 'Set the maximum number of predicted words.',
	},
	size: {
		title: 'Size',
		description: 'Set the maximum number of results to be returned.',
	},
	categoryField: {
		title: 'Category Field',
		description:
			'When specified, suggestions will show category specific suggestions based on the most frequent values based on this field.',
	},
	urlField: {
		title: 'URL',
		description:
			'When specified, suggestions will redirect to the URL value based on this field.',
	},
	customQuery: {
		title: 'Custom Query',
		description:
			'Specify a custom stored query to execute instead of the pre-tuned suggestions query.',
	},
	minHits: {
		title: 'Min Hits',
		description:
			'Set the minimum number of hits that must be returned for a suggestion term to be considered.',
	},
	minChars: {
		title: 'Min Characters',
		description:
			'Set the minimum number of characters that must be present for a suggestion term to be considered.',
	},
	numberOfDays: {
		title: 'Number of days',
		description:
			'Set the duration of days for which to populate the popular suggestions index.',
	},
	minCount: {
		title: 'Min Count',
		description:
			'Set the minimum number of times a term must be searched by users before it is considered.',
	},
	transformDiacritics: {
		title: 'Transform Diacritics',
		description:
			'When enabled, suggestion terms will be transformed to remove the diacritics from them.',
	},
	blacklist: {
		title: 'Blacklist',
		description:
			'A list of suggestion terms to be ignored when populating the popular suggestions index.',
	},
	externalSuggestions: {
		title: 'External Suggestions',
		description: 'Define your custom suggestions.',
	},
	exportType: {
		title: 'Choose e-commerce platform',
		description: '',
	},
	syncSettings: {
		title: 'Sync Settings',
		description: '',
	},
	storeInfo: {
		title: 'Store Info',
		description: 'Set currency',
	},
	searchLayout: {
		title: 'Search Layout',
		description: '',
	},
	branding: {
		title: 'Branding',
		description: 'Logo and placement',
	},
	stylePresets: {
		title: 'Style Presets',
		description: '',
	},
	customCSS: {
		title: 'Custom CSS',
		description: 'Apply custom CSS classes',
	},
	autosuggest: {
		title: 'Search / Show Autosuggestions',
		description: '',
	},
	enablePopularSuggestions: {
		title: 'Search / Show Popular suggestions (based on analytics data)',
		description: '',
	},
	enableRecentSearches: {
		title: 'Search / Show recent suggestions (based on analytics data)',
		description: '',
	},
	showVoiceSearch: {
		title: 'Search / Enable Voice Search',
		description: '',
	},
	staticFilters: {
		title: 'Filters / Static Filters',
		description: 'Static Filters',
	},
	dynamicFacets: {
		title: 'Filters / Custom Filters',
		description: 'Custom filter(s) set based on the schema',
	},
	csbID: {
		title: 'Codesandbox ID',
		description: 'Persisted codesandbox.io editor Id',
	},
	exportAs: {
		title: 'Export Mode',
		description: 'Your code export mode',
	},
	openAsPage: {
		title: 'Open As Page',
		description: 'Open search as a page',
	},
	name: {
		title: 'Name',
		description: '',
	},
	pipeline: {
		title: 'Pipeline',
		description: '',
	},
	description: {
		title: 'Description',
		description: '',
	},
	credentials: {
		title: 'Credentials',
		description: '',
	},
	showSelectedFilters: {
		title: 'Show Selected Filters',
		description: '',
	},
	pagination: {
		title: 'Pagination',
		description: '',
	},
	infiniteScroll: {
		title: 'Infinite Scroll',
		description: '',
	},
	sortOptionSelector: {
		title: 'Sort Options Selector',
		description: '',
	},
	resultHighlight: {
		title: 'Result Highlight',
		description: '',
	},
	layout: {
		title: 'Layout',
		description: '',
	},
	viewSwitcher: {
		title: 'View Switcher',
		description: '',
	},
	title: {
		title: 'Title',
		description: '',
	},
	price: {
		title: 'Price',
		description: '',
	},
	image: {
		title: 'Image',
		description: '',
	},
	handle: {
		title: 'Handle',
		description: '',
	},
	noSuggestion: {
		title: 'No Suggestions',
		description: '',
	},
	noResults: {
		title: 'Search Button Text',
		description: '',
	},
	searchButton: {
		title: 'Search Button Text',
		description: '',
	},
	searchIcon: {
		title: 'Search Icon',
		description: '',
	},
	redirectUrlText: {
		title: 'Redirect Url Text',
		description: '',
	},
	redirectUrlIcon: {
		title: 'Redirect Url Icon',
		description: '',
	},
	resultStats: {
		title: 'Result Stats',
		description: '',
	},
	mapLayout: {
		title: 'Map Layout',
		description: '',
	},
	mapComponent: {
		title: 'Map Component',
		description: '',
	},
	defaultZoom: {
		title: 'Default Zoom',
		description: '',
	},
	showSearchAsMove: {
		title: 'Show search as move',
		description: '',
	},
	mapsAPIkey: {
		title: 'Maps API key',
		description: '',
	},
	showMarkerClusters: {
		title: 'Show marker clusters',
		description: '',
	},
	locationDataField: {
		title: 'Location',
		description: '',
	},
	productTypeFilter: {
		title: 'Filters / Show product type filter',
		description: 'Applicable for Shopify storefront search',
	},
	collectionsFilter: {
		title: 'Filters / Show collections filter',
		description: '',
	},
	sizeFilter: {
		title: 'Filters / Show size filter',
		description: '',
	},
	colorFilter: {
		title: 'Filters / Show color filter',
		description: '',
	},
	priceFilter: {
		title: 'Filters / Show price filter',
		description: '',
	},
};

export default settingsMap;
