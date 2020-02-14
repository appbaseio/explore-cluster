const getParsedRule = rule => {
	if (rule) {
		let values = {};

		values.name = rule.name;
		values.id = rule.id;
		values.description = rule.description;
		values.actions = rule.actions;
		values.enabled = rule.enabled;
		values.order = rule.order;
		values.condition = rule.trigger.type;

		values = { ...values, ...getValueFromExpression(rule.trigger.expression) };

		return values;
	}
	return null;
};

const getValueFromExpression = expression => {
	const pattern = /"(.*?)"/;
	const allQueries = expression.split('and');
	const value = {};
	const indexQuery = allQueries.find(query => query.includes('$index'));
	const searchQuery = allQueries.find(query => query.includes('$query'));
	const filterQuery = allQueries.find(query => query.includes('$filter'));
	if (indexQuery) {
		value.selectedIndexes = indexQuery.match(pattern)[1].split(',');
	}

	if (searchQuery) {
		value.queryValue = searchQuery.match(pattern)[1];
		value.query = searchQuery
			.replace('$query', '')
			.replace(`"${value.queryValue}"`, '')
			.trim();
	}

	if (filterQuery) {
		value.dataFieldValue = filterQuery.match(pattern)[1];
		value.dataField = filterQuery
			.replace('$filter.', '')
			.replace('matches', '')
			.replace(`"${value.dataFieldValue}"`, '')
			.trim();
	}

	return value;
};

const getExpressionFromValue = ({
	dataField,
	dataFieldValue,
	query,
	queryValue,
	selectedIndexes,
	condition,
}) => {
	let expression = `"${selectedIndexes.join(',')}" in $index`;

	if (condition === 'filter') {
		if (query && queryValue) {
			expression = `${expression} and $query ${query} "${queryValue}"`;
		}

		if (dataField && dataFieldValue) {
			expression = `${expression} and $filter.${dataField} matches "${dataFieldValue}"`;
		}
	}

	return expression;
};

export { getParsedRule, getExpressionFromValue };
