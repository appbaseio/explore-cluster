export const settingsMap = {
	size: {
		title: 'Page Size',
		description: 'Number of results shown in a page.',
	},
	includeFields: {
		title: 'Include Fields',
		description: 'Fields to include in the search results',
	},
	excludeFields: {
		title: 'Exclude Fields',
		description: 'Fields to exclude from the search results.',
	},
	highlight: {
		title: 'Highlight',
		description: 'Whether highlighting should be enabled in the search results.',
	},
	highlightFields: {
		title: 'Highlight Fields',
		description: 'Specifying the fields which should be returned with the matching highlights.',
	},
	highlightOptions: {
		title: 'Highlight Options',
		description:
			'Set custom options for your highlight results such as number_of_fragments, fragment_size, pre_tags and post_tags.',
	},
	language: {
		title: 'Language',
		description:
			'Sets the languages at the index level for language-specific processing such as tokenization and normalization.',
	},
	applyStopwords: {
		title: 'Apply Default Stopwords',
		description: 'Sets whether to apply default stopwords for language or not.',
	},
	customStopwords: {
		title: 'Apply Custom Stopwords',
		description: 'Removes these words from query before searching.',
	},
	stemmingExceptions: {
		title: 'Stemming Exceptions',
		description: 'Words which should be excluded from stemming.',
	},
	normalizeDiacritics: {
		title: 'Normalize Diacritics',
		description: 'Removes accents/diacritics from search string.',
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
			'Enable use of special characters in the search query to enable an advanced search behavior.',
	},
	includeNullValues: {
		title: 'Include Null Values',
		description:
			'Enable to show sparse data or document or items not having the value in the specified field or mapping',
	},
	fuzziness: {
		title: 'Typo Tolerance',
		description: 'Sets a maximum edit distance on the search parameters.',
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
		description: 'Set the search weight for the database fields.',
	},
	agg_type: {
		title: 'Aggregation Type',
		description: 'Set the aggregation type for the database fields.',
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
};
