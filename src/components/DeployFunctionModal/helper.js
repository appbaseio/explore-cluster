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
}) {
	return (
		<Form.Item
			validateStatus={globalError[fieldName] ? 'error' : null}
			help={globalError[fieldName] ? 'Field Required' : ''}
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

const DEPLOYMENT_TIME = 10 * 60;

export async function deploymentCheck(getFunction, functionName, myInterval) {
	const currTimeStamp = (Date.now() / 1000) | 0;
	try {
		const res = await getFunction(functionName);
		if (res && res.payload) {
			const { updated_at, availableReplicas } = res.payload;
			if (currTimeStamp - updated_at > DEPLOYMENT_TIME || availableReplicas > 0) {
				clearInterval(myInterval);
			}
		}
	} catch (e) {
		console.error(e);
	}
}
