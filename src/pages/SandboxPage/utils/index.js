const generateQuery = ({ filters, search, result }) => {
	const filtersData = filters.map((filter, index) => {
		return {
			...filter,
			id: `list-${index}`,
			type: 'term',
			dataField: Array.isArray(filter.dataField) ? filter.dataField : [filter.dataField],
		};
	});

	const filtersId = filtersData.map(filter => filter.id);

	const query = [
		{
			...result,
			id: 'result',
			react: {
				and: ['search', ...filtersId],
			},
			dataField: Array.isArray(result.dataField) ? result.dataField : [result.dataField],
		},
		{
			...search,
			id: 'search',
			dataField: Array.isArray(search.dataField) ? search.dataField : [search.dataField],
		},
		...filtersData,
	];

	return JSON.stringify(query, null, 4);
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

export { isValidJSON, generateQuery };
