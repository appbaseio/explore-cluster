/* eslint-disable no-param-reassign,prefer-destructuring */
import React from 'react';
import ReactFilterBox, { GridDataAutoCompleteHandler } from '@appbaseio/react-filter-box';
import { keys } from 'lodash';
import '@appbaseio/react-filter-box/lib/react-filter-box.css';
import { operatorsMap } from './helper';

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
		return keys(operatorsMap);
	}
}
