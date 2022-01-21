/* eslint-disable */
export default {
	'Async Fetch':
		"function handleRequest(){ fetch('http://localhost:9200'); const body = JSON.parse(context.request.body); return { ...context.request, body: JSON.stringify({...body, query: [...body.query, { id: 'brandFilter', execute: false, 'type': 'term', dataField: 'brand.keyword', value: nlp('Hariom Enterprises') }] })} }",
	'Sync Fetch':
		"async function handleRequest(){ const res = await fetch('http://localhost:9200/_search'); const parsedResponse = JSON.parse(res); const body = JSON.parse(context.request.body); return { ...context.request, body: JSON.stringify({...body, query: [...body.query, { id: 'brandFilter', execute: false, 'type': 'term', dataField: 'brand.keyword', value: parsedResponse.took, }] })} }",
	'Modify Request with CryptoJS':
		// eslint-disable-next-line
		'function handleRequest() { return {...context.request, body: context.request.body, headers: { ...context.request.headers, message: `${CryptoJS.SHA256(_.get(context.request.headers, `X-Customheader`))}` } } }',
	'Modify Request with Compromise':
		"function handleRequest(){ const body = JSON.parse(context.request.body); return { ...context.request, body: JSON.stringify({...body, query: [...body.query, { id: 'brandFilter', execute: false, 'type': 'term', dataField: 'brand.keyword', value: nlp('the purple dinosaur').nouns().toPlural().text() }] })} }",
	'Modify Response with Lodash':
		'function handleResponse() { const body = _.omit(JSON.parse(context.response.body), `search._shards`); return { ...context.response, body: JSON.stringify({ ...body }) }}',
	'Modify an indexing request':
		"/** \n The following example modifes the indexing request \n to add a calculated field named \n `queryLength` \n **/ \n function handleRequest() { if (['update', 'index'].includes(context.envs.acl)) {const requestBody = JSON.parse(context.request.body); if(requestBody.query) { requestBody.queryLength = requestBody.query.length;    }  return { ...context.request, body: JSON.stringify(requestBody) };  } return context.request;}",
	'Modify a bulk request':
		"/** \n The following example modifes the indexing request \n to add a calculated field named `queryLength` \n */ \n function handleRequest() {    if(context.envs.acl === 'bulk') {    const jsonRows = context.request.body.split('\\n');    if(jsonRows[jsonRows.length - 1] == '') {      jsonRows.pop();     }    const data = jsonRows.map((jsonStringRow) => {      let bodyEach = JSON.parse(jsonStringRow);       if (!('index' in bodyEach)) {        bodyEach = {           ...bodyEach, queryLength:  bodyEach.query ? bodyEach.query.length : 0};       }       return JSON.stringify(bodyEach);     }); context.request.body = data.join('\\n') + '\\n'; return context.request;  }return context.request;}",
	'Add a new doc into index every minute':
		"/** \n The following example adds a new doc into the `test-v2` index. \n It also adds a new field `context` in the doc that \n contains the user passed context. */ \n const data = {    'my_data': {      'context': context    }};  async function putData() {    const r = await fetch('http://localhost:9200/test-v2/_doc', {        method: 'POST',        headers: {            'Content-Type': 'application/json'        },        body: JSON.stringify(data)    });}putData();",
};
