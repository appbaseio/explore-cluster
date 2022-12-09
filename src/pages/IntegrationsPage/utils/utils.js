import React from 'react';
import get from 'lodash/get';
import { FormBuilder, Validators } from 'react-reactive-form';
import { css } from 'emotion';
import { componentTypes } from '@appbaseio/reactivesearch';
import { diff } from 'jsondiffpatch';
import isEqual from 'lodash/isEqual';
import { isEqualWith } from 'lodash';
// eslint-disable-next-line import/no-cycle
import { removeEmpty } from './index';
import { BACKENDS } from '../../../batteries/utils';

// eslint-disable-next-line
export const FormContext = React.createContext(null);

export const verticalTab = css`
	margin-top: 10px;
	.ant-tabs-bar .ant-tabs-nav-wrap .ant-tabs-nav-scroll .ant-tabs-nav .ant-tabs-tab {
		text-align: left !important;
	}
	.ant-row {
		margin-right: 0 !important;
		margin-left: 0 !important;
	}

	.ant-col:first-child {
		padding-left: 0 !important;
	}

	.ant-col:last-child {
		padding-right: 0 !important;
	}
`;

export const fontWeights = [
	{ label: '100 - Thin', value: 100 },
	{ label: '200 - Extra Light', value: 200 },
	{ label: '300 - Light', value: 300 },
	{ label: '400 - Normal', value: 400 },
	{ label: '500 - Medium', value: 500 },
	{ label: '600 - Semi Bold', value: 600 },
	{ label: '700 - Bold', value: 700 },
	{ label: '800 - Extra Bold', value: 800 },
];

export const webSafeFonts = [
	{
		family: 'Arial',
	},
	{
		family: 'Verdana',
	},
	{
		family: 'Tahoma',
	},
	{
		family: 'Trebuchet',
	},
	{
		family: 'Times New Roman',
	},
	{
		family: 'Georgia',
	},
	{
		family: 'Garamond',
	},
	{
		family: 'Courier New',
	},
	{
		family: 'Brush Script MT',
	},
];

export const currencies = [
	{ cc: 'AED', symbol: '\u062f.\u0625;', name: 'UAE dirham' },
	{ cc: 'AFN', symbol: 'Afs', name: 'Afghan afghani' },
	{ cc: 'ALL', symbol: 'L', name: 'Albanian lek' },
	{ cc: 'AMD', symbol: 'AMD', name: 'Armenian dram' },
	{
		cc: 'ANG',
		symbol: 'NA\u0192',
		name: 'Netherlands Antillean gulden',
	},
	{ cc: 'AOA', symbol: 'Kz', name: 'Angolan kwanza' },
	{ cc: 'ARS', symbol: '$', name: 'Argentine peso' },
	{ cc: 'AUD', symbol: '$', name: 'Australian dollar' },
	{ cc: 'AWG', symbol: '\u0192', name: 'Aruban florin' },
	{ cc: 'AZN', symbol: 'AZN', name: 'Azerbaijani manat' },
	{
		cc: 'BAM',
		symbol: 'KM',
		name: 'Bosnia and Herzegovina konvertibilna marka',
	},
	{ cc: 'BBD', symbol: 'Bds$', name: 'Barbadian dollar' },
	{ cc: 'BDT', symbol: '\u09f3', name: 'Bangladeshi taka' },
	{ cc: 'BGN', symbol: 'BGN', name: 'Bulgarian lev' },
	{ cc: 'BHD', symbol: '.\u062f.\u0628', name: 'Bahraini dinar' },
	{ cc: 'BIF', symbol: 'FBu', name: 'Burundi franc' },
	{ cc: 'BMD', symbol: 'BD$', name: 'Bermudian dollar' },
	{ cc: 'BND', symbol: 'B$', name: 'Brunei dollar' },
	{ cc: 'BOB', symbol: 'Bs.', name: 'Bolivian boliviano' },
	{ cc: 'BRL', symbol: 'R$', name: 'Brazilian real' },
	{ cc: 'BSD', symbol: 'B$', name: 'Bahamian dollar' },
	{ cc: 'BTN', symbol: 'Nu.', name: 'Bhutanese ngultrum' },
	{ cc: 'BWP', symbol: 'P', name: 'Botswana pula' },
	{ cc: 'BYR', symbol: 'Br', name: 'Belarusian ruble' },
	{ cc: 'BZD', symbol: 'BZ$', name: 'Belize dollar' },
	{ cc: 'CAD', symbol: '$', name: 'Canadian dollar' },
	{ cc: 'CDF', symbol: 'F', name: 'Congolese franc' },
	{ cc: 'CHF', symbol: 'Fr.', name: 'Swiss franc' },
	{ cc: 'CLP', symbol: '$', name: 'Chilean peso' },
	{ cc: 'CNY', symbol: '\u00a5', name: 'Chinese/Yuan renminbi' },
	{ cc: 'COP', symbol: 'Col$', name: 'Colombian peso' },
	{ cc: 'CRC', symbol: '\u20a1', name: 'Costa Rican colon' },
	{ cc: 'CUC', symbol: '$', name: 'Cuban peso' },
	{ cc: 'CVE', symbol: 'Esc', name: 'Cape Verdean escudo' },
	{ cc: 'CZK', symbol: 'K\u010d', name: 'Czech koruna' },
	{ cc: 'DJF', symbol: 'Fdj', name: 'Djiboutian franc' },
	{ cc: 'DKK', symbol: 'Kr', name: 'Danish krone' },
	{ cc: 'DOP', symbol: 'RD$', name: 'Dominican peso' },
	{ cc: 'DZD', symbol: '\u062f.\u062c', name: 'Algerian dinar' },
	{ cc: 'EEK', symbol: 'KR', name: 'Estonian kroon' },
	{ cc: 'EGP', symbol: '\u00a3', name: 'Egyptian pound' },
	{ cc: 'ERN', symbol: 'Nfa', name: 'Eritrean nakfa' },
	{ cc: 'ETB', symbol: 'Br', name: 'Ethiopian birr' },
	{ cc: 'EUR', symbol: '\u20ac', name: 'European Euro' },
	{ cc: 'FJD', symbol: 'FJ$', name: 'Fijian dollar' },
	{ cc: 'FKP', symbol: '\u00a3', name: 'Falkland Islands pound' },
	{ cc: 'GBP', symbol: '\u00a3', name: 'British pound' },
	{ cc: 'GEL', symbol: 'GEL', name: 'Georgian lari' },
	{ cc: 'GHS', symbol: 'GH\u20b5', name: 'Ghanaian cedi' },
	{ cc: 'GIP', symbol: '\u00a3', name: 'Gibraltar pound' },
	{ cc: 'GMD', symbol: 'D', name: 'Gambian dalasi' },
	{ cc: 'GNF', symbol: 'FG', name: 'Guinean franc' },
	{ cc: 'GQE', symbol: 'CFA', name: 'Central African CFA franc' },
	{ cc: 'GTQ', symbol: 'Q', name: 'Guatemalan quetzal' },
	{ cc: 'GYD', symbol: 'GY$', name: 'Guyanese dollar' },
	{ cc: 'HKD', symbol: 'HK$', name: 'Hong Kong dollar' },
	{ cc: 'HNL', symbol: 'L', name: 'Honduran lempira' },
	{ cc: 'HRK', symbol: 'kn', name: 'Croatian kuna' },
	{ cc: 'HTG', symbol: 'G', name: 'Haitian gourde' },
	{ cc: 'HUF', symbol: 'Ft', name: 'Hungarian forint' },
	{ cc: 'IDR', symbol: 'Rp', name: 'Indonesian rupiah' },
	{ cc: 'ILS', symbol: '\u20aa', name: 'Israeli new sheqel' },
	{ cc: 'INR', symbol: '₹', name: 'Indian rupee' },
	{ cc: 'IQD', symbol: '\u062f.\u0639', name: 'Iraqi dinar' },
	{ cc: 'IRR', symbol: 'IRR', name: 'Iranian rial' },
	{ cc: 'ISK', symbol: 'kr', name: 'Icelandic kr\u00f3na' },
	{ cc: 'JMD', symbol: 'J$', name: 'Jamaican dollar' },
	{ cc: 'JOD', symbol: 'JOD', name: 'Jordanian dinar' },
	{ cc: 'JPY', symbol: '\u00a5', name: 'Japanese yen' },
	{ cc: 'KES', symbol: 'KSh', name: 'Kenyan shilling' },
	{ cc: 'KGS', symbol: '\u0441\u043e\u043c', name: 'Kyrgyzstani som' },
	{ cc: 'KHR', symbol: '\u17db', name: 'Cambodian riel' },
	{ cc: 'KMF', symbol: 'KMF', name: 'Comorian franc' },
	{ cc: 'KPW', symbol: 'W', name: 'North Korean won' },
	{ cc: 'KRW', symbol: 'W', name: 'South Korean won' },
	{ cc: 'KWD', symbol: 'KWD', name: 'Kuwaiti dinar' },
	{ cc: 'KYD', symbol: 'KY$', name: 'Cayman Islands dollar' },
	{ cc: 'KZT', symbol: 'T', name: 'Kazakhstani tenge' },
	{ cc: 'LAK', symbol: 'KN', name: 'Lao kip' },
	{ cc: 'LBP', symbol: '\u00a3', name: 'Lebanese lira' },
	{ cc: 'LKR', symbol: 'Rs', name: 'Sri Lankan rupee' },
	{ cc: 'LRD', symbol: 'L$', name: 'Liberian dollar' },
	{ cc: 'LSL', symbol: 'M', name: 'Lesotho loti' },
	{ cc: 'LTL', symbol: 'Lt', name: 'Lithuanian litas' },
	{ cc: 'LVL', symbol: 'Ls', name: 'Latvian lats' },
	{ cc: 'LYD', symbol: 'LD', name: 'Libyan dinar' },
	{ cc: 'MAD', symbol: 'MAD', name: 'Moroccan dirham' },
	{ cc: 'MDL', symbol: 'MDL', name: 'Moldovan leu' },
	{ cc: 'MGA', symbol: 'FMG', name: 'Malagasy ariary' },
	{ cc: 'MKD', symbol: 'MKD', name: 'Macedonian denar' },
	{ cc: 'MMK', symbol: 'K', name: 'Myanma kyat' },
	{ cc: 'MNT', symbol: '\u20ae', name: 'Mongolian tugrik' },
	{ cc: 'MOP', symbol: 'P', name: 'Macanese pataca' },
	{ cc: 'MRO', symbol: 'UM', name: 'Mauritanian ouguiya' },
	{ cc: 'MUR', symbol: 'Rs', name: 'Mauritian rupee' },
	{ cc: 'MVR', symbol: 'Rf', name: 'Maldivian rufiyaa' },
	{ cc: 'MWK', symbol: 'MK', name: 'Malawian kwacha' },
	{ cc: 'MXN', symbol: '$', name: 'Mexican peso' },
	{ cc: 'MYR', symbol: 'RM', name: 'Malaysian ringgit' },
	{ cc: 'MZM', symbol: 'MTn', name: 'Mozambican metical' },
	{ cc: 'NAD', symbol: 'N$', name: 'Namibian dollar' },
	{ cc: 'NGN', symbol: '\u20a6', name: 'Nigerian naira' },
	{ cc: 'NIO', symbol: 'C$', name: 'Nicaraguan c\u00f3rdoba' },
	{ cc: 'NOK', symbol: 'kr', name: 'Norwegian krone' },
	{ cc: 'NPR', symbol: 'NRs', name: 'Nepalese rupee' },
	{ cc: 'NZD', symbol: 'NZ$', name: 'New Zealand dollar' },
	{ cc: 'OMR', symbol: 'OMR', name: 'Omani rial' },
	{ cc: 'PAB', symbol: 'B./', name: 'Panamanian balboa' },
	{ cc: 'PEN', symbol: 'S/.', name: 'Peruvian nuevo sol' },
	{ cc: 'PGK', symbol: 'K', name: 'Papua New Guinean kina' },
	{ cc: 'PHP', symbol: '\u20b1', name: 'Philippine peso' },
	{ cc: 'PKR', symbol: 'Rs.', name: 'Pakistani rupee' },
	{ cc: 'PLN', symbol: 'z\u0142', name: 'Polish zloty' },
	{ cc: 'PYG', symbol: '\u20b2', name: 'Paraguayan guarani' },
	{ cc: 'QAR', symbol: 'QR', name: 'Qatari riyal' },
	{ cc: 'RON', symbol: 'L', name: 'Romanian leu' },
	{ cc: 'RSD', symbol: 'din.', name: 'Serbian dinar' },
	{ cc: 'RUB', symbol: 'R', name: 'Russian ruble' },
	{ cc: 'SAR', symbol: 'SR', name: 'Saudi riyal' },
	{ cc: 'SBD', symbol: 'SI$', name: 'Solomon Islands dollar' },
	{ cc: 'SCR', symbol: 'SR', name: 'Seychellois rupee' },
	{ cc: 'SDG', symbol: 'SDG', name: 'Sudanese pound' },
	{ cc: 'SEK', symbol: 'kr', name: 'Swedish krona' },
	{ cc: 'SGD', symbol: 'S$', name: 'Singapore dollar' },
	{ cc: 'SHP', symbol: '\u00a3', name: 'Saint Helena pound' },
	{ cc: 'SLL', symbol: 'Le', name: 'Sierra Leonean leone' },
	{ cc: 'SOS', symbol: 'Sh.', name: 'Somali shilling' },
	{ cc: 'SRD', symbol: '$', name: 'Surinamese dollar' },
	{ cc: 'SYP', symbol: 'LS', name: 'Syrian pound' },
	{ cc: 'SZL', symbol: 'E', name: 'Swazi lilangeni' },
	{ cc: 'THB', symbol: '\u0e3f', name: 'Thai baht' },
	{ cc: 'TJS', symbol: 'TJS', name: 'Tajikistani somoni' },
	{ cc: 'TMT', symbol: 'm', name: 'Turkmen manat' },
	{ cc: 'TND', symbol: 'DT', name: 'Tunisian dinar' },
	{ cc: 'TRY', symbol: 'TRY', name: 'Turkish new lira' },
	{ cc: 'TTD', symbol: 'TT$', name: 'Trinidad and Tobago dollar' },
	{ cc: 'TWD', symbol: 'NT$', name: 'New Taiwan dollar' },
	{ cc: 'TZS', symbol: 'TZS', name: 'Tanzanian shilling' },
	{ cc: 'UAH', symbol: 'UAH', name: 'Ukrainian hryvnia' },
	{ cc: 'UGX', symbol: 'USh', name: 'Ugandan shilling' },
	{ cc: 'USD', symbol: 'US$', name: 'United States dollar' },
	{ cc: 'UYU', symbol: '$U', name: 'Uruguayan peso' },
	{ cc: 'UZS', symbol: 'UZS', name: 'Uzbekistani som' },
	{ cc: 'VEB', symbol: 'Bs', name: 'Venezuelan bolivar' },
	{ cc: 'VND', symbol: '\u20ab', name: 'Vietnamese dong' },
	{ cc: 'VUV', symbol: 'VT', name: 'Vanuatu vatu' },
	{ cc: 'WST', symbol: 'WS$', name: 'Samoan tala' },
	{ cc: 'XAF', symbol: 'CFA', name: 'Central African CFA franc' },
	{ cc: 'XCD', symbol: 'EC$', name: 'East Caribbean dollar' },
	{ cc: 'XDR', symbol: 'SDR', name: 'Special Drawing Rights' },
	{ cc: 'XOF', symbol: 'CFA', name: 'West African CFA franc' },
	{ cc: 'XPF', symbol: 'F', name: 'CFP franc' },
	{ cc: 'YER', symbol: 'YER', name: 'Yemeni rial' },
	{ cc: 'ZAR', symbol: 'R', name: 'South African rand' },
	{ cc: 'ZMK', symbol: 'ZK', name: 'Zambian kwacha' },
	{ cc: 'ZWR', symbol: 'Z$', name: 'Zimbabwean dollar' },
];

export const BaseURL = 'https://recommendations-template.vercel.app/static/js/main.js';
export const BaseCSSURL = 'https://recommendations-template.vercel.app/static/css/main.css';

export const getInstallationScript = (preferences = {}, credentials) => `
<script>var APPBASE_SEARCH_PREFERENCES=${JSON.stringify(
	JSON.stringify({
		...preferences,
		appbaseSettings: {
			...get(preferences, 'appbaseSettings'),
			credentials,
		},
	}),
)};</script>
<div id="reactivesearch-shopify-1" ${
	get(preferences, 'exportSettings.openAsPage') ? `openAsPage="true"` : ''
}></div>
<link rel="stylesheet" href="${BaseCSSURL}">
<script defer src="${BaseURL}"></script>
		`;

export const getInstallationScriptRecommendation = (preferences = {}, credentials, widgetId) => `
<script>var APPBASE_RECOMMENDATIONS_PREFERENCES=${JSON.stringify(
	JSON.stringify({
		...preferences,
		appbaseSettings: {
			...get(preferences, 'appbaseSettings'),
			credentials,
		},
	}),
)};</script>
<div id="reactivesearch-shopify-product-recommendations-1" ${
	widgetId ? `widget-id="${widgetId}"` : ''
}></div>
<link rel="stylesheet" href="${BaseCSSURL}">
<script defer src="${BaseURL}"></script>
		`;

export const getInstallationHeadScript = (
	preferences = {},
	credentials,
	isRecommendation = false,
) => `
<script>var ${
	isRecommendation ? 'APPBASE_RECOMMENDATIONS_PREFERENCES' : 'APPBASE_SEARCH_PREFERENCES'
}=${JSON.stringify(
	JSON.stringify({
		...preferences,
		appbaseSettings: {
			...get(preferences, 'appbaseSettings'),
			credentials,
		},
	}),
)};</script>
<link rel="stylesheet" href="${BaseCSSURL}">
		`;

export const getInstallationBodyScript = () => `
<script defer src="${BaseURL}"></script>
		`;

export const getCTAScript = (preferences = {}) => `
<div id="reactivesearch-shopify-1"${
	get(preferences, 'exportSettings.openAsPage') ? ` openAsPage="true"` : ''
}></div>
		`;

export const getRecommendationScript = (widgetId) => `
<div id="reactivesearch-shopify-product-recommendations-1" ${
	widgetId ? `widget-id="${widgetId}"` : ''
}></div>
		`;
export const getCSBScript = (preferences = {}, credentials, isRecommendation = false) => `
<script>var ${
	isRecommendation ? 'APPBASE_RECOMMENDATIONS_PREFERENCES' : 'APPBASE_SEARCH_PREFERENCES'
}=${JSON.stringify(
	JSON.stringify({
		...preferences,
		appbaseSettings: {
			...get(preferences, 'appbaseSettings'),
			credentials,
		},
	}),
)};</script>
		`;

export const validateURL = (control) => {
	if (control && control.value) {
		try {
			const extension = new URL(control.value).pathname.split('.').pop();
			if (
				extension === 'jpg' ||
				extension === 'png' ||
				extension === 'jpeg' ||
				extension === 'svg'
			) {
				return null;
			}
			return { invalidURL: true };
		} catch (e) {
			return { invalidURL: true };
		}
	}
	return null;
};
// Add all the fields which have default values
export const chartConfigurationFormDefaultFields = {
	customize: {
		useAsFilter: false,
		type: 'term',
		componentType: componentTypes.reactiveChart,
	},
};
export const getChartConfigurationForm = (customFields) => {
	return FormBuilder.group({
		enabled: false,
		customize: FormBuilder.group({
			title: [undefined, Validators.required],
			dataField: [undefined, Validators.required],
			size: null,
			queryFormat: null,
			chartType: null,
			sortBy: null,
			labelFormatter: null,
			xAxisName: null,
			yAxisName: null,
			xAxisField: null,
			yAxisField: null,
			...chartConfigurationFormDefaultFields.customize,
			...customFields,
		}),
	});
};
// Add all the fields which have default values
export const filterConfigurationFormDefaultFields = (fields = {}, returnType = 'object') => {
	const customFields = { ...fields };
	const defaultFields = {
		MULTILIST: {
			title: undefined,
			dataField: undefined,
			filterLabel: undefined,
			filterType: 'list',
			size: undefined,
			queryFormat: 'or',
			sortBy: 'count',
			componentType: componentTypes.multiList,
			showCount: true,
			showCheckbox: true,
			showSearch: true,
			showMissing: false,
			missingLabel: undefined,
			selectAllLabel: undefined,
		},
		SINGLELIST: {
			title: undefined,
			dataField: undefined,
			filterLabel: undefined,
			filterType: 'list',
			size: undefined,
			sortBy: 'count',
			componentType: componentTypes.singleList,
			showCount: true,
			showSearch: true,
			showMissing: false,
			missingLabel: undefined,
			selectAllLabel: undefined,
		},
		RANGEINPUT: {
			title: undefined,
			dataField: undefined,
			filterLabel: undefined,
			filterType: 'range',
			startValue: undefined,
			endValue: undefined,
			startLabel: undefined,
			endLabel: undefined,
			showHistogram: false,
			calendarInterval: undefined,
			componentType: componentTypes.rangeInput,
		},
		DYNAMICRANGESLIDER: {
			title: undefined,
			dataField: undefined,
			filterLabel: undefined,
			filterType: 'range',
			showHistogram: false,
			calendarInterval: undefined,
			componentType: componentTypes.dynamicRangeSlider,
		},
		TAGCLOUD: {
			title: undefined,
			dataField: undefined,
			filterLabel: undefined,
			filterType: 'list',
			size: undefined,
			queryFormat: 'or',
			componentType: componentTypes.tagCloud,
			showCount: true,
			multiSelect: false,
			sortBy: 'count',
		},
		TABDATALIST: {
			title: undefined,
			dataField: undefined,
			filterLabel: undefined,
			filterType: 'list',
			componentType: componentTypes.tabDataList,
			data: [],
			showCount: true,
			displayAsVertical: false,
			showRadio: false,
			showSearch: true,
			selectAllLabel: undefined,
		},
		customize: {
			title: undefined,
			dataField: undefined,
			filterType: 'list',
			// queryFormat: 'or',
			// sortBy: 'count',
			// componentType: componentTypes.multiList,
			// showCount: true,
			// showCheckbox: true,
			// showRadio: false,
			// displayAsVertical: false,
			// showSearch: true,
			// showMissing: false,
			// multiSelect: false,
			// data: FormBuilder.array(dataPropFromArray(customFields?.data)),
		},
	};

	const defaultObj = defaultFields[customFields.componentType || componentTypes.multiList];
	const validProps = Object.keys(defaultObj);
	const newObj = { ...defaultObj };
	Object.keys(customFields).forEach((key) => {
		if (validProps.includes(key)) {
			if (
				customFields.componentType === 'TABDATALIST' &&
				key === 'data' &&
				returnType === 'controlObj'
			) {
				newObj[key] = FormBuilder.array(dataPropFromArray(customFields?.data));
			}
			newObj[key] = customFields[key];
		}
	});

	return newObj;
};

export function dataPropFromArray(arr) {
	if (Array.isArray(arr)) {
		return arr.map((obj) => FormBuilder.group(obj));
	}
	return [];
}

export const getFilterConfigurationForm = (customFields = {}, isDynamicFilter = false) => {
	const filtersConfig = filterConfigurationFormDefaultFields(customFields || {}, 'controlObj');
	// ...customFields,
	return FormBuilder.group({
		enabled: true,
		customize: FormBuilder.group({
			...filtersConfig,
			title: isDynamicFilter ? [undefined, Validators.required] : undefined,
			dataField: isDynamicFilter ? [undefined, Validators.required] : undefined,
			componentType: componentTypes.multiList,
			...(customFields && customFields.componentType === 'TABDATALIST'
				? {
						data: FormBuilder.array(dataPropFromArray(customFields?.data)),
				  }
				: {}),
		}),
	});
};

export const getPriceFilterConfigurationForm = () => {
	return FormBuilder.group({
		enabled: false,
		customize: FormBuilder.group({
			title: undefined,
			dataField: undefined,
			startValue: undefined,
			endValue: undefined,
			startLabel: undefined,
			endLabel: undefined,
			showHistogram: false,
			componentType: componentTypes.dynamicRangeSlider,
		}),
	});
};

export const getRecommendationForm = (recommendationType, exportType) => {
	const isMostRecent = recommendationType === RecommendationTypes.MOST_RECENT;
	const isSimilarTo = recommendationType === RecommendationTypes.SIMILAR_PRODUCTS;
	const isProductsPageURLEnabled = recommendationType === RecommendationTypes.SIMILAR_PRODUCTS;
	const isFeaturedProducts = recommendationType === RecommendationTypes.FEATURED_PRODUCTS;
	return FormBuilder.group({
		id: new Date().getTime(),
		title: 'You might also like',
		type: RecommendationTypes.MOST_POPULAR_PRODUCTS,
		maxProducts: [15, Validators.min(1)],
		dataFieldSimilarTo: [
			{
				value: isMostRecent && exportType === 'shopify' ? 'created_at' : '',
				disabled: !isSimilarTo,
			},
			Validators.required,
		],
		dataFieldMostRecent: [{ value: '', disabled: !isMostRecent }, Validators.required],
		productsPageHandle: FormBuilder.group({
			productsPageUrlPrefix: [
				{ value: '/products/', disabled: !isProductsPageURLEnabled },
				Validators.required,
			],
			productsPageUrlField: [
				{
					value: exportType === 'shopify' ? 'handle.keyword' : undefined,
					disabled: !isProductsPageURLEnabled,
				},
				Validators.required,
			],
		}),
		docIds: [{ value: [], disabled: !isFeaturedProducts }, Validators.required],
	});
};

export const getDynamicFilterKey = (index) => {
	return `dynamic-filter-control_${index}_${new Date().getTime()}`;
};

export const getChartKey = (index) => {
	return `chart-form_${index}_${new Date().getTime()}`;
};

export const shopifyDefaultFields = {
	size: 'variants.option1.keyword',
	color: 'variants.option2.keyword',
	price: 'variants.price',
	title: 'title',
	image: 'image.src',
	description: 'body_html',
	handle: 'handle',
};

export const getMultiListProps = (values) => {
	let obj = {};
	if (values.filterType === 'range' || values.filterType === 'date') {
		if (values.startValue && values.endValue) {
			obj = {
				componentType: componentTypes.rangeInput,
			};
		} else {
			obj = {
				componentType: componentTypes.dynamicRangeSlider,
			};
		}
	}
	return {
		...values,
		...obj,
		size: Number.isNaN(parseInt(values.size, 10)) ? undefined : parseInt(values.size, 10),
	};
};

export const RecommendationTypes = {
	MOST_POPULAR_PRODUCTS: 'most_popular',
	MOST_RECENT: 'most_recent',
	SIMILAR_PRODUCTS: 'similar',
	FEATURED_PRODUCTS: 'featured',
};

export const RecommendationTypeLabels = {
	[RecommendationTypes.MOST_POPULAR_PRODUCTS]: 'Most Popular Products',
	[RecommendationTypes.MOST_RECENT]: 'Most Recent Products',
	[RecommendationTypes.SIMILAR_PRODUCTS]: 'Similar to this Product',
	[RecommendationTypes.FEATURED_PRODUCTS]: 'Featured Products',
};

export const CtaActions = {
	REDIRECT_TO_PRODUCT: 'redirect_to_product',
	NO_BUTTON: 'no_button',
};

export const messages = {
	productsPageURL: (
		<span>
			This input allows you to define the pattern for the products page URL. It helps us to
			extract the product details and show the recommendations for that product. The first
			input is to define the URL prefix and second input is to select the ES field that is
			mapped to the product identification that you are using in your application.
			<br />
			For example, if your products page URL is
			`https://mystore.shopify.com/products/adidas-shoes-black-2` then first input should be
			`products/` and second input value should be the data field that has the product handle
			value. In case if you are using query params i.e the URL looks like
			`https://mystore.shopify.com/products?id=232323`then first input value must be
			`products?id=`.
		</span>
	),
	dataFieldSimilarProduct:
		'Select a field to display the similar products. For example, if you select `brand` and user is viewing the `Adidas Black Shoe` product that has `brand` value as `adidas` then reactivesearch.io will show the products having `adidas` brand as recommendations.',
	dataFieldMostRecent: 'Select the timestamp field to sort the products.',
	featuredProducts: 'Select the products to be featured.',
};

export const defaultSettings = [
	{
		id: 'product_sync',
		label: 'Sync Products',
		value: true,
	},
	{
		id: 'smartcollection_sync',
		label: 'Sync Smart Collections',
		value: true,
	},
	{
		id: 'customcollection_sync',
		label: 'Sync Custom Collections',
		value: true,
	},
	{
		id: 'collect_sync',
		label: 'Sync Product-Collections Relationship',
		value: false,
	},
	{
		id: 'metafield_sync',
		label: 'Sync Metafields',
		value: false,
	},
	{
		id: 'namedtags_sync',
		label: 'Sync Named Tags',
		value: false,
	},
];

export const defaultRecommendationsPreferences = {
	name: '',
	description: '',
	pipeline: '',
	id: '',
	logoUrl: '',
	logoWidth: 200,
	logoAlignment: 'left',
	themeType: 'classic',
	primaryColor: '#0B6AFF',
	primaryTextColor: '#fff',
	textColor: '#424242',
	titleColor: '#424242',
	fontFamily: 'Open Sans',
	customCss: '',
	resultTitle: '',
	resultDescription: '',
	resultPrice: '',
	priceUnit: undefined,
	resultImage: '',
	resultHandle: '',
	storeInfo: { currency: 'USD' },
	exportSettings: { exportAs: 'embed', credentials: '', openAsPage: false, type: 'other' },
	ctaTitle: 'View Product',
	ctaAction: 'redirect_to_product',
	recommendations: [],
};

export const defaultSearchPreferences = {
	name: '',
	description: '',
	pipeline: '',
	app: '',
	profile: '',
	searchProfile: '',
	sponsoredProfile: '',
	url: '',
	method: 'POST',
	headers: '',
	backend: BACKENDS.ELASTICSEARCH.name,
	id: '',
	currentPage: '',
	logoUrl: '',
	logoWidth: 200,
	logoAlignment: 'left',
	versionId: '',
	themeType: 'classic',
	primaryColor: '#0B6AFF',
	primaryTextColor: '#fff',
	textColor: '#424242',
	titleColor: '#424242',
	fontFamily: 'Open Sans',
	fontWeight: 400,
	bodyBackgroundColor: '#fff',
	navbarBackgroundColor: '#001628',
	linkColor: '#3eb0ef',
	customCss: '',
	resultTitle: '',
	resultDescription: '',
	resultPrice: '',
	priceUnit: null,
	metaDataFields: [],
	cssSelector: '',
	sortOptionSelector: [],
	resultImage: '',
	resultHandle: '',
	resultHandleViewer: 'link',
	layout: 'grid',
	resultHighlight: false,
	viewSwitcher: true,
	mapLayout: 'map',
	mapComponent: 'googleMap',
	locationDataField: 'location',
	defaultZoom: 13,
	showSearchAsMove: true,
	showMarkerClusters: true,
	mapsAPIkey: '',
	storeInfo: { currency: 'USD' },
	exportSettings: { exportAs: 'embed', credentials: '', openAsPage: false, type: 'other' },
	showPagination: false,
	showSelectedFilters: true,
	displayFields: {},
	customMessages: {
		resultStats: '[count] products found in [time] ms',
		noFilterItem: 'No items Found',
		noResultItem: 'No Results Found!',
		noSuggestion: 'No suggestions found for <mark>[term]</mark>',
		fetchingFilterOptions: 'Fetching Options',
		searchText: 'Click here to search',
		searchIcon: '',
		redirectUrlText: 'Open URL',
		redirectUrlIcon: '',
	},
	autosuggest: true,
	showSearchAs: 'sticky',
	showVoiceSearch: true,
	autoSuggestionSettings: {
		enablePopularSuggestions: false,
		enableRecentSearches: false,
		highlight: false,
	},
	staticFilters: {
		productType: {
			enabled: false,
			customize: {
				title: null,
				filterType: 'list',
				filterLabel: null,
				queryFormat: 'or',
				sortBy: 'count',
				showCount: true,
				showCheckbox: true,
				showSearch: true,
				showMissing: false,
				missingLabel: null,
				selectAllLabel: null,
				componentType: componentTypes.multiList,
				multiSelect: false,
			},
		},
		collections: {
			enabled: false,
			customize: {
				title: null,
				filterLabel: null,
				filterType: 'list',
				queryFormat: 'or',
				sortBy: 'count',
				showCount: true,
				showCheckbox: true,
				showSearch: true,
				showMissing: false,
				componentType: componentTypes.multiList,
				multiSelect: false,
				missingLabel: null,
				selectAllLabel: null,
			},
		},
		color: {
			enabled: false,
			customize: {
				title: null,
				dataField: null,
				filterLabel: null,
				filterType: 'list',
				queryFormat: 'or',
				sortBy: 'count',
				showCount: true,
				showCheckbox: true,
				showSearch: true,
				showMissing: false,
				componentType: componentTypes.multiList,
				multiSelect: false,
				missingLabel: null,
				selectAllLabel: null,
			},
		},
		size: {
			enabled: false,
			customize: {
				title: null,
				dataField: null,
				filterLabel: null,
				filterType: 'list',
				queryFormat: 'or',
				sortBy: 'count',
				showCount: true,
				showCheckbox: true,
				showSearch: true,
				showMissing: false,
				showHistogram: false,
				startValue: null,
				endValue: null,
				startLabel: null,
				endLabel: null,
				calendarInterval: null,
				componentType: componentTypes.multiList,
				multiSelect: false,
				missingLabel: null,
				selectAllLabel: null,
			},
		},
		price: {
			enabled: false,
			customize: {
				title: null,
				dataField: null,
				startValue: null,
				endValue: null,
				startLabel: null,
				endLabel: null,
				showHistogram: false,
				componentType: componentTypes.dynamicRangeSlider,
			},
		},
	},
	dynamicFilters: [],
	syncSettings: defaultSettings.reduce((acc, item) => ({ ...acc, [item.id]: item.value }), {}),
	authenticationSettings: {
		clientId: '',
		enableAuth0: false,
		enableProfilePage: true,
		profileSettingsForm: {
			viewData: true,
			editData: true,
			closeAccount: true,
			editThemeSettings: true,
			editSearchPreferences: true,
		},
	},
};

const getParseJSON = (val) => {
	if (val)
		try {
			const jsonObj = JSON.parse(val);
			return jsonObj;
		} catch (err) {
			console.error(err);
			return val;
		}
	return val;
};

export const getRecommendationPreferencesPayload = (formValue) => {
	return JSON.parse(
		JSON.stringify({
			name: get(formValue, 'name'),
			description: get(formValue, 'description'),
			pipeline: get(formValue, 'pipeline'),
			id: get(formValue, 'id'),
			themeSettings: {
				type: get(formValue, 'themeType'),
				customCss: get(formValue, 'customCss'),
				rsConfig: {
					colors: {
						primaryColor: get(formValue, 'primaryColor'),
						primaryTextColor: get(formValue, 'primaryTextColor'),
						textColor: get(formValue, 'textColor'),
						titleColor: get(formValue, 'titleColor'),
					},
					typography: {
						fontFamily: get(formValue, 'fontFamily'),
					},
				},
			},
			globalSettings: {
				currency: get(formValue, 'storeInfo.currency'),
				showSelectedFilters: !!get(formValue, 'showSelectedFilters'),
				meta: {
					branding: {
						logoUrl: get(formValue, 'logoUrl'),
						logoWidth: get(formValue, 'logoWidth'),
						logoAlignment: get(formValue, 'logoAlignment'),
					},
				},
			},
			exportSettings: get(formValue, 'exportSettings'),
			resultSettings: {
				fields: {
					title: get(formValue, 'resultTitle'),
					description: get(formValue, 'resultDescription'),
					price: get(formValue, 'resultPrice'),
					priceUnit: get(formValue, 'priceUnit'),
					image: get(formValue, 'resultImage'),
					handle: get(formValue, 'resultHandle'),
					handleViewer: get(formValue, 'resultHandleViewer'),
				},
				customMessages: {
					resultStats: '',
					noResults: '',
				},
				rsConfig: {},
			},
			recommendationSettings: {
				ctaTitle: get(formValue, 'ctaTitle'),
				ctaAction: get(formValue, 'ctaAction'),
				recommendations: get(formValue, 'recommendations', []).map((item) => {
					let dataField;
					let productsPageUrl;
					let docIds;
					if (item.type === RecommendationTypes.MOST_RECENT) {
						dataField = item.dataFieldMostRecent;
					} else if (item.type === RecommendationTypes.SIMILAR_PRODUCTS) {
						dataField = item.dataFieldSimilarTo;
						productsPageUrl = `${get(
							item,
							'productsPageHandle.productsPageUrlPrefix',
						)}{${get(item, 'productsPageHandle.productsPageUrlField')}}`;
					} else if (item.type === RecommendationTypes.FEATURED_PRODUCTS) {
						({ docIds } = item);
					}
					return {
						id: String(item.id),
						title: item.title,
						type: item.type,
						productsPageUrl,
						dataField,
						maxProducts: Number(item.maxProducts),
						docIds,
					};
				}),
			},
		}),
	);
};

const getPagesConfig = (formValue) => {
	const pages = get(formValue, 'pageSettings.pages', {});
	const currentPage = get(formValue, 'pageSettings.currentPage', {});
	const newPages = {};
	Object.keys(pages).forEach((page) => {
		newPages[page] = {
			...pages[page],
		};
		if (page === currentPage) {
			newPages[page].indexSettings = get(formValue, 'indexSettings');
		}
	});

	return newPages;
};

export const getSearchPreferencesPayload = (formValue) => {
	const displayFieldsObj = {};
	const displayFields = get(formValue, 'displayFields', {});
	Object.keys(displayFields).forEach((key) => {
		displayFieldsObj[key] = {
			title: get(displayFields[key], 'resultTitle'),
			description: get(displayFields[key], 'resultDescription'),
			price: get(displayFields[key], 'resultPrice'),
			priceUnit: get(displayFields[key], 'priceUnit'),
			image: get(displayFields[key], 'resultImage'),
			handle: get(displayFields[key], 'resultHandle'),
			handleViewer: get(displayFields[key], 'resultHandleViewer'),
			userDefinedFields: getParseJSON(get(displayFields[key], 'metaDataFields')),
			cssSelector: get(displayFields[key], 'cssSelector'),
		};
	});

	return JSON.parse(
		JSON.stringify({
			name: get(formValue, 'name'),
			description: get(formValue, 'description'),
			pipeline: get(formValue, 'pipeline'),
			...(get(formValue, 'backend') === BACKENDS.FUSION.name && {
				pipeline: '_fusion',
			}),
			backend: get(formValue, 'backend'),
			id: get(formValue, 'id'),
			pageSettings: {
				currentPage: get(formValue, 'currentPage'),
				pages: getPagesConfig(formValue),
				fields: get(formValue, 'pageSettings.fields'),
			},
			themeSettings: {
				type: get(formValue, 'themeType'),
				customCss: get(formValue, 'customCss'),
				rsConfig: {
					colors: {
						primaryColor: get(formValue, 'primaryColor'),
						primaryTextColor: get(formValue, 'primaryTextColor'),
						textColor: get(formValue, 'textColor'),
						titleColor: get(formValue, 'titleColor'),
					},
					typography: {
						fontFamily: get(formValue, 'fontFamily'),
					},
				},
				meta: {
					bodyBackgroundColor: get(formValue, 'bodyBackgroundColor'),
					navbarBackgroundColor: get(formValue, 'navbarBackgroundColor'),
					linkColor: get(formValue, 'linkColor'),
					fontWeight: get(formValue, 'fontWeight'),
				},
			},
			globalSettings: {
				currency: get(formValue, 'storeInfo.currency'),
				showSelectedFilters: !!get(formValue, 'showSelectedFilters'),
				meta: {
					branding: {
						logoUrl: get(formValue, 'logoUrl'),
						logoWidth: get(formValue, 'logoWidth'),
						logoAlignment: get(formValue, 'logoAlignment'),
					},
					deploySettings: {
						versionId: get(formValue, 'versionId'),
					},
				},
				endpoint: {
					url: get(formValue, 'url'),
					method: get(formValue, 'method'),
					headers: get(formValue, 'headers'),
				},
			},
			exportSettings: get(formValue, 'exportSettings'),
			resultSettings: {
				fields: {
					title: get(formValue, 'resultTitle'),
					description: get(formValue, 'resultDescription'),
					price: get(formValue, 'resultPrice'),
					priceUnit: get(formValue, 'priceUnit'),
					image: get(formValue, 'resultImage'),
					handle: get(formValue, 'resultHandle'),
					handleViewer: get(formValue, 'resultHandleViewer'),
					userDefinedFields: get(formValue, 'metaDataFields'),
					cssSelector: get(formValue, 'cssSelector'),
				},
				customMessages: {
					resultStats: get(formValue, 'customMessages.resultStats'),
					noResults: get(formValue, 'customMessages.noResultItem'),
				},
				rsConfig: {
					pagination: !!get(formValue, 'showPagination'),
					infiniteScroll: !get(formValue, 'showPagination'),
					componentType:
						get(formValue, 'themeType') === 'geo'
							? componentTypes.reactiveMap
							: componentTypes.reactiveList,
				},
				sortOptionSelector: get(formValue, 'sortOptionSelector'),
				resultHighlight: get(formValue, 'resultHighlight'),
				layout: get(formValue, 'layout'),
				viewSwitcher: get(formValue, 'viewSwitcher'),
				...(get(formValue, 'themeType') === 'geo' && {
					mapLayout: get(formValue, 'mapLayout'),
					locationDataField: get(formValue, 'locationDataField'),
					mapComponent: get(formValue, 'mapComponent'),
					defaultZoom: get(formValue, 'defaultZoom'),
					showSearchAsMove: get(formValue, 'showSearchAsMove'),
					showMarkerClusters: get(formValue, 'showMarkerClusters'),
					mapsAPIkey: get(formValue, 'mapsAPIkey'),
				}),
				...(Object.keys(get(formValue, 'displayFields', {}) || {}).length && {
					displayFields: displayFieldsObj,
					categoryField: get(formValue, 'categoryField'),
					categoryFieldValue: get(formValue, 'categoryFieldValue'),
				}),
			},
			searchSettings: {
				customMessages: {
					noResults: get(formValue, 'customMessages.noSuggestion'),
				},
				searchButton: {
					icon: get(formValue, 'customMessages.searchIcon'),
					text: get(formValue, 'customMessages.searchText'),
				},
				redirectUrlText: get(formValue, 'customMessages.redirectUrlText'),
				redirectUrlIcon: get(formValue, 'customMessages.redirectUrlIcon'),
				showSearchAs: get(formValue, 'showSearchAs'),
				fields: {
					title: get(formValue, 'resultTitle'),
					description: get(formValue, 'resultDescription'),
					price: get(formValue, 'resultPrice'),
					priceUnit: get(formValue, 'priceUnit'),
					image: get(formValue, 'resultImage'),
					handle: get(formValue, 'resultHandle'),
					handleViewer: get(formValue, 'resultHandleViewer'),
					userDefinedFields: get(formValue, 'metaDataFields'),
					cssSelector: get(formValue, 'cssSelector'),
				},
				rsConfig: {
					autosuggest: get(formValue, 'autosuggest'),
					enablePopularSuggestions: get(
						formValue,
						'autoSuggestionSettings.enablePopularSuggestions',
					),
					enableRecentSearches: get(
						formValue,
						'autoSuggestionSettings.enableRecentSearches',
					),
					highlight: get(formValue, 'autoSuggestionSettings.highlight'),
					showVoiceSearch: get(formValue, 'showVoiceSearch'),
					componentType: componentTypes.searchBox,
				},
			},
			facetSettings: {
				dynamicFacets: get(formValue, 'dynamicFilters', []).map((filter, filterIndex) => ({
					enabled: filter.enabled,
					customMessages: {
						loading: get(formValue, 'customMessages.fetchingFilterOptions'),
						noResults: get(formValue, 'customMessages.noFilterItem'),
					},
					rsConfig: {
						componentId: `${get(filter, 'customize.title', '').replace(
							' ',
							'_',
						)}_${filterIndex}`,
						filterLabel: get(filter, 'customize.title'),
						...getMultiListProps(filter.customize),
					},
				})),
			},
			chartSettings: {
				charts: get(formValue, 'charts', []).map((chart, idx) => ({
					enabled: chart.enabled,
					rsConfig: {
						componentId: `${get(chart, 'customize.title')?.replace(' ', '_')}_${idx}`,
						componentType: componentTypes.reactiveChart,
						...chart.customize,
					},
				})),
			},
			syncSettings:
				get(formValue, 'exportSettings.type') === 'shopify'
					? get(formValue, 'syncSettings')
					: null,
			...(get(formValue, 'backend') === BACKENDS.FUSION.name && {
				fusionSettings: {
					app: get(formValue, 'app'),
					profile: get(formValue, 'profile'),
					searchProfile: get(formValue, 'searchProfile'),
				},
			}),
			authenticationSettings: {
				...get(formValue, 'authenticationSettings'),
			},
			indexSettings: {
				index: get(formValue, 'indexSettings.index'),
				fusionSettings: get(formValue, 'indexSettings.fusionSettings'),
				endpoint: get(formValue, 'indexSettings.endpoint'),
			},
		}),
	);
};

const getURL = () => {
	const { host, protocol } = new URL(
		localStorage.getItem('url') || sessionStorage.getItem('url'),
	);
	const username = localStorage.getItem('username') || sessionStorage.getItem('username');
	const password = localStorage.getItem('password') || sessionStorage.getItem('password');
	const uri = `${protocol}//${username}:${password}@${host}`;
	return uri;
};

export const getResyncURL = (index, params = {}) => {
	const url = new URLSearchParams('');
	url.set('index', index);
	url.set('url', getURL());
	Object.keys(params).forEach((i) => {
		url.set(i, params[i]);
	});
	return `https://shopify-sync.appbase.io?${url.toString()}`;
};

export const rsConfigMapper = {
	MULTILIST: [
		'dataField',
		'title',
		'componentId',
		'componentType',
		'missingLabel',
		'queryFormat',
		'selectAllLabel',
		'showCheckbox',
		'showCount',
		'showMissing',
		'showSearch',
		'sortBy',
		'aggregationSize',
		'size',
		'defaultQuery',
		'customQuery',
	],
	SINGLELIST: [
		'dataField',
		'title',
		'componentId',
		'componentType',
		'missingLabel',
		'selectAllLabel',
		'showCount',
		'showMissing',
		'showSearch',
		'sortBy',
		'aggregationSize',
		'size',

		'defaultQuery',
		'customQuery',
	],
	RANGEINPUT: [
		'dataField',
		'title',
		'componentId',
		'componentType',
		'queryFormat',
		'range',
		'rangeLabels',
		'showHistogram',

		'defaultQuery',
		'customQuery',
	],
	DYNAMICRANGESLIDER: [
		'dataField',
		'title',
		'componentId',
		'componentType',
		'queryFormat',
		'showHistogram',

		'defaultQuery',
		'customQuery',
	],
	TAGCLOUD: [
		'dataField',
		'title',
		'componentId',
		'componentType',
		'queryFormat',
		'showCount',
		'multiSelect',
		'aggregationSize',
		'size',
		'sortBy',
		'defaultQuery',
		'customQuery',
	],
	REACTIVE_CHART: [
		'dataField',
		'title',
		'componentId',
		'componentType',
		'chartType',
		'useAsFilter',
		'labelFormatter',
		'xAxisField',
		'yAxisField',
		'xAxisName',
		'yAxisName',
		'range',
		'sortBy',
		'queryFormat',
		'type',
		'setOption',
		'defaultQuery',
		'customQuery',
	],
	TABDATALIST: [
		'dataField',
		'title',
		'componentId',
		'componentType',
		'queryFormat',
		'showCount',
		'showRadio',
		'showSearch',
		'displayAsVertical',
		'data',
		'selectAllLabel',
	],
};

const transformRSConfig = (config) => {
	const newRsConfig = {};
	const rsConfig = { ...config };
	if (config.filterType === 'range' || config.filterType === 'date') {
		if (config.startValue && config.endValue)
			rsConfig.componentType = componentTypes.rangeInput;
		else rsConfig.componentType = componentTypes.dynamicRangeSlider;

		if (rsConfig.filterType === 'date') rsConfig.queryFormat = 'date';
		else delete rsConfig.queryFormat;
	} else if (rsConfig.size) {
		rsConfig.aggregationSize = parseInt(rsConfig.size, 10);
		rsConfig.size = parseInt(rsConfig.size, 10);
	}

	// eslint-disable-next-line
	Object.entries(rsConfig).map(([key, value]) => {
		if (
			// rsConfigMapper[rsConfig.componentType] is an Array from mapper.
			rsConfigMapper[rsConfig.componentType] &&
			rsConfigMapper[rsConfig.componentType].length &&
			rsConfigMapper[rsConfig.componentType].includes(key)
		) {
			if (key === 'showHistogram' && value === undefined) newRsConfig[key] = false;
			else newRsConfig[key] = value;
		}
	});

	if (
		(rsConfig.componentType === 'RANGEINPUT' ||
			(rsConfig.componentType === 'REACTIVE_CHART' && rsConfig.type === 'range')) &&
		rsConfig.startValue &&
		rsConfig.endValue
	) {
		newRsConfig.range = {
			start:
				rsConfig.filterType === 'date'
					? new Date(get(rsConfig, 'startValue', ''))
					: parseInt(get(rsConfig, 'startValue', ''), 10),
			end:
				rsConfig.filterType === 'date'
					? new Date(get(rsConfig, 'endValue', ''))
					: parseInt(get(rsConfig, 'endValue', ''), 10),
		};
		if (
			(rsConfig.filterType === 'range' || rsConfig.filterType === 'date') &&
			rsConfig.startLabel &&
			rsConfig.endLabel
		) {
			newRsConfig.rangeLabels = {
				start: get(rsConfig, 'startLabel', ''),
				end: get(rsConfig, 'endLabel', ''),
			};
		}
	}
	if (rsConfig.componentType === componentTypes.tabDataList) {
		newRsConfig.data = rsConfig.data.filter((o) => o.label);
	}

	return newRsConfig;
};

export const transformFacets = (facetPrefs) => {
	if (facetPrefs.rsConfig) {
		const { rsConfig } = facetPrefs;
		return transformRSConfig(rsConfig);
	}
	return transformRSConfig(facetPrefs);
};

export const transformCharts = (chartPrefs) => {
	const componentProps = { ...chartPrefs };
	Object.keys(componentProps).forEach((key) => {
		if (!componentProps[key]) delete componentProps[key];
	});
	return transformRSConfig(componentProps);
};

export const perPageDependentKeys = [
	'charts',
	'dynamicFilters',
	'resultTitle',
	'resultDescription',
	'resultPrice',
	'priceUnit',
	'resultImage',
	'resultHandle',
	'resultHandleViewer',
	'metaDataFields',
	'cssSelector',
	'customMessages',
	'showPagination',
	'themeType',
	'sortOptionSelector',
	'resultHighlight',
	'layout',
	'viewSwitcher',
	'mapLayout',
	'locationDataField',
	'mapComponent',
	'defaultZoom',
	'showSearchAsMove',
	'showMarkerClusters',
	'mapsAPIkey',
	'displayFields',
	'categoryField',
	'categoryFieldValue',
	'autosuggest',
	'autoSuggestionSettings',
	'showVoiceSearch',
	'indexSettings',
];

const returnEmpty = (val) => {
	if (val === '') return '';

	if (typeof val === 'object' && (JSON.stringify(val) === '{}' || JSON.stringify(val) === '[]'))
		return '';

	return val;
};

const getDiffFieldsFromObject = (diffData, field, oldObj, newObj) => {
	const oldKeys = Object.keys(get(oldObj, field, {}) || {});
	const newKeys = Object.keys(get(newObj, field, {}) || {});

	let newDiffData = {};
	[...oldKeys, ...newKeys].forEach((key) => {
		const newVal = get(newObj, `${field}.${key}`, '');
		const oldVal = get(oldObj, `${field}.${key}`, '');
		if ((oldVal || newVal) && !isEqual(returnEmpty(oldVal), returnEmpty(newVal)))
			newDiffData = {
				...newDiffData,
				[key]: [oldVal, newVal],
			};
	});

	return newDiffData;
};

// For review and save diff data
export const staticFacetsFields = [
	'productTypeFilter',
	'collectionsFilter',
	'colorFilter',
	'sizeFilter',
	'priceFilter',
];
const flattenObject = (obj) => {
	const flattened = {};

	Object.keys(obj).forEach((key) => {
		const value = obj[key];

		if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
			Object.assign(flattened, flattenObject(value));
		} else {
			flattened[key] = value;
		}
	});

	return flattened;
};

export const getDiffData = (oldObj, newObj, isPageLevelDiff = false, isRecommendation) => {
	let diffData = diff(removeEmpty({ ...oldObj }), removeEmpty({ ...newObj }));

	if (!diffData) {
		return [0, {}];
	}
	if (!isPageLevelDiff) {
		if (get(diffData, 'name', null)) {
			const newVal = get(newObj, 'name', '');
			const oldVal = get(oldObj, 'name', '');
			diffData = {
				...diffData,
				generalSettings: {
					...diffData.generalSettings,
					name: [oldVal, newVal],
				},
			};
		}

		if (get(diffData, 'pipeline', null)) {
			const newVal = get(newObj, 'pipeline', '');
			const oldVal = get(oldObj, 'pipeline', '');
			diffData = {
				...diffData,
				generalSettings: {
					...diffData.generalSettings,
					pipeline: [oldVal, newVal],
				},
			};
		}

		if (get(diffData, 'description', null)) {
			const newVal = get(newObj, 'description', '');
			const oldVal = get(oldObj, 'description', '');
			diffData = {
				...diffData,
				generalSettings: {
					...diffData.generalSettings,
					description: [oldVal, newVal],
				},
			};
		}

		if (get(diffData, 'exportSettings.type', null)) {
			const newVal = get(newObj, 'exportSettings.type', '');
			const oldVal = get(oldObj, 'exportSettings.type', '');
			diffData = {
				...diffData,
				ecommercePlatform: {
					...diffData.ecommercePlatform,
					exportType: [oldVal, newVal],
				},
			};
			delete diffData.exportSettings.type;
		}

		if (get(diffData, 'exportSettings.credentials', null)) {
			const newVal = get(newObj, 'exportSettings.credentials', '');
			const oldVal = get(oldObj, 'exportSettings.credentials', '');
			diffData = {
				...diffData,
				generalSettings: {
					...diffData.generalSettings,
					credentials: [oldVal, newVal],
				},
			};
			delete diffData.exportSettings.credentials;
		}

		if (get(diffData, 'syncSettings', null)) {
			const newVal = get(newObj, 'syncSettings', '');
			const oldVal = get(oldObj, 'syncSettings', '');
			diffData = {
				...diffData,
				ecommercePlatform: {
					...diffData.ecommercePlatform,
					syncSettings: [oldVal, newVal],
				},
			};
		}

		if (get(diffData, 'globalSettings.currency', null)) {
			const newVal = get(newObj, 'globalSettings.currency', '');
			const oldVal = get(oldObj, 'globalSettings.currency', '');
			diffData = {
				...diffData,
				ecommercePlatform: {
					...diffData.ecommercePlatform,
					storeInfo: [oldVal, newVal],
				},
			};
		}

		if (get(diffData, 'globalSettings.endpoint', null)) {
			const newVal = get(newObj, 'globalSettings.endpoint', '');
			const oldVal = get(oldObj, 'globalSettings.endpoint', '');

			if (!isEqualWith(oldVal, newVal)) {
				diffData = {
					...diffData,
					generalSettings: {
						...diffData.generalSettings,
						...getDiffFieldsFromObject(
							get(diffData, `globalSettings.endpoint `, {}),
							`globalSettings.endpoint`,
							oldObj,
							newObj,
						),
					},
				};
			}
		}

		if (get(diffData, 'themeSettings.type', null)) {
			const newVal = get(newObj, 'themeSettings.type', '');
			const oldVal = get(oldObj, 'themeSettings.type', '');
			diffData = {
				...diffData,
				layoutAndDesign: {
					...diffData.layoutAndDesign,
					searchLayout: [oldVal, newVal],
				},
			};
		}

		if (get(diffData, 'globalSettings.meta.branding', null)) {
			const newVal = get(newObj, 'globalSettings.meta.branding', '');
			const oldVal = get(oldObj, 'globalSettings.meta.branding', '');
			diffData = {
				...diffData,
				layoutAndDesign: {
					...diffData.layoutAndDesign,
					branding: [oldVal, newVal],
				},
			};
		}

		if (get(diffData, 'themeSettings', null)) {
			const newRsConfig = get(newObj, 'themeSettings.rsConfig', {});
			const oldRsConfig = get(oldObj, 'themeSettings.rsConfig', {});
			const newMeta = get(newObj, 'themeSettings.meta', {});
			const oldMeta = get(oldObj, 'themeSettings.meta', {});
			const newVal = { rsConfig: newRsConfig, meta: newMeta };
			const oldVal = { rsConfig: oldRsConfig, meta: oldMeta };
			try {
				// For below to work objects must contain only properties and no methods.
				const isObjectSame = JSON.stringify(newVal) === JSON.stringify(oldVal);
				if (!isObjectSame) {
					diffData = {
						...diffData,
						layoutAndDesign: {
							...diffData.layoutAndDesign,
							stylePresets: [oldVal, newVal],
						},
					};
				}
			} catch (e) {
				// Silence error
			}
		}

		if (get(diffData, 'themeSettings.customCss', null)) {
			const newVal = get(newObj, 'themeSettings.customCss', '');
			const oldVal = get(oldObj, 'themeSettings.customCss', '');
			diffData = {
				...diffData,
				layoutAndDesign: {
					...diffData.layoutAndDesign,
					customCSS: [oldVal, newVal],
				},
			};
		}

		if (get(diffData, 'globalSettings.showSelectedFilters', null)) {
			const newVal = get(newObj, 'globalSettings.showSelectedFilters', '');
			const oldVal = get(oldObj, 'globalSettings.showSelectedFilters', '');
			diffData = {
				...diffData,
				resultSettings: {
					...diffData.resultSettings,
					showSelectedFilters: [oldVal, newVal],
				},
			};
		}

		if (get(diffData, 'recommendationSettings', null)) {
			const recommendationSettings = get(diffData, 'recommendationSettings', null);
			diffData = {
				...diffData,
				recommendationSettings: {
					...diffData.recommendationSettings,
					...recommendationSettings,
				},
			};
		}

		if (get(diffData, 'recommendationSettings.recommendations', null)) {
			const newVal = get(newObj, 'recommendationSettings.recommendations', {});
			const oldVal = get(oldObj, 'recommendationSettings.recommendations', {});
			diffData = {
				...diffData,
				recommendationSettings: {
					...diffData.recommendationSettings,
					recommendations: [oldVal, newVal],
				},
			};
		}

		if (get(diffData, 'authenticationSettings', null)) {
			let newDiffData = {};
			const oldVal = get(oldObj, 'authenticationSettings', {});
			const newVal = get(newObj, 'authenticationSettings', {});
			const oldValObj = flattenObject(oldVal);
			const newValObj = flattenObject(newVal);
			const traversalObj = { ...newValObj, ...oldValObj };

			Object.keys(traversalObj).forEach((data) => {
				const arr0 = oldValObj[data] || false;
				const arr1 = newValObj[data] || false;
				if (arr0 !== arr1 && data !== 'clientId')
					newDiffData = {
						...newDiffData,
						[data]: [arr0, arr1],
					};
			});
			diffData = {
				...diffData,
				authenticationSettings: {
					...newDiffData,
				},
			};
		}

		if (get(diffData, 'fusionSettings', null)) {
			diffData = {
				...diffData,
				fusionSettings: {
					...getDiffFieldsFromObject(
						get(diffData, 'fusionSettings', {}),
						'fusionSettings',
						oldObj,
						newObj,
					),
				},
			};
		}

		if (isRecommendation) {
			if (get(diffData, 'resultSettings', null)) {
				const newVal = get(removeEmpty(newObj), 'resultSettings.fields', '');
				const oldVal = get(removeEmpty(oldObj), 'resultSettings.fields', '');
				const resultSettings = get(diffData, 'resultSettings.fields', {});

				Object.keys(resultSettings).forEach((i) => {
					resultSettings[i] = [oldVal[i] || '', newVal[i] || ''];
				});

				diffData = {
					...diffData,
					resultSettings,
				};

				delete diffData.resultSettings.fields;
			}
		}
	} else {
		// TODO: page level settings

		if (get(diffData, 'pageSettings.pages', null)) {
			const currentPage = get(newObj, 'pageSettings.currentPage', '');
			const oldVal = get(oldObj, `pageSettings.pages.${currentPage}.indexSettings.index`, '');
			const newVal = get(newObj, `pageSettings.pages.${currentPage}.indexSettings.index`, '');

			if (!isEqualWith(oldVal, newVal)) {
				diffData = {
					...diffData,
					searchSettings: {
						...diffData.searchSettings,
						pagePipeline: [oldVal, newVal],
					},
				};
			}

			const oldFusionSettingsVal = get(
				oldObj,
				`pageSettings.pages.${currentPage}.indexSettings.fusionSettings`,
				'',
			);
			const newFusionSettingsVal = get(
				newObj,
				`pageSettings.pages.${currentPage}.indexSettings.fusionSettings`,
				'',
			);

			if (!isEqualWith(oldFusionSettingsVal, newFusionSettingsVal)) {
				diffData = {
					...diffData,
					searchSettings: {
						...diffData.searchSettings,
						...getDiffFieldsFromObject(
							get(
								diffData,
								`pageSettings.pages.${currentPage}.indexSettings.fusionSettings `,
								{},
							),
							`pageSettings.pages.${currentPage}.indexSettings.fusionSettings`,
							oldObj,
							newObj,
						),
					},
				};
			}

			const oldEndpointVal = get(
				oldObj,
				`pageSettings.pages.${currentPage}.indexSettings.endpoint`,
				'',
			);
			const newEndpointVal = get(
				newObj,
				`pageSettings.pages.${currentPage}.indexSettings.endpoint`,
				'',
			);

			if (!isEqualWith(oldEndpointVal, newEndpointVal)) {
				diffData = {
					...diffData,
					searchSettings: {
						...diffData.searchSettings,
						...getDiffFieldsFromObject(
							get(
								diffData,
								`pageSettings.pages.${currentPage}.indexSettings.endpoint `,
								{},
							),
							`pageSettings.pages.${currentPage}.indexSettings.endpoint`,
							oldObj,
							newObj,
						),
					},
				};
			}
		}
		if (get(diffData, 'searchSettings.rsConfig', null)) {
			const searchSettings = get(diffData, 'searchSettings.rsConfig', {});
			Object.keys(searchSettings).forEach((field) => {
				if (searchSettings[field].length !== 2) {
					const newVal = get(newObj, `searchSettings.rsConfig.${field}`, '');
					const oldVal = get(oldObj, `searchSettings.rsConfig.${field}`, '');
					searchSettings[field] = [oldVal, newVal];
				}
			});
			diffData = {
				...diffData,
				searchSettings: {
					...diffData.searchSettings,
					...searchSettings,
				},
			};
			delete diffData.searchSettings.rsConfig;
		}

		if (get(diffData, 'searchSettings.searchButton', null)) {
			const customMessagesObj = {};
			if (get(diffData, 'searchSettings.searchButton.text', null)) {
				const newVal = get(newObj, 'searchSettings.searchButton.text', '');
				const oldVal = get(oldObj, 'searchSettings.searchButton.text', '');
				customMessagesObj.searchButton = [oldVal, newVal];
			}
			if (get(diffData, 'searchSettings.searchButton.icon', null)) {
				const newVal = get(newObj, 'searchSettings.searchButton.icon', '');
				const oldVal = get(oldObj, 'searchSettings.searchButton.icon', '');
				customMessagesObj.searchIcon = [oldVal, newVal];
			}
			diffData = {
				...diffData,
				searchSettings: {
					...diffData.searchSettings,
					...customMessagesObj,
				},
			};
		}

		if (get(diffData, 'searchSettings.showSearchAs', null)) {
			const newVal = get(newObj, 'searchSettings.showSearchAs', 'sticky');
			const oldVal = get(oldObj, 'searchSettings.showSearchAs', 'sticky');
			if (oldVal === newVal) {
				delete diffData.searchSettings.showSearchAs;
			} else {
				diffData = {
					...diffData,
					searchSettings: {
						...diffData.searchSettings,
						showSearchAs: [oldVal, newVal],
					},
				};
			}
		}

		if (get(diffData, 'facetSettings.staticFacets', null)) {
			const newVal = get(newObj, 'facetSettings.staticFacets', []);
			const oldVal = get(oldObj, 'facetSettings.staticFacets', []);
			let facetSettings = {};
			// eslint-disable-next-line
			for (let i = 0; i < 5; i++) {
				if (diff(oldVal[i], newVal[i])) {
					facetSettings = {
						...facetSettings,
						[staticFacetsFields[i]]: [oldVal[i], newVal[i]],
					};
				}
			}
			diffData = {
				...diffData,
				searchSettings: {
					...diffData.searchSettings,
					...facetSettings,
				},
			};
		}

		if (get(diffData, 'facetSettings.dynamicFacets', null)) {
			const newVal = get(newObj, 'facetSettings.dynamicFacets', '').map((filter) => {
				const finalObj = {
					enabled: filter.enabled,
					...filter.rsConfig,
					...filter.customMessages,
				};

				return finalObj;
			});
			const oldVal = get(oldObj, 'facetSettings.dynamicFacets', '').map((filter) => {
				const finalObj = {
					enabled: filter.enabled,
					...filter.rsConfig,
					...filter.customMessages,
				};

				return finalObj;
			});

			const finalObjArray = [];
			Array.from(new Set([...Object.keys(oldVal), ...Object.keys(newVal)])).forEach((key) => {
				if (!isEqual(oldVal[key], newVal[key])) {
					finalObjArray.push({
						title: newVal?.[key]?.title || oldVal?.[key]?.title,
						oldVal: oldVal[key],
						newVal: newVal[key],
					});
				}
			});

			diffData = {
				...diffData,
				searchSettings: {
					...diffData.searchSettings,
					dynamicFacets: finalObjArray,
				},
			};
		}
		if (get(diffData, 'chartSettings.charts', null)) {
			const newVal = get(newObj, 'chartSettings.charts', []).map((filter) => {
				const finalObj = { enabled: filter.enabled, ...filter.rsConfig };

				return removeEmpty(finalObj);
			});
			const oldVal = get(oldObj, 'chartSettings.charts', []).map((filter) => {
				const finalObj = { enabled: filter.enabled, ...filter.rsConfig };

				return removeEmpty(finalObj);
			});
			const finalObjArray = [];
			Array.from(new Set([...Object.keys(oldVal), ...Object.keys(newVal)])).forEach((key) => {
				if (!isEqual(oldVal[key], newVal[key])) {
					finalObjArray.push({
						title: newVal?.[key]?.title || oldVal?.[key]?.title,
						oldVal: oldVal[key],
						newVal: newVal[key],
					});
				}
			});
			if (!isEqual(oldVal, newVal)) {
				diffData = {
					...diffData,
					chartSettings: {
						...diffData.chartSettings,
						charts: finalObjArray,
					},
				};
			} else delete diffData.chartSettings.charts;
		}
		if (get(diffData, 'resultSettings.rsConfig', null)) {
			const resultSettings = get(diffData, 'resultSettings.rsConfig', {});
			if (resultSettings.componentType) {
				const newVal = get(newObj, 'resultSettings.componentType', '');
				const oldVal = get(oldObj, 'resultSettings.componentType', '');

				diffData = {
					...diffData,
					resultSettings: {
						componentType: [oldVal, newVal],
					},
				};
			}

			diffData = {
				...diffData,
				resultSettings: {
					...diffData.resultSettings,
					...resultSettings,
				},
			};
			delete diffData.resultSettings.rsConfig;
		}

		if (get(diffData, 'resultSettings.fields', null)) {
			const newVal = get(removeEmpty(newObj), 'resultSettings.fields', '');
			const oldVal = get(removeEmpty(oldObj), 'resultSettings.fields', '');
			const resultSettings = get(diffData, 'resultSettings.fields', {});
			const newResultSettings = {};
			Object.keys(resultSettings).forEach((i) => {
				if (i === 'handleViewer') {
					const oldData = oldVal[i] || 'link';
					const newData = newVal[i] || 'link';
					if (oldData !== newData) newResultSettings[i] = [oldData, newData];
				} else {
					const oldData = returnEmpty(oldVal[i]) || '';
					const newData = returnEmpty(newVal[i]) || '';
					if (oldData !== newData) newResultSettings[i] = [oldData, newData];
				}
			});
			diffData = {
				...diffData,
				resultSettings: {
					...diffData.resultSettings,
					...newResultSettings,
				},
			};

			diffData = {
				...diffData,
				resultSettings: {
					...diffData.resultSettings,
					...newResultSettings,
				},
			};
			delete diffData.resultSettings.fields;
			delete diffData?.searchSettings?.fields;
		}

		if (get(diffData, 'resultSettings.displayFields', null)) {
			const newVal = get(removeEmpty(newObj), 'resultSettings.displayFields', {});
			const oldVal = get(removeEmpty(oldObj), 'resultSettings.displayFields', {});
			const resultSettings = get(diffData, 'resultSettings.fields', {});
			diffData = JSON.parse(
				JSON.stringify({
					...diffData,
					resultSettings: {
						...diffData.resultSettings,
						displayFields: !isEqual(oldVal, newVal) ? [oldVal, newVal] : undefined,
					},
				}),
			);

			diffData = {
				...diffData,
				resultSettings: {
					...diffData.resultSettings,
					...resultSettings,
				},
			};
			delete diffData.resultSettings.fields;
			delete diffData?.searchSettings?.fields;
		}
		if (get(diffData, 'resultSettings.categoryFieldValue', null)) {
			const newVal = get(newObj, 'resultSettings.categoryFieldValue', []);
			const oldVal = get(oldObj, 'resultSettings.categoryFieldValue', []);

			diffData = {
				...diffData,
				resultSettings: {
					...diffData.resultSettings,
					categoryFieldValue: [JSON.stringify(oldVal), JSON.stringify(newVal)],
				},
			};
		}
		if (get(diffData, 'resultSettings.sortOptionSelector', null)) {
			const newVal = get(newObj, `resultSettings.sortOptionSelector`, []);
			const oldVal = get(oldObj, `resultSettings.sortOptionSelector`, []);

			if (JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
				diffData = {
					...diffData,
					resultSettings: {
						...diffData.resultSettings,
						sortOptionSelector: [oldVal, newVal],
					},
				};
			}
		}
		if (get(diffData, 'resultSettings', null)) {
			const resultSettings = get(diffData, 'resultSettings', null);
			// eslint-disable-next-line
			for (const key in resultSettings) {
				if (Array.isArray(resultSettings[key]) && resultSettings[key].length !== 2) {
					const newVal = get(newObj, `resultSettings.${key}`, '');
					const oldVal = get(oldObj, `resultSettings.${key}`, '');
					if (newVal !== oldVal) {
						diffData = {
							...diffData,
							resultSettings: {
								...diffData.resultSettings,
								[key]: [oldVal, newVal],
							},
						};
					} else {
						delete diffData.resultSettings[key];
					}
				}
			}
		}

		if (get(diffData, 'searchSettings.customMessages.noResults', null)) {
			const newVal = get(newObj, 'searchSettings.customMessages.noResults', '');
			const oldVal = get(oldObj, 'searchSettings.customMessages.noResults', '');
			diffData = {
				...diffData,
				searchSettings: {
					...diffData.searchSettings,
					noSuggestion: [oldVal, newVal],
				},
			};
			delete diffData.searchSettings.customMessages;
		}

		if (get(diffData, 'resultSettings.customMessages', null)) {
			const customMessages = get(diffData, 'resultSettings.customMessages', null);
			diffData = {
				...diffData,
				resultSettings: {
					...diffData.resultSettings,
					...customMessages,
				},
			};
			delete diffData.resultSettings.customMessages;
		}
	}

	diffData = {
		...(!isPageLevelDiff && {
			ecommercePlatform: get(diffData, 'ecommercePlatform', {}),
			layoutAndDesign: get(diffData, 'layoutAndDesign', {}),
			codeSettings: get(diffData, 'codeSettings', {}),
			generalSettings: get(diffData, 'generalSettings', {}),
			exportSettings: get(diffData, 'exportSettings', {}),
			authenticationSettings: get(diffData, 'authenticationSettings', {}),
			recommendationSettings: get(diffData, 'recommendationSettings', {}),
			fusionSettings: get(diffData, 'fusionSettings', {}),
			...(isRecommendation && {
				resultSettings: get(diffData, 'resultSettings', {}),
			}),
		}),
		...(isPageLevelDiff && {
			resultSettings: get(diffData, 'resultSettings', {}),
			searchSettings: get(diffData, 'searchSettings', {}),
			chartSettings: get(diffData, 'chartSettings', {}),
		}),
	};
	// filter empty fields
	diffData = Object.keys(diffData).reduce((agg, item) => {
		if (Object.keys(diffData[item]).length) {
			return {
				...agg,
				[item]: {
					...diffData[item],
				},
			};
		}
		return agg;
	}, {});

	const topLevelFields = Object.keys(diffData);
	const diffCount = topLevelFields.reduce((agg, item) => {
		const data = diffData[item];
		const count =
			agg +
			Object.keys(data || {}).reduce((sum) => {
				return sum + 1;
			}, 0);

		return count;
	}, 0);

	return [diffCount, diffData];
};

export const getDiffDataAndCount = (oldData, newData, isRecommendation = false) => {
	// eslint-disable-next-line prefer-const
	let [diffCount, diffData] = getDiffData(
		oldData.general,
		newData.general,
		false,
		isRecommendation,
	);

	const pagesKeys = Array.from(
		new Set([...(Object.keys(oldData) ?? {}), ...(Object.keys(newData) ?? {})]),
	);
	delete pagesKeys.general;
	const pagesDiffdata = [];
	pagesKeys.forEach((pageKey) => {
		if (pageKey === 'general') {
			return;
		}
		const pageDiffData = getDiffData(
			oldData[pageKey],
			newData[pageKey],
			true,
			isRecommendation,
		);
		diffCount += pageDiffData[0];
		pagesDiffdata.push({
			sectionTitle: pageKey,
			diffData: pageDiffData[1],
		});
	});

	return {
		diffCount,
		diffDataArray: [diffData, ...pagesDiffdata],
	};
};
