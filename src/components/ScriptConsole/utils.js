const prettier = require('prettier');
const babylon = require('prettier/parser-babel');

export const DEFAULT_EXECUTION_CONTEXT_VALUE = {
	request: {
		body: {
			query: [
				{
					id: 'search',
					react: {
						and: 'color',
					},
					dataField: ['name'],
					size: 5,
					value: 'vinyl',
					includeFields: ['name', 'color'],
					index: 'best-buy-dataset',
				},
				{
					id: 'color',
					type: 'term',
					dataField: 'color.keyword',
					value: ['Black'],
					execute: false,
				},
			],
		},
		headers: {
			'Content-Type': 'application/json',
		},
	},
	response: {
		code: 200,
		body: {
			search: {
				_shards: {
					failed: 0,
					skipped: 0,
					successful: 3,
					total: 3,
				},
				hits: {
					hits: [
						{
							_id: 'UXGArnYBpOdhck8TDcFv',
							_index: 'best-buy-dataset',
							_score: 5.7865844,
							_source: {
								color: 'Black',
								name: 'Cricut - Premium Removable Vinyl - Black',
							},
							_type: '_doc',
						},
						{
							_id: '4Od7rnYBR5qBrhW_U3tj',
							_index: 'best-buy-dataset',
							_score: 5.5054154,
							_source: {
								color: 'Black',
								name: 'Uncaged Ergonomics - Vinyl Wobble Stool - Black',
							},
							_type: '_doc',
						},
						{
							_id: 'cOd_rnYBR5qBrhW_gZB7',
							_index: 'best-buy-dataset',
							_score: 5.476978,
							_source: {
								color: 'Black',
								name: 'Crosley - Vinyl Record Cleaning Set - Black',
							},
							_type: '_doc',
						},
						{
							_id: 'XedzrnYBR5qBrhW_KlLb',
							_index: 'best-buy-dataset',
							_score: 5.2471347,
							_source: {
								color: 'Black',
								name: 'Office Star Products - Vinyl Drafting Stool - Black',
							},
							_type: '_doc',
						},
						{
							_id: 'z3F0rnYBpOdhck8T-4lM',
							_index: 'best-buy-dataset',
							_score: 5.237612,
							_source: {
								color: 'Black',
								name: 'Pro-Ject - Vinyl Cleaner VC-S - Black',
							},
							_type: '_doc',
						},
					],
					max_score: 5.7865844,
					total: {
						relation: 'eq',
						value: 22,
					},
				},
				status: 200,
				timed_out: false,
				took: 6,
			},
			settings: {
				searchRelevancy: 'best-buy-dataset',
				took: 6,
			},
		},
		headers: {
			'Content-Type': 'application/json; charset=utf-8',
		},
	},
	envs: {
		index: ['test1', 'test2'],
		filters: {
			filter1: '2011',
			filter2: 'product',
		},
		query: 'harry',
		type: 'search',
		origin: 'https://my-search.domain.com',
		referer: 'https://my-search.domain.com/path?q=hello',
		ipv4: '29.120.12.12',
		ipv6: '2001:db8:3333:4444:5555:6666:7777:8888',
		customEvents: {
			platform: 'mac',
		},
	},
};

export const getDefaultExecutionContextValue = (overrideObject = {}) => {
	const finalObjectValue = { ...DEFAULT_EXECUTION_CONTEXT_VALUE };
	Object.keys(overrideObject).forEach((key) => {
		if (Object.keys(DEFAULT_EXECUTION_CONTEXT_VALUE).includes(key)) {
			if (typeof DEFAULT_EXECUTION_CONTEXT_VALUE[key] === 'object') {
				finalObjectValue[key] = {
					...DEFAULT_EXECUTION_CONTEXT_VALUE[key],
					...overrideObject[key],
				};
			} else {
				finalObjectValue[key] = overrideObject[key];
			}
		}
	});

	return JSON.stringify(finalObjectValue);
};

export const sanitizeScriptString = (scriptString = '') => {
	const scriptStringFormatted = prettier.format(scriptString, {
		parser: 'babel',
		plugins: [babylon],
	});
	/* eslint-enable import/no-extraneous-dependencies */
	return scriptStringFormatted?.replace(/ {4}/g, '').replace(/(\r\n|\n|\r)/gm, ''); // removing long spaces of 4 space-chars
};
export const generateScriptValidationRequestBody = (scriptValue, executionContextValue) => {
	// we process spaces and newline chars before appending to requestbody
	// we remove combination of 4 spaces at a time since we use 4 tab spaces in monaco to format string
	const requestBody = { script: sanitizeScriptString(scriptValue) };
	if (executionContextValue) {
		const executionContextValueObj = JSON.parse(executionContextValue);
		if (Object.keys(executionContextValueObj))
			Object.keys(executionContextValueObj).forEach((key) => {
				Object.assign(requestBody, { [key]: executionContextValueObj[key] });
			});
	}

	return requestBody;
};

export const monacoOptions = {
	cursorStyle: 'line',
	fontFamily: 'Monaco, monospace',
	fontSize: 14,
	autoIndent: true,
	padding: {
		top: 10,
		bottom: 10,
	},
	minimap: {
		enabled: false,
	},
	comments: 'insertSpace',
};

export const DEFAULT_QUERY_EDITOR_VALUE = '// query here';

export const isJson = (itemProp) => {
	let item = typeof itemProp !== 'string' ? JSON.stringify(itemProp) : itemProp;

	try {
		item = JSON.parse(item);
	} catch (e) {
		return false;
	}
	if (typeof item === 'object' && item !== null) {
		return item;
	}

	return false;
};
