import React from 'react';
import { string, object } from 'prop-types';
import { FieldControl } from 'react-reactive-form';
import { Input, Form } from 'antd';

const TextInput = ({ name, control, label, inputProps }) => (
	<FieldControl name={name} control={control}>
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
	control: null,
	inputProps: null,
};

TextInput.propTypes = {
	name: string.isRequired,
	inputProps: object,
	control: object,
	label: string,
};

export default TextInput;
