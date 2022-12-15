import { getURL } from '../../../constants/config';
import { getAuthToken } from './index';

export function addDomain(id, body) {
	const ACC_API = getURL();
	const token = getAuthToken();
	const url = `${ACC_API}/_uibuilder/${id}/domain`;

	const options = {
		method: 'POST',
		headers: {
			authorization: `Basic ${token}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(body),
	};

	return fetch(url, options);
}

export function getDomainStatus(id, domainName) {
	const ACC_API = getURL();
	const token = getAuthToken();

	const url = `${ACC_API}/_uibuilder/${id}/domain/${domainName}`;

	const options = {
		method: 'GET',
		headers: {
			authorization: `Basic ${token}`,
			'Content-Type': 'application/json',
		},
	};

	return fetch(url, options);
}

export function getAllDomains(id) {
	const ACC_API = getURL();
	const token = getAuthToken();
	const url = `${ACC_API}/_uibuilder/${id}/domain`;
	const options = {
		method: 'GET',
		headers: {
			authorization: `Basic ${token}`,
			'Content-Type': 'application/json',
		},
	};

	return fetch(url, options);
}

export function deleteDomain(id, domainName) {
	const ACC_API = getURL();
	const token = getAuthToken();

	const url = `${ACC_API}/_uibuilder/${id}/domain/${domainName}`;

	const options = {
		method: 'DELETE',
		headers: {
			authorization: `Basic ${token}`,
			'Content-Type': 'application/json',
		},
	};

	return fetch(url, options);
}
