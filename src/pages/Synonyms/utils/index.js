import get from 'lodash/get';
import { uniqueId } from 'lodash';
import { getVersion } from '../../../constants/config';
import {
	closeIndex,
	getMappings,
	getMappingsTree,
	getSettings,
	openIndex,
	updateSettings,
} from '../../../batteries/utils/mappings';

export const getSynonymsState = ({ synonyms, type }) => {
	if (type === 'one-way' && synonyms) {
		const alternatives = synonyms.split('=>')[0].split(',');
		const searchTerm = synonyms.split('=>')[1];
		return {
			alternatives,
			searchTerm,
		};
	}

	if (type === 'equivalent' && synonyms) {
		return {
			synonyms: synonyms.split(','),
		};
	}

	return {};
};

export const hasSynonymsAnalyzer = (settings) => {
	const synonymAnalyzer = get(settings, 'index.analysis.analyzer.synonym');

	return !!synonymAnalyzer;
};

export const hasSynonymsSubFields = (mappings) => {
	const version = getVersion()[0];
	const traversedMappings = getMappingsTree(mappings, +version);
	const synonymNotPresent = Object.keys(traversedMappings).some(
		(mapping) =>
			traversedMappings[mapping] &&
			traversedMappings[mapping].fields &&
			traversedMappings[mapping].fields.includes('search') &&
			!traversedMappings[mapping].fields.includes('synonyms'),
	);
	return !synonymNotPresent;
};

export const getSynonymsAnalyzerSettings = ({ settings, isSynonymsAnalyzerPresent, synonyms }) => {
	if (isSynonymsAnalyzerPresent) {
		return {
			analysis: {
				...get(settings, 'index.analysis', {}),
				filter: {
					...get(settings, 'index.analysis.filter', {}),
					synonym_graph: {
						type: 'synonym_graph',
						lenient: true,
						synonyms,
					},
				},
			},
		};
	}
	return {
		analysis: {
			filter: {
				...get(settings, 'index.analysis.filter', {}),
				synonym_graph: {
					type: 'synonym_graph',
					lenient: true,
					synonyms: synonyms.filter(Boolean),
				},
			},
			analyzer: {
				...get(settings, 'index.analysis.analyzer', {}),
				synonyms: {
					tokenizer: 'standard',
					filter: ['lowercase', 'synonym_graph'],
				},
			},
		},
	};
};

export const getParsedSynonyms = ({ type, alternatives, synonyms, searchTerm }) => {
	switch (type) {
		case 'one-way': {
			return `${alternatives.join(',')} => ${searchTerm}`;
		}
		case 'equivalent': {
			return synonyms.join(',');
		}
		default:
			return '';
	}
};

export const applySynonymsAnalyzer = (properties = {}) => {
	const synonyms = {
		analyzer: 'synonyms',
		type: 'text',
	};
	return Object.keys(properties).reduce((agg, key) => {
		if (properties[key].properties) {
			return {
				...agg,
				[key]: {
					...properties[key],
					properties: applySynonymsAnalyzer(properties[key].properties),
				},
			};
		}
		const data = properties[key];
		// eslint-disable-next-line prefer-const
		let { type, fields } = properties[key];
		if (type === 'text') {
			if (fields) {
				fields.synonyms = synonyms;
			}
		}
		data.fields = fields;
		return { ...agg, [key]: data };
	}, {});
};

export const updateMappingsProperties = ({ mappings: originalMapping, types }) => {
	const mapping = JSON.parse(JSON.stringify(originalMapping));
	const esVersion = +getVersion()[0];
	let isMappingsPresent = false;
	if (+esVersion >= 7) {
		isMappingsPresent = mapping && mapping.properties;
	} else {
		isMappingsPresent = mapping && types[0] && mapping[types[0]];
	}
	if (isMappingsPresent) {
		if (+esVersion >= 7) {
			const updatedProperties = applySynonymsAnalyzer(
				JSON.parse(JSON.stringify(mapping.properties)),
			);
			mapping.properties = {
				...mapping.properties,
				...updatedProperties,
			};
		} else {
			return types.reduce((agg, type) => {
				return {
					...agg,
					[type]: mapping[type].properties
						? {
								properties: applySynonymsAnalyzer(mapping[type].properties),
						  }
						: mapping[type],
				};
			}, {});
		}
	}
	return mapping;
};

export const getUpdatedSynonymsSubfields = (mappings) => {
	return updateMappingsProperties({ mappings, types: Object.keys(mappings) });
};

export const applySynonymsSettings = async ({ appName, credentials, url, settings }) => {
	try {
		const closeResponse = await closeIndex(appName, credentials, url);
		if (
			closeResponse &&
			closeResponse.Message &&
			closeResponse.Message.includes('is not allowed by Amazon Elasticsearch Service.')
		) {
			throw new Error('AWS');
		}
		const synonymResponse = await updateSettings({ appName, credentials, settings });

		if (synonymResponse.acknowledged) {
			// If synonyms request is successful than update mapping via PUT request
			const indexResponse = await openIndex(appName, credentials, url);

			if (indexResponse.acknowledged) {
				return 'Updated';
			}
			throw new Error('');
		} else {
			throw new Error('Unable to update Synonyms');
		}
	} catch (e) {
		await openIndex(appName, credentials, url);
		console.log(e);
		throw e;
	}
};

export async function parseSynonymsAnalyzer({ appName, credentials, url, synonyms }) {
	const settings = await getSettings(appName, credentials, url).then((data) =>
		get(data, [appName, `settings`], {}),
	);

	const isSynonymsAnalyzerPresent = hasSynonymsAnalyzer(settings);
	let mappings = await getMappings(appName, credentials, url);

	// // check if all search field has the synonyms analyzer added
	const hasSubfield = hasSynonymsSubFields(mappings);
	// get the settings request body will add analyzer if not already present
	const synonymsAnalyzerSettings = getSynonymsAnalyzerSettings({
		settings,
		isSynonymsAnalyzerPresent,
		synonyms,
	});
	if (!hasSubfield) {
		// update all subfields for search
		mappings = getUpdatedSynonymsSubfields(mappings);
	}
	return {
		mappings,
		hasSubfield,
		synonymsAnalyzerSettings,
	};
}

// Takes an array of comma-separated synonym sets and returns an optimized structure of synonyms
export function optimizeSynonyms(synonymSets) {
	const optimized = {}; // Object to store the optimized synonym sets

	// Iterate through each synonym set using forEach
	synonymSets.forEach((set) => {
		const synonyms = set.split(',').map((_) => _.trim()); // Split the comma-separated set into an array of synonyms
		let existingKey = null;

		// Use find() to check if any synonym in the current set already exists in the optimized object
		const foundKey = synonyms.find((synonym) =>
			Object.keys(optimized).find((key) => optimized[key].includes(synonym)),
		);

		if (foundKey) {
			existingKey = Object.keys(optimized).find((key) => optimized[key].includes(foundKey));
		}

		// If a synonym exists in the optimized object, merge the current set with the existing set
		if (existingKey) {
			optimized[existingKey] = Array.from(new Set([...optimized[existingKey], ...synonyms]));
		} else {
			// If no synonym exists in the optimized object, create a new entry with a unique identifier
			optimized[uniqueId()] = synonyms;
		}
	});

	return Object.values(optimized).map((val) => val.join(', '));
}
