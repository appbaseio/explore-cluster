import React from 'react';
import { FieldControl } from 'react-reactive-form';
import { Input } from 'antd';
import PropTypes from 'prop-types';
import Grid from '../CreateCredentials/Grid';

const InputElement = ({ name, label, toolTipMessage, inputProps, placeholder, gridRatio }) => (
	<FieldControl
		name={name}
		render={({ handler, invalid, touched, hasError, getError }) => (
			<Grid
				label={label}
				toolTipMessage={toolTipMessage}
				gridRatio={gridRatio}
				component={
					<div style={{ width: '100%' }}>
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
									`Please enter ${label.toLowerCase()} value.`) ||
									(hasError('min') &&
										`Minimum allowed value for ${label.toLowerCase()} is ${
											getError('min').min
										}.`) ||
									(hasError('max') &&
										`Maximum allowed value for ${label.toLowerCase()} is ${
											getError('max').max
										}.`)}
							</div>
						)}
					</div>
				}
			/>
		)}
	/>
);

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
