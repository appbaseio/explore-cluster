import { ProductSuggestions } from './constants/productSuggestions';
import { Search } from './constants/search';
import { SuggestionCard } from './constants/suggestionCard';
import { Suggestions } from './constants/suggestions';
import { Loader } from './constants/loader';
import { SearchPlugin } from './constants/searchPlugin';
import { ResultsLayout } from './constants/resultsLayout';
import { GeoResultsLayout } from './constants/GeoLayout/GeoResultsLayout';
import { GeoLayoutSwitch } from './constants/GeoLayout/LayoutSwitch';
import { GeoListLayout } from './constants/GeoLayout/ListLayout';
import { GeoResults } from './constants/GeoLayout/ResultsLayout';
import { Filters } from './constants/Filters';

const html = (prefs) => {
	const preferences = JSON.stringify(prefs);
	return `
    <!DOCTYPE html>
    <html lang="en">

    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta name="theme-color" content="#000000" />

        <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
        <link rel="shortcut icon" href="%PUBLIC_URL%/favicon.ico" />

        <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.8.1/css/all.css"
            integrity="sha384-50oBUHEmvpQ+1lW4y57PTFmhCaXp0ML5d60M1M7uH2+nqUivzIebhndOJK28anvf" crossorigin="anonymous" />
        <link href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.4/leaflet.css" rel="stylesheet" />

        <link rel="shortcut icon" href="/static/images/favicon.ico" />
        <link href="https://fonts.googleapis.com/css?family=Open+Sans:300,400,600,700" rel="preload" as="style" />
        <link href="https://fonts.googleapis.com/css?family=Open+Sans:300,400,600,700" rel="stylesheet" />

        <script type="text/javascript"
            src="https://maps.googleapis.com/maps/api/js?libraries=places&key=REDACTED_GOOGLE_API_KEY">
        </script>

        <title>ReactiveSearch Shopify</title>
    </head>

    <body>
        <!-- <noscript> You need to enable JavaScript to run this app. </noscript> -->
        <script>var APPBASE_SEARCH_PREFERENCES = ${preferences};</script>

        <div id="reactivesearch-shopify" openAsPage="true"></div>
        <div id="reactivesearch-shopify-product-recommendations"></div>

    </body>

    </html>

    `;
};

const index = `import React from 'react';
import ReactDOM from 'react-dom';
import SearchPlugin from './components/SearchPlugin';
import ProductSuggestions from './components/ProductSuggestions';
import "antd/dist/antd.css";
import './index.css';

const isIdAvailble = (id) => document.getElementById(id);

const getPropsById = (id) => {
    const container = isIdAvailble(id);
    if (container) {
        return {
            widgetId: container.getAttribute('widget-id'),
            currentProduct: container.getAttribute('current-product'),
            isOpen: container.getAttribute('isOpen') === 'true',
            openAsPage: container.getAttribute('openaspage') === 'true',
            isPreview: container.getAttribute('isPreview') === 'true',
            disableSearchText: container.getAttribute('disableSearchText') === 'true',
        };
    }
    return null;
};

const renderById = (id, mode) => {
    const container = isIdAvailble(id);
    if (container) {
        ReactDOM.render(
            mode === 'suggestions' ? (
                <ProductSuggestions {...getPropsById(id)} />
            ) : (
                <SearchPlugin {...getPropsById(id)} />
            ),
            document.getElementById(id),
        );
    }
};
// ------------------ PRODUCT RECOMMENDATIONS ------------------

// Note: Only for internal testing, below id is not available for use

renderById('reactivesearch-shopify-product-recommendations', 'suggestions');

// Note: These ids can be used in plugin
renderById('reactivesearch-shopify-product-recommendations-1', 'suggestions');
renderById('reactivesearch-shopify-product-recommendations-2', 'suggestions');
renderById('reactivesearch-shopify-product-recommendations-2', 'suggestions');
renderById('reactivesearch-shopify-product-recommendations-4', 'suggestions');

// ------------------ SEARCH PLUGIN ------------------

// Note: Only for internal testing, below id is not available for use
renderById('reactivesearch-shopify');

// Note: These ids can be used in plugin
renderById('reactivesearch-shopify-1');
renderById('reactivesearch-shopify-2');
renderById('reactivesearch-shopify-3');
renderById('reactivesearch-shopify-4');

`;

const styles = `
body {
    margin: 0;
    padding: 0;
    font-family: sans-serif;
}

.list-input {
    height: 42px !important;
}

.switcher-styles {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    margin-bottom: 30px;
}

.icon-styles {
    padding: 5px;
    &: hover {
        cursor: pointer;
        color: #40a9ff;
    }
}

`;

const utils = `
/** @jsxRuntime classic */
/** @jsxFrag React.Fragment */
/** @jsx jsx */
import { jsx } from '@emotion/core';
import get from 'lodash.get';

export const browserColors = {
    aliceblue: '#f0f8ff',
    antiquewhite: '#faebd7',
    aqua: '#00ffff',
    aquamarine: '#7fffd4',
    azure: '#f0ffff',
    beige: '#f5f5dc',
    bisque: '#ffe4c4',
    black: '#000000',
    blanchedalmond: '#ffebcd',
    blue: '#0000ff',
    blueviolet: '#8a2be2',
    brown: '#a52a2a',
    burlywood: '#deb887',
    cadetblue: '#5f9ea0',
    chartreuse: '#7fff00',
    chocolate: '#d2691e',
    coral: '#ff7f50',
    cornflowerblue: '#6495ed',
    cornsilk: '#fff8dc',
    crimson: '#dc143c',
    cyan: '#00ffff',
    darkblue: '#00008b',
    darkcyan: '#008b8b',
    darkgoldenrod: '#b8860b',
    darkgray: '#a9a9a9',
    darkgreen: '#006400',
    darkgrey: '#a9a9a9',
    darkkhaki: '#bdb76b',
    darkmagenta: '#8b008b',
    darkolivegreen: '#556b2f',
    darkorange: '#ff8c00',
    darkorchid: '#9932cc',
    darkred: '#8b0000',
    darksalmon: '#e9967a',
    darkseagreen: '#8fbc8f',
    darkslateblue: '#483d8b',
    darkslategray: '#2f4f4f',
    darkslategrey: '#2f4f4f',
    darkturquoise: '#00ced1',
    darkviolet: '#9400d3',
    deeppink: '#ff1493',
    deepskyblue: '#00bfff',
    dimgray: '#696969',
    dimgrey: '#696969',
    dodgerblue: '#1e90ff',
    firebrick: '#b22222',
    floralwhite: '#fffaf0',
    forestgreen: '#228b22',
    fuchsia: '#ff00ff',
    gainsboro: '#dcdcdc',
    ghostwhite: '#f8f8ff',
    goldenrod: '#daa520',
    gold: '#ffd700',
    gray: '#808080',
    green: '#008000',
    greenyellow: '#adff2f',
    grey: '#808080',
    honeydew: '#f0fff0',
    hotpink: '#ff69b4',
    indianred: '#cd5c5c',
    indigo: '#4b0082',
    ivory: '#fffff0',
    khaki: '#f0e68c',
    lavenderblush: '#fff0f5',
    lavender: '#e6e6fa',
    lawngreen: '#7cfc00',
    lemonchiffon: '#fffacd',
    lightblue: '#add8e6',
    lightcoral: '#f08080',
    lightcyan: '#e0ffff',
    lightgoldenrodyellow: '#fafad2',
    lightgray: '#d3d3d3',
    lightgreen: '#90ee90',
    lightgrey: '#d3d3d3',
    lightpink: '#ffb6c1',
    lightsalmon: '#ffa07a',
    lightseagreen: '#20b2aa',
    lightskyblue: '#87cefa',
    lightslategray: '#778899',
    lightslategrey: '#778899',
    lightsteelblue: '#b0c4de',
    lightyellow: '#ffffe0',
    lime: '#00ff00',
    limegreen: '#32cd32',
    linen: '#faf0e6',
    magenta: '#ff00ff',
    maroon: '#800000',
    mediumaquamarine: '#66cdaa',
    mediumblue: '#0000cd',
    mediumorchid: '#ba55d3',
    mediumpurple: '#9370db',
    mediumseagreen: '#3cb371',
    mediumslateblue: '#7b68ee',
    mediumspringgreen: '#00fa9a',
    mediumturquoise: '#48d1cc',
    mediumvioletred: '#c71585',
    midnightblue: '#191970',
    mintcream: '#f5fffa',
    mistyrose: '#ffe4e1',
    moccasin: '#ffe4b5',
    navajowhite: '#ffdead',
    navy: '#000080',
    oldlace: '#fdf5e6',
    olive: '#808000',
    olivedrab: '#6b8e23',
    orange: '#ffa500',
    orangered: '#ff4500',
    orchid: '#da70d6',
    palegoldenrod: '#eee8aa',
    palegreen: '#98fb98',
    paleturquoise: '#afeeee',
    palevioletred: '#db7093',
    papayawhip: '#ffefd5',
    peachpuff: '#ffdab9',
    peru: '#cd853f',
    pink: '#ffc0cb',
    plum: '#dda0dd',
    powderblue: '#b0e0e6',
    purple: '#800080',
    rebeccapurple: '#663399',
    red: '#ff0000',
    rosybrown: '#bc8f8f',
    royalblue: '#4169e1',
    saddlebrown: '#8b4513',
    salmon: '#fa8072',
    sandybrown: '#f4a460',
    seagreen: '#2e8b57',
    seashell: '#fff5ee',
    sienna: '#a0522d',
    silver: '#c0c0c0',
    skyblue: '#87ceeb',
    slateblue: '#6a5acd',
    slategray: '#708090',
    slategrey: '#708090',
    snow: '#fffafa',
    springgreen: '#00ff7f',
    steelblue: '#4682b4',
    tan: '#d2b48c',
    teal: '#008080',
    thistle: '#d8bfd8',
    tomato: '#ff6347',
    turquoise: '#40e0d0',
    violet: '#ee82ee',
    wheat: '#f5deb3',
    white: '#ffffff',
    whitesmoke: '#f5f5f5',
    yellow: '#ffff00',
    yellowgreen: '#9acd32',
};

export const defaultPreferences = {
    themeSettings: {
        type: 'classic',
        customCss: '',
        rsConfig: {},
    },
    searchSettings: {
        searchButton: {
            icon: '',
            text: 'Click here to Search',
        },
        rsConfig: null,
        redirectUrlText: {
            text: 'View Product',
        }
    },
    resultSettings: {
        rsConfig: {
            infiniteScroll: true,
        },
        layout: 'grid',
        viewSwitcher: true,
        mapLayout: 'map',
        locationDataField: 'location',
        mapComponent: 'googleMap',
        defaultZoom: 13,
        showSearchAsMove: true,
        showMarkerClusters: true,
        mapsAPIkey: 'REDACTED_GOOGLE_API_KEY',
        resultHighlight: false,
    },
    facetSettings: {
        globalSettings: {
            isCollapsible: true,
        },
        staticFacets: [],
        dynamicFacets: [],
    },
    globalSettings: {
        currency: '$',
        showSelectedFilters: true,
    },
    productRecommendationSettings: {
        title: 'You might also like',
        rsConfig: {},
    },
    appbaseSettings: null,
    exportType: 'other',
};

export const shopifyDefaultFields = {
    size: 'variants.option1.keyword',
    color: 'variants.option2.keyword',
    price: 'variants.price',
    title: 'title',
    image: 'image.src',
    description: 'body_html',
    handle: 'handle',
    timestamp: 'created_at',
};

export const getReactDependenciesFromPreferences = (
    preferences = {},
    id = '',
) => {
    const react = [];
    const searchId = get(preferences, 'searchSettings.rsConfig.componentId');
    if (searchId) {
        react.push(searchId);
    } else {
        react.push('q');
    }
    const staticFacets = get(preferences, 'facetSettings.staticFacets');
    if (staticFacets && Array.isArray(staticFacets)) {
        staticFacets.forEach((facet) => {
            const componentId = get(
                staticFacets[facet],
                'rsConfig.componentId',
            );
            if (componentId && componentId !== id) {
                react.push(componentId);
            } else if (facet.name && facet.name !== id) {
                react.push(facet.name);
            }
        });
    }
    const dynamicFacets = get(preferences, 'facetSettings.dynamicFacets');
    if (dynamicFacets && Array.isArray(dynamicFacets)) {
        dynamicFacets.forEach((facet) => {
            const componentId = get(facet, 'rsConfig.componentId');
            if (componentId && componentId !== id) {
                react.push(componentId);
            }
        });
    }
    return react;
};

export const getSearchPreferences = () => {
    let preferences = {};
    if (window.APPBASE_SEARCH_PREFERENCES) {
        try {
            preferences = JSON.parse(window.APPBASE_SEARCH_PREFERENCES);
        } catch (e) {
            console.warn(
                'Appbase: Error encountered while parsing the search preferences, fall-backing to the default preferences',
            );
        }
    }
    return preferences;
};

export const getRecommendationsPreferences = () => {
    let preferences = {};
    if (window.APPBASE_RECOMMENDATIONS_PREFERENCES) {
        try {
            preferences = JSON.parse(
                window.APPBASE_RECOMMENDATIONS_PREFERENCES,
            );
        } catch (e) {
            console.warn(
                'Appbase: Error encountered while parsing the recommendations preferences, fall-backing to the default preferences',
            );
        }
    }
    return preferences;
};

export const RecommendationTypes = {
    MOST_POPULAR_PRODUCTS: 'most_popular',
    MOST_RECENT: 'most_recent',
    SIMILAR_PRODUCTS: 'similar',
    FEATURED_PRODUCTS: 'featured',
};

export const accapi = 'https://accapi.appbase.io';

export const getFieldWithoutKeyword = (fieldWithKeyword = '') => {
    return fieldWithKeyword.split('.keyword')[0];
};

export const CtaActions = {
    REDIRECT_TO_PRODUCT: 'redirect_to_product',
    NO_BUTTON: 'no_button',
};

export const getNoRecommendationMessage = (recommendationType) => {
    switch (recommendationType) {
        case RecommendationTypes.SIMILAR_PRODUCTS:
            return (
                <p>
                    It might be possible that there are no products present that
                    matches with the selected product. In that case try to
                    change the similar to dataField or test by selecting other
                    products. If issue persist then please contact us at{' '}
                    <a href="mailto:support@appbase.io">support@appbase.io</a>.
                </p>
            );
        case RecommendationTypes.FEATURED_PRODUCTS:
            return (
                <p>
                    Please make sure that you have featured products and using
                    an API credential that has read access to analytics. If the
                    issue persists, then please contact us at{' '}
                    <a href="mailto:support@appbase.io">support@appbase.io</a>.
                </p>
            );
        case RecommendationTypes.MOST_POPULAR_PRODUCTS:
            return (
                <p>
                    Please make sure that you are using an API credential that
                    has read access to analytics. If the issue persists, then
                    please contact us at{' '}
                    <a href="mailto:support@appbase.io">support@appbase.io</a>.
                </p>
            );
        case RecommendationTypes.MOST_RECENT:
            return (
                <p>
                    Please make sure that the selected dataField is sortable. If
                    the issue persists, then please contact us at{' '}
                    <a href="mailto:support@appbase.io">support@appbase.io</a>.
                </p>
            );
        default:
            return null;
    }
};
`;

const media = `
export const mediaMax = {
    xsmall: '@media (max-width: 420px)',
    small: '@media (max-width: 576px)',
    medium: '@media (max-width: 768px)',
    large: '@media (max-width: 992px)',
    xlarge: '@media (max-width: 1200px)'
};

export const mediaMin = {
    xsmall: '@media (min-width: 420px)',
    small: '@media (min-width: 576px)',
    medium: '@media (min-width: 768px)',
    large: '@media (min-width: 992px)',
    xlarge: '@media (min-width: 1200px)'
};
`;

const PackageDependencies = `
{
    "name": "reactivesearch-shopify-plugin",
    "version": "0.1.0",
    "private": true,
    "author": {
      "name": "Divyanshu Maithani",
      "email": "div.blackcat@gmail.com",
      "url": "https://github.com/divyanshu013"
    },
    "dependencies": {
      "@appbaseio/reactivesearch": "3.28.0",
      "@appbaseio/reactivemaps": "^3.0.0-beta.14",
      "@emotion/core": "^10.0.35",
      "antd": "3.26.20",
      "babel-eslint": "^10.1.0",
      "emotion": "10.0.27",
      "lodash.get": "4.4.2",
      "prop-types": "15.7.2",
      "react": "17.0.2",
      "react-dom": "17.0.2",
      "react-highlight-words": "0.16.0",
      "react-scripts": "4.0.0",
      "react-slick": "0.27.13",
      "react-truncate": "^2.4.0",
      "slick-carousel": "1.8.1",
      "striptags": "3.2.0"
    },
    "devDependencies": {
      "babel-plugin-direct-import": "0.6.2",
      "babel-plugin-emotion": "10.0.33",
      "babel-plugin-import": "1.13.1",
      "customize-cra": "^1.0.0",
      "eslint": "7.12.0",
      "eslint-config-airbnb": "18.2.0",
      "eslint-config-prettier": "6.14.0",
      "eslint-plugin-import": "2.22.1",
      "eslint-plugin-jest": "24.1.0",
      "eslint-plugin-jsx-a11y": "6.4.0",
      "eslint-plugin-prettier": "3.1.4",
      "eslint-plugin-react": "7.21.5",
      "prettier": "2.1.2",
      "react-app-rewired": "^2.1.6"
    },
    "scripts": {
      "start": "PORT=1358 react-app-rewired start",
      "build": "react-app-rewired build",
      "test": "react-app-rewired test --env=jsdom",
      "eject": "react-scripts eject",
      "lint": "eslint ."
    },
    "browserslist": {
      "production": [
        ">0.2%",
        "not dead",
        "not op_mini all"
      ],
      "development": [
        "last 1 chrome version",
        "last 1 firefox version",
        "last 1 safari version"
      ]
    }
  }
`;

const LayoutSwitch = `
    /** @jsxRuntime classic */
    /** @jsx jsx */
    import { Icon } from 'antd';
    import { css, jsx } from '@emotion/core';
    import { func } from 'prop-types';
    import '../index.css';

    export default function LayoutSwitch({ switchViewLayout }) {

        return (
            <div className="switcher-styles">
                <Icon type="appstore" className="icon-styles" onClick={() => switchViewLayout('grid')}/>
                <Icon type="menu" className="icon-styles" onClick={() => switchViewLayout('list')} />
            </div>
        )
    }

    LayoutSwitch.propTypes = {
        switchViewLayout: func,
    }
`;

export const generateInlineSandboxURL = async (preferences) => {
	const loader = Loader();
	const productSuggestions = ProductSuggestions();
	const resultsLayout = ResultsLayout();
	const search = Search();
	const searchPlugin = SearchPlugin();
	const suggestionCard = SuggestionCard();
	const suggestions = Suggestions();
	const geoResultsLayout = GeoResultsLayout();
	const geoLayoutSwitch = GeoLayoutSwitch();
	const geoListLayout = GeoListLayout();
	const geoResults = GeoResults();
	const filters = Filters();

	const unFormattedFiles = {
		'public/index.html': { content: html(JSON.stringify(preferences())) },
		'src/index.js': {
			content: index,
		},
		'src/index.css': { content: styles },
		'src/utils/index.js': {
			content: utils,
		},
		'src/utils/media.js': {
			content: media,
		},
		'src/components/Filters.js': {
			content: filters,
		},
		'src/components/LayoutSwitch.js': {
			content: LayoutSwitch,
		},
		'src/components/Loader.js': {
			content: loader,
		},
		'src/components/ProductSuggestions.js': {
			content: productSuggestions,
		},
		'src/components/ResultsLayout.js': {
			content: resultsLayout,
		},
		'src/components/Search.js': {
			content: search,
		},
		'src/components/SearchPlugin.js': {
			content: searchPlugin,
		},
		'src/components/SuggestionCard.js': {
			content: suggestionCard,
		},
		'src/components/Suggestions.js': {
			content: suggestions,
		},
		'src/components/GeoLayout/GeoResultsLayout.js': {
			content: geoResultsLayout,
		},
		'src/components/GeoLayout/LayoutSwitch.js': {
			content: geoLayoutSwitch,
		},
		'src/components/GeoLayout/ListLayout.js': {
			content: geoListLayout,
		},
		'src/components/GeoLayout/ResultsLayout.js': {
			content: geoResults,
		},
		'package.json': {
			content: PackageDependencies,
		},
	};

	const files = Object.keys(unFormattedFiles).reduce(
		(agg, item) => ({
			...agg,
			[item]: {
				content: unFormattedFiles[item].content,
			},
		}),
		{},
	);

	const settings = {
		method: 'POST',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			files,
		}),
	};
	try {
		const fetchResponse = await fetch(
			'https://codesandbox.io/api/v1/sandboxes/define?json=1',
			settings,
		);
		const data = await fetchResponse.json();
		return data;
	} catch (e) {
		return e;
	}
};

export default generateInlineSandboxURL;
