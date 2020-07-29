import get from 'lodash/get';
import includes from 'lodash/includes';
import keys from 'lodash/keys';
import values from 'lodash/values';
import { notification } from 'antd';
import { getURL } from '../constants/config';
import { getSingleFunction, updateFunctions } from '../batteries/utils/app';
import { getESVersion } from '../batteries/utils/mappings';
import { doGet } from '../batteries/utils/requestService';

export async function getUser(username, password, url) {
	const ACC_API = getURL();
	const api = url || ACC_API;
	const authToken = btoa(`${username}:${password}`);
	const response = await fetch(`${api}/_user`, {
		method: 'GET',
		headers: {
			Authorization: `Basic ${authToken}`,
		},
	});
	if (response.status === 402) {
		// eslint-disable-next-line
		throw {
			message: 'Payment is required',
			status: 402,
		};
	}
	const data = await response.json();
	if (response.status >= 400) {
		throw new Error(data);
	}

	const res = await fetch(`${api}/arc/plan`, {
		headers: {
			Authorization: `Basic ${btoa(`${username}:${password}`)}`,
		},
	});
	if (res.status === 400) {
		// eslint-disable-next-line
		throw {
			message: 'Payment is required',
			status: 402,
		};
	}

	// Dont use await over here as we dont need these immediately.
	fetch(`${api}`, {
		method: 'GET',
		headers: {
			Authorization: `Basic ${authToken}`,
		},
	})
		.then((es) => es.json())
		.then((esResponse) => {
			const version = get(esResponse, 'version.number');
			sessionStorage.setItem('version', version);
		})
		.catch((e) => {
			console.error('Error while fetching the Elasticsearch details');
			console.error(e);
		});

	return {
		username,
		password,
		authToken,
		isAdmin: data.is_admin,
	};
}

const getAuthToken = () => {
	let token = null;
	try {
		token = sessionStorage.getItem('authToken');
	} catch (e) {
		console.error(e);
	}
	return token;
};

export async function getESIndices(authToken) {
	const ACC_API = getURL();
	const esVersion = await getESVersion(null, atob(authToken));
	let url = `${ACC_API}/_aliasedindices`;
	if (esVersion && esVersion < 6) url = `${ACC_API}/_cat/indices?format=json`;
	const response = await fetch(url, {
		method: 'GET',
		headers: {
			Authorization: `Basic ${authToken}`,
		},
	});
	const data = await response.json();
	if (response.status >= 400) {
		throw new Error(data);
	}

	const indices = {};
	data.forEach((item) => {
		indices[item.alias || item.index] = item;
	});

	return indices;
}

export async function getAppsMetrics() {
	const ACC_API = getURL();
	const response = await fetch(`${ACC_API}/user/apps/metrics`, { credentials: 'include' });
	const data = await response.json();
	if (response.status >= 400) {
		throw new Error(data);
	}

	return data.body;
}

export async function getAppsOwners() {
	const ACC_API = getURL();
	const response = await fetch(`${ACC_API}/user/apps`, { credentials: 'include' });
	const data = await response.json();
	if (response.status >= 400) {
		throw new Error(data);
	}

	return data.body;
}

export async function getCreateApp(options, authToken) {
	const ACC_API = getURL();
	const response = await fetch(`${ACC_API}/${options.appName}`, {
		method: 'PUT',
		body: JSON.stringify({
			settings: {
				...options.settings,
			},
		}),
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Basic ${authToken}`,
		},
		// body: JSON.stringify({
		// 	es_version: options.es_version,
		// }),
	});

	const data = await response.json();
	if (response.status >= 400) {
		throw new Error(JSON.stringify(data));
	}

	const { body, acknowledged } = data;
	return { ...body, acknowledged };
}

// returns the required param from the url
export function getParam(name, url) {
	/* eslint-disable */
	if (!url) url = window.location.href;
	const param = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
	const regexS = '[\\?&]' + param + '=([^&#]*)';
	const regex = new RegExp(regexS);
	const results = regex.exec(url);
	return results == null ? null : results[1];
}

export async function deleteApp(appName) {
	const ACC_API = getURL();
	const authToken = sessionStorage.getItem('authToken');
	try {
		const response = await fetch(`${ACC_API}/${appName}`, {
			headers: {
				Authorization: `Basic ${authToken}`,
			},
			method: 'DELETE',
		});
		const data = await response.json();
		if (response.status >= 400) {
			throw new Error(data);
		}

		return data.acknowledged;
	} catch (e) {
		return { message: 'An error occured while deleting the app. Please try again.' };
	}
}

export const setRole = (username, role) =>
	new Promise((resolve, reject) => {
		const ACC_API = getURL();
		const authToken = getAuthToken();
		fetch(`${ACC_API}/_permission/${username}`, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Basic ${authToken}`,
			},
			body: JSON.stringify({
				role,
			}),
		})
			.then((res) => res.json())
			.then((data) => resolve({ ...data, message: data.message }))
			.catch((error) => reject(error));
	});

export async function cloneApp(source, destination, payload = {}) {
	if (!source || !destination) return;
	const ACC_API = getURL();
	const authToken = sessionStorage.getItem('authToken');
	const response = await fetch(`${ACC_API}/_reindex/${source}/${destination}`, {
		headers: {
			Authorization: `Basic ${authToken}`,
		},
		method: 'POST',
		body: JSON.stringify(payload),
	});
	if (response.status >= 400) {
		if (response.status === 400 || response.status === 406) {
			throw new Error(
				'You need to upgrade appbase.io to v7.11.0 or above to take advantage of this feature.',
			);
		}
		throw new Error('An error occurred while cloning the index. Please try again.');
	}
	return true;
}

export const deleteRole = (appId, username) =>
	new Promise((resolve, reject) => {
		const ACC_API = getURL();
		const authToken = getAuthToken();
		fetch(`${ACC_API}/_permission/${username}`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Basic ${authToken}`,
			},
			body: JSON.stringify({}),
		})
			.then((res) => res.json())
			.then((data) => resolve({ ...data.body, message: data.message }))
			.catch((error) => reject(error));
	});

// set private registry
export async function setPrivateRegistry(payload = {}) {
	const ACC_API = getURL();
	const authToken = sessionStorage.getItem('authToken');

	const response = await fetch(`${ACC_API}/_functions/registry_config`, {
		headers: {
			Authorization: `Basic ${authToken}`,
		},
		method: 'PUT',
		body: JSON.stringify(payload),
	});
	const data = await response.json();
	if (response.status >= 400) {
		throw data.error.message;
	}

	return data.message;
}

function extractLogs(data) {
	const regex = new RegExp(/("text"):\s*([^\n]*)/, 'ig');
	const parsedData = data.match(regex);
	return parsedData.reduce((stringAcc, data) => {
		const split = data.split(`"text":`)[1].split('}')[0];
		const filtered = split.replace(/['"]+/g, '');
		return stringAcc + filtered.replace(/\\n/g, '') + '\n';
	}, '');
}

// fetch logs
export async function fetchLogs(name = 'default') {
	const ACC_API = getURL();
	const authToken = sessionStorage.getItem('authToken');
	const response = await fetch(`${ACC_API}/_function/${name}/logs?tail=100`, {
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Basic ${authToken}`,
		},
		method: 'GET',
	});
	const data = await response.clone().text();
	if (response.status >= 400) {
		throw data.error.message;
	}
	if (data) {
		return extractLogs(data);
	}
	return data;
}

export async function fetchMappings(name = '*') {
	const ACC_API = getURL();
	const authToken = sessionStorage.getItem('authToken');
	const response = await fetch(`${ACC_API}/${name}/_mapping`, {
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Basic ${authToken}`,
		},
		method: 'GET',
	});
	const data = await response.json();
	if (response.status >= 400) {
		throw data.error.message;
	}
	return data;
}

// checks open-faas health
export async function getFunctionHealthCheck() {
	const ACC_API = getURL();
	const authToken = sessionStorage.getItem('authToken');
	const response = await fetch(`${ACC_API}/_functions/health`, {
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Basic ${authToken}`,
		},
		method: 'GET',
	});
	const data = await response.json();
	if (response.status >= 400) {
		throw {
			status: response.status,
			message: data.error.message,
		};
	}

	return data;
}

// checks whether it is a valid URL
export const isAbsoluteURL = (str) => /^[a-z][a-z0-9+.-]*:/.test(str);

// extract credentials from URL
export const getURLCredentials = (url) => {
	if (!isAbsoluteURL(url) || !url.includes('@')) return null;
	const credArr = ((url.split('@')[0] || '').split('//')[1] || '').split(':');
	return { username: credArr[0], password: credArr[1] };
};

// remove trailing slashes from URL
export const removeTrailingSlashes = (url) => url.replace(/\/+$/, '');

// get protocol from url
export const getProtocol = (url) => {
	if (!isAbsoluteURL(url)) return;
	return url.split('/')[0];
};

// https://{url}?search=xyz => {search: xyz}
export const getURLParameters = (url) =>
	(url.match(/([^?=&]+)(=([^&]*))/g) || []).reduce(
		(a, v) => ((a[v.slice(0, v.indexOf('='))] = v.slice(v.indexOf('=') + 1)), a),
		{},
	);

export const isEmpty = (val) => val == null || !(Object.keys(val) || val).length;

export async function getClusterMappings() {
	const ACC_API = getURL();
	const authToken = sessionStorage.getItem('authToken');
	const response = await fetch(`${ACC_API}/*/_mapping`, {
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Basic ${authToken}`,
		},
		method: 'GET',
	});
	const mappings = await response.json();
	if (response.status >= 400) {
		throw get(data, 'error.message');
	}
	return mappings;
}

export function getDatafields({ mappings, indexes, isSearch = false, isAggs = false }) {
	const hasAllIndex = indexes.includes('*');
	let fieldMap = {};
	let subFieldsMap = {};

	function filtered(properties, property) {
		const propertyType = get(properties, `${property}.type`);
		if (isSearch) return propertyType === 'string' || propertyType === 'text';
		return (
			propertyType === 'string' ||
			propertyType === 'text' ||
			propertyType === 'integer' ||
			propertyType === 'long' ||
			propertyType === 'bool' ||
			propertyType === 'float'
		);
	}

	const dataFields = Object.keys(mappings)
		.filter((index) => !index.startsWith('.'))
		.filter((index) => hasAllIndex || indexes.includes(index))
		.reduce((acc, key) => {
			const { properties } = get(mappings[key], 'mappings._doc') || mappings[key].mappings;
			const fieldTree = getFieldsTree(properties);
			const nestedDataFields = keys(fieldTree).reduce((acc, field) => {
				const fieldObj = fieldTree[field];
				const { type, fields } = fieldObj || {};

				const setKeyWordField = () => {
					if (type === 'text' || type === 'string') {
						if (includes(fields, 'keyword')) {
							acc[field] = `${field}.keyword`;
						} else if (!isAggs) {
							acc[field] = field;
						}
					}
					subFieldsMap[field] = fields;
				};

				if (isSearch) {
					setKeyWordField(type, fields);
				} else {
					if (type === 'text' || type === 'string') setKeyWordField(type, fields);
					else {
						acc[field] = field;
						subFieldsMap[field] = fields;
					}
				}
				return acc;
			}, {});
			fieldMap = { ...fieldMap, ...nestedDataFields };
			return [...acc, ...values(nestedDataFields)];
		}, []);

	return [[...new Set(dataFields)], fieldMap, subFieldsMap];
}

function updateQueryRules(selectedFunction, res) {
	selectedFunction.queryRules = [...(selectedFunction.queryRules || []), res.payload.id]
		// remove duplicate rule ids
		.filter((value, index, self) => {
			return self.indexOf(value) === index;
		});
}

export function deleteQueryRuleInFunction(selectedFunction, res) {
	const index = selectedFunction.queryRules.indexOf(res.payload.id);
	if (index !== -1) selectedFunction.queryRules.splice(index, 1);
}

export function updateFunction({
	selectedFunction,
	res,
	updateQueryFn = updateQueryRules,
	description = `Updating function ${get(selectedFunction, 'function.service')} with ${get(
		res,
		'payload.name',
	)} rule`,
}) {
	if (selectedFunction && get(selectedFunction, 'function.service')) {
		updateQueryFn(selectedFunction, res);
		const service = get(selectedFunction, 'function.service');
		if (description)
			notification.info({
				message: 'Updating Function',
				description: description,
			});
		updateFunctions(service, selectedFunction)
			.then(() => {
				if (description)
					notification.success({
						message: 'Success',
						description: `Function ${service} updated successfully.`,
					});
			})
			.catch((e) => {
				notification.error({
					message: 'Error',
					description: e,
				});
			});
	}
}

export function getSelectedIndexes(selectedIndexes, mappings) {
	if ((selectedIndexes || []).length === 0 || get(selectedIndexes, 0) === '*') {
		return keys(mappings).filter((key) => !key.startsWith('.'));
	}
	return selectedIndexes;
}

export async function handleQueryRuleDelete(rule, removeRule) {
	const functionIndex = get(rule, 'actions', []).findIndex((item) => item.type === 'function');
	if (functionIndex !== -1) {
		try {
			const res = await getSingleFunction(rule.actions[functionIndex].data);
			updateFunction({
				selectedFunction: res,
				res: { payload: rule },
				updateQueryFn: deleteQueryRuleInFunction,
				description: `Updating function ${get(res, 'function.service')} by removing ${
					rule.name
				} rule`,
			});
			await removeRule(rule.id);
		} catch (e) {
			notification.error({
				message: 'error',
				description: get(e, 'message'),
			});
		}
	} else {
		await removeRule(rule.id);
	}
}

export function getReIndexedName(appName) {
	const reindexedRegex = new RegExp('.*reindexed_[0-9]+', 'g');
	const matched = appName.match(reindexedRegex);
	let newName;
	if (matched) {
		const splittedPart = appName.split('_');
		splittedPart[splittedPart.length - 1] = Number(splittedPart[splittedPart.length - 1]) + 1;
		newName = splittedPart.join('_');
	} else {
		newName = `${appName}_reindexed_1`;
	}
	return newName;
}

export function getSubFields({ fields, weight, address }) {
	if (fields) {
		const fieldsToMap = Array.isArray(fields) ? fields : Object.keys(fields);
		const subFields = fieldsToMap.reduce((agg, field) => {
			return {
				...agg,
				[`${address}.${field}`]: getFieldWeight(field, weight),
			};
		}, {});

		return { [address]: weight, ...subFields };
	}

	return { [address]: weight };
}

export const getFieldWeight = (field, weight) => {
	switch (field) {
		case 'autosuggest':
		case 'lang':
			return weight ? weight * 0.9 : 0;
		case 'synonyms':
			return weight ? weight * 0.7 : 0;
		case 'delimiter':
			return weight ? weight * 0.4 : 0;
		case 'search':
			return weight ? weight * 0.1 : 0;
		case 'keyword':
			return weight ? weight : 0;
		default:
			return weight;
	}
};

function ltrim(str) {
	if (!str) return str;
	return str.replace(/^\s+/g, '');
}

function rtrim(str) {
	if (!str) return str;
	return str.replace(/\s+$/g, '');
}

export function removeWhiteSpaces(str) {
	str = ltrim(str);
	str = rtrim(str);
	return str;
}

const getFieldsTree = (mappings = {}, prefix = null) => {
	let tree = {};
	Object.keys(mappings).forEach((key) => {
		if (mappings[key].properties) {
			tree = {
				...tree,
				...getFieldsTree(mappings[key].properties, `${prefix ? `${prefix}.` : ''}${key}`),
			};
		} else {
			const originalFields = mappings[key].fields;
			tree = {
				...tree,
				[`${prefix ? `${prefix}.` : ''}${key}`]: {
					type: mappings[key].type,
					fields: mappings[key].fields ? Object.keys(mappings[key].fields) : [],
					originalFields: originalFields || {},
				},
			};
		}
	});

	return tree;
};

export const getParsedRoutes = (routes) =>
	Object.keys(routes).reduce((agg, route) => {
		const routeItem = routes[route];
		if (routeItem.menu) {
			return [
				...agg,
				...routeItem.menu.map((item) => ({
					...item,
					title: route,
					icon: routeItem.icon,
				})),
			];
		}
		return [
			...agg,
			{
				...routeItem,
				title: route,
			},
		];
	}, []);

export const reservedSearchSubFields = [
	'search',
	'english',
	'lang',
	'autosuggest',
	'keyword',
	'synonyms',
	'delimiter',
];

export const removeSubFields = (dataField) => {
	const fieldsToMap = Array.isArray(dataField) ? dataField : Object.keys(dataField);
	const parsedFields = fieldsToMap.filter(
		(field) => !reservedSearchSubFields.some((subField) => field.endsWith(`.${subField}`)),
	);

	if (Array.isArray(dataField)) {
		return [...new Set(parsedFields)];
	}

	return parsedFields.reduce(
		(agg, item) => ({
			...agg,
			[item]: dataField[item],
		}),
		{},
	);
};

export const changedSubFields = (old_fields, new_fields) => {
	const differentKeys = new_fields.filter((field) => !old_fields.includes(field));

	return differentKeys.reduce((agg, key) => {
		const lastKey = key.split('.').pop();
		let fieldName = key;
		reservedSearchSubFields.forEach((subField) => {
			fieldName = fieldName.replace(`.${subField}`, '');
		});
		return {
			...agg,
			[fieldName]: `${agg[fieldName] ? `${agg[fieldName]} ,` : ''}${lastKey}`,
		};
	}, {});
};

export const validateQueryString = (queryString) => {
	const ACC_API = getURL();
	return doGet(`${ACC_API}/_validate/query?q=${queryString}`);
};
