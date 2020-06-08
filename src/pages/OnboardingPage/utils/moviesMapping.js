export default {
	properties: {
		genres: {
			type: 'text',
			fields: {
				autosuggest: {
					type: 'text',
					analyzer: 'autosuggest_analyzer',
					search_analyzer: 'standard',
				},
				keyword: {
					type: 'keyword',
				},
				search: {
					type: 'text',
					analyzer: 'ngram_analyzer',
					search_analyzer: 'standard',
				},
			},
			analyzer: 'standard',
		},
		original_language: {
			type: 'text',
			fields: {
				autosuggest: {
					type: 'text',
					analyzer: 'autosuggest_analyzer',
					search_analyzer: 'standard',
				},
				keyword: {
					type: 'keyword',
				},
			},
			analyzer: 'standard',
		},
		original_title: {
			type: 'text',
			fields: {
				autosuggest: {
					type: 'text',
					analyzer: 'autosuggest_analyzer',
					search_analyzer: 'standard',
				},
				keyword: {
					type: 'keyword',
				},
				search: {
					type: 'text',
					analyzer: 'ngram_analyzer',
					search_analyzer: 'standard',
				},
			},
			analyzer: 'standard',
		},
		overview: {
			type: 'text',
			fields: {
				autosuggest: {
					type: 'text',
					analyzer: 'autosuggest_analyzer',
					search_analyzer: 'standard',
				},
				keyword: {
					type: 'keyword',
				},
				search: {
					type: 'text',
					analyzer: 'ngram_analyzer',
					search_analyzer: 'standard',
				},
			},
			analyzer: 'standard',
		},
		poster_path: {
			type: 'text',
			fields: {
				autosuggest: {
					type: 'text',
					analyzer: 'autosuggest_analyzer',
					search_analyzer: 'standard',
				},
				keyword: {
					type: 'keyword',
				},
			},
			analyzer: 'standard',
		},
		release_year: {
			type: 'integer',
		},
		tagline: {
			type: 'text',
			fields: {
				autosuggest: {
					type: 'text',
					analyzer: 'autosuggest_analyzer',
					search_analyzer: 'standard',
				},
				keyword: {
					type: 'keyword',
				},
				search: {
					type: 'text',
					analyzer: 'ngram_analyzer',
					search_analyzer: 'standard',
				},
			},
			analyzer: 'standard',
		},
	},
};
