import get from 'lodash/get';
import omit from 'lodash/omit';
import { getVersion, getURL } from '../constants/config';
import mappingUsecase from '../batteries/utils/mappingUsecase';
import { getAuthHeaders } from '../batteries/utils/mappings';

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

	if (enableNgram) {
		delete updatedFields.search;
	} else if (type === 'text') {
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
	if (MAPPING_TYPE_WITH_NO_FIELDS.includes(type)) {
		return mapping;
	}

	if (fields.length === currentIndex + 1) {
		const { enableNgram, enableSynonyms, language } = settings;

		const updatedFields = _getFieldsByRelevancy({
			enableSynonyms,
			enableNgram,
			language,
			fields: get(mappingUsecase, `${usecase}.fields`),
			type,
		});

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
	console.log(path);
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

	const deletedPath = path.split('.').join('.properties.');
	console.log(deletedPath);
	const updatedMappings = omit(get(mapping, TOP_FIELD), deletedPath);

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
		deletedPath,
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
