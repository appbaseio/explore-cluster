import React from 'react';
import { string, object } from 'prop-types';
import { FieldControl } from 'react-reactive-form';
import { Input, Form } from 'antd';

const TextInput = ({ name, label, inputProps }) => (
	<FieldControl name={name}>
		{({ touched, invalid, handler }) => (
			<Form.Item label={label || name}>
				<Input
					style={
						touched && invalid
							? {
									borderColor: 'tomato',
							  }
							: null
					}
					{...handler()}
					{...inputProps}
				/>
			</Form.Item>
		)}
	</FieldControl>
);

TextInput.defaultProps = {
	label: '',
	inputProps: null,
};

TextInput.propTypes = {
	name: string.isRequired,
	inputProps: object,
	label: string,
};

export default TextInput;
