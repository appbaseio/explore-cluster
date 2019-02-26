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
	const data = await response.json();
	if (response.status >= 400) {
		throw new Error(data);
	}

	return {
		username,
		password,
		authToken,
		isAdmin: data.is_admin,
	};
}

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
