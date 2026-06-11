import { getURL } from '../constants/config';

function getStorageItem(key) {
	try {
		return localStorage.getItem(key) || sessionStorage.getItem(key);
	} catch (e) {
		return null;
	}
}

function decodeBasicCredentials(token) {
	if (!token) {
		return { username: '', password: '' };
	}

	const raw = token.startsWith('Basic ') ? token.slice(6).trim() : token;

	try {
		const decoded = atob(raw);
		const separator = decoded.indexOf(':');
		if (separator > -1) {
			return {
				username: decoded.slice(0, separator),
				password: decoded.slice(separator + 1),
			};
		}
	} catch (e) {
		// ignore decode errors
	}

	return { username: '', password: '' };
}

/**
 * Default cluster settings for the data importer, derived from the active RS session.
 * Returns null when no cluster URL or credentials are available.
 */
export function getImporterClusterConfig() {
	const url = getURL();
	if (!url) {
		return null;
	}

	let authToken = getStorageItem('authToken');
	let username = getStorageItem('username') || '';
	let password = getStorageItem('password') || '';

	if (!username || !password) {
		const decoded = decodeBasicCredentials(authToken);
		username = username || decoded.username;
		password = password || decoded.password;
	}

	if (!authToken && username && password) {
		try {
			authToken = btoa(`${username}:${password}`);
		} catch (e) {
			return null;
		}
	}

	if (!authToken) {
		return null;
	}

	let authHeader = authToken;
	if (!authHeader.startsWith('Basic ') && !authHeader.startsWith('ApiKey ')) {
		authHeader = `Basic ${authHeader}`;
	}

	const authMode = authHeader.startsWith('ApiKey ') ? 'custom' : 'basic';

	return {
		url,
		authHeader,
		authMode,
		username,
		password,
	};
}
