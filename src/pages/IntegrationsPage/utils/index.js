import get from 'lodash/get';
import { componentTypes } from '@appbaseio/reactivesearch';
import templates from '../../../../template-sources-output.json';
import { getSearchPreferencesPayload, defaultSearchPreferences } from '../utils';

export const deployStatusMapper = {
	QUEUED: '🕓',
	BUILDING: '🕓',
	ERROR: '❌',
	INITIALIZING: '🕓',
	READY: '✅',
	CANCELED: '❌',
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

export const getTemplate = (template) => {
	return templates.filter((i) => i.name === template)[0] || {};
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
			facetSettings.dynamicFacets.forEach((data) => {
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

				newObj = {
					...newObj,
					[data.rsConfig.componentId]: {
						...data,
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

	if (facetSettings.staticFacets) {
		// collection, productType, color, size, price
		let newObj = {};
		let filterType = '';
		if (facetSettings.staticFacets.length) {
			facetSettings.staticFacets.forEach((data) => {
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

				newObj = {
					...newObj,
					[data.name]: {
						...data,
						componentType: data?.rsConfig?.componentType || componentTypes[filterType],
						facetType: 'static',
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
			chartSettings.charts.forEach((chart) => {
				newCompononentSettings = {
					...newCompononentSettings,
					[chart.rsConfig.componentId]: chart,
				};
			});
		}
		componentSettings = {
			...componentSettings,
			...newCompononentSettings,
		};
	}

	if (newPreferences.pageSettings && newPreferences.pageSettings.currentPage) {
		newPreferences.pageSettings = {
			...newPreferences.pageSettings,
			pages: {
				...newPreferences.pageSettings.pages,
				[newPreferences.pageSettings.currentPage]: {
					componentSettings,
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
	return newPreferences;
};

export const defaultPageSettings = (fields = {}) => {
	const fieldsObj = Object.keys(fields).length ? { fields } : {};
	const defaultSettings = getSearchPreferencesPayload(defaultSearchPreferences);
	const { facetSettings } = defaultSettings;
	// get componentSettings from defaultSettings and replace fields in resultSettings with fields from pageSettings.
	let componentSettings = {
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

	if (facetSettings.staticFacets) {
		// collection, productType, color, size, price
		let newObj = {};
		let filterType = '';
		if (facetSettings.staticFacets.length) {
			facetSettings.staticFacets.forEach((data) => {
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

				newObj = {
					...newObj,
					[data.name]: {
						...data,
						componentType: data?.rsConfig?.componentType || componentTypes[filterType],
						facetType: 'static',
					},
				};
			});
			componentSettings = {
				...componentSettings,
				...newObj,
			};
		}
	}
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
			}
		} else {
			const { componentSettings } = newPreferences;
			compSettings = componentSettings;
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
					chartSettings.charts.push(compSettings[facet]);
				} else if (compSettings[facet].rsConfig.title) {
					const newFacetObj = { ...compSettings[facet] };
					if (newFacetObj.facetType) delete newFacetObj.facetType;
					delete newFacetObj.componentType;

					if (compSettings[facet].facetType !== 'static') {
						facetSettings.dynamicFacets.push(newFacetObj);
					}
				}
			}
		});

		newPreferences.facetSettings = facetSettings;
		newPreferences.chartSettings = chartSettings;
		delete newPreferences?.componentSettings;
		return newPreferences;
	}
	return prefs;
};
