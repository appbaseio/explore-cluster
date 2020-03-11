export const settingsMap = {
	size: {
		title: 'Page Size',
		description: 'No of results shown in a page.',
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
		description: 'Whether highlighting should be enabled in the search results.',
	},
	highlightFields: {
		title: 'Highlight Fields',
		description: 'Specifying the fields which should be returned with the matching highlights.',
	},
	highlightOptions: {
		title: 'Highlight Options',
		description:
			'Set custom options for your highlight results such as number_of_fragments, fragment_size, pre_tags and post_tags',
	},
	language: {
		title: 'Language',
		description:
			'Sets the languages at the index level for language-specific processing such as tokenization and normalization.',
	},
	applyStopwords: {
		title: 'Apply Default Stopwords',
		description: 'Sets whether to apply default stopwords for language or not',
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
		description: 'Parses accents of a language.',
	},
};
