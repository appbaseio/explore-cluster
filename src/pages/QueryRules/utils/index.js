import { get } from 'lodash';
import React from 'react';

const getParsedRule = (rule = {}) => {
	if (rule) {
		let values = {};

		const { expression, type, timeframe } = rule.trigger || {};

		values.name = rule.name;
		values.id = rule.id;
		values.description = rule.description;
		values.actions = rule.actions;
		values.enabled = rule.enabled;
		values.order = rule.order;
		values.timeframe = timeframe || null;
		values.condition = type;
		values.show_advance_editor = rule.show_advance_editor;

		values = { ...values, ...getValueFromExpression(expression) };

		return values;
	}
	return null;
};

const getValueFromExpression = (expression = '') => {
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

const bannerDetails = {
	title: 'Query Rules',
	description: 'Create "If this, then that" style query rules',
	buttonText: 'Read More',
	icon: 'pencil',
	href: 'https://docs.appbase.io/docs/search/Rules/',
};

const toolTips = {
	promote_result: (
		<>
			Promote a result and show it at a specific position within the search results.{' '}
			<a
				target="_blank"
				rel="noopener noreferrer"
				href="https://docs.appbase.io/docs/search/Rules/#promote-results"
			>
				Learn more
			</a>
		</>
	),
	hide_result: (
		<>
			Hide a document from search results.{' '}
			<a
				target="_blank"
				rel="noopener noreferrer"
				href="https://docs.appbase.io/docs/search/Rules/#hide-results"
			>
				Learn more
			</a>
		</>
	),
	replace_search_term: (
		<>
			Replace the whole search term with another search term.{' '}
			<a
				target="_blank"
				rel="noopener noreferrer"
				href="https://docs.appbase.io/docs/search/Rules/#replace-search-term"
			>
				Learn more
			</a>
		</>
	),
	custom_data: (
		<>
			Add extra JSON data to be returned with your search results.{' '}
			<a
				target="_blank"
				rel="noopener noreferrer"
				href="https://docs.appbase.io/docs/search/Rules/#custom-data"
			>
				Learn more
			</a>
		</>
	),
	function: (
		<>
			Add a custom function to make changed without any limitations.{' '}
			<a
				target="_blank"
				rel="noopener noreferrer"
				href="https://docs.appbase.io/docs/search/Functions"
			>
				Learn more
			</a>
		</>
	),
	remove_words: (
		<>
			Remove a word(s) from the search term.{' '}
			<a
				target="_blank"
				rel="noopener noreferrer"
				href="https://docs.appbase.io/docs/search/Rules/#remove-words"
			>
				Learn more
			</a>
		</>
	),
	replace_words: (
		<>
			Replace all the instances of a word in the applied search term.{' '}
			<a
				target="_blank"
				rel="noopener noreferrer"
				href="https://docs.appbase.io/docs/search/Rules/#replace-words"
			>
				Learn more
			</a>
		</>
	),
};

export { getParsedRule, getExpressionFromValue, hasValuesChanged, bannerDetails, toolTips };
