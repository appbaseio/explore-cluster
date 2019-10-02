import { chain } from 'lodash';
import { getURL } from '../constants/config';

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

	const res = await fetch(`${api}/_buildinfo`, {
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
	data.forEach((item) => {
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
// checks whether it is a valid URL
export const isAbsoluteURL = str => /^[a-z][a-z0-9+.-]*:/.test(str);

// extract credentials from URL
export const getURLCredentials = url => {
	if (!isAbsoluteURL(url) || !url.includes('@')) return null;
	const credArr = chain(url).split('@').get(0).split('//').get(1).split(':').value();
	return { username: credArr[0], password: credArr[1] };
};

// remove trailing slashes from URL
export const removeTrailingSlashes = url => url.replace(/\/+$/, '');

// get protocol from url
export const getProtocol = url => {
	if (!isAbsoluteURL(url)) return;
	return url.split('/')[0];
};
