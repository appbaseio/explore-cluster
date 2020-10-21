import get from 'lodash/get';
import cloneDeep from 'lodash/cloneDeep';
import omit from 'lodash/omit';
import languages from '../constants/language';

export function buildLanguageAnalysis(language, languagePayload) {
	const analysis = cloneDeep(get(languages, [language, 'analysis']));

	const getStopwords = () => {
		const defaultStopWords = get(analysis, `filter.${language}_stop.stopwords`);
		const { customStopwords, applyStopwords } = languagePayload;
		if (defaultStopWords && applyStopwords) return [defaultStopWords, ...customStopwords];
		return customStopwords;
	};

	if (analysis) {
		if (!languagePayload.applyStopwords) {
			omit(analysis.filter, `${language}_stop`);
		}
		if (languagePayload.customStopwords) {
			analysis.filter = {
				...analysis.filter,
				[`${language}_stop`]: {
					type: 'stop',
					stopwords: getStopwords(),
				},
			};
		}
		if (languagePayload.stemmingExceptions) {
			analysis.filter = {
				...analysis.filter,
				[`${language}_keywords`]: {
					type: 'keyword_marker',
					keywords: languagePayload.stemmingExceptions,
				},
			};
			const { filter } = analysis.analyzer[language];
			if (language === 'universal') filter.push(`${language}_keywords`);
			else filter.splice(filter.length - 1, 0, `${language}_keywords`);
		}
	}
	return analysis;
}

export function getLanguageFallback(language) {
	if (['chinese', 'japanese', 'korean'].includes(language)) return 'cjk';
	return language;
}
