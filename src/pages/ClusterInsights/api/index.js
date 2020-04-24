import { getURL } from '../../../constants/config';
import { getAuthHeaders } from '../../../batteries/utils/mappings';

export const getSubscription = (credentials) => {
	return new Promise((resolve, reject) => {
		fetch(`${getURL()}/arc/curated_insights`, {
			method: 'GET',
			headers: {
				...getAuthHeaders(credentials),
				'Content-Type': 'application/json',
			},
		})
			.then((res) => res.json())
			.then((res) => {
				resolve(res);
			})
			.catch((e) => {
				reject(e);
			});
	});
};

export const updateSubscription = ({ token, credentials }) => {
	return new Promise((resolve, reject) => {
		fetch(`${getURL()}/arc/curated_insights`, {
			method: 'POST',
			body: JSON.stringify({ token }),
			headers: {
				...getAuthHeaders(credentials),
				'Content-Type': 'application/json',
			},
		})
			.then((res) => res.json())
			.then((res) => {
				resolve(res);
			})
			.catch((e) => {
				reject(e);
			});
	});
};

export const deleteSubscription = (credentials) => {
	return new Promise((resolve, reject) => {
		fetch(`${getURL()}/arc/curated_insights`, {
			method: 'DELETE',
			headers: {
				...getAuthHeaders(credentials),
				'Content-Type': 'application/json',
			},
		})
			.then((res) => res.json())
			.then((res) => {
				resolve(res);
			})
			.catch((e) => {
				reject(e);
			});
	});
};
