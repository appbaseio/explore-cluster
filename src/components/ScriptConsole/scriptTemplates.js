export const TEMPLATE_KEYS = {
	ASYNC_FETCH: 'Async Fetch',
	SYNC_FETCH: 'Sync Fetch',
	MODIFY_REQUEST_CRYPTOJS: 'Modify Request with CryptoJS',
	MODIFY_REQUEST_COMPROMISE: 'Modify Request with Compromise',
	MODIFY_RESPONSE_LODASH: 'Modify Response with Lodash',
	MODIFY_INDEXING_REQUEST: 'Modify an indexing request',
	MODIFY_BULK_REQUEST: 'Modify a bulk request',
	CRON_SCRIPT: 'Add a new doc into index every minute',
};

const {
	ASYNC_FETCH,
	SYNC_FETCH,
	MODIFY_REQUEST_CRYPTOJS,
	MODIFY_REQUEST_COMPROMISE,
	MODIFY_RESPONSE_LODASH,
	MODIFY_INDEXING_REQUEST,
	MODIFY_BULK_REQUEST,
	CRON_SCRIPT,
} = TEMPLATE_KEYS;

export default {
	[ASYNC_FETCH]: {
		script: "/**\n * This example makes use fetch request to query an endpoint\n * but doesn't depend on the resolution of it to modify the\n * request being fired to the search service.\n */\nfunction handleRequest(){ fetch('http://localhost:9200'); const body = JSON.parse(context.request.body); return { ...context.request, body: JSON.stringify({...body, query: [...body.query, { id: 'brandFilter', execute: false, 'type': 'term', dataField: 'brand.keyword', value: nlp('Hariom Enterprises') }] })} }",
		executionContextOverride: null,
	},
	[SYNC_FETCH]: {
		script: "/**\n * This example makes use fetch request to query an endpoint\n * and depends on the resolution of it to modify the\n * request being fired to the search service.\n */\nasync function handleRequest(){ const res = await fetch('http://localhost:9200/_search'); const parsedResponse = JSON.parse(res); const body = JSON.parse(context.request.body); return { ...context.request, body: JSON.stringify({...body, query: [...body.query, { id: 'brandFilter', execute: false, 'type': 'term', dataField: 'brand.keyword', value: parsedResponse.took, }] })} }",
		executionContextOverride: null,
	},
	[MODIFY_REQUEST_CRYPTOJS]: {
		// eslint-disable-next-line no-template-curly-in-string
		script: '/**\n * This script utilizes Crypto.JS, a built-in package to scripts\n * and exposed via `CryptoJS` to apply a SHA256 transformation\n * to a custom header being passed by the user\n */\nfunction handleRequest() { return {...context.request, body: context.request.body, headers: { ...context.request.headers, message: `${CryptoJS.SHA256(_.get(context.request.headers, `X-Customheader`))}` } } }',
		executionContextOverride: null,
	},
	[MODIFY_REQUEST_COMPROMISE]: {
		script: "/**\n * Compromise (exposed as `nlp` global) is a built-in package to scripts.\n * In this example, we use compromise to get nouns from a phrase and search\n * on the pluralized form of the noun.\n */\nfunction handleRequest(){ const body = JSON.parse(context.request.body); return { ...context.request, body: JSON.stringify({...body, query: [...body.query, { id: 'brandFilter', execute: false, 'type': 'term', dataField: 'brand.keyword', value: nlp('the purple dinosaur').nouns().toPlural().text() }] })} }",
		executionContextOverride: null,
	},
	[MODIFY_RESPONSE_LODASH]: {
		script: '/** \n * lodash (_) is the most popular JavaScript utility package and comes \n * built-in with scripts.\n * Here, we use lodash to perform a response transformation. \n*/ \nfunction handleResponse() { const body = _.omit(JSON.parse(context.response.body), `search._shards`); return { ...context.response, body: JSON.stringify({ ...body }) }}',
		executionContextOverride: null,
	},
	[MODIFY_INDEXING_REQUEST]: {
		script: "/** \n * The following example modifes the indexing request \n * to add a calculated field named \n * `queryLength` \n **/ \n function handleRequest() { if (['update', 'index'].includes(context.envs.acl)) {const requestBody = JSON.parse(context.request.body); if(requestBody.query) { requestBody.queryLength = requestBody.query.length;    }  return { ...context.request, body: JSON.stringify(requestBody) };  } return context.request;}",
		executionContextOverride: {
			request: {
				body: {
					data: 'hello world',
				},
				headers: {
					'Content-Type': 'application/json',
				},
			},
			envs: {
				acl: 'index',
				index: ['test1'],
			},
		},
	},
	[MODIFY_BULK_REQUEST]: {
		script: "/** \n * The following example modifes the indexing request \n * to add a calculated field named `queryLength` \n */ \n function handleRequest() {    if(context.envs.acl === 'bulk') {    const jsonRows = context.request.body.split('\\n');    if(jsonRows[jsonRows.length - 1] == '') {      jsonRows.pop();     }    const data = jsonRows.map((jsonStringRow) => {      let bodyEach = JSON.parse(jsonStringRow);       if (!('index' in bodyEach)) {        bodyEach = {           ...bodyEach, queryLength:  bodyEach.query ? bodyEach.query.length : 0};       }       return JSON.stringify(bodyEach);     }); context.request.body = data.join('\\n') + '\\n'; return context.request;  }return context.request;}",
		executionContextOverride: {
			request: {
				body: '{"index" : { "_index" : "test", "_id" : "1" } }\n{ "query" : "value1" }\n',
			},
			envs: {
				acl: 'bulk',
				index: ['test1'],
			},
		},
	},
	[CRON_SCRIPT]: {
		script: "/** \n * The following example adds a new doc into the `test-v2` index. \n * It also adds a new field `context` in the doc that \n * contains the user passed context. */ \n const data = {    'my_data': {      'context': context    }};  async function putData() {    const r = await fetch('http://localhost:9200/test-v2/_doc', {        method: 'POST',        headers: {            'Content-Type': 'application/json'        },        body: JSON.stringify(data)    });}putData();",
		executionContextOverride: {
			isCron: true,
			request: {
				body: {
					data: 'hello world',
				},
				headers: {
					'Content-Type': 'application/json',
				},
			},
			envs: {
				acl: 'index',
				index: ['test1'],
			},
		},
	},
};
