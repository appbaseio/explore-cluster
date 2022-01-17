/* eslint-disable prefer-destructuring */
import get from 'lodash/get';
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
		values.envs =
			rule.trigger &&
			rule.trigger.type === 'cron' &&
			rule?.actions[0] &&
			rule?.actions[0]?.envs
				? rule?.actions[0]?.envs
				: {};
		values.cronExpression =
			rule.trigger && rule.trigger.expression ? rule.trigger.expression : '';

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
	const indexQuery = allQueries.find((query) => query.includes('$index'));
	const searchQuery = allQueries.find((query) => query.includes('$query'));
	const filterQuery = allQueries.find((query) => query.includes('$filter'));
	if (indexQuery) {
		const isDoubleQuotePresent = indexQuery.includes(`"`);
		value.selectedIndexes = indexQuery
			.match(isDoubleQuotePresent ? doubleQuote : pattern)[1]
			.split(',');
	}

	if (searchQuery) {
		const isDoubleQuotePresent = searchQuery.includes(`"`);
		let queryValue;
		if (
			isDoubleQuotePresent &&
			searchQuery.match(doubleQuote) &&
			searchQuery.match(doubleQuote)[1]
		) {
			queryValue = searchQuery.match(doubleQuote)[1];
		} else if (searchQuery.match(pattern)) {
			queryValue = searchQuery.match(pattern)[1];
		}
		value.queryValue = queryValue;
		value.query = searchQuery
			.replace('$query', '')
			.replace(`'${value.queryValue}'`, '')
			.replace(`"${value.queryValue}"`, '')
			.trim();
	}

	if (filterQuery) {
		const isDoubleQuotePresent = searchQuery?.includes(`"`);
		let dataFieldValue;
		if (
			isDoubleQuotePresent &&
			filterQuery.match(doubleQuote) &&
			filterQuery.match(doubleQuote)[1]
		) {
			dataFieldValue = filterQuery.match(doubleQuote)[1];
		} else if (filterQuery.match(pattern)) {
			dataFieldValue = filterQuery.match(pattern)[1];
		}
		value.dataFieldValue = dataFieldValue;
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
	type,
}) => {
	let expression = Array.isArray(selectedIndexes)
		? `'${selectedIndexes.join(',')}' in $index`
		: '';

	if (condition === 'filter') {
		if (query && queryValue) {
			expression = `${expression} and $query ${query} '${queryValue}'`;
		}

		if (dataField && dataFieldValue) {
			expression = `${expression} and $filter.${dataField} matches '${dataFieldValue}'`;
		}

		if (type?.length) {
			expression = `${expression} and $type in ${JSON.stringify(type)}`;
		}
	}
	return expression;
};

const hasValuesChanged = (prevValue, nextValue, keys) => {
	if (typeof keys === 'string') {
		return prevValue[keys] !== nextValue[keys];
	}

	const keysChanged = keys.some(
		(key) => JSON.stringify(get(prevValue, key)) !== JSON.stringify(get(nextValue, key)),
	);
	return keysChanged;
};

const bannerDetails = {
	title: 'Query Rules',
	description: 'Create "If this, then that" style query rules',
	videoLink: 'https://youtu.be/2g9sZgLPNxk',
	buttonText: 'Read Docs',
	icon: 'info-circle',
	href: 'https://docs.appbase.io/docs/search/rules/',
};

const toolTips = {
	promote_result: (
		<>
			Promote a document and show it at a specific position within the search results.{' '}
			<a
				target="_blank"
				rel="noopener noreferrer"
				href="https://docs.appbase.io/docs/search/rules/#promote-results"
			>
				Learn more
			</a>
		</>
	),
	hide_result: (
		<>
			Hide document(s) from search results.{' '}
			<a
				target="_blank"
				rel="noopener noreferrer"
				href="https://docs.appbase.io/docs/search/rules/#hide-results"
			>
				Learn more
			</a>
		</>
	),
	replace_search_term: (
		<>
			Replace an end-user provided search term with a specified search term.{' '}
			<a
				target="_blank"
				rel="noopener noreferrer"
				href="https://docs.appbase.io/docs/search/rules/#replace-search-term"
			>
				Learn more
			</a>
		</>
	),
	custom_data: (
		<>
			Add extra JSON data to be returned with the search results.{' '}
			<a
				target="_blank"
				rel="noopener noreferrer"
				href="https://docs.appbase.io/docs/search/Rules/#custom-data"
			>
				Learn more
			</a>
		</>
	),
	remove_words: (
		<>
			Remove specified word(s) from the end-user provided search term.{' '}
			<a
				target="_blank"
				rel="noopener noreferrer"
				href="https://docs.appbase.io/docs/search/rules/#remove-words"
			>
				Learn more
			</a>
		</>
	),
	replace_words: (
		<>
			Replace all the instances of the specified word(s) in the end-user provided search term.{' '}
			<a
				target="_blank"
				rel="noopener noreferrer"
				href="https://docs.appbase.io/docs/search/rules/#replace-words"
			>
				Learn more
			</a>
		</>
	),
	add_filter: (
		<>
			Add one or more term queries (aka filters) to the incoming search query.{' '}
			<a
				target="_blank"
				rel="noopener noreferrer"
				href="https://docs.appbase.io/docs/search/rules/#add_filter"
			>
				Learn more
			</a>
		</>
	),
	replace_search_query: (
		<>
			Modify the whole query by using the{' '}
			<a
				target="_blank"
				rel="noopener noreferrer"
				href="https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-query-string-query.html"
			>
				Elasticsearch Query String
			</a>{' '}
			syntax.{' '}
			<a
				target="_blank"
				rel="noopener noreferrer"
				href="https://docs.appbase.io/docs/search/rules/#replace-search-query"
			>
				Learn more
			</a>
		</>
	),
	search_settings: (
		<>
			Set data field(s) and field weight(s) to be applied to the search query.{' '}
			<a
				target="_blank"
				rel="noopener noreferrer"
				href="https://docs.appbase.io/docs/search/rules/#search-settings"
			>
				Learn more
			</a>
		</>
	),
	script: (
		<>
			Add a script rule to be applied.
			<a
				target="_blank"
				rel="noopener noreferrer"
				href="https://docs.appbase.io/docs/search/rules/#script-rule"
			>
				Learn more
			</a>
		</>
	),
};

export { getParsedRule, getExpressionFromValue, hasValuesChanged, bannerDetails, toolTips };
