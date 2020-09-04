import get from 'lodash/get';
import omit from 'lodash/omit';
import { getVersion } from '../../../../constants/config';
import mappingUsecase from '../../../../batteries/utils/mappingUsecase';
import { flatObject } from '.';

export const getMappingsInfo = (originalMappings) => {
	const mappings = JSON.parse(JSON.stringify(originalMappings));
	const ES_VERSION = getVersion();

	if (!ES_VERSION) {
		return {};
	}

	let TOP_FIELD = '';

	if (+ES_VERSION[0] >= 6) {
		TOP_FIELD = '_doc.properties';
	}

	if (+ES_VERSION[0] >= 7) {
		TOP_FIELD = 'properties';
	}

	if (!get(mappings, TOP_FIELD, null)) {
		return {};
	}
	const fields = get(mappings, TOP_FIELD);
	const usecase = _getMappingsUsecase(fields);
	const type = _getMappingsType(fields);
	const flattenUsecase = flatObject(usecase);
	const flattenType = flatObject(type);

	return {
		usecase,
		type,
		flattenType,
		flattenUsecase,
	};
};

const _getMappingsUsecase = (mappings) => {
	return Object.keys(mappings).reduce((agg, item) => {
		return {
			...agg,
			[item]: get(mappings, `${item}.properties`)
				? { ..._getMappingsUsecase(get(mappings, `${item}.properties`)) }
				: _getUsecase(get(mappings, `${item}.fields`)),
		};
	}, {});
};

const _getMappingsType = (mappings) => {
	return Object.keys(mappings).reduce((agg, item) => {
		return {
			...agg,
			[item]: get(mappings, `${item}.properties`)
				? { ..._getMappingsType(get(mappings, `${item}.properties`)) }
				: get(mappings, `${item}.type`),
		};
	}, {});
};

const _hasAggs = (field) => {
	if (!field) return false;
	let hasAggsFlag = false;
	Object.keys(field).forEach((subField) => {
		if (
			field[subField].type === 'keyword' ||
			(field[subField].type === 'string' && field[subField].index === 'not_analyzed') // for ES2
		) {
			hasAggsFlag = true;
		}
	});
	return hasAggsFlag;
};

const _getUsecase = (fields) => {
	if (!fields) {
		return 'none';
	}
	const hasAggsFlag = _hasAggs(fields);
	let hasSearchFlag = 0;
	if (fields.search || fields.autosuggest || fields.delimiter) hasSearchFlag = 1;

	if (hasAggsFlag && hasSearchFlag) return 'searchaggs';
	if (!hasAggsFlag && hasSearchFlag) return 'search';
	if (hasAggsFlag && !hasSearchFlag) return 'aggs';
	return 'none';
};

const MAPPING_TYPE_WITH_NO_FIELDS = ['rank_feature', 'rank_features'];

const _updateNestedMapping = ({ mapping, type, usecase, fields, currentIndex, settings }) => {
	if (MAPPING_TYPE_WITH_NO_FIELDS.includes(type)) {
		return mapping;
	}

	if (fields.length === currentIndex + 1) {
		const { enableNgram, enableSynonyms, language } = settings;

		const languageField = {
			type: 'text',
			analyzer: language,
		};
		const synonymsField = {
			analyzer: 'synonyms',
			type: 'text',
		};

		const extraFields = {
			...(type === 'text' && enableSynonyms
				? {
						synonyms: synonymsField,
				  }
				: {}),
			...(type === 'text' && language
				? {
						lang: languageField,
				  }
				: {}),
		};

		const updatedFields = {
			...(get(mappingUsecase, `${usecase}.fields`)
				? {
						...get(mappingUsecase, `${usecase}.fields`),
						...extraFields,
				  }
				: { ...extraFields }),
		};

		if (enableNgram && usecase.includes('search')) {
			delete updatedFields.search;
		}

		return {
			...mapping,
			[`${fields[currentIndex]}`]: {
				...mappingUsecase[usecase],
				fields: updatedFields,
				type,
			},
		};
	}

	return {
		...mapping,
		[`${fields[currentIndex]}`]: {
			...get(mapping, `${fields[currentIndex]}`),
			properties: {
				..._updateNestedMapping({
					mapping: get(mapping, `${fields[currentIndex]}.properties`),
					type,
					usecase,
					fields,
					currentIndex: currentIndex + 1,
					settings,
				}),
			},
		},
	};
};

export const updateMapping = ({ originalMapping, type, usecase, path, settings }) => {
	const mapping = JSON.parse(JSON.stringify(originalMapping));

	const ES_VERSION = getVersion();
	let TOP_FIELD = '';

	if (+ES_VERSION[0] >= 6) {
		TOP_FIELD = '_doc.properties';
	}

	if (+ES_VERSION[0] >= 7) {
		TOP_FIELD = 'properties';
	}

	const updatedMappings = _updateNestedMapping({
		mapping: get(mapping, TOP_FIELD),
		type,
		usecase,
		fields: path.split('.'),
		currentIndex: 0,
		settings,
	});

	if (+ES_VERSION[0] >= 6 && +ES_VERSION[0] < 7) {
		return {
			_doc: {
				properties: {
					...updatedMappings,
				},
			},
		};
	}

	return {
		[TOP_FIELD]: {
			...updatedMappings,
		},
	};
};

export const deleteMappingField = ({ originalMapping, path }) => {
	const mapping = JSON.parse(JSON.stringify(originalMapping));

	const ES_VERSION = getVersion();
	let TOP_FIELD = '';

	if (+ES_VERSION[0] >= 6) {
		TOP_FIELD = '_doc.properties';
	}

	if (+ES_VERSION[0] >= 7) {
		TOP_FIELD = 'properties';
	}

	const updatedPath = path.split('.').join('.properties.');
	const updatedMappings = omit(get(mapping, TOP_FIELD), updatedPath);

	if (+ES_VERSION[0] >= 6 && +ES_VERSION[0] < 7) {
		return {
			_doc: {
				properties: {
					...updatedMappings,
				},
			},
		};
	}

	return {
		[TOP_FIELD]: {
			...updatedMappings,
		},
	};
};

export const getMappingsByPath = ({ mappings, path }) => {
	const ES_VERSION = getVersion();

	if (!ES_VERSION) {
		return {};
	}

	let TOP_FIELD = '';

	if (+ES_VERSION[0] >= 6) {
		TOP_FIELD = '_doc.properties';
	}

	if (+ES_VERSION[0] >= 7) {
		TOP_FIELD = 'properties';
	}
	const updatedPath = path.split('.').join('.properties.');
	return get(mappings, `${TOP_FIELD}.${updatedPath}`);
};
