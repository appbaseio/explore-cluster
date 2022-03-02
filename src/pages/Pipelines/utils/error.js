/* eslint-disable camelcase */
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

const getErrorMessages = () => {};

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
