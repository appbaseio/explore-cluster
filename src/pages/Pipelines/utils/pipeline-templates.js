export default {
	'Basic Template': {
		enabled: true,
		description: 'Template to create a pipeline',
		routes: [
			{
				path: '/basic/_reactivesearch',
				method: 'POST',
				classify: {
					category: 'reactivesearch',
				},
			},
		],
		envs: {
			index: ["good-books-ds"]
		},
		stages: [
			{
				id: 'auth',
				use: 'authorization',
			},
			{
				id: 'modify request',
				scriptRef: 'modify_request',
				scriptContent:
					"function handleRequest() { const reqBody = JSON.parse(context.request.body); return { ...context, request: {...context.request, body: JSON.stringify({...reqBody, query: [...reqBody.query, {id: 'search2'}]})}}; }",
			},
			{
				id: 'query',
				use: 'reactivesearchQuery',
				continueOnError: false
			},
			{
				id: 'es_query',
				use: 'elasticsearchQuery',
				continueOnError: false
			},
		],
	},
	'Knowledge Graph': {
		enabled: true,
		description:
			'Pipeline to retrieve and merge Google knowledge graph response to ES response',
		routes: [
			{
				path: '/knowledge_graph/_reactivesearch',
				method: 'POST',
				classify: {
					category: 'reactivesearch',
				},
			},
		],
		envs: {
			category: 'reactivesearch',
			index: ['test'],
			knowledgeGraphAPIKey: 'REDACTED_GOOGLE_API_KEY',
		},
		stages: [
			{
				use: 'authorization',
			},
			{
				id: 'modify_request',
				scriptRef: 'modify_request',
				scriptContent:
					"function handleRequest() { const reqBody = JSON.parse(context.request.body); return { request: {...context.request, body: JSON.stringify({...reqBody, query: [...reqBody.query, {id: 'search2'}]})}}; }",
			},
			{
				use: 'reactivesearchQuery',
			},
			{
				id: 'google_knowledge_graph',
				needs: ['extract user passed query'],
				async: true,
				scriptRef: 'google_knowledge_graph',
				scriptContent:
					// eslint-disable-next-line no-template-curly-in-string
					'async function handleRequest() { try { const URL = `https://kgsearch.googleapis.com/v1/entities:search?query=${context.envs.query}&key=${context.envs.knowledgeGraphAPIKey}&limit=1&indent=True`; const responseBody = await fetch(URL); const response = await responseBody.json(); return { knowledge_graph: response }} catch(e) {} return context; }',
			},
			{
				use: 'elasticsearchQuery',
				async: true,
			},
			{
				id: 'merge_response',
				needs: ['elasticsearchQuery', 'google_knowledge_graph'],
				scriptRef: 'merge_response',
				scriptContent:
					"function handleRequest() { const esResponse = JSON.parse(context.elasticsearchQuery); const knowledgeGraph = context['knowledge_graph']; return { ...context, response: { ...context.response, body: JSON.stringify({ ...esResponse, knowledgeGraph })}}}",
			},
		],
	},
	'Saved Search': {
		enabled: true,
		description: 'Pipeline to save search to an Elasticsearch index',
		routes: [
			{
				path: '/saved_search/_reactivesearch',
				method: 'POST',
				classify: {
					category: 'reactivesearch',
				},
			},
		],
		envs: {
			category: 'reactivesearch',
			index: ['good-books-ds-pipeline'],
			saved_search_index: 'savedsearch',
			saved_search_credentials: 'REDACTED_CREDENTIALS',
		},
		stages: [
			{
				use: 'authorization',
			},
			{
				id: 'modify_request',
				scriptRef: 'modify_request',
				scriptContent:
					"function handleRequest() { const reqBody = JSON.parse(context.request.body); return { request: {...context.request, body: JSON.stringify({...reqBody, query: [...reqBody.query, {id: 'search2'}]})}}; }",
			},
			{
				id: 'save_search',
				async: true,
				scriptRef: 'save_search',
				scriptContent:
					// eslint-disable-next-line no-template-curly-in-string
					"async function handleRequest() { try { const res = await fetch(`http://${context.envs.origin}/${context.envs.saved_search_index}/_doc`, {method: 'POST', body: context.request.body, headers: {'Content-Type': 'application/json', 'Authorization': `Basic ${btoa(context.envs.saved_search_credentials)}`} }); } catch(e) { console.log('error', e); } return {}; }",
			},
			{
				use: 'reactivesearchQuery',
				needs: ['save_search'],
			},
			{
				use: 'elasticsearchQuery',
			},
		],
	},
	'Script with error response handling': {
		enabled: true,
		description: 'Pipeline to handle script errors using throw',
		routes: [
			{
				path: 'good-books-ds-pipeline/_reactivesearch',
				method: 'POST',
				classify: {
					category: 'reactivesearch',
				},
			},
		],
		envs: {
			category: 'reactivesearch',
			index: ['good-books-ds-pipeline'],
		},
		stages: [
			{
				id: 'custom_script_error',
				continueOnError: false,
				scriptRef: 'custom_script_error',
				scriptContent: "function handleRequest() { throw Error('custom error message'); }",
			},
			{
				use: 'searchRelevancy',
				inputs: {
					search: {
						dataField: ['original_title'],
						size: 1,
					},
					suggestion: {
						dataField: ['original_title'],
						enablePopularSuggestions: true,
						size: 3,
						popularSuggestionsConfig: {
							size: 1,
						},
						enableRecentSuggestions: true,
						recentSuggestionsConfig: {
							size: 1,
						},
					},
				},
				continueOnError: false,
			},
			{
				use: 'reactivesearchQuery',
				continueOnError: false,
			},
			{
				use: 'elasticsearchQuery',
				continueOnError: false,
			},
			{
				use: 'recordAnalytics',
			},
		],
	},
	'Script with caching + analytics': {
		enabled: true,
		description: 'Pipeline to record cache with analytics',
		routes: [
			{
				path: 'good-books-ds-pipeline/_reactivesearch',
				method: 'POST',
				classify: {
					category: 'reactivesearch',
				},
			},
		],
		envs: {
			category: 'reactivesearch',
			index: ['good-books-ds-pipeline'],
			urlValues: {
				cache: true,
			},
		},
		stages: [
			{
				id: 'mock-request-body',
				description: 'Mocks the request body',
				scriptRef: 'mock-request-body',
				scriptContent:
					"function handleRequest() { return { request: {...context.request, body: JSON.stringify({ query: [{ id: 'search', value: 'harry', dataField: 'original_title'}], settings: { recordAnalytics: true } })}}}",
				continueOnError: false,
			},
			{
				use: 'searchRelevancy',
				inputs: {
					search: {
						dataField: ['original_title'],
						size: 1,
					},
					suggestion: {
						dataField: ['original_title'],
						enablePopularSuggestions: true,
						size: 3,
						popularSuggestionsConfig: {
							size: 1,
						},
						enableRecentSuggestions: true,
						recentSuggestionsConfig: {
							size: 1,
						},
					},
				},
				continueOnError: false,
			},
			{
				use: 'useCache',
			},
			{
				use: 'reactivesearchQuery',
				continueOnError: false,
			},
			{
				use: 'elasticsearchQuery',
				continueOnError: false,
			},
			{
				use: 'recordAnalytics',
			},
		],
	},
	'Script with pre-built stages': {
		enabled: true,
		description: 'Pipeline to use elasticsearch query stage multiple times',
		routes: [
			{
				path: '/good-books-ds-pipeline/_reactivesearch',
				method: 'POST',
				classify: {
					category: 'reactivesearch',
				},
			},
		],
		envs: {
			category: 'reactivesearch',
			index: ['good-books-ds-pipeline'],
		},
		stages: [
			{
				use: 'authorization',
				continueOnError: false,
			},
			{
				use: 'searchRelevancy',
				inputs: {
					search: {
						dataField: ['original_title'],
						size: 1,
					},
					suggestion: {
						dataField: ['original_title'],
						enablePopularSuggestions: true,
						size: 3,
						popularSuggestionsConfig: {
							size: 1,
						},
						enableRecentSuggestions: true,
						recentSuggestionsConfig: {
							size: 1,
						},
					},
				},
				continueOnError: false,
			},
			{
				use: 'reactivesearchQuery',
				continueOnError: false,
			},
			{
				id: 'get_es_index',
				scriptRef: 'get_es_index',
				scriptContent: "function handleRequest() { return {'es_index': 'good-books-ds'}}",
			},
			{
				id: 'search_books',
				use: 'elasticsearchQuery',
				async: true,
				inputs: {
					method: 'POST',
					url: 'https://REDACTED_USERNAME:REDACTED_PASSWORD@appbase-demo-ansible-abxiydt-es.searchbase.io/good-books-ds/_search',
					body: '{"query": {"match_all": {}}, "size": 5}',
					headers: {
						'Content-Type': 'application/json',
					},
					parseResponseToReactivesearch: false,
				},
				continueOnError: false,
			},
			{
				use: 'elasticsearchQuery',
				inputs: {
					path: '/{{es_index}}/_msearch',
				},
				continueOnError: false,
			},
			{
				id: 'merge',
				needs: ['search_books'],
				scriptRef: 'merge',
				scriptContent: 'function handleRequest() { return {}; }',
			},
			{
				use: 'recordAnalytics',
			},
		],
	},
	'Script with query rules': {
		enabled: true,
		description: 'Pipeline to use query rules pre-built stages',
		routes: [
			{
				path: '/good-books-ds-pipeline/_reactivesearch',
				method: 'POST',
				classify: {
					category: 'reactivesearch',
				},
			},
		],
		envs: {
			category: 'reactivesearch',
			index: ['good-books-ds-pipeline'],
		},
		stages: [
			{
				use: 'authorization',
				continueOnError: false,
			},
			{
				id: 'mock-request-body',
				description: 'Mocks the request body',
				scriptRef: 'mock-request-body',
				scriptContent:
					"function handleRequest() { return { request: {...context.request, body: JSON.stringify({ query: [{ id: 'search', value: 'harry', dataField: 'original_title'}], settings: { recordAnalytics: true } })}}}",
				continueOnError: false,
			},
			{
				use: 'searchRelevancy',
				inputs: {
					search: {
						dataField: ['original_title'],
						size: 1,
					},
					suggestion: {
						dataField: ['original_title'],
						enablePopularSuggestions: true,
						size: 3,
						popularSuggestionsConfig: {
							size: 1,
						},
						enableRecentSuggestions: true,
						recentSuggestionsConfig: {
							size: 1,
						},
					},
				},
				continueOnError: false,
			},
			{
				use: 'replaceSearchTerm',
				description: "Replace query to 'paradise test query'",
				inputs: {
					data: 'paradise test query',
				},
				continueOnError: false,
			},
			{
				use: 'removeWords',
				description: "Removes 'test' word from query",
				inputs: {
					data: ['test'],
				},
				continueOnError: false,
			},
			{
				use: 'replaceWords',
				description: "Replaces 'query' word to 'lost'",
				inputs: {
					data: {
						query: 'lost',
					},
				},
				continueOnError: false,
			},
			{
				use: 'addFilter',
				description: 'Filter results by author',
				inputs: {
					data: {
						'authors.keyword': 'Simone Elkeles',
					},
				},
				continueOnError: false,
			},
			{
				use: 'reactivesearchQuery',
				continueOnError: false,
			},
			{
				use: 'elasticsearchQuery',
				continueOnError: false,
			},
			{
				use: 'promoteResults',
				inputs: {
					data: [
						{
							doc: {
								_id: 'id_1',
								_source: {
									title: 'id_1',
								},
							},
							position: 10,
						},
						{
							doc: {
								_id: 'id_2',
								_source: {
									title: 'id_2',
								},
							},
							position: 5,
						},
					],
				},
			},
			{
				use: 'hideResults',
				inputs: {
					data: ['1jftXXEBdEU4aeo6Gdqs'],
				},
			},
			{
				use: 'customData',
				inputs: {
					data: {
						reference: 'Appbase Pipeline',
					},
				},
			},
		],
	},
};
