import { getURL } from '../../../constants/config';

const ACC_API = getURL();
const username = 'appbase';
const password = 'REDACTED_PASSWORD';
const baseURL = 'http://34.122.120.39:6764';

export const isFusion = true;

export const transformGeneralMappingsToFusionArrayFormat = ({ mappings } = { mappings: {} }) => {
	const transformedArray = [];
	if (mappings.properties instanceof Object && Object.keys(mappings.properties).length) {
		const propertiesKeys = Object.keys(mappings.properties);
		propertiesKeys.forEach((propertyKey) => {
			transformedArray.push({
				name: propertyKey,
				docCount: mappings.properties[propertyKey].doc_count,
			});
		});
	}

	return transformedArray;
};

export const getAllApps = () => {
	return fetch(
		`${ACC_API}/_fusion/api/apps?fusion_url=${baseURL}&username=${username}&password=${password}`,
	);
};

export const getQueryProfiles = (app) => {
	return fetch(
		`${ACC_API}/_fusion/api/apps/${app}/query-profiles?fusion_url=${baseURL}&username=${username}&password=${password}`,
	);
};

export const getSearchQueryFields = (query, profile) => {
	return fetch(
		`${ACC_API}/_fusion/api/suggestions/collections/${
			profile || 'appbase'
		}/schema/fields?q=${query}&fusion_url=${baseURL}&username=${username}&password=${password}`,
	);
};
