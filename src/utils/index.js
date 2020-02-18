import { chain, keys } from 'lodash';
import { getURL } from '../constants/config';
import { notification } from 'antd';
import { updateFunctions } from '../batteries/utils/app';

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
	const response = await fetch(`${ACC_API}/_cat/indices?format=json`, {
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
	data.forEach(item => {
		indices[item.index] = item;
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
			.then(res => res.json())
			.then(data => resolve({ ...data, message: data.message }))
			.catch(error => reject(error));
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
				'You need to upgrade Arc (appbase.io) to v7.11.0 or above to take advantage of this feature.',
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
			.then(res => res.json())
			.then(data => resolve({ ...data.body, message: data.message }))
			.catch(error => reject(error));
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
export const isAbsoluteURL = str => /^[a-z][a-z0-9+.-]*:/.test(str);

// extract credentials from URL
export const getURLCredentials = url => {
	if (!isAbsoluteURL(url) || !url.includes('@')) return null;
	const credArr = chain(url)
		.split('@')
		.get(0)
		.split('//')
		.get(1)
		.split(':')
		.value();
	return { username: credArr[0], password: credArr[1] };
};

// remove trailing slashes from URL
export const removeTrailingSlashes = url => url.replace(/\/+$/, '');

// get protocol from url
export const getProtocol = url => {
	if (!isAbsoluteURL(url)) return;
	return url.split('/')[0];
};

// https://{url}?search=xyz => {search: xyz}
export const getURLParameters = url =>
	(url.match(/([^?=&]+)(=([^&]*))/g) || []).reduce(
		(a, v) => ((a[v.slice(0, v.indexOf('='))] = v.slice(v.indexOf('=') + 1)), a),
		{},
	);

export const isEmpty = val => val == null || !(Object.keys(val) || val).length;

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
		throw data.error.message;
	}
	return mappings;
}

export function getDatafields(mappings, indexes) {
	const hasAllIndex = indexes.includes('*');
	const dataFields = Object.keys(mappings)
		.filter(index => !index.startsWith('.'))
		.filter(index => hasAllIndex || indexes.includes(index))
		.reduce((acc, key) => {
			const { properties } = mappings[key].mappings;
			const nestedDataFields = keys(properties).filter(property => {
				return (
					properties[property].type === 'string' || properties[property].type === 'text'
				);
			});
			return [...acc, ...nestedDataFields];
		}, []);

	return [...new Set(dataFields)];
}

export function updateFunction(selectedFunction, res) {
	if (selectedFunction) {
		// eslint-disable-next-line no-param-reassign
		selectedFunction.queryRules = [...(selectedFunction.queryRules || []), res.payload.id]
			// remove duplicate rule ids
			.filter((value, index, self) => {
				return self.indexOf(value) === index;
			});
		notification.info({
			message: 'Updating Function',
			description: `Updating function ${selectedFunction.service} with ${res.payload.name} rule`,
		});
		updateFunctions(selectedFunction.service, selectedFunction)
			.then(() => {
				notification.success({
					message: 'Success',
					description: `Function ${selectedFunction.service} updated successfully.`,
				});
			})
			.catch(e => {
				notification.error({
					message: 'Error',
					description: e,
				});
			});
	}
}
