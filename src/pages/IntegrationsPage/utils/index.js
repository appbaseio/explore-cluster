import get from 'lodash/get';
import { componentTypes } from '@appbaseio/reactivesearch';
import templates from '../../../../template-sources-output.json';
// eslint-disable-next-line
import {
	getSearchPreferencesPayload,
	defaultSearchPreferences,
	filterConfigurationFormDefaultFields,
} from './utils';

export const deployStatusMapper = {
	QUEUED: '🕓',
	BUILDING: '🕓',
	ERROR: '❌',
	INITIALIZING: '🕓',
	READY: '✅',
	CANCELED: '❌',
};

export const getStringifiedObj = (obj = {}) => {
	let str = '{\n';
	Object.entries(obj).forEach(([key, value]) => {
		str += `\t\t\t"${key}":`;
		// eslint-disable-next-line
		if (typeof value === 'boolean' || (typeof value === 'number' && isFinite(value)))
			str += `{${value}}\n`;
		else if (typeof value === 'object') str += `{${JSON.stringify(value)}}\n`;
		else str += `"${value}"\n`;
	});
	str += '\t\t}';

	return str;
};

export function timeDifference(current, previous) {
	const msPerMinute = 60 * 1000;
	const msPerHour = msPerMinute * 60;
	const msPerDay = msPerHour * 24;
	const msPerMonth = msPerDay * 30;
	const msPerYear = msPerDay * 365;

	const elapsed = current - previous;

	if (elapsed < msPerMinute) {
		return `${
			Math.round(elapsed / 1000) === 1 ? '1 second' : `${Math.round(elapsed / 1000)} seconds`
		} ago`;
	}
	if (elapsed < msPerHour) {
		return `${
			Math.round(elapsed / msPerMinute) === 1
				? '1 minute'
				: `${Math.round(elapsed / msPerMinute)} minutes`
		} ago`;
	}
	if (elapsed < msPerDay) {
		return `${
			Math.round(elapsed / msPerHour) === 1
				? '1 hour'
				: `${Math.round(elapsed / msPerHour)} hours`
		} ago`;
	}
	if (elapsed < msPerMonth) {
		return `${
			Math.round(elapsed / msPerDay) === 1
				? '1 day'
				: `${Math.round(elapsed / msPerDay)} days`
		} ago`;
	}
	if (elapsed < msPerYear) {
		return `${
			Math.round(elapsed / msPerMonth) === 1
				? '1 month'
				: `${Math.round(elapsed / msPerMonth)} months`
		} ago`;
	}
	return `${
		Math.round(elapsed / msPerYear) === 1
			? '1 year'
			: `${Math.round(elapsed / msPerYear)} years`
	} ago`;
}

export const unsafeChars = [' ', '<', '>', '%', '{', '}', '|', '\\', '^'];
export const getAuthToken = () => {
	let token = null;
	try {
		token = localStorage.getItem('authToken');
	} catch (e) {
		// eslint-disable-next-line
		console.error(e);
	}
	return token;
};

export const updateConstantsWithPreferences = (preferences) => {
	return `
const appbasePrefs = ${JSON.stringify(preferences, null)};

export default JSON.stringify(appbasePrefs);
	`;
};

export const removeEmpty = (obj) => {
	const isArray = Array.isArray(obj);
	Object.keys(obj).forEach((k) => {
		if (obj[k] === null) {
			if (isArray) {
				obj.splice(k, 1);
			} else {
				// eslint-disable-next-line
				delete obj[k];
			}
		} else if (typeof obj[k] === 'object') {
			removeEmpty(obj[k]);
		}
		if (isArray && obj.length === k) {
			removeEmpty(obj);
		}
	});

	return obj;
};

export const getTemplate = (template) => {
	return templates.filter((i) => i.name === template)[0] || {};
};

export const transformResultsDefaultFields = (prefs) => {
	const preferences = { ...JSON.parse(JSON.stringify(prefs)) };
	const { pageSettings } = preferences;
	const componentSettings = get(
		pageSettings,
		`pages.${pageSettings.currentPage}.componentSettings`,
		{},
	);
	const defaultFields = removeEmpty(get(componentSettings, 'result.displayFields._default', {}));
	const fields = get(componentSettings, 'result.fields', {});
	if (
		JSON.stringify(defaultFields) !== JSON.stringify(fields) &&
		Object.keys(defaultFields).length
	) {
		componentSettings.search.fields = defaultFields;
		componentSettings.result.fields = defaultFields;
		preferences.pageSettings.pages[pageSettings.currentPage].componentSettings =
			componentSettings;
		return preferences;
	}
	if (
		preferences.globalSettings &&
		preferences.globalSettings.endpoint &&
		!preferences.globalSettings.endpoint.url
	)
		preferences.globalSettings.endpoint.url = '/_fusion/_reactivesearch';
	return preferences;
};

// Generate the pageSettings from resultSettings, searchSettings, facetSettings during save to B.E
export const transformPreferences = (preferences) => {
	// const pageRoutes = templateObj.pages;
	const newPreferences = { ...preferences };
	const { facetSettings, chartSettings } = preferences;

	let componentSettings = {
		search: {
			componentType: componentTypes.searchBox,
			...newPreferences.searchSettings,
		},
		result: {
			componentType: componentTypes.reactiveList,
			...newPreferences.resultSettings,
		},
	};

	if (facetSettings.dynamicFacets) {
		let newObj = {};
		let filterType = '';
		if (facetSettings.dynamicFacets.length) {
			facetSettings.dynamicFacets.forEach((facet, idx) => {
				const data = { ...facet };
				data.rsConfig = filterConfigurationFormDefaultFields({ ...(data?.rsConfig || {}) });

				if (data?.rsConfig?.filterType === 'list') {
					filterType = 'multiList';
				} else if (
					data?.rsConfig?.filterType === 'date' ||
					data?.rsConfig?.filterType === 'range'
				) {
					if (data?.rsConfig?.startValue && data?.rsConfig?.endValue) {
						filterType = 'rangeInput';
					} else {
						filterType = 'dynamicRangeSlider';
					}
				} else {
					filterType = 'dynamicRangeSlider';
				}

				const newComponentId = `${
					data.rsConfig.title ? data.rsConfig.title.split(' ').join('_') : ''
				}_${idx}`;
				newObj = {
					...newObj,
					[newComponentId]: {
						...data,
						rsConfig: {
							...data.rsConfig,
							componentId: newComponentId,
						},
						componentType: data?.rsConfig?.componentType || componentTypes[filterType],
						facetType: 'dynamic',
					},
				};
			});
			componentSettings = {
				...componentSettings,
				...newObj,
			};
		}
	}

	if (chartSettings) {
		let newCompononentSettings = {};
		if (chartSettings.charts.length) {
			chartSettings.charts.forEach((chart, idx) => {
				const newComponentId = `${chart.rsConfig.title.split(' ').join('_')}_${idx}`;
				newCompononentSettings = {
					...newCompononentSettings,
					[newComponentId]: {
						...chart,
						rsConfig: {
							...chart.rsConfig,
							componentId: newComponentId,
						},
					},
				};
			});
		}
		componentSettings = {
			...componentSettings,
			...newCompononentSettings,
		};
	}

	if (newPreferences.pageSettings && newPreferences.pageSettings.currentPage) {
		const { currentPage } = newPreferences.pageSettings;
		newPreferences.pageSettings = {
			...newPreferences.pageSettings,
			pages: {
				...newPreferences.pageSettings.pages,
				[newPreferences.pageSettings.currentPage]: {
					componentSettings,
					indexSettings: {
						...get(
							newPreferences,
							`pageSettings.pages.${currentPage}.indexSettings`,
							{},
						),
					},
				},
			},
			currentPage: newPreferences.pageSettings.currentPage,
		};
	} else {
		// Ui builder creation: Wizard flow
		const themeType = get(preferences, 'themeSettings.type', '');
		const template = getTemplate(themeType);
		if (Object.keys(template?.pages || []).length) {
			// Generate pageSettings and fields for defaultPageSettings
			let pageSettings = {
				fields: get(
					componentSettings,
					'result.fields',
					get(newPreferences, 'resultSettings.fields', {}),
				),
			};
			Object.keys(template.pages || []).forEach((page, idx) => {
				pageSettings = {
					...pageSettings,
					pages: {
						...(pageSettings.pages || {}),
						[page]: {
							componentSettings,
							indexSettings: {
								index: '',
							},
						},
					},
				};
				if (idx === 0) pageSettings.currentPage = page;
			});
			newPreferences.pageSettings = pageSettings;
		} else {
			newPreferences.componentSettings = componentSettings;
		}
	}

	delete newPreferences.resultSettings;
	delete newPreferences.searchSettings;
	delete newPreferences.facetSettings;
	delete newPreferences.indexSettings;
	return newPreferences;
};

export const defaultPageSettings = (fields = {}) => {
	const fieldsObj = Object.keys(fields).length ? { fields } : {};
	const defaultSettings = getSearchPreferencesPayload(defaultSearchPreferences);
	// get componentSettings from defaultSettings and replace fields in resultSettings with fields from pageSettings.
	const componentSettings = {
		search: {
			componentType: componentTypes.searchBox,
			...defaultSettings.searchSettings,
			...fieldsObj,
		},
		result: {
			componentType: componentTypes.reactiveList,
			...defaultSettings.resultSettings,
			...fieldsObj,
		},
	};

	return componentSettings;
};

// Trasform the preferences from B.E to get resultSettings, searchSettings, facetSettings from pageSettings of currentPage selected.
export const reOrderPreferences = (prefs, page = '') => {
	let newPreferences = {};
	let compSettings = {};
	if (prefs && prefs.name && (prefs.pageSettings || prefs.componentSettings)) {
		newPreferences = { ...prefs };
		const facetSettings = {
			dynamicFacets: [],
		};
		const chartSettings = { charts: [] };
		if (newPreferences.pageSettings && Object.keys(newPreferences.pageSettings).length) {
			const { currentPage } = newPreferences.pageSettings;
			if (page || currentPage) {
				if (newPreferences.pageSettings.pages[page || currentPage]) {
					const { componentSettings } =
						newPreferences.pageSettings.pages[page || currentPage];
					compSettings = componentSettings;
				} else if (newPreferences.pageSettings.fields) {
					const componentSettings = defaultPageSettings(
						newPreferences.pageSettings.fields,
					);
					compSettings = componentSettings;
					newPreferences.pageSettings.pages[page] = {
						componentSettings,
					};
				} else {
					const componentSettings = defaultPageSettings();
					compSettings = componentSettings;
					newPreferences.pageSettings.pages[page] = {
						componentSettings,
					};
				}
				newPreferences.pageSettings.currentPage = page || currentPage;

				const pageConfig = newPreferences.pageSettings.pages[page || currentPage];
				newPreferences.indexSettings = {
					...(pageConfig.indexSettings || {}),
				};
			}
		} else {
			const { componentSettings } = newPreferences;
			compSettings = componentSettings;
			newPreferences.indexSettings = {
				index: '',
			};
		}

		delete compSettings?.result?.componentType;
		delete compSettings?.search?.componentType;

		newPreferences.resultSettings = {
			...compSettings.result,
		};
		newPreferences.searchSettings = {
			...compSettings.search,
		};

		Object.keys(compSettings).forEach((facet) => {
			if (facet !== 'search' && facet !== 'result') {
				// If component is a chart
				if (compSettings[facet].rsConfig.componentType === componentTypes.reactiveChart) {
					const arr = compSettings[facet].rsConfig.componentId.split('_');
					const idx = arr.pop() || 0;

					chartSettings.charts[idx] = compSettings[facet];
				} else if (compSettings[facet].rsConfig.title) {
					const newFacetObj = { ...compSettings[facet] };
					if (newFacetObj.facetType) delete newFacetObj.facetType;
					delete newFacetObj.componentType;

					if (compSettings[facet].facetType !== 'static') {
						const arr = compSettings[facet].rsConfig.componentId.split('_');
						const idx = arr.pop() || 0;
						facetSettings.dynamicFacets[idx] = newFacetObj;
					}
				}
			}
		});

		facetSettings.dynamicFacets = facetSettings.dynamicFacets.filter((n) => n);
		chartSettings.charts = chartSettings.charts.filter((n) => n);
		newPreferences.facetSettings = facetSettings;
		newPreferences.chartSettings = chartSettings;
		delete newPreferences?.componentSettings;

		return newPreferences;
	}
	return prefs;
};

export const facetKeyLabel = {
	chartType: 'Chart Type',
	enabled: 'Enabled',
	componentId: 'Component Id',
	componentType: 'Component Type',
	title: 'Title',
	dataField: 'DataField',
	useAsFilter: 'Use As Filter',
	defaultQuery: 'Default Query',
	setOption: 'Set Option',
	type: 'Type',
	filterType: 'Filter Type',
	queryFormat: 'Query Format',
	showCheckbox: 'Show Checkbox',
	showCount: 'Show Count',
	showMissing: 'Show Missing',
	showSearch: 'Show Search',
	sortBy: 'Sort By',
	startValue: 'Start Value',
	endValue: 'End Value',
	startLabel: 'Start Label',
	endLabel: 'End Label',
	showHistogram: 'Show Histogram',
	missingLabel: 'Missing Label',
	selectAllLabel: 'SelectAll Label',
	xAxisField: 'X-Axis Field',
	yAxisField: 'Y-Axis Field',
	xAxisName: 'X-Axis Name',
	yAxisName: 'Y-Axis Name',
	size: 'Size',
	multiSelect: 'Multi Select',
	filterLabel: 'Filter Label',
	data: 'Data',
	calendarInterval: 'Calendar Interval',
	loading: 'Loading Message',
	noResults: 'No Results Message',
};
