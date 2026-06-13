import get from 'lodash/get';
import set from 'lodash/set';
import includes from 'lodash/includes';
import keys from 'lodash/keys';
import values from 'lodash/values';
import { notification } from 'antd';
import { BACKENDS } from '../batteries/utils';
import { getSingleFunction, updateFunctions } from '../batteries/utils/app';
// eslint-disable-next-line import/no-cycle
import { getESVersion } from '../batteries/utils/mappings';
import { doGet } from '../batteries/utils/requestService';
import { getDefaultAllowedActions } from './allowedActions';
import { ALLOWED_ACTIONS, SUB_FIELDS } from '../constants';
import { getURL, persistElasticsearchServerlessFlavor } from '../constants/config';

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
	await fetch(`${api}`, {
		method: 'GET',
		headers: {
			Authorization: `Basic ${authToken}`,
		},
	})
		.then((es) => es.json())
		.then((esResponse) => {
			const version = get(esResponse, 'version.number');
			const clusterId = get(esResponse, 'cluster_name');
			localStorage.setItem(
				'isUsingOpenSearch',
				esResponse?.version?.distribution === 'opensearch',
			);
			persistElasticsearchServerlessFlavor(esResponse);
			localStorage.setItem('version', version);
			localStorage.setItem('clusterId', clusterId);
		})
		.catch((e) => {
			// eslint-disable-next-line no-console
			console.error('Error while fetching the Elasticsearch details');
			// eslint-disable-next-line no-console
			console.error(e);
		});
	return {
		username,
		password,
		authToken,
		isAdmin: data.is_admin,
		allowedActions: data.allowed_actions || getDefaultAllowedActions(data.is_admin),
	};
}

export const getAuthToken = () => {
	let token = null;
	try {
		token = localStorage.getItem('authToken');
	} catch (e) {
		console.error(e);
	}
	return token;
};

const transformRegexString = (regex, varRegex, str, attrs = { app: 'appbase' }) => {
	let newStr = str;
	// newStr.match(regex) -> returns array of ${variable} available in the string
	newStr.match(regex).forEach((tempVar) => {
		// Extract variable from ${variable}
		const keyVariable = varRegex.exec(tempVar)[1];
		const reqStr = attrs[keyVariable];
		if (reqStr) {
			const newRegex = `\${${keyVariable}}`;
			// Replace the ${varibale} with the value
			newStr = newStr.replace(newRegex, reqStr);
		}
	});

	return newStr;
};

export const getValidURL = (config = {}, attrs = {}) => {
	const regex = /\${[a-zA-Z0-9_]*}/gm;
	const varRegex = /(?:\${)(.*?)(?=\})/;
	const { url, qs = [] } = config;
	let newStr = url;

	// Traverse the queryStrings and append them to url.
	qs.forEach((attr, idx) => {
		if (idx === 0) newStr += `?${attr.key}=${attrs[attr.key]}`;
		else newStr += `&${attr.key}=${attrs[attr.key]}`;
	});

	// check if newStr has any template string of format ${variable}
	if (newStr.match(regex)) newStr = transformRegexString(regex, varRegex, newStr, attrs);
	if (newStr.startsWith('/')) newStr = newStr.slice(1);

	return newStr;
};

export async function getESIndices(authToken, backend, endpointConfig = {}) {
	const ACC_API = getURL();
	// let url = `${ACC_API}/_aliasedindices`;
	let url = '';
	if (backend === BACKENDS.FUSION.name) {
		url = `${ACC_API}/${getValidURL(endpointConfig.app)}`;
	} else {
		url = `${ACC_API}/${getValidURL(endpointConfig.index)}`;
		try {
			if (
				backend === BACKENDS.ELASTICSEARCH.name ||
				backend === BACKENDS.ELASTICSEARCH_SERVERLESS.name ||
				backend === BACKENDS.SYSTEM.name
			) {
				const esVersion = await getESVersion(null, atob(authToken));
				// older endpoint
				// Note: OpenSearch v3 resolves to esVersion as 3, and should use the new endpoint.
				if (esVersion && esVersion === 6) url = `${ACC_API}/_cat/indices?format=json`;
			}
		} catch (error) {
			console.log(error);
		}
	}

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
		indices[item.alias || item.index || item.name] = item;
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
			mappings: {
				...options.mappings,
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
	const authToken = localStorage.getItem('authToken');
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
	const authToken = localStorage.getItem('authToken');
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
				'You need to upgrade reactivesearch.io to v7.11.0 or above to take advantage of this feature.',
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
	const authToken = localStorage.getItem('authToken');

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
	const authToken = localStorage.getItem('authToken');
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
	const authToken = localStorage.getItem('authToken');
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

export const getOriginURL = (value) => {
	const credObj = getURLCredentials(value) || {};
	const { url } = getURLParameters(value);
	const originURL = value.split('@')[1];
	if (url) return removeTrailingSlashes(url);
	if (!isEmpty(credObj)) {
		localStorage.setItem('username', credObj.username);
		localStorage.setItem('password', credObj.password);
		return `${getProtocol(value)}//${removeTrailingSlashes(originURL || '')}`;
	}
	return removeTrailingSlashes(value);
};

export async function getClusterMappings() {
	const ACC_API = getURL();
	const authToken = localStorage.getItem('authToken');
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
	const hasAllIndex = Array.isArray(indexes) && indexes.includes('*');
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
		.filter((index) => !index.includes('metricbeat-'))
		.filter((index) => hasAllIndex || indexes?.includes(index))
		.reduce((acc, key) => {
			const { properties } =
				get(mappings[key], 'mappings._doc') || mappings[key]?.mappings || mappings[key];
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
	if (
		Array.isArray(selectedIndexes) &&
		(selectedIndexes.length === 0 || selectedIndexes === '*')
	) {
		return ['*'];
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

export const getFieldWeight = (field, weightData) => {
	const weight = Number(weightData);
	switch (field) {
		case SUB_FIELDS.AUTOSUGGEST:
			return (weight ? weight * 0.1 : 0).toFixed(1);
		case SUB_FIELDS.LANGUAGE:
			return (weight ? weight * 0.9 : 0).toFixed(1);
		case SUB_FIELDS.SYNONYMS:
			return (weight ? weight * 0.7 : 0).toFixed(1);
		case SUB_FIELDS.DELIMITER:
			return (weight ? weight * 0.4 : 0).toFixed(1);
		case SUB_FIELDS.SEARCH:
			return (weight ? weight * 0.1 : 0).toFixed(1);
		case SUB_FIELDS.KEYWORD:
			return (weight ? weight : 0).toFixed(1);
		default:
			return weight.toFixed(1);
	}
};

export const getPossibleSubFields = () => {
	return Object.values(SUB_FIELDS);
};

export function getSubFields({
	fields,
	weight,
	address,
	skipSearch = false,
	skipAutosuggest = false,
	skipSynonyms = false,
	skipLang = false,
}) {
	if (fields) {
		const fieldsToMap = Array.isArray(fields) ? fields : Object.keys(fields);
		const subFields = fieldsToMap
			.filter((field) => {
				if (skipSearch && field === 'search') return false;
				if (skipAutosuggest && field === 'autosuggest') return false;
				if (skipSynonyms && field === 'synonyms') return false;
				if (skipLang && field === 'lang') return false;
				return true;
			})
			.reduce((agg, field) => {
				return {
					...agg,
					[`${address}.${field}`]: getFieldWeight(field, weight),
				};
			}, {});

		return { [address]: Number(weight).toFixed(1), ...subFields };
	}

	return { [address]: Number(weight).toFixed(1) };
}

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
		if (mappings[key].type !== 'nested') {
			if (mappings[key].properties) {
				tree = {
					...tree,
					...getFieldsTree(
						mappings[key].properties,
						`${prefix ? `${prefix}.` : ''}${key}`,
					),
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
		}
	});
	return tree;
};

export const getParsedRoutes = (routes = {}) =>
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

export const getAuthorizedViews = (routes = {}, allowedActions = [], backend) => {
	// overview page is showed only if user has develop, analytics or search relevancy access
	const hasOverviewPageAccess =
		(backend === BACKENDS.ELASTICSEARCH.name ||
			backend === BACKENDS.ELASTICSEARCH_SERVERLESS.name ||
			backend === BACKENDS.OPENSEARCH.name ||
			backend === BACKENDS.ZINC.name ||
			backend === BACKENDS.SYSTEM.name) &&
		allowedActions.some(
			(i) =>
				i === ALLOWED_ACTIONS.DEVELOP ||
				i === ALLOWED_ACTIONS.ANALYTICS ||
				i === ALLOWED_ACTIONS.SEARCH_RELEVANCY,
		);

	const authorizedViews = Object.keys(routes)
		.filter((r) => {
			const routeAction = get(routes, `${r}.action`);

			if (routeAction) {
				if (routeAction === ALLOWED_ACTIONS.OVERVIEW) {
					return hasOverviewPageAccess;
				} else {
					return allowedActions.includes(routeAction);
				}
			} else {
				return true;
			}
		})
		.reduce((res, key) => {
			return {
				...res,
				[key]: { ...routes[key] },
			};
		}, {});

	return authorizedViews;
};

// this function takes in parsedRoutes which are already parsed through getAuthorizedViews
// hence it would always have authorized list of routes and we don't need to match against allowedActions
export const getAuthorizedRoutes = (routes = {}) => {
	const parsedRoutes = getParsedRoutes(routes);
	return parsedRoutes.reduce((agg, i) => ({ ...agg, [i.link || '/']: i }), {});
};

export const hasClusterEditAccess = (allowedActions = []) =>
	allowedActions.some(
		(i) => i === ALLOWED_ACTIONS.DEVELOP || i === ALLOWED_ACTIONS.SEARCH_RELEVANCY,
	);
// Compare pre-release identifiers
const comparePreRelease = (preReleaseA, preReleaseB) => {
	// If both pre-release identifiers are absent, they are equal
	if (!preReleaseA && !preReleaseB) return 0;
	// If pre-release identifier A is absent, it is considered higher version
	if (!preReleaseA) return 1;
	// If pre-release identifier B is absent, it is considered higher version
	if (!preReleaseB) return -1;

	// Split pre-release identifiers by '.' and compare each part
	const preReleaseASplit = preReleaseA.split('.');
	const preReleaseBSplit = preReleaseB.split('.');

	// Iterate through parts of pre-release identifiers and compare them
	for (let i = 0; i < Math.max(preReleaseASplit.length, preReleaseBSplit.length); i++) {
		const partA = parseInt(preReleaseASplit[i], 10) || 0;
		const partB = parseInt(preReleaseBSplit[i], 10) || 0;

		if (partA > partB) {
			return 1;
		} else if (partA < partB) {
			return -1;
		}
	}

	// If all parts are equal, the pre-release identifiers are equal
	return 0;
};

// Compare two version numbers with optional pre-release identifiers
export const compareVersion = (versionA = '0.0.0', versionB = '0.0.0') => {
	// If the version numbers are equal, there is no need to compare further
	if (versionA === versionB) {
		return 0;
	}

	// Split the main version numbers and pre-release identifiers
	const [mainVersionA, preReleaseA] = versionA.split('-');
	const [mainVersionB, preReleaseB] = versionB.split('-');

	const versionASplit = mainVersionA.split('.');
	const versionBSplit = mainVersionB.split('.');

	// Compare the main version numbers (major, minor, patch)
	for (let i = 0; i < versionASplit.length; i++) {
		const partA = parseInt(versionASplit[i], 10);
		const partB = parseInt(versionBSplit[i], 10);

		if (partA > partB) {
			return 1;
		} else if (partA < partB) {
			return -1;
		}
	}

	// If the main version numbers are equal, compare the pre-release identifiers
	return comparePreRelease(preReleaseA, preReleaseB);
};

export const unflattenObject = (flatObj) =>
	Object.keys(flatObj).reduce((agg, key) => set(agg, key, flatObj[key]), {});

export const renameObjectKey = (oldObj, oldName, newName) => {
	const newObj = {};

	Object.keys(oldObj).forEach((key) => {
		const value = oldObj[key];

		if (key === oldName) {
			newObj[newName] = value;
		} else {
			newObj[key] = value;
		}
	});

	return newObj;
};

export async function getEndpoints() {
	try {
		const authToken = localStorage.getItem('authToken');
		const ACC_API = getURL();
		let url = `${ACC_API}/reactivesearch/endpoints`;

		const response = await fetch(url, {
			method: 'GET',
			headers: {
				Authorization: `Basic ${authToken}`,
			},
		});

		if (response.status >= 400) {
			return response;
		}
		const data = await response.json();

		return data;
	} catch (error) {
		console.log('Error loading endpoints', error);
		return error;
	}
}

// util function to get the index expression
export function getIndexExpr(selectIndexes) {
	const indexExpr = [];
	for (let i = 0; i < selectIndexes.length; i += 1) {
		if (selectIndexes[i] === '*') {
			return '';
		}
		indexExpr.push(`'${selectIndexes[i]}' in $index`);
	}
	if (indexExpr.length === 0) {
		return '';
	}
	return `(${indexExpr.join(' or ')})`;
}
