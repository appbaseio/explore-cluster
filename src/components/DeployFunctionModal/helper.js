import React from 'react';
import PropTypes from 'prop-types';
import { css } from 'emotion';
import { Input, Form } from 'antd';
import { Validators } from 'react-reactive-form';
import get from 'lodash/get';

export function isTrue(element) {
	return element;
}

export const commonRowPad = css`
	padding-bottom: 10px;
`;

export const centerAligned = css`
	display: flex;
	align-items: center;
`;

// TODO: remove once integrated with API
export const later = (delay, value) => new Promise((resolve) => setTimeout(resolve, delay, value));

export function renderInputField({
	globalError,
	fieldName,
	fieldValue,
	handleInputRequired,
	setterFunc,
	extraProps,
	errorMessage = 'Field Required',
}) {
	return (
		<Form.Item
			validateStatus={get(globalError, fieldName) ? 'error' : null}
			help={get(globalError, fieldName) ? errorMessage : ''}
			style={{ marginBottom: 0 }}
		>
			<Input
				value={fieldValue}
				onChange={(e) => handleInputRequired(e, fieldName, setterFunc)}
				{...extraProps}
			/>
		</Form.Item>
	);
}

renderInputField.propTypes = {
	globalError: PropTypes.object,
	fieldName: PropTypes.string.isRequired,
	fieldValue: PropTypes.string,
	handleInputRequired: PropTypes.func.isRequired,
	setterFunc: PropTypes.func.isRequired,
	extraProps: PropTypes.object,
	errorMessage: PropTypes.string,
};

renderInputField.defaultProps = {
	globalError: {},
	fieldValue: undefined,
	extraProps: {},
	errorMessage: 'Field Required',
};

export function handleInputClosure(setGlobalError, globalError) {
	return (e, fieldName, setterFunc) => {
		const { value } = e.target;
		const hasError = Validators.required({ value }) || {};
		setterFunc(value);
		setGlobalError({
			...globalError,
			[fieldName]: hasError.required,
		});
	};
}

export async function deploymentCheck(getFunction, functionName, myInterval) {
	try {
		const res = await getFunction(functionName);
		if (res) {
			const { deploymentStatus } = get(res, 'payload', res);
			if (deploymentStatus === 'active' || deploymentStatus === 'failed') {
				clearInterval(myInterval);
			}
		}
		return res;
	} catch (e) {
		console.error(e);
	}
	return null;
}
