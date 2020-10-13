const sampleData = [
	{
		id: 'no_results',
		insight: {
			title: 'There are 54 no result searches',
			description: 'This is the most important issue for a search engine to avoid.',
			recommendations: [
				{
					title: 'Language Settings',
					description:
						"If you're using a specific language, make sure the language, stemming and stop words are configured in the Language menu.",
					short_link: 'app/:index/language',
					long_link: '',
				},
				{
					title: 'Search Settings',
					description:
						'Make sure all the searchable fields and typo tolerance setting is set correctly.',
					short_link: 'app/:index/search',
					long_link: '',
				},
				{
					title: 'Synonyms',
					description:
						'Set synonyms for search terms that are present in your index as different terms.',
					short_link: '',
					long_link: '',
				},
				{
					title: 'Query Rules',
					description: 'Create a query rule for the specific search terms.',
					short_link: '',
					long_link: '',
				},
			],
		},
	},
	{
		id: 'low_clicks',
		insight: {
			title: 'Less than 65% of your searches have a click',
			description: 'Search Relevancy needs fixing.',
			recommendations: [
				{
					title: 'Language Settings',
					description:
						"If you're using a specific language, make sure the language, stemming and stop words are configured in the Language menu.",
					short_link: '',
					long_link: '',
				},
				{
					title: 'Search Settings',
					description:
						'Make sure all the searchable fields and typo tolerance setting is set correctly.',
					short_link: '',
					long_link: '',
				},
				{
					title: 'Synonyms',
					description:
						'Set synonyms for search terms that are present in your index as different terms.',
					short_link: '',
					long_link: '',
				},
				{
					title: 'Query Rules',
					description: 'Create a query rule for the specific search terms.',
					short_link: '',
					long_link: '',
				},
				{
					title: 'Popular suggestions',
					description: '',
					short_link: '',
					long_link: '',
				},
				{
					title: 'Tune Popular suggestions',
					description: '',
					short_link: '',
					long_link: '',
				},
			],
		},
	},
];

export default sampleData;
