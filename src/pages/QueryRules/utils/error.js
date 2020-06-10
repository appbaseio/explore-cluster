/* eslint-disable camelcase */
import React from 'react';
import { css } from 'emotion';
import get from 'lodash/get';

export const borderError = css`
	border-color: #f5222d;

	.ant-select-selection {
		border-color: #f5222d;
	}
`;

const errorDescription = css`
	color: #f5222d;
	font-size: 13px;
	line-height: 1;
	margin: 0 0 8px;
`;

const getErrorMessages = (state) => {
	const {
		actions,
		name,
		queryValue,
		dataFieldValue,
		condition,
		dataField,
		selectedIndexes,
		show_advance_editor,
		advancedExpression,
		expressionError,
	} = state;
	const error = {};

	if (!name) {
		error.name = {
			hasError: true,
			description: 'Name cannot be empty',
		};
	}

	if (selectedIndexes && !selectedIndexes.length) {
		error.selectedIndexes = {
			hasError: true,
			description: 'Select a index',
		};
	}

	if (actions && !actions.length) {
		error.actions = {
			hasError: true,
			description: 'No actions defined',
		};
	}

	function hasError(item) {
		if (!item.data) return true;
		if (Array.isArray(item.data)) return !item.data.length;
		return Object.keys(item.data).length === 0;
	}

	function getObjectEmptyKeys(obj) {
		if (!obj) return true;

		const invalidKeys = Object.keys(obj).filter((key) => {
			const value = obj[key];
			if (Array.isArray(value)) return !value.length;

			if (value) return false;
			return true;
		});

		return invalidKeys;
	}

	if (actions.length) {
		actions.forEach((item) => {
			if (hasError(item)) {
				error[item.type] = {
					hasError: true,
					description: 'Value cannot be empty',
				};
			}

			if (item.type === 'search_settings' && get(item, 'data.dataField', []).length === 0) {
				error[item.type] = {
					hasError: true,
					description: 'Value cannot be empty',
				};
			}

			if (item.type === 'add_filter' && !hasError(item)) {
				const keysWithNoValue = getObjectEmptyKeys(item.data);

				if (keysWithNoValue && keysWithNoValue.length > 0) {
					error[item.type] = {
						hasError: true,
						description: `${keysWithNoValue
							.map((key) => key.replace('.keyword', ''))
							.join(', ')} cannot be empty`,
					};
				}
			}
			if (item.type === 'replace_words' && !hasError(item)) {
				const keysWithNoValue = getObjectEmptyKeys(item.data);
				if (keysWithNoValue && keysWithNoValue.length > 0) {
					error[item.type] = {
						hasError: true,
						description: `${
							keysWithNoValue.filter(Boolean).join(', ').trim() || 'Inputs'
						} cannot be empty`,
					};
				}
			}
		});
	}

	if (condition === 'filter') {
		const isDataFieldsPresent = !!(dataField && dataFieldValue);
		const isQueryPresent = !!queryValue;
		if (show_advance_editor) {
			if (!advancedExpression)
				error.condition = {
					hasError: true,
					description: 'Advanced expression is needed',
				};
			if (expressionError) {
				error.condition = {
					hasError: true,
					description: 'Invalid expression',
				};
			}
		} else {
			if (!isQueryPresent) {
				if (!dataFieldValue || !dataField) {
					error.condition = {
						hasError: true,
						description: 'Either dataField value or query is needed',
					};
				}
			}

			if (!isDataFieldsPresent && !queryValue) {
				error.condition = {
					hasError: true,
					description: 'Either dataField value or query is needed',
				};
			}
		}
	}

	return error;
};

const getErrorClass = (errorValue) => {
	if (errorValue && errorValue.hasError) {
		return borderError;
	}
	return '';
};

const getErrorMessage = (errorValue) => {
	if (errorValue && errorValue.hasError) {
		return <p className={errorDescription}>{errorValue.description}</p>;
	}
	return null;
};

const getErrorCount = (error) => {
	const count = Object.keys(error).reduce(
		(agg, item) => (error[item].hasError ? agg + 1 : agg),
		0,
	);
	return count;
};

export { getErrorMessages, getErrorClass, getErrorMessage, getErrorCount };
