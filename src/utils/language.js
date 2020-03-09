import { cloneDeep, get, omit } from 'lodash';
import languages from '../constants/language';

export function buildLanguageAnalysis(language, languagePayload) {
	const analysis = cloneDeep(get(languages, [language, 'analysis']));
	if (analysis) {
		if (!languagePayload.applyStopwords) {
			omit(analysis.filter, `${language}_stop`);
		}
		if (languagePayload.customStopwords) {
			analysis.filter = {
				...analysis.filter,
				[`${language}_stop`]: {
					type: 'stop',
					stopwords: languagePayload.customStopwords,
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
			filter.splice(filter.length - 1, 0, `${language}_keywords`);
		}
		if (languagePayload.normalizeDiacritics) {
			analysis.analyzer = {
				...analysis.analyzer,
				standard_asciifolding: {
					tokenizer: 'standard',
					filter: ['asciifolding'],
				},
			};
		}
	}
	return analysis;
}

export function getLanguageFallback(language) {
	if (['chinese', 'japanese', 'korean'].includes(language)) return 'cjk';
	return language;
}
