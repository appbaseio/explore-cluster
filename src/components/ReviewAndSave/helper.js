const settingsMap = {
	size: {
		title: 'Page Size',
		description: 'Number of results to show in a page',
	},
	includeFields: {
		title: 'Include Fields',
		description: 'Fields to include in the search results',
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
	language: {
		title: 'Language',
		description: 'Set the search engine language for this index. Defaults to Universal.',
	},
	applyStopwords: {
		title: 'Apply Default Stopwords',
		description: 'Enable or disable application of default stopwords. Enabled by default.',
	},
	customStopwords: {
		title: 'Apply Custom Stopwords',
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
};

export { settingsMap };
