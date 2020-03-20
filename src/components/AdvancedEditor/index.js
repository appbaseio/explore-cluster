/* eslint-disable no-param-reassign */
import React from 'react';
import ReactFilterBox, { GridDataAutoCompleteHandler } from 'react-filter-box';

import 'react-filter-box/lib/react-filter-box.css';

export const AdvancedEditor = props => {
	const { autoCompleteHandler, onChange, onParseOk } = props;
	return (
		<ReactFilterBox
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

export const parseOperator = (query, operator) => {
	const filterRegex = new RegExp(`(\\w*) ${operator} (\\w*)`, 'g');
	query = query.replace(filterRegex, `$filter.$1 ${operator} '$2'`);
	return query;
};

export const parseExpression = (query = '') => {
	const regex = new RegExp(`(\\$\\w*\\.\\w*) (doesnot(\\w*)) ('\\w*')`, 'g');
	operators.forEach(op => {
		query = parseOperator(query, op);
	});
	query = query.replace(regex, 'not ($1 $3 $4)');
	query = query.replace(/AND/g, 'and');
	query = query.replace(/OR/g, 'or');
	return query;
};
