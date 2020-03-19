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
			if (language === 'universal') filter.push(`${language}_keywords`);
			else filter.splice(filter.length - 1, 0, `${language}_keywords`);
		}
		if (languagePayload.normalizeDiacritics) {
			const { filter } = analysis.analyzer[language];
			let stopIndex = filter.findIndex(f => f.includes('_stop'));
			if (stopIndex === -1) stopIndex = 0;
			filter.splice(stopIndex, 0, 'asciifolding');
		}
	}
	return analysis;
}

export function getLanguageFallback(language) {
	if (['chinese', 'japanese', 'korean'].includes(language)) return 'cjk';
	return language;
}
