import { getURL } from '../../../constants/config';
import { getAuthToken, getValidURL } from '../../../utils';

const ACC_API = getURL();
const authToken = getAuthToken();
export const getApiGeneralization = (config = {}, attrs = {}) => {
	const newURL = getValidURL(config, attrs);

	return fetch(`${ACC_API}/${newURL}`, {
		headers: {
			'Content-Type': 'application/text',
			Authorization: `Basic ${authToken}`,
		},
	});
};
