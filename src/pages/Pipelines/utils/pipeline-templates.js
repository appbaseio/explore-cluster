export default {
	'Basic Template': {
		enabled: true,
		routes: [
			{
				path: '/{index}/_reactivesearch',
				method: 'POST',
				classify: {
					category: 'reactivesearch',
				},
			},
		],
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
			},
			{
				id: 'es_query',
				use: 'elasticsearchQuery',
				async: true,
			},
		],
	},
	'Knowledge Graph': {
		enabled: true,
		description:
			'Pipeline to retrieve and merge Google knowledge graph response to ES response',
		routes: [
			{
				path: '/{index}/_reactivesearch',
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
				async: true,
				scriptRef: 'google_knowledge_graph',
				scriptContent:
					// eslint-disable-next-line no-template-curly-in-string
					'async function handleRequest() { try { const URL = `https://kgsearch.googleapis.com/v1/entities:search?query=${context.envs.query}&key=${context.envs.knowledgeGraphAPIKey}&limit=1&indent=True`; const responseBody = await fetch(URL); const response = JSON.parse(responseBody); return { knowledge_graph: response }} catch(e) {} return context; }',
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
				path: '/{index}/_reactivesearch',
				method: 'POST',
				classify: {
					category: 'reactivesearch',
				},
			},
		],
		envs: {
			category: 'reactivesearch',
			index: ['test'],
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
};
