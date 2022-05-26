import React from 'react';
import get from 'lodash/get';
import { FormBuilder, Validators } from 'react-reactive-form';
import { css } from 'emotion';

// eslint-disable-next-line
export const FormContext = React.createContext(null);

export const verticalTab = css`
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

export const BaseURL = 'https://appbase-ecomm.netlify.app/static/js/main.js';
export const BaseCSSURL = 'https://appbase-ecomm.netlify.app/static/css/main.css';

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

export const getFilterConfigurationForm = (customFields = {}, isDynamicFilter = false) => {
	return FormBuilder.group({
		enabled: false,
		customize: FormBuilder.group({
			title: isDynamicFilter ? [undefined, Validators.required] : undefined,
			dataField: isDynamicFilter ? [undefined, Validators.required] : undefined,
			filterType: 'list',
			size: undefined,
			queryFormat: 'or',
			sortBy: 'count',
			filterLabel: undefined,
			showCount: true,
			showCheckbox: true,
			showSearch: true,
			showMissing: false,
			missingLabel: undefined,
			selectAllLabel: undefined,
			...customFields,
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

export const shopifyDefaultFields = {
	size: 'variants.option1.keyword',
	color: 'variants.option2.keyword',
	price: 'variants.price',
	title: 'title',
	image: 'image.src',
	description: 'body_html',
	handle: 'handle',
};

export const getMultiListProps = (values) => ({
	...values,
	size: Number.isNaN(parseInt(values.size, 10)) ? undefined : parseInt(values.size, 10),
});

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
		'Select a field to display the similar products. For example, if you select `brand` and user is viewing the `Adidas Black Shoe` product that has `brand` value as `adidas` then appbase.io will show the products having `adidas` brand as recommendations.',
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
	logoWidth: 20,
	logoAlignment: 'left',
	themeType: 'classic',
	primaryColor: '#0B6AFF',
	primaryTextColor: '#fff',
	textColor: '#424242',
	titleColor: '#424242',
	fontFamily: 'default',
	customCss: '',
	resultTitle: '',
	resultDescription: '',
	resultPrice: '',
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
	id: '',
	logoUrl: '',
	logoWidth: 20,
	logoAlignment: 'left',
	versionId: '',
	themeType: 'classic',
	primaryColor: '#0B6AFF',
	primaryTextColor: '#fff',
	textColor: '#424242',
	titleColor: '#424242',
	fontFamily: 'default',
	customCss: '',
	resultTitle: '',
	resultDescription: '',
	resultPrice: '',
	resultImage: '',
	resultHandle: '',
	layout: 'grid',
	resultHighlight: false,
	viewSwitcher: true,
	storeInfo: { currency: 'USD' },
	exportSettings: { exportAs: 'embed', credentials: '', openAsPage: false, type: 'other' },
	showPagination: false,
	showSelectedFilters: true,
	customMessages: {
		resultStats: '[count] products found in [time] ms',
		noFilterItem: 'No items Found',
		noResultItem: 'No Results Found!',
		noSuggestion: 'No suggestions found for <mark>[term]</mark>',
		fetchingFilterOptions: 'Fetching Options',
		searchText: 'Click here to search',
		searchIcon: '',
		redirectUrlText: 'View Product',
		redirectUrlIcon: '',
	},
	autosuggest: true,
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
				filterType: 'list',
				queryFormat: 'or',
				sortBy: 'count',
				showCount: true,
				showCheckbox: true,
				showSearch: true,
				showMissing: false,
			},
		},
		collections: {
			enabled: false,
			customize: {
				filterType: 'list',
				queryFormat: 'or',
				sortBy: 'count',
				showCount: true,
				showCheckbox: true,
				showSearch: true,
				showMissing: false,
			},
		},
		color: {
			enabled: false,
			customize: {
				filterType: 'list',
				queryFormat: 'or',
				sortBy: 'count',
				showCount: true,
				showCheckbox: true,
				showSearch: true,
				showMissing: false,
			},
		},
		size: {
			enabled: false,
			customize: {
				filterType: 'list',
				queryFormat: 'or',
				sortBy: 'count',
				showCount: true,
				showCheckbox: true,
				showSearch: true,
				showMissing: false,
				showHistogram: false,
				startValue: undefined,
				endValue: undefined,
				startLabel: undefined,
				endLabel: undefined,
				calendarInterval: undefined,
			},
		},
		price: {
			enabled: false,
			customize: {
				startValue: undefined,
				endValue: undefined,
				startLabel: undefined,
				endLabel: undefined,
				showHistogram: false,
			},
		},
	},
	dynamicFilters: [],
	syncSettings: defaultSettings.reduce((acc, item) => ({ ...acc, [item.id]: item.value }), {}),
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
					image: get(formValue, 'resultImage'),
					handle: get(formValue, 'resultHandle'),
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

export const getSearchPreferencesPayload = (formValue) => {
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
					deploySettings: {
						versionId: get(formValue, 'versionId'),
					},
				},
			},
			exportSettings: get(formValue, 'exportSettings'),
			resultSettings: {
				fields: {
					title: get(formValue, 'resultTitle'),
					description: get(formValue, 'resultDescription'),
					price: get(formValue, 'resultPrice'),
					image: get(formValue, 'resultImage'),
					handle: get(formValue, 'resultHandle'),
				},
				customMessages: {
					resultStats: get(formValue, 'customMessages.resultStats'),
					noResults: get(formValue, 'customMessages.noResultItem'),
				},
				rsConfig: {
					pagination: !!get(formValue, 'showPagination'),
					infiniteScroll: !get(formValue, 'showPagination'),
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
				fields: {
					title: get(formValue, 'resultTitle'),
					description: get(formValue, 'resultDescription'),
					price: get(formValue, 'resultPrice'),
					image: get(formValue, 'resultImage'),
					handle: get(formValue, 'resultHandle'),
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
				},
			},
			facetSettings: {
				staticFacets: [
					{
						name: 'productType',
						enabled: get(formValue, 'staticFilters.productType.enabled'),
						isCollapsible: true,
						customMessages: {
							loading: get(formValue, 'customMessages.fetchingFilterOptions'),
							noResults: get(formValue, 'customMessages.noFilterItem'),
						},
						rsConfig: {
							...getMultiListProps(
								get(formValue, 'staticFilters.productType.customize'),
							),
						},
					},
					{
						name: 'collection',
						enabled: get(formValue, 'staticFilters.collections.enabled'),
						isCollapsible: true,
						customMessages: {
							loading: get(formValue, 'customMessages.fetchingFilterOptions'),
							noResults: get(formValue, 'customMessages.noFilterItem'),
						},
						rsConfig: {
							...getMultiListProps(
								get(formValue, 'staticFilters.collections.customize'),
							),
						},
					},
					{
						name: 'color',
						enabled: get(formValue, 'staticFilters.color.enabled'),
						isCollapsible: true,
						customMessages: {
							loading: get(formValue, 'customMessages.fetchingFilterOptions'),
							noResults: get(formValue, 'customMessages.noFilterItem'),
						},
						rsConfig: {
							...getMultiListProps(get(formValue, 'staticFilters.color.customize')),
						},
					},
					{
						name: 'size',
						enabled: get(formValue, 'staticFilters.size.enabled'),
						isCollapsible: true,
						customMessages: {
							loading: get(formValue, 'customMessages.fetchingFilterOptions'),
							noResults: get(formValue, 'customMessages.noFilterItem'),
						},
						rsConfig: {
							...getMultiListProps(get(formValue, 'staticFilters.size.customize')),
						},
					},
					{
						name: 'price',
						enabled: get(formValue, 'staticFilters.price.enabled'),
						isCollapsible: true,
						customMessages: {
							loading: get(formValue, 'customMessages.fetchingFilterOptions'),
							noResults: get(formValue, 'customMessages.noFilterItem'),
						},
						rsConfig: {
							...getMultiListProps(get(formValue, 'staticFilters.price.customize')),
						},
					},
				],
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
			syncSettings:
				get(formValue, 'exportSettings.type') === 'shopify'
					? get(formValue, 'syncSettings')
					: null,
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
