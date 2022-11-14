import get from 'lodash/get';
import { getURL } from '../../../constants/config';
import files from '../../../../templates/files';
import { doGet, doPut } from '../../../batteries/utils/requestService';
import { getAuthToken, getTemplate } from './index';

export const templateConfigMap = {
	reactivechart: [
		'/src/components/GeoLayout/GeoResultsLayout.js',
		'/src/components/GeoLayout/LayoutSwitch.js',
		'/src/components/GeoLayout/ListLayout.js',
		'/src/components/GeoLayout/ResultsLayout.js',
	],
	'auth0-classic': [
		'/src/components/GeoLayout/GeoResultsLayout.js',
		'/src/components/GeoLayout/LayoutSwitch.js',
		'/src/components/GeoLayout/ListLayout.js',
		'/src/components/GeoLayout/ResultsLayout.js',
	],
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

export const excludedArr = [
	'/.eslintignore',
	'/.eslintrc.js',
	'/.gitignore',
	'/.nvmrc',
	'/.prettierrc.js',
	'/.vscode',
	'/README.md',
	'/build',
	'/node_modules',
	'/config-overrides.js',
	'/yarn.lock',
	'.eslintignore',
	'.eslintrc.js',
	'.gitignore',
	'.nvmrc',
	'.prettierrc.js',
	'.vscode',
	'README.md',
	'build',
	'node_modules',
	'config-overrides.js',
	'yarn.lock',
	'.editorconfig',
	'.git',
	'LICENSE.md',
];

export const tabSettings = {
	reactivechart: {
		openPaths: ['/public/index.html', '/src/components/AllFilters.js'],
		activePath: '/public/index.html',
	},
	'auth0-classic': {
		openPaths: [
			'/public/index.html',
			'/src/components/ResultsLayout.js',
			'/src/components/Search.js',
		],
		activePath: '/public/index.html',
	},
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

const getObjectStructure = (value) => {
	const [dataField = '', highlight = false] =
		typeof value === 'string' ? value.split('~') : ['', false];
	return { dataField, highlight: highlight === 'true' };
};

export const getObjectStructureReverse = (obj) => {
	if (obj instanceof Object && Object.keys(obj).length) {
		return `${obj.dataField}~${obj.highlight}`;
	}

	return obj;
};

const transformResultSettingsWithHighlight = (
	resultSettings,
	maintainStringFormatForFields = false,
) => {
	const newObj = {};
	Object.keys(resultSettings || {}).forEach((field) => {
		if (field === 'userDefinedFields') {
			newObj[field] = resultSettings[field];
		} else if (field !== 'priceUnit' && field !== 'cssSelector' && field !== 'handleViewer') {
			newObj[field] = maintainStringFormatForFields
				? getObjectStructureReverse(resultSettings[field])
				: getObjectStructure(resultSettings[field]);
		} else {
			newObj[field] = resultSettings[field];
		}
	});

	return newObj;
};

export const transformPreferences = (preferences, maintainStringFormatForFields = false) => {
	const newPreferences = JSON.parse(JSON.stringify({ ...preferences }));
	const { pageSettings } = newPreferences;
	const pages = get(newPreferences, 'pageSettings.pages', {});
	const pageSettingsFields = transformResultSettingsWithHighlight(
		pageSettings.fields,
		maintainStringFormatForFields,
	);
	newPreferences.pageSettings.fields = pageSettingsFields;
	const newPageSettings = {};
	Object.keys(pages).forEach((page) => {
		newPageSettings[page] = { ...pages[page] };
		const { componentSettings } = pages[page];
		const resultSettings = componentSettings.result;
		const { displayFields = {}, fields = {} } = resultSettings;
		const newResultSettings = { ...resultSettings };
		newResultSettings.fields = transformResultSettingsWithHighlight(
			fields,
			maintainStringFormatForFields,
		);

		const newDisplayFields = {};
		Object.keys(displayFields).forEach((field) => {
			newDisplayFields[field] = transformResultSettingsWithHighlight(
				displayFields[field],
				maintainStringFormatForFields,
			);
		});
		newResultSettings.displayFields = newDisplayFields;

		newPageSettings[page].componentSettings.result = newResultSettings;
		newPageSettings[page].componentSettings.search.fields = newResultSettings.fields;
	});
	newPreferences.pageSettings.pages = newPageSettings;
	return newPreferences;
};

export const preferencesInConstants = (code, prefs) => {
	const themeType = get(prefs, 'themeSettings.type', '');
	const template = getTemplate(themeType);
	const newPrefs = {
		...transformPreferences(prefs),
		appbaseSettings: {
			index: prefs.pipeline,
			credentials: get(prefs, 'exportSettings.credentials', ''),
			url: localStorage.getItem('url') || sessionStorage.getItem('url'),
		},
	};
	const newFiles = { ...code };
	newFiles[
		`/${
			template && template.preferences_path
				? template.preferences_path
				: 'src/utils/constants.js'
		}`
	] = `
const appbasePrefs = ${JSON.stringify(newPrefs, null, 2)};
export default JSON.stringify(appbasePrefs);
`;
	return newFiles;
};

export const generateInlineSandboxURL = async (preferences) => {
	let fileName = '';
	const themeType = get(preferences, 'themeSettings.type', '');
	const template = getTemplate(themeType);
	if (Object.keys(template).length) {
		if (template.version) {
			fileName = `${template.repository}@${template.version}`;
		} else if (template.commit) {
			fileName = `${template.repository}@${template.commit}`;
		} else if (template.branch) {
			fileName = `${template.repository}@${template.branch}`;
		} else {
			fileName = `${template.repository}@master`;
		}
		const newFiles = { ...files[fileName] };
		const newPrefs = {
			...transformPreferences(preferences),
			appbaseSettings: {
				index: preferences.pipeline,
				credentials: get(preferences, 'exportSettings.credentials', ''),
				url: localStorage.getItem('url') || sessionStorage.getItem('url'),
			},
		};
		const str =
			newFiles[
				`/${
					template && template.preferences_path
						? template.preferences_path
						: 'src/utils/constants.js'
				}`
			];
		if (str) {
			const newStr = str.replace(
				`'{{APPBASE_PREFERENCES}}'`,
				JSON.stringify(newPrefs, null, 2),
			);

			newFiles[
				`/${
					template && template.preferences_path
						? template.preferences_path
						: 'src/utils/constants.js'
				}`
			] = newStr;
		}
		return newFiles;
	}
	return {};
};

export const replaceWithPreferences = async (code, preferences) => {
	const themeType = get(preferences, 'themeSettings.type', '');
	const template = getTemplate(themeType);
	const newFiles = { ...code };
	const newPrefs = {
		...transformPreferences(preferences),
		appbaseSettings: {
			index: preferences.pipeline,
			credentials: get(preferences, 'exportSettings.credentials', ''),
			url: localStorage.getItem('url') || sessionStorage.getItem('url'),
		},
	};
	const str =
		newFiles[
			`/${
				template && template.preferences_path
					? template.preferences_path
					: 'src/utils/constants.js'
			}`
		];
	if (str) {
		const newStr = str.replace(`'{{APPBASE_PREFERENCES}}'`, JSON.stringify(newPrefs, null, 2));

		newFiles[
			`/${
				template && template.preferences_path
					? template.preferences_path
					: 'src/utils/constants.js'
			}`
		] = newStr;
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

export function getByVersionId(id, versionId) {
	const authToken = getAuthToken();
	const ACC_API = getURL();

	return doGet(`${ACC_API}/_uibuilder/${id}/code/version/${versionId}`, {
		'Content-Type': 'application/json',
		Authorization: `Basic ${authToken}`,
	});
}

export function getDeploymentStatus(id) {
	const ACC_API = getURL();
	const authToken = getAuthToken();

	return doGet(`${ACC_API}/_uibuilder/${id}/deploy`, {
		'Content-Type': 'application/json',
		Authorization: `Basic ${authToken}`,
	});
}

export function getDeploymentStatusByDeploymentId(id, deploymentId) {
	const ACC_API = getURL();
	const authToken = getAuthToken();

	return doGet(`${ACC_API}/_uibuilder/${id}/deploy/${deploymentId}`, {
		'Content-Type': 'application/json',
		Authorization: `Basic ${authToken}`,
	});
}

export function deployUiBuilder(id, body = {}) {
	const authToken = getAuthToken();
	const ACC_API = getURL();

	return doPut(`${ACC_API}/_uibuilder/${id}/deploy`, body, {
		'Content-Type': 'application/json',
		Authorization: `Basic ${authToken}`,
	});
}

export function getDeploymentLogs(id, clusterId = '', deploymentId = '') {
	const authToken = getAuthToken();
	// const ACC_API = getURL();

	return doGet(
		`https://accapi.appbase.io/uibuilder/deploy/${clusterId}/${id}/${deploymentId}/events?follow=1`,
		{
			'Content-Type': 'application/json',
			Authorization: `Basic ${authToken}`,
		},
	);
}

export const getChangedDetails = (arr = []) => {
	let added = 0;
	let removed = 0;
	(arr || []).forEach((element) => {
		if (element.added && element.value !== '\n') added += 1;

		if (element.removed && element.value !== '\n') removed += 1;
	});
	return { added, removed };
};
