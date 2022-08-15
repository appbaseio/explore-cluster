import { isEmpty } from 'lodash';

export const SearchBoxBannerDetails = {
	title: 'Searchbox',
	description: `GUI to create and manage searchbox UI preferences. Configure design, and suggestions layout: supports featured, popular, recent and endpoint type of suggestions.`,
	buttonText: 'Read Docs',
	icon: 'info-circle',
	href: 'https://docs.appbase.io/docs/reactivesearch/v3/search/searchbox/',
};

// function to validate for a valid HTML string
// https://stackoverflow.com/a/49711807/10822996
export function validateHtmlStr(htmlStr, strictBoolean) {
	if (typeof htmlStr !== 'string') return false;

	const validateHtmlTag = new RegExp('<[a-z]+(s+|"[^"]*"s?|\'[^\']*\'s?|[^\'">])*>', 'igm');
	const sdom = document.createElement('div');
	let noSrcNoAmpHtmlStr = htmlStr
		.replace(/ src=/, ' svhs___src=') // disarm src attributes
		.replace(/&amp;/gim, '#svhs#amp##'); // 'save' encoded ampersands
	const noSrcNoAmpIgnoreScriptContentHtmlStr = noSrcNoAmpHtmlStr
		.replace(/\n\r?/gim, '#svhs#nl##') // temporarily remove line breaks
		.replace(/(<script[^>]*>)(.*?)(<\/script>)/gim, '$1$3') // ignore script contents
		.replace(/#svhs#nl##/gim, '\n\r'); // re-add line breaks
	const htmlTags = noSrcNoAmpIgnoreScriptContentHtmlStr.match(/<[a-z]+[^>]*>/gim); // get all start-tags
	const htmlTagsCount = htmlTags ? htmlTags.length : 0;
	let tagsAreValid;
	let resHtmlStr;

	if (!strictBoolean) {
		// ignore <br/> conversions
		noSrcNoAmpHtmlStr = noSrcNoAmpHtmlStr.replace(/<br\s*\/>/, '<br>');
	}

	if (htmlTagsCount) {
		tagsAreValid = htmlTags.reduce((isValid, tagStr) => {
			return isValid && tagStr.match(validateHtmlTag);
		}, true);

		if (!tagsAreValid) {
			return false;
		}
	}

	try {
		sdom.innerHTML = noSrcNoAmpHtmlStr;
	} catch (err) {
		return false;
	}

	// compare rendered tag-count with expected tag-count
	if (sdom.querySelectorAll('*').length !== htmlTagsCount) {
		return false;
	}

	resHtmlStr = sdom.innerHTML.replace(/&amp;/gim, '&'); // undo '&' encoding

	if (!strictBoolean) {
		// ignore empty attribute normalizations
		resHtmlStr = resHtmlStr.replace(/=""/, '');
	}

	// compare html strings while ignoring case, quote-changes, trailing spaces
	const simpleIn = noSrcNoAmpHtmlStr
		.replace(/["']/gim, '')
		.replace(/\s+/gim, ' ')
		.toLowerCase()
		.trim();
	const simpleOut = resHtmlStr.replace(/["']/gim, '').replace(/\s+/gim, ' ').toLowerCase().trim();
	if (simpleIn === simpleOut) return true;

	return resHtmlStr.replace(/ svhs___src=/gim, ' src=').replace(/#svhs#amp##/, '&amp;');
}

export function isUrlValid(string) {
	// eslint-disable-next-line no-useless-escape
	const matcher = /^(?:\w+:)?\/\/([^\s\.]+\.\S{2}|localhost[\:?\d]*)\S*$/;
	return matcher.test(string);
}

export function generateFeaturedSuggestionPayload({ sections, suggestions }) {
	try {
		if (isEmpty(sections)) {
			return null;
		}

		const sectionsArray = [];

		Object.values(sections).forEach((sectionItem) => {
			sectionsArray.push({
				id: sectionItem.id,
				label: sectionItem.title,
				suggestions: Object.values(suggestions)
					.filter((suggItem) => {
						if (sectionItem.suggestionsIds.includes(suggItem.id)) {
							return true;
						}
						return false;
					})
					.map(({ label, value, description, action, subAction, iconURL, icon }) => {
						return {
							label,
							value,
							description,
							action,
							subAction,
							iconURL,
							icon,
						};
					}),
			});
		});

		return { sections: sectionsArray };
	} catch (e) {
		// eslint-disable-next-line no-console
		console.error(e.stack);
		return null;
	}
}

/* eslint-disable */
export function overrideConsoleLog() {
	console.stdlog = console.log.bind(console);
	console.logs = [];
	console.log = function () {
		console.logs.push(Array.from(arguments));
		console.stdlog.apply(console, arguments);
	};
}

export function resetConsoleOverride() {
	console.log = console.stdlog.bind(console);
}
/* eslint-enable */

export const DEFAULT_DESIGN_COLORS = {
	light: {
		primaryColor: '#4A90E2',
		textColor: '#333',
	},
	dark: {
		primaryColor: '#4A90E2',
		textColor: '#ABABAB',
	},
};
