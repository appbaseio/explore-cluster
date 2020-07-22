import { get } from 'lodash';
import { doPost, doGet } from '../../../batteries/utils/requestService';
import { getURL } from '../../../constants/config';

const generateQuery = ({ aggregations: filters, search, results, synonyms }) => {
	const filtersData =
		filters && filters.dataField
			? Object.keys(filters.dataField).map((filter, index) => {
					const filterField = filter;
					return {
						id: `list-${index}`,
						dataField: typeof filterField === 'string' ? [filterField] : filterField,
						sortBy: get(filters, 'sortBy', 'asc'),
						size: get(filters, 'size', 10),
						type: 'term',
						value: [],
						queryFormat: get(filters, 'queryFormat', 'or'),
					};
			  })
			: [];

	const filtersId = filtersData.map((filter) => filter.id);
	const resultDataField = get(results, 'dataField', '_score');
	const searchDataField = get(search, 'dataField', []);
	const query = [
		{
			...results,
			id: 'result',
			react: {
				and: ['search', ...filtersId],
			},
			size: get(results, 'size', 10),
			dataField: Array.isArray(resultDataField) ? resultDataField : [resultDataField],
		},
		{
			...search,
			id: 'search',
			dataField: Array.isArray(searchDataField) ? searchDataField : [searchDataField],
			fieldWeights: get(search, 'fieldWeights', []),
			enableSynonyms: get(synonyms, 'enabled', true),
			value: '',
		},
		...filtersData,
	];
	return query;
};

const isValidJSON = (value) => {
	try {
		const temp = JSON.parse(value);
		if (temp && typeof temp === 'object') {
			return true;
		}
	} catch (e) {
		// empty for now
	}
	return false;
};

const flatObject = (obj, path = '') => {
	const newObj = JSON.parse(JSON.stringify(obj));

	return Object.keys(newObj).reduce((agg, key) => {
		if (!Array.isArray(newObj[key]) && typeof newObj[key] === 'object') {
			return {
				...agg,
				...flatObject(newObj[key], path ? `${path}.${key}` : key),
			};
		}
		return {
			...agg,
			[path ? `${path}.${key}` : key]: newObj[key],
		};
	}, {});
};

const recordGrade = ({ index, id, grade, query }) => {
	const ACC_API = getURL();
	return doPost(`${ACC_API}/_grade/${index}/${id}`, {
		query,
		grade,
	});
};

const getQueryGrades = ({ query }) => {
	const ACC_API = getURL();
	const finalQuery = query || 'empty_query';
	return doGet(`${ACC_API}/_grade/${finalQuery}`);
};

export { isValidJSON, generateQuery, flatObject, recordGrade, getQueryGrades };
