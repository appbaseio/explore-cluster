import React from 'react';
import { InputNumber } from 'antd';
import PropTypes from 'prop-types';

const NumberInput = ({ defaultValue, onBlur, ...rest }) => {
	const [value, onValueChange] = React.useState(defaultValue);

	return (
		<InputNumber
			value={value}
			onChange={onValueChange}
			onBlur={() => onBlur(value)}
			{...rest}
		/>
	);
};

NumberInput.propTypes = {
	defaultValue: PropTypes.any.isRequired,
	onBlur: PropTypes.func.isRequired,
};

export default NumberInput;
