/* eslint-disable no-param-reassign,prefer-destructuring */
import React from 'react';
import ReactFilterBox, { GridDataAutoCompleteHandler } from 'react-filter-box';

import 'react-filter-box/lib/react-filter-box.css';
import { get } from 'lodash';

export const AdvancedEditor = props => {
	const { autoCompleteHandler, onChange, onParseOk, query } = props;
	return (
		<ReactFilterBox
			query={query}
			onChange={onChange}
			autoCompleteHandler={autoCompleteHandler}
			onParseOk={onParseOk}
		/>
	);
};

export class CustomAutoComplete extends GridDataAutoCompleteHandler {
	// override this method to add new your operator
	needOperators(parsedCategory) {
		super.needOperators(parsedCategory);
		return operators;
	}
}

const operators = [
	'==',
	'!=',
	'contains',
	'doesnotcontains',
	'startsWith',
	'doesnotstartsWith',
	'endsWith',
	'doesnotendsWith',
	'matches',
	'<',
	'>',
	'<=',
	'>=',
];

const parseOperator = (query, operator) => {
	const filterRegex = new RegExp(`(?![$query ])(\\w*) ${operator} (\\w*)`, 'g');
	query = query.replace(filterRegex, `$filter.$1 ${operator} '$2'`);
	return query;
};

const parseQueryOperator = (query, operator) => {
	const queryRegex = new RegExp(`(\\$query) ${operator} (\\w*)`, 'g');
	query = query.replace(queryRegex, `$1 ${operator} '$2'`);
	return query;
};

const parseQuery = query => {
	operators.forEach(op => {
		query = parseQueryOperator(query, op);
	});
	const queryNegationRegex = new RegExp(`(\\$query) (doesnot(\\w*)) ('\\w*')`, 'g');
	query = query.replace(queryNegationRegex, 'not ($1 $3 $4)');
	return query;
};

export const parseExpression = (query = '') => {
	const negationRegex = new RegExp(`(\\$\\w*\\.\\w*) (doesnot(\\w*)) ('\\w*')`, 'g');
	operators.forEach(op => {
		query = parseOperator(query, op);
	});
	query = parseQuery(query);
	query = query.replace(negationRegex, 'not ($1 $3 $4)');
	query = query.replace(/AND/g, 'and');
	query = query.replace(/OR/g, 'or');
	return query;
};

const unParseOperator = (query, operator) => {
	const filterRegex = new RegExp(`\\$filter.(\\w*) ${operator} '(\\w*)'`, 'g');
	query = query.replace(filterRegex, `$1 ${operator} $2`);
	return query;
};

const unParseQueryOperator = (query, operator) => {
	const queryRegex = new RegExp(`(\\$query) ${operator} '(\\w*)'`, 'g');
	query = query.replace(queryRegex, `$1 ${operator} $2`);
	return query;
};

const unParseQuery = query => {
	operators.forEach(op => {
		query = unParseQueryOperator(query, op);
	});
	const queryNegationRegex = new RegExp(`not \\((\\$query) (\\w*) (\\w*)\\)`, 'g');
	query = query.replace(queryNegationRegex, '$1 doesnot$2 $3');
	return query;
};

export const unParseExpression = (query = '') => {
	const antiNegationRegex = new RegExp(`not \\((\\w*) (\\w*) (\\w*)\\)`, 'g');
	operators.forEach(op => {
		query = unParseOperator(query, op);
	});
	query = unParseQuery(query);
	query = query.replace(antiNegationRegex, '$1 doesnot$2 $3');
	query = query.replace(/and/g, 'AND');
	query = query.replace(/or/g, 'OR');
	return query;
};

export const getRawQuery = (preferences, unparsedRule) => {
	const showAdvancedEditor = get(preferences, `showAdvancedEditor.${unparsedRule.id}`);
	let rawQuery;
	if (showAdvancedEditor) {
		rawQuery = get(unparsedRule, 'trigger.expression', '');
		rawQuery = rawQuery.split('in $index and ');
		if (rawQuery.length > 1) rawQuery = rawQuery[1];
		else rawQuery = rawQuery[0];
		rawQuery = unParseExpression(rawQuery);
	}
	return {
		showAdvancedEditor,
		rawQuery,
	};
};
