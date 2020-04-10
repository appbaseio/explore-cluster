/* eslint-disable no-param-reassign,prefer-destructuring */
import React from 'react';
import ReactFilterBox, { GridDataAutoCompleteHandler } from 'react-filter-box';

import 'react-filter-box/lib/react-filter-box.css';
import { get } from 'lodash';

export const AdvancedEditor = props => {
	const { autoCompleteHandler, onChange, onParseOk, query, onParseError } = props;
	return (
		<ReactFilterBox
			query={query}
			onChange={onChange}
			autoCompleteHandler={autoCompleteHandler}
			onParseOk={onParseOk}
			onParseError={onParseError}
			editorConfig={{ lineWrapping: true }}
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
	'doesnotmatches',
	'<',
	'>',
	'<=',
	'>=',
];

const applyFilterRegex = (filterRegex, query, fieldMap) => {
	let matches = [];
	// eslint-disable-next-line no-cond-assign
	while ((matches = filterRegex.exec(query))) {
		if (fieldMap[matches[1]]) {
			query = query.replace(matches[1], fieldMap[matches[1]]);
		}
	}
	return query;
};

const parseOperator = (query, operator, fieldMap = {}) => {
	const filterRegex = new RegExp(`(?![$query ])([.#@\\w]*) ${operator} ([^"]\\w*[^ \\d])`, 'g');
	const filterRegex2 = new RegExp(`(?![$query ])([.#@\\w]*) ${operator} ("\\w.*")`, 'g');
	const numberRegex = new RegExp(`(?![$query ])([.#@\\w]*) ${operator} (\\d+)`, 'g');
	query = applyFilterRegex(filterRegex, query, fieldMap);
	query = applyFilterRegex(filterRegex2, query, fieldMap);
	query = query.replace(filterRegex, `$filter.$1 ${operator} '$2'`);
	query = query.replace(filterRegex2, `$filter.$1 ${operator} $2`);
	query = query.replace(numberRegex, `$filter.$1 ${operator} $2`);
	return query;
};

const parseQueryOperator = (query, operator) => {
	const queryRegex = new RegExp(`(\\$query) ${operator} ([^"]\\w*)`, 'g');
	const queryRegex2 = new RegExp(`(\\$query) ${operator} ("\\w.*")`, 'g');
	query = query.replace(queryRegex, `$1 ${operator} '$2'`);
	query = query.replace(queryRegex2, `$1 ${operator} $2`);
	return query;
};

const parseQuery = query => {
	operators.forEach(op => {
		query = parseQueryOperator(query, op);
	});
	const queryNegationRegex = new RegExp(`(\\$query) (doesnot(\\w*)) ('\\w*')`, 'g');
	const queryNegationRegex2 = new RegExp(`(\\$query) (doesnot(\\w*)) ("[\\w ]*")`, 'g');
	query = query.replace(queryNegationRegex, 'not ($1 $3 $4)');
	query = query.replace(queryNegationRegex2, 'not ($1 $3 $4)');
	return query;
};

export const parseExpression = (query = '', fieldMap) => {
	const negationRegex = new RegExp(`(\\$filter[.#@\\w]*) (doesnot(\\w*)) ('\\w*')`, 'g');
	const negationRegex2 = new RegExp(`(\\$filter[.#@\\w]*) (doesnot(\\w*)) ("[\\w ]*")`, 'g');
	operators.forEach(op => {
		query = parseOperator(query, op, fieldMap);
	});
	query = parseQuery(query);
	query = query.replace(negationRegex, 'not ($1 $3 $4)');
	query = query.replace(negationRegex2, 'not ($1 $3 $4)');
	query = query.replace(/\bAND\b/g, 'and');
	query = query.replace(/\bOR\b/g, 'or');
	return query;
};

const unParseOperator = (query, operator) => {
	const filterRegex = new RegExp(`\\$filter.([\\w.]*) ${operator} '(\\w*)'`, 'g');
	const filterRegex2 = new RegExp(`\\$filter.([\\w.]*) ${operator} "([\\w ]*)"`, 'g');
	const numberRegex = new RegExp(`\\$filter.([\\w.]*) ${operator} (\\d)+`, 'g');
	query = query.replace(filterRegex, `$1 ${operator} $2`);
	query = query.replace(filterRegex2, `$1 ${operator} "$2"`);
	query = query.replace(numberRegex, `$1 ${operator} $2`);
	query = query.replace(/.keyword/g, '');
	return query;
};

const unParseQueryOperator = (query, operator) => {
	const queryRegex = new RegExp(`(\\$query) ${operator} '(\\w*)'`, 'g');
	const queryRegex2 = new RegExp(`(\\$query) ${operator} "([\\w ]*)"`, 'g');
	query = query.replace(queryRegex, `$1 ${operator} $2`);
	query = query.replace(queryRegex2, `$1 ${operator} "$2"`);
	return query;
};

const unParseQuery = query => {
	operators.forEach(op => {
		query = unParseQueryOperator(query, op);
	});
	const queryNegationRegex = new RegExp(`not \\((\\$query) (\\w*) ([\\w" ]*)\\)`, 'g');
	query = query.replace(queryNegationRegex, '$1 doesnot$2 $3');
	return query;
};

export const unParseExpression = (query = '') => {
	const antiNegationRegex = new RegExp(`not \\(([.#@\\w]*) (\\w*) ([\\w" ]*)\\)`, 'g');
	operators.forEach(op => {
		query = unParseOperator(query, op);
	});
	query = unParseQuery(query);
	query = query.replace(antiNegationRegex, '$1 doesnot$2 $3');
	query = query.replace(/\band\b/g, 'AND');
	query = query.replace(/\bor\b/g, 'OR');
	return query;
};

export const getRawQuery = (showAdvancedEditor, unparsedRule) => {
	let rawQuery;
	let indexes;
	if (showAdvancedEditor) {
		rawQuery = get(unparsedRule, 'trigger.expression', '');
		rawQuery = rawQuery.split('in $index and ');
		const pattern = /'(.*?)'/;
		indexes = rawQuery[0].match(pattern)[1].split(',');
		if (rawQuery.length > 1) {
			rawQuery = rawQuery[1];
		} else rawQuery = rawQuery[0];
	}
	return { rawQuery: unParseExpression(rawQuery), indexes };
};
