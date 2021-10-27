export default {
	properties: {
		brand: {
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
		categories: {
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
		crawl_timestamp: {
			type: 'date',
			format: 'strict_date_optional_time',
		},
		description: {
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
		discounted_price: {
			type: 'integer',
		},
		image: {
			type: 'text',
			fields: {
				keyword: {
					type: 'keyword',
				},
			},
			analyzer: 'standard',
		},
		is_FK_Advantage_product: {
			type: 'boolean',
		},
		overall_rating: {
			type: 'double',
		},
		pid: {
			type: 'text',
			fields: {
				keyword: {
					type: 'keyword',
				},
			},
			analyzer: 'standard',
		},
		product_name: {
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
		product_rating: {
			type: 'double',
		},
		product_url: {
			type: 'text',
			fields: {
				keyword: {
					type: 'keyword',
				},
			},
			analyzer: 'standard',
		},
		retail_price: {
			type: 'integer',
		},
		'specifications.key': {
			type: 'text',
			fields: {
				keyword: {
					type: 'keyword',
				},
			},
			analyzer: 'standard',
		},
		'specifications.value': {
			type: 'text',
			fields: {
				keyword: {
					type: 'keyword',
				},
			},
			analyzer: 'standard',
		},
		uniq_id: {
			type: 'text',
			fields: {
				keyword: {
					type: 'keyword',
				},
			},
			analyzer: 'standard',
		},
	},
};
