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
};
