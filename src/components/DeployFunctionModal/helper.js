import { css } from 'emotion';
import { Form, Input } from 'antd';
import React from 'react';
import { Validators } from 'react-reactive-form';

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
export const later = (delay, value) => new Promise(resolve => setTimeout(resolve, delay, value));

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
			validateStatus={globalError[fieldName] ? 'error' : null}
			help={globalError[fieldName] ? errorMessage : ''}
			style={{ marginBottom: 0 }}
		>
			<Input
				value={fieldValue}
				onChange={e => handleInputRequired(e, fieldName, setterFunc)}
				{...extraProps}
			/>
		</Form.Item>
	);
}

export function handleInputClosure(setGlobalError, globalError) {
	const handleInputRequired = (e, fieldName, setterFunc) => {
		const { value } = e.target;
		const hasError = Validators.required({ value }) || {};
		setterFunc(value);
		setGlobalError({
			...globalError,
			[fieldName]: hasError.required,
		});
	};
	return handleInputRequired;
}

export async function deploymentCheck(getFunction, functionName, myInterval) {
	try {
		const res = await getFunction(functionName);
		if (res && res.payload) {
			const { deploymentStatus } = res.payload;
			if (deploymentStatus === 'active' || deploymentStatus === 'failed') {
				clearInterval(myInterval);
			}
		}
	} catch (e) {
		console.error(e);
	}
}
