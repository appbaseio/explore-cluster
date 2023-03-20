import React from 'react';
import { FieldControl } from 'react-reactive-form';
import { Input } from 'antd';
import PropTypes from 'prop-types';
import Grid from '../CreateCredentials/Grid';

// util to extract out text content from React Node
function textContent(elem) {
	if (!elem) {
		return '';
	}
	if (typeof elem === 'string') {
		return elem;
	}

	const children = elem.props && elem.props.children;
	if (children instanceof Array) {
		return children.map(textContent).join('');
	}
	return textContent(children);
}

const InputElement = ({ name, label, toolTipMessage, inputProps, placeholder, gridRatio }) => {
	const labelText = typeof label !== 'string' ? textContent(label) : label;

	return (
		<FieldControl
			name={name}
			render={({ handler, invalid, touched, hasError, getError }) => (
				<Grid
					label={label}
					toolTipMessage={toolTipMessage}
					gridRatio={gridRatio}
					component={
						<div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
							<div>
								<Input
									className={touched && invalid ? 'input-error' : null}
									placeholder={placeholder}
									type="number"
									{...handler()}
									{...inputProps}
								/>
							</div>

							{touched && invalid && (
								<div className="error">
									{(hasError('required') &&
										`Please enter ${
											labelText?.toLowerCase?.() ?? ''
										} value.`) ||
										(hasError('min') &&
											`Minimum allowed value for ${
												labelText?.toLowerCase?.() ?? ''
											} is ${getError('min').min}.`) ||
										(hasError('max') &&
											`Maximum allowed value for ${
												labelText?.toLowerCase?.() ?? ''
											} is ${getError('max').max}.`)}
								</div>
							)}
						</div>
					}
				/>
			)}
		/>
	);
};

export default InputElement;

InputElement.propTypes = {
	name: PropTypes.string.isRequired,
	label: PropTypes.string.isRequired,
	toolTipMessage: PropTypes.any,
	inputProps: PropTypes.object,
	placeholder: PropTypes.string,
	gridRatio: PropTypes.number,
};

InputElement.defaultProps = {
	toolTipMessage: undefined,
	inputProps: {},
	placeholder: undefined,
	gridRatio: 0.5,
};
