const generateQuery = ({ aggregations: filters, search, results }) => {
	const filtersData =
		filters && filters.dataField
			? Object.keys(filters.dataField).map((filter, index) => {
					const filterField = filter;
					return {
						id: `list-${index}`,
						dataField: typeof filterField === 'string' ? [filterField] : filterField,
						sortBy: filters.sortBy,
						size: filters.size,
					};
			  })
			: [];

	const filtersId = filtersData.map(filter => filter.id);
	const resultDataField = results.dataField || '_score';
	const searchDataField = search.dataField || [];
	const query = [
		{
			...results,
			id: 'result',
			react: {
				and: ['search', ...filtersId],
			},
			size: results.size || 10,
			dataField: Array.isArray(resultDataField) ? resultDataField : [resultDataField],
		},
		{
			...search,
			id: 'search',
			dataField: Array.isArray(searchDataField) ? searchDataField : [searchDataField],
			fieldWeights: search.fieldWeights || [],
		},
		...filtersData,
	];
	return query;
};

const isValidJSON = value => {
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

export { isValidJSON, generateQuery, flatObject };
