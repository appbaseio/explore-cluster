import { get } from 'lodash';

const getParsedRule = rule => {
	if (rule) {
		let values = {};

		values.name = rule.name;
		values.id = rule.id;
		values.description = rule.description;
		values.actions = rule.actions;
		values.enabled = rule.enabled;
		values.order = rule.order;
		values.timeframe = rule.trigger.timeframe || null;
		values.condition = rule.trigger.type;

		values = { ...values, ...getValueFromExpression(rule.trigger.expression) };

		return values;
	}
	return null;
};

const getValueFromExpression = expression => {
	const pattern = /'(.*?)'/;
	const doubleQuote = /"(.*?)"/;
	const allQueries = expression.split('and');
	const value = {
		dataField: '',
		dataFieldValue: '',
		query: '',
		queryValue: '',
	};
	const indexQuery = allQueries.find(query => query.includes('$index'));
	const searchQuery = allQueries.find(query => query.includes('$query'));
	const filterQuery = allQueries.find(query => query.includes('$filter'));
	if (indexQuery) {
		const isDoubleQuotePresent = indexQuery.includes(`"`);
		value.selectedIndexes = indexQuery
			.match(isDoubleQuotePresent ? doubleQuote : pattern)[1]
			.split(',');
	}

	if (searchQuery) {
		const isDoubleQuotePresent = searchQuery.includes(`"`);
		value.queryValue = searchQuery.match(isDoubleQuotePresent ? doubleQuote : pattern)[1];
		value.query = searchQuery
			.replace('$query', '')
			.replace(`'${value.queryValue}'`, '')
			.replace(`"${value.queryValue}"`, '')
			.trim();
	}

	if (filterQuery) {
		const isDoubleQuotePresent = filterQuery.includes(`"`);

		value.dataFieldValue = filterQuery.match(isDoubleQuotePresent ? doubleQuote : pattern)[1];
		value.dataField = filterQuery
			.replace('$filter.', '')
			.replace('matches', '')
			.replace(`'${value.dataFieldValue}'`, '')
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
	let expression = `'${selectedIndexes.join(',')}' in $index`;

	if (condition === 'filter') {
		if (query && queryValue) {
			expression = `${expression} and $query ${query} '${queryValue}'`;
		}

		if (dataField && dataFieldValue) {
			expression = `${expression} and $filter.${dataField} matches '${dataFieldValue}'`;
		}
	}

	return expression;
};

const hasValuesChanged = (prevValue, nextValue, keys) => {
	if (typeof keys === 'string') {
		return prevValue[keys] !== nextValue[keys];
	}

	const keysChanged = keys.some(
		key => JSON.stringify(get(prevValue, key)) !== JSON.stringify(get(nextValue, key)),
	);
	return keysChanged;
};

const validPlans = [
	'2019-production-1',
	'2019-production-2',
	'2019-production-3',
	'2019-production-4',
	'arc-enterprise',
	'hosted-arc-enterprise',
];

const bannerDetails = {
	title: 'Query Rules',
	description: `Create "If this, then that" rules`,
	buttonText: 'Read More',
	icon: 'pencil',
	href: 'https://docs.appbase.io/docs/search/Rules/',
};

export { getParsedRule, getExpressionFromValue, hasValuesChanged, bannerDetails, validPlans };
