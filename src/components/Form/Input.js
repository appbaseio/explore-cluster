import React from 'react';
import { string, object, any } from 'prop-types';
import { FieldControl } from 'react-reactive-form';
import { Input, Form } from 'antd';

const TextInput = ({ name, control, label, inputProps, formItemProps, controlProps }) => (
	<FieldControl name={name} control={control} {...controlProps}>
		{({ touched, invalid, handler }) => (
			<Form.Item label={label || name} {...formItemProps}>
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
	formItemProps: null,
	controlProps: null,
	control: null,
	inputProps: null,
};

TextInput.propTypes = {
	name: string.isRequired,
	formItemProps: object,
	inputProps: object,
	controlProps: object,
	control: object,
	label: any,
};

export default TextInput;
