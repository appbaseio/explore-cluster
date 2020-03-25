import { getURL } from '../../../constants/config';
import { getAuthHeaders } from '../../../batteries/utils/mappings';

export const getSynonyms = ({ appName, credentials }) => {
	const url = getURL();
	return new Promise((resolve, reject) => {
		fetch(`${url}/_synonyms/${appName}`, {
			method: 'GET',
			headers: {
				...getAuthHeaders(credentials),
				'Content-Type': 'application/json',
			},
		})
			.then(res => res.json())
			.then(res => resolve(res))
			.catch(e => reject(e));
	});
};

export const updateSynonyms = ({ appName, credentials, synonyms }) => {
	const url = getURL();
	return new Promise((resolve, reject) => {
		fetch(`${url}/_synonym/${appName}`, {
			method: 'PUT',
			headers: {
				...getAuthHeaders(credentials),
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(synonyms),
		})
			.then(res => res.json())
			.then(res => resolve(res))
			.catch(e => reject(e));
	});
};

export const deleteSynonym = ({ id, credentials }) => {
	const url = getURL();
	return new Promise((resolve, reject) => {
		fetch(`${url}/_synonym/${id}`, {
			method: 'DELETE',
			headers: {
				...getAuthHeaders(credentials),
				'Content-Type': 'application/json',
			},
		})
			.then(res => res.json())
			.then(res => resolve(res))
			.catch(e => reject(e));
	});
};
