import { getURL } from '../../../constants/config';
import files from '../../../../constants/files';
import { doGet, doPut } from '../../../batteries/utils/requestService';
import { getAuthToken } from './index';

export const templateConfigMap = {
	classic: [
		'/src/components/GeoLayout/GeoResultsLayout.js',
		'/src/components/GeoLayout/LayoutSwitch.js',
		'/src/components/GeoLayout/ListLayout.js',
		'/src/components/GeoLayout/ResultsLayout.js',
	],
	minimal: [
		'/src/components/GeoLayout/GeoResultsLayout.js',
		'/src/components/GeoLayout/LayoutSwitch.js',
		'/src/components/GeoLayout/ListLayout.js',
		'/src/components/GeoLayout/ResultsLayout.js',
	],
	geo: ['/src/components/LayoutSwitch.js', '/src/components/ResultsLayout.js'],
};

export const tabSettings = {
	classic: {
		openPaths: [
			'/public/index.html',
			'/src/components/ResultsLayout.js',
			'/src/components/Search.js',
		],
		activePath: '/public/index.html',
	},
	minimal: {
		openPaths: [
			'/public/index.html',
			'/src/components/ResultsLayout.js',
			'/src/components/Search.js',
		],
		activePath: '/public/index.html',
	},
	geo: {
		openPaths: [
			'/src/components/GeoLayout/GeoResultsLayout.js',
			'/src/components/GeoLayout/ListLayout.js',
			'/src/components/GeoLayout/ResultsLayout.js',
		],
		activePath: '/src/components/GeoLayout/GeoResultsLayout.js',
	},
};

export const generateInlineSandboxURL = async (preferences) => {
	const newFiles = { ...files };
	const str = newFiles['/src/utils/constants.js'];
	if (str) {
		const newStr = str.replace(
			`'{{APPBASE_PREFERENCES}}'`,
			JSON.stringify(JSON.stringify(preferences)),
		);

		newFiles['/src/utils/constants.js'] = newStr;
	}
	return newFiles;
};

export const replaceWithPreferences = async (code, preferences) => {
	const newFiles = { ...code };
	const str = newFiles['/src/utils/constants.js'];
	if (str) {
		const newStr = str.replace(
			`'{{APPBASE_PREFERENCES}}'`,
			JSON.stringify(JSON.stringify(preferences)),
		);

		newFiles['/src/utils/constants.js'] = newStr;
	}
	return newFiles;
};

export function commitCode(id, body = {}) {
	const authToken = getAuthToken();
	const ACC_API = getURL();

	return doPut(`${ACC_API}/_uibuilder/${id}/code`, body, {
		'Content-Type': 'application/json',
		Authorization: `Basic ${authToken}`,
	});
}

export function getAllVersions(id) {
	const authToken = getAuthToken();
	const ACC_API = getURL();

	return doGet(`${ACC_API}/_uibuilder/${id}/code/versions`, {
		'Content-Type': 'application/json',
		Authorization: `Basic ${authToken}`,
	});
}

export function getLatestVersion(id) {
	const authToken = getAuthToken();
	const ACC_API = getURL();

	return doGet(`${ACC_API}/_uibuilder/${id}/code`, {
		'Content-Type': 'application/json',
		Authorization: `Basic ${authToken}`,
	});
}

export async function getByVersionId(id, versionId) {
	const authToken = getAuthToken();
	const ACC_API = getURL();

	return doGet(`${ACC_API}/_uibuilder/${id}/code/version/${versionId}`, {
		'Content-Type': 'application/json',
		Authorization: `Basic ${authToken}`,
	});
}

export function getDeploymentStatus(id, versionId) {
	const ACC_API = getURL();
	const authToken = getAuthToken();

	return doGet(`${ACC_API}/_uibuilder/${id}/deploy_status?version=${versionId}`, {
		'Content-Type': 'application/json',
		Authorization: `Basic ${authToken}`,
	});
}
