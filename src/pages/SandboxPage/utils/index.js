const generateQuery = ({ filters, search, result }) => {
	const filtersData = Object.keys(filters.dataField).map((filter, index) => {
		return {
			id: `list-${index}`,
			dataField: typeof filter === 'string' ? [filter] : filter,
			sortBy: filters.sortBy,
			size: filters.size,
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
