export default {
	location: {
		type: 'geo_point',
	},
	magnitude: {
		type: 'double',
	},
	place: {
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
	time: {
		type: 'date',
	},
	year: {
		type: 'integer',
	},
};
