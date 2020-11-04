import React from 'react';

export const relevancyTitles = {
	language: 'Language Settings',
	search: 'Search Settings',
	indexSettings: 'Index Settings',
	aggregations: 'Aggregation Settings',
	results: 'Result Settings',
	synonyms: 'Synonyms Settings',
};

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
		title: 'Enable N gram',
		description:
			'appbase.io adds an n-grams tokenizer to enable partial infix matching of search terms, but this comes with a substantial storage increase. By disabling n-grams, you can make significant storage savings.',
	},
};

export default settingsMap;
