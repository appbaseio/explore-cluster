import React from 'react';
import { css } from 'emotion';

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

const getErrorMessages = state => {
	const {
		actions,
		name,
		queryValue,
		dataFieldValue,
		condition,
		dataField,
		selectedIndexes,
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

	if (actions.length) {
		actions.forEach(item => {
			if (!item.data || !item.data.length) {
				error[item.type] = {
					hasError: true,
					description: 'Value cannot be empty',
				};
			}
		});
	}

	if (condition === 'filter') {
		const isDataFieldsPresent = !!(dataField && dataFieldValue);
		const isQueryPresent = !!queryValue;
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

	return error;
};

const getErrorClass = errorValue => {
	if (errorValue && errorValue.hasError) {
		return borderError;
	}
	return '';
};

const getErrorMessage = errorValue => {
	if (errorValue && errorValue.hasError) {
		return <p className={errorDescription}>{errorValue.description}</p>;
	}
	return null;
};

const getErrorCount = error => {
	const count = Object.keys(error).reduce(
		(agg, item) => (error[item].hasError ? agg + 1 : agg),
		0,
	);
	return count;
};

export { getErrorMessages, getErrorClass, getErrorMessage, getErrorCount };
