import get from 'lodash/get';
import omit from 'lodash/omit';
import { getVersion, getURL } from '../constants/config';
import mappingUsecase from '../batteries/utils/mappingUsecase';
import { getAuthHeaders } from '../batteries/utils/mappings';
import { getPossibleSubFields, unflattenObject } from '.';
import { SUB_FIELDS } from '../constants';

export const getMappingsInfo = ({
	mappings: originalMappings,
	enableNgram,
	enableSynonyms,
	language,
}) => {
	const mappings = updateSubFields({
		mappings: originalMappings,
		enableNgram,
		enableSynonyms,
		language,
	});
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
				: _getUsecase(get(mappings, `${item}.fields`), get(mappings, `${item}.type`)),
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
	// this means its of non text type and has aggs
	if (!field || !Object.keys(field).length) return true;

	// for text type check if .keyword exists
	const hasAggsFlag = Object.keys(field).some(
		(subField) =>
			field[subField].type === 'keyword' ||
			(field[subField].type === 'string' && field[subField].index === 'not_analyzed'),
	);
	return hasAggsFlag;
};

const _getUsecase = (fields, type) => {
	if ((!fields || !Object.keys(fields).length) && type === 'text') {
		return 'none';
	}
	const hasAggsFlag = _hasAggs(fields);
	let hasSearchFlag = 0;
	if (type === 'text') {
		if (fields.search || fields.autosuggest || fields.delimiter) hasSearchFlag = 1;
		if (hasAggsFlag && hasSearchFlag) return 'searchaggs';
		if (!hasAggsFlag && hasSearchFlag) return 'search';
	}
	if (hasAggsFlag && !hasSearchFlag) return 'aggs';
	return 'none';
};

const _getFieldsByRelevancy = ({
	enableNgram,
	enableSynonyms,
	language,
	fields: originalFields,
	type,
}) => {
	const languageField = {
		type: 'text',
		analyzer: language,
	};
	const synonymsField = {
		analyzer: 'synonyms',
		type: 'text',
	};

	const { ...fields } = originalFields;

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

	let updatedFields = {
		...(fields
			? {
					...fields,
					...extraFields,
			  }
			: { ...extraFields }),
	};

	if (!enableNgram) {
		delete updatedFields.search;
	} else if (type === 'text' && enableNgram) {
		if (_getUsecase(updatedFields, type).includes('search') && !updatedFields.search) {
			updatedFields = {
				...updatedFields,
				search: {
					type: 'text',
					index: 'true',
					analyzer: 'ngram_analyzer',
					search_analyzer: 'standard',
				},
			};
		}
	}

	return updatedFields;
};

const MAPPING_TYPE_WITH_NO_FIELDS = ['rank_feature', 'rank_features'];

const _updateNestedMapping = ({ mapping, type, usecase, fields, currentIndex, settings }) => {
	if (fields.length === currentIndex + 1) {
		const { enableNgram, enableSynonyms, language } = settings;

		const updatedFields = _getFieldsByRelevancy({
			enableSynonyms,
			enableNgram,
			language,
			fields: get(mappingUsecase, `${usecase}.fields`),
			type,
		});
		const data = {
			...mappingUsecase[usecase],
			fields: updatedFields,
			type,
		};

		if (MAPPING_TYPE_WITH_NO_FIELDS.includes(type)) {
			delete data.fields;
		}
		return {
			...mapping,
			[`${fields[currentIndex]}`]: data,
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

	const updatedMappings = omit(get(mapping, TOP_FIELD), path);

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
		deletedPath: path,
		mappings: {
			[TOP_FIELD]: {
				...updatedMappings,
			},
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

export const updateSubFields = ({
	mappings: originalMappings,
	enableSynonyms,
	enableNgram,
	language,
}) => {
	const mappings = JSON.parse(JSON.stringify(originalMappings));
	const ES_VERSION = getVersion();

	let TOP_FIELD = '';

	if (+ES_VERSION[0] >= 6) {
		TOP_FIELD = '_doc.properties';
	}

	if (+ES_VERSION[0] >= 7) {
		TOP_FIELD = 'properties';
	}

	if (!get(mappings, TOP_FIELD, null)) {
		return mappings;
	}
	const mappingFields = Object.keys(get(mappings, TOP_FIELD, {}));

	const updatedMappings = mappingFields.reduce((agg, field) => {
		if (get(mappings, `properties.${field}.properties`, null)) {
			return {
				...agg,
				properties: {
					...agg.properties,
					[field]: updateSubFields({
						mappings: get(mappings, `properties.${field}`, {}),
						enableSynonyms,
						enableNgram,
						language,
					}),
				},
			};
		}
		const type = get(mappings, `properties.${field}.type`);
		return {
			...agg,
			properties: {
				...agg.properties,
				[field]: {
					...get(mappings, `properties.${field}`, {}),
					...(!MAPPING_TYPE_WITH_NO_FIELDS.includes(type) && {
						fields: {
							..._getFieldsByRelevancy({
								enableSynonyms,
								enableNgram,
								language,
								type,
								fields: get(mappings, `properties.${field}.fields`, {}),
							}),
						},
					}),
				},
			},
		};
	}, {});

	if (+ES_VERSION[0] >= 6 && +ES_VERSION[0] < 7) {
		return {
			_doc: {
				...updatedMappings,
			},
		};
	}

	return { ...updatedMappings };
};

export function reIndex({ mappings, appName, version, credentials, settings, excludeFields }) {
	const body = {
		mappings,
		settings,
		es_version: version,
	};

	if (excludeFields && excludeFields.length) {
		body.exclude_fields = excludeFields;
	}

	return new Promise((resolve, reject) => {
		const ACC_API = getURL();
		fetch(`${ACC_API}/_reindex/${appName}`, {
			method: 'POST',
			headers: {
				...getAuthHeaders(credentials),
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(body),
		})
			.then((res) => {
				if (res.status === 504) {
					resolve('~100');
				}
				return res;
			})
			.then((res) => res.json())
			.then((data) => {
				if (data.error) {
					reject(data.error);
				}
				if (data.code >= 400) {
					reject(data.message);
				}
				resolve(data);
			})
			.catch((e) => {
				reject(e);
			});
	});
}

export const updateObjectNestedProperty = ({ obj, value, fields, currentIndex = 0 }) => {
	if (currentIndex + 1 === fields.length) {
		return {
			...obj,
			[fields[currentIndex]]: value,
		};
	}

	return {
		...obj,
		[fields[currentIndex]]: {
			...get(obj, `${fields[currentIndex]}`),
			...updateObjectNestedProperty({
				obj: get(obj, `${fields[currentIndex]}`),
				value,
				fields,
				currentIndex: currentIndex + 1,
			}),
		},
	};
};

export const flatObject = (originalObject, path = '') => {
	const clonedObject = JSON.parse(JSON.stringify(originalObject));

	return Object.keys(clonedObject).reduce((agg, key) => {
		const parsedKey =
			typeof clonedObject[key] === 'object'
				? flatObject(clonedObject[key], `${path}${key}.`)
				: { [`${path}${key}`]: clonedObject[key] };
		return {
			...agg,
			...parsedKey,
		};
	}, {});
};

export const hasKeyword = (fieldMappings) => {
	if (get(fieldMappings, 'fields.keyword.type', '') === 'keyword') {
		return true;
	}

	return false;
};

export const applyNgramMapping = (mappings, isNgramEnabled) => {
	const updatedMappings = Object.keys(mappings).reduce((agg, field) => {
		const fieldVal = { ...get(mappings, field) };
		let updatedData = { ...agg };
		if (get(fieldVal, 'properties', null)) {
			// recursive call the function
			updatedData = {
				...updatedData,
				[field]: {
					properties: applyNgramMapping(get(fieldVal, 'properties'), isNgramEnabled),
				},
			};
		} else if (get(fieldVal, 'type') === 'text') {
			if (!isNgramEnabled && get(fieldVal, 'fields.search', null)) {
				// remove the .search field
				delete fieldVal.fields.search;
				updatedData = {
					...updatedData,
					[field]: {
						...fieldVal,
					},
				};
			}

			if (isNgramEnabled && !get(fieldVal, 'fields.search', null)) {
				// add the .search field
				updatedData = {
					...updatedData,
					[field]: {
						...fieldVal,
						fields: {
							...get(fieldVal, 'fields'),
							search: {
								analyzer: 'ngram_analyzer',
								search_analyzer: 'standard',
								type: 'text',
							},
						},
					},
				};
			}
		}

		return updatedData;
	}, {});

	return updatedMappings;
};

export const applyNgramDataFields = (dataFields) => {
	const subFields = getPossibleSubFields();
	const dataFieldsWithoutSubFields = dataFields.filter(
		(i) => !subFields.some((s) => i.includes(s)),
	);

	// returns a tuple [ngramSearchFields, ngramSearchFieldsWeights]
	return dataFieldsWithoutSubFields.reduce(
		(agg, item) => {
			return [
				[...agg[0], `${item}.search`],
				[...agg[1], 0.1],
			];
		},
		[[], []],
	);
};

export const applyLanguageMapping = (mappings, language) => {
	const lang = {
		type: 'text',
		analyzer: language,
	};
	const synonyms = {
		analyzer: 'synonyms',
		type: 'text',
	};
	const updatedMappings = Object.keys(mappings).reduce((agg, field) => {
		const fieldVal = { ...get(mappings, field) };
		let updatedData = { ...agg };
		if (get(fieldVal, 'properties', null)) {
			// recursive call the function
			updatedData = {
				...updatedData,
				[field]: {
					properties: applyNgramMapping(get(fieldVal, 'properties'), language),
				},
			};
		} else if (get(fieldVal, 'type') === 'text') {
			updatedData = {
				...updatedData,
				[field]: {
					...fieldVal,
					fields: {
						...get(fieldVal, 'fields'),
						lang,
						synonyms,
					},
				},
			};
		}

		return updatedData;
	}, {});

	return updatedMappings;
};

export const getValidSubFields = ({ fieldMapping, enableNgram, enableSynonyms }) => {
	const possibleSubFields = Object.values(SUB_FIELDS).filter((field) => {
		if (field === SUB_FIELDS.SEARCH && !enableNgram) {
			return false;
		}

		if (field === SUB_FIELDS.SYNONYMS && !enableSynonyms) {
			return false;
		}
		if (field in fieldMapping.fields) {
			return true;
		}

		return false;
	});

	return possibleSubFields;
};

export const getSearchableFieldMap = ({ dataField, fieldWeights }) => {
	const subFieldMap = dataField.reduce((agg, field, index) => {
		const hasSubField = Object.values(SUB_FIELDS).some((s) => field.indexOf(`.${s}`) > -1);
		if (hasSubField) {
			const originalField = field.split('.').slice(0, -1).join('.');
			const subField = field.split('.').pop();
			return {
				...agg,
				[originalField]: {
					...(agg[originalField] || {}),
					__fields__: {
						...((agg[originalField] || {}).__fields__ || {}),
						[subField]: fieldWeights[index],
					},
				},
			};
		}
		return {
			...agg,
			[field]: {
				__weight__: fieldWeights[index],
				__fields__: {},
			},
		};
	}, {});

	return unflattenObject(subFieldMap);
};
