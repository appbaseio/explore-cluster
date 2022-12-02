import get from 'lodash/get';
import omit from 'lodash/omit';
import { getVersion, getURL } from '../constants/config';
import mappingUsecase from '../batteries/utils/mappingUsecase';
import { getAuthHeaders } from '../batteries/utils/mappings';
import { getPossibleSubFields, unflattenObject } from '.';
import { SUB_FIELDS, RANGE_FIELDS } from '../constants';

export const getMappingsInfo = ({
	mappings: originalMappings,
	enableNgram,
	enableAutoSuggestion,
	enableSynonyms,
	language,
}) => {
	const mappings = updateSubFields({
		mappings: originalMappings,
		enableNgram,
		enableAutoSuggestion,
		enableSynonyms,
		language,
	});

	const ES_VERSION = getVersion();
	if (!ES_VERSION) {
		return {};
	}

	let TOP_FIELD = 'properties';

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
		const type = get(mappings, `${item}.type`, ``);

		return {
			...agg,
			[item]: get(mappings, `${item}.properties`)
				? {
						..._getMappingsType(get(mappings, `${item}.properties`)),
						...(type === 'nested' ? { isNestedField: true } : {}),
				  }
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
	enableSynonyms,
	enableNgram,
	enableAutoSuggestion,
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
	let fields;
	if (originalFields) {
		fields = { ...originalFields };
	}

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

	if (!enableAutoSuggestion) {
		delete updatedFields.autosuggest;
	} else if (type === 'text' && enableAutoSuggestion) {
		if (
			_getUsecase(updatedFields, type).includes('autosuggest') &&
			!updatedFields.autosuggest
		) {
			updatedFields = {
				...updatedFields,
				search: {
					type: 'text',
					index: 'true',
					analyzer: 'autosuggest_analyzer',
					search_analyzer: 'standard',
				},
			};
		}
	}

	return updatedFields;
};

const _updateNestedMapping = ({
	mapping,
	type,
	usecase,
	fields,
	currentIndex,
	settings,
	properties,
}) => {
	if (fields.length === currentIndex + 1) {
		const { enableNgram, enableAutoSuggestion, enableSynonyms, language } = settings;

		const updatedFields = _getFieldsByRelevancy({
			enableSynonyms,
			enableNgram,
			enableAutoSuggestion,
			language,
			fields: get(mappingUsecase, `${usecase}.fields`),
			type,
		});

		let data = {
			...mappingUsecase[usecase],
			fields: updatedFields,
			type,
		};

		if (!Object.keys(updatedFields).length) {
			data = {
				...mappingUsecase[usecase],
				type,
				properties, // useful when switching between nested and object
			};
		}
		if (type === 'geo_point') {
			delete data.properties;
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

export const updateMapping = ({ originalMapping, type, usecase, path, settings, properties }) => {
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
		properties,
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
	enableAutoSuggestion,
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
		const { type } = mappings.properties[field];

		if ((mappings.properties[field].properties || null) && type !== 'nested') {
			return {
				...agg,

				properties: {
					...agg.properties,
					[field]: updateSubFields({
						mappings: mappings.properties[field] || {},
						enableSynonyms,
						enableNgram,
						enableAutoSuggestion,
						language,
					}),
				},
			};
		}

		const fields = {
			..._getFieldsByRelevancy({
				enableSynonyms,
				enableNgram,
				enableAutoSuggestion,
				language,
				type,
				fields: get(mappings, `properties.${field}.fields`, {}),
			}),
		};
		const fieldData = {
			...get(mappings, `properties.${field}`, {}),
			...(Object.keys(fields).length ? { fields } : {}),
		};
		if (type.trim()) {
			fieldData.type = type;
		}

		return {
			...agg,
			properties: {
				...agg.properties,
				[field]: fieldData,
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

export function reIndex({
	mappings,
	appName,
	version,
	credentials,
	settings,
	excludeFields,
	script,
}) {
	const body = {
		mappings,
		settings,
		es_version: version,
		script,
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
		if (clonedObject[key].isNestedField) {
			// avoid nested type in dropdowns
			return {
				...agg,
			};
		}
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

export const isRangeType = (type) => {
	if (RANGE_FIELDS.includes(type)) {
		return true;
	}

	return false;
};

export const applyNgramMapping = (mappings, isNgramEnabled) => {
	const updatedMappings = Object.keys(mappings).reduce((agg, field) => {
		const fieldVal = { ...get(mappings, field) };
		let updatedData = { ...agg };
		const type = get(fieldVal, 'type', ``);
		if (get(fieldVal, 'properties', null)) {
			// recursive call the function
			const fieldData = {
				properties: applyNgramMapping(get(fieldVal, 'properties'), isNgramEnabled),
			};

			if (type.trim()) {
				fieldData.type = type;
			}
			updatedData = {
				...updatedData,
				[field]: fieldData,
			};
		} else if (type === 'text') {
			if (!isNgramEnabled && get(fieldVal, 'fields.search', null)) {
				// remove the .search field
				delete fieldVal.fields.search;
				updatedData = {
					...updatedData,
					[field]: {
						...fieldVal,
					},
				};
			} else if (isNgramEnabled && !get(fieldVal, 'fields.search', null)) {
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
			} else {
				updatedData = {
					...updatedData,
					[field]: {
						...fieldVal,
					},
				};
			}
		}

		return updatedData;
	}, {});

	return updatedMappings;
};

export const applyAutosuggestionMapping = (mappings, isAutosuggestionEnabled) => {
	const updatedMappings = Object.keys(mappings).reduce((agg, field) => {
		const fieldVal = { ...get(mappings, field) };
		let updatedData = { ...agg };
		const type = get(fieldVal, 'type', ``);
		if (get(fieldVal, 'properties', null)) {
			// recursive call the function
			const fieldData = {
				properties: applyAutosuggestionMapping(
					get(fieldVal, 'properties'),
					isAutosuggestionEnabled,
				),
			};

			if (type.trim()) {
				fieldData.type = type;
			}
			updatedData = {
				...updatedData,
				[field]: fieldData,
			};
		} else if (type === 'text') {
			if (!applyAutosuggestionMapping && get(fieldVal, 'fields.autosuggest', null)) {
				// remove the .search field
				delete fieldVal.fields.autosuggest;
				updatedData = {
					...updatedData,
					[field]: {
						...fieldVal,
					},
				};
			} else if (isAutosuggestionEnabled && !get(fieldVal, 'fields.autosuggest', null)) {
				// add the .search field
				updatedData = {
					...updatedData,
					[field]: {
						...fieldVal,
						fields: {
							...get(fieldVal, 'fields'),
							search: {
								analyzer: 'autosuggest_analyzer',
								search_analyzer: 'standard',
								type: 'text',
							},
						},
					},
				};
			} else {
				updatedData = {
					...updatedData,
					[field]: {
						...fieldVal,
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
			if (!dataFields.includes(`${item}.search`)) {
				return [
					[...agg[0], `${item}.search`],
					[...agg[1], 0.1],
				];
			}
			return agg;
		},
		[[], []],
	);
};

export const applyAutosuggestionDataFields = (dataFields) => {
	const subFields = getPossibleSubFields();
	const dataFieldsWithoutSubFields = dataFields.filter(
		(i) => !subFields.some((s) => i.includes(s)),
	);

	// returns a tuple [autosuggestSearchFields, autosuggestSearchFieldsWeights]
	return dataFieldsWithoutSubFields.reduce(
		(agg, item) => {
			if (!dataFields.includes(`${item}.autosuggest`)) {
				return [
					[...agg[0], `${item}.autosuggest`],
					[...agg[1], 0.1],
				];
			}
			return agg;
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
	const updatedMappings = Object.keys(mappings || {}).reduce((agg, field) => {
		const fieldVal = { ...get(mappings, field) };
		let updatedData = { ...agg };
		const type = get(fieldVal, 'type', ``);
		if (get(fieldVal, 'properties', null)) {
			// recursive call the function
			const fieldData = {
				properties: applyNgramMapping(get(fieldVal, 'properties'), language),
			};

			if (type.trim()) {
				fieldData.type = type;
			}

			updatedData = {
				...updatedData,
				[field]: fieldData,
			};
		} else if (type === 'text') {
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

export const getValidSubFields = ({
	fieldMapping,
	enableNgram,
	enableAutoSuggestion,
	enableSynonyms,
}) => {
	const possibleSubFields = Object.values(SUB_FIELDS).filter((field) => {
		if (field === SUB_FIELDS.SEARCH && !enableNgram) {
			return false;
		}
		if (field === SUB_FIELDS.AUTOSUGGEST && !enableAutoSuggestion) {
			return false;
		}
		if (field === SUB_FIELDS.SYNONYMS && !enableSynonyms) {
			return false;
		}
		if (field in get(fieldMapping, 'fields', {})) {
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

export const getTopLevelFields = ({ dataField }) => {
	return dataField.reduce((agg, field, index) => {
		const hasSubField = Object.values(SUB_FIELDS).some((s) => field.indexOf(`.${s}`) > -1);
		if (!hasSubField) {
			return {
				...agg,
				[field]: index,
			};
		}

		return agg;
	}, {});
};
