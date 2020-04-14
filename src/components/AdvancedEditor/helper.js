/* eslint-disable no-param-reassign */
import { get, invert, keys, values } from 'lodash';

// list of operators supported by advanced editor
export const operatorsMap = {
	exactlyMatches: '==',
	doesNotMatch: '!=',
	contains: 'contains',
	doesNotContain: 'doesnotcontains',
	startsWith: 'startsWith',
	doesNotStartWith: 'doesnotstartsWith',
	endsWith: 'endsWith',
	doesNotEndWith: 'doesnotendsWith',
	regularExpressionMatch: 'matches',
};

const reverseOperatorMap = invert(operatorsMap);

// handles keyword fields
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

/*
 parses each of the operator of type
 1.	category.name == hello
 2.	category.name == "hello world"
 3. category.name == 'hello'
*/
const parseOperator = (query, operator, fieldMap = {}) => {
	const filterRegex = new RegExp(`(?![$query ])([.#@\\w]*) ${operator} ([^"]\\w*)`, 'g');
	const filterRegex2 = new RegExp(`(?![$query ])([.#@\\w]*) ${operator} ("[\\w ]*")`, 'g');
	const numberRegex = new RegExp(`(?![$query ])([.#@\\w]*) ${operator} (\\d+)`, 'g');
	query = applyFilterRegex(filterRegex, query, fieldMap);
	query = applyFilterRegex(filterRegex2, query, fieldMap);
	query = query.replace(filterRegex, `$filter.$1 ${operator} '$2'`);
	query = query.replace(filterRegex2, `$filter.$1 ${operator} $2`);
	query = query.replace(numberRegex, `$filter.$1 ${operator} $2`);
	return query;
};

/*
 parses each of the query operator ((==, !=, contains, doesnotcontains and more (refer to operatorsMap constant above)))
 1. $query == hello
 2. $query == 'hello'
 3. $query == "hello world"
*/
const parseQueryOperator = (query, operator) => {
	const queryRegex = new RegExp(`(\\$query) ${operator} ([^"]\\w*)`, 'g');
	const queryRegex2 = new RegExp(`(\\$query) ${operator} ("[\\w ]*")`, 'g');
	query = query.replace(queryRegex, `$1 ${operator} '$2'`);
	query = query.replace(queryRegex2, `$1 ${operator} $2`);
	return query;
};

/*
 parses negation query
 1. $query doesnotcontains hello -> not ($query contains hello)
 2. $query doesnotcontains "hello world" -> not ($query contains "hello world")
*/
const parseQuery = query => {
	values(operatorsMap).forEach(op => {
		query = parseQueryOperator(query, op);
	});
	const queryNegationRegex = new RegExp(`(\\$query) (doesnot(\\w*)) ('\\w*')`, 'g');
	const queryNegationRegex2 = new RegExp(`(\\$query) (doesnot(\\w*)) ("[\\w ]*")`, 'g');
	query = query.replace(queryNegationRegex, 'not ($1 $3 $4)');
	query = query.replace(queryNegationRegex2, 'not ($1 $3 $4)');
	return query;
};

/*
 parses whole expression
 IN: $query == hello AND category.name == "foo bar"
 OUT: $query == 'hello' and $filter.category.name.keyword == "foo bar"
*/
export const parseExpression = (query = '', fieldMap) => {
	query = query.replace(/'/g, `"`);
	const negationRegex = new RegExp(`(\\$filter[.#@\\w]*) (doesnot(\\w*)) ('\\w*')`, 'g');
	const negationRegex2 = new RegExp(`(\\$filter[.#@\\w]*) (doesnot(\\w*)) ("[\\w ]*")`, 'g');
	keys(operatorsMap).forEach(operator => {
		query = parseCustomOperator(query, operator);
	});
	values(operatorsMap).forEach(op => {
		query = parseOperator(query, op, fieldMap);
	});
	query = parseQuery(query);
	query = query.replace(negationRegex, 'not ($1 $3 $4)');
	query = query.replace(negationRegex2, 'not ($1 $3 $4)');
	query = query.replace(/\bAND\b/g, 'and');
	query = query.replace(/\bOR\b/g, 'or');
	return query;
};

/*
 unparses operators of type (==, !=, contains, doesnotcontains and more (refer to operatorsMap constant above))
 1.	category.name == hello
 2.	category.name == "hello world"
 3. category.name == 'hello'
*/
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

/*
 unparses query operators of type
 1. $query == hello
 2. $query == 'hello'
 3. $query == "hello world"
*/
const unParseQueryOperator = (query, operator) => {
	const queryRegex = new RegExp(`(\\$query) ${operator} '(\\w*)'`, 'g');
	const queryRegex2 = new RegExp(`(\\$query) ${operator} "([\\w ]*)"`, 'g');
	query = query.replace(queryRegex, `$1 ${operator} $2`);
	query = query.replace(queryRegex2, `$1 ${operator} "$2"`);
	return query;
};

/*
 unparses query
 IN: not ($query contains "hello world")
 OUT: $query doesnotcontains "hello world"
*/
const unParseQuery = query => {
	values(operatorsMap).forEach(op => {
		query = unParseQueryOperator(query, op);
	});
	const queryNegationRegex = new RegExp(`not \\((\\$query) (\\w*) ([\\w" ]*)\\)`, 'g');
	query = query.replace(queryNegationRegex, '$1 doesnot$2 $3');
	return query;
};

// parse operators like (== -> exactlyMatches, != -> doesNotMatch and more(refer operatorsMap constant above))
function parseCustomOperator(query, customOperator) {
	const customOperatorRegex = new RegExp(`\\b${customOperator}\\b`, 'g');
	query = query.replace(customOperatorRegex, operatorsMap[customOperator]);
	return query;
}

// parse operators like (exactlyMatches -> ==, doesNotMatch -> != and more(refer reverseOperatorMap constant above))
function unParseCustomOperator(query, customOperator) {
	const customOperatorRegex = new RegExp(`\\b${customOperator}\\b`, 'g');
	query = query.replace(customOperatorRegex, reverseOperatorMap[customOperator]);
	return query;
}

/*
 unparse whole expression
 IN: $query == 'hello' and $filter.category.name.keyword == "foo bar"
 OUT: $query == hello AND category.name == "foo bar"
*/
export const unParseExpression = (query = '') => {
	const antiNegationRegex = new RegExp(`not \\(([.#@\\w]*) (\\w*) ([\\w" ]*)\\)`, 'g');
	values(operatorsMap).forEach(op => {
		query = unParseOperator(query, op);
	});
	query = unParseQuery(query);
	query = query.replace(antiNegationRegex, '$1 doesnot$2 $3');
	query = query.replace(/\band\b/g, 'AND');
	query = query.replace(/\bor\b/g, 'OR');
	keys(reverseOperatorMap).forEach(op => {
		query = unParseCustomOperator(query, op);
	});
	// special case for arithmetic comparision opertors, bc they're not word boundaries
	query = query.replace(/==/g, reverseOperatorMap['==']);
	query = query.replace(/!=/g, reverseOperatorMap['!=']);
	return query;
};

// unparses expression and returns index and expression from the two combined
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
		} else {
			rawQuery = rawQuery[0];
		}
	}
	return {
		rawQuery: unParseExpression(rawQuery),
		indexes,
	};
};
