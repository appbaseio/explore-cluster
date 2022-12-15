import React, { useRef } from 'react';
import { Modal, Select, Form } from 'antd';
import { css } from 'react-emotion';
import { array, bool, func, object } from 'prop-types';
import { FieldControl, FieldGroup, FormBuilder, Validators } from 'react-reactive-form';
import TextInput from '../../../../components/Form/Input';
import { headersValidator, urlValidator } from '../../../SearchAuth0Settings/utils';
import CodeEditor from '../../../SearchBox/components/EndpointSuggestions/CodeEditor';

const modal = css`
	max-width: 800px;
	margin: 20px auto;
	background-color: #fff;

	width: 100%;
	.error {
		color: tomato;
		padding: 5px 0;
	}
	.input-error {
		border-color: tomato;
	}
	.required-marker {
		color: red;
		font-size: 1rem;
	}
`;

const EndpointModal = ({ showForm, setShowForm, customFields, setCustomFields, control }) => {
	const newForm = useRef(
		FormBuilder.group({
			url: ['', [Validators.required, urlValidator]],
			method: ['POST', Validators.required],
			headers: ['{}', headersValidator],
		}),
	);

	const handleCustomFields = () => {
		if (newForm.current) {
			const form = newForm.current;
			setCustomFields([
				...customFields,
				{
					url: form.get('url') ? form.get('url').value : '',
					method: form.get('method') ? form.get('method').value : '',
					headers: form.get('headers') ? form.get('headers').value : '{}',
				},
			]);

			if (control.get('method') && control.get('url') && control.get('headers')) {
				control.get('method').setValue(form.get('method') ? form.get('method').value : '');
				control.get('url').setValue(form.get('url') ? form.get('url').value : '');
				control
					.get('headers')
					.setValue(form.get('headers') ? form.get('headers').value : '{}');
			}

			handleCancel();
		}
	};

	const handleCancel = () => {
		setShowForm(false);
		newForm.current.reset({
			url: '',
			headers: '{}',
			method: 'POST',
		});
	};

	return (
		<FieldGroup control={newForm.current} strict={false}>
			{() => (
				<Modal
					visible={showForm}
					onOk={() => {
						handleCustomFields();
					}}
					onCancel={() => handleCancel()}
					okButtonProps={{
						disabled: newForm?.current?.invalid || newForm?.current?.pristine,
					}}
				>
					<div className={modal}>
						<FieldControl strict={false} name="url">
							{(endpointURLControl) => {
								const { errors, touched } = endpointURLControl;
								return (
									<div>
										<TextInput
											name="url"
											label={<span>URL</span>}
											formItemProps={{ colon: false, required: true }}
											control={endpointURLControl}
										/>
										{touched && errors?.required ? (
											<div style={{ marginTop: -30 }} className="error">
												URL field is required
											</div>
										) : null}
										{touched && !errors?.required && errors?.invalidLink ? (
											<div className="error" style={{ marginTop: -30 }}>
												URL field is invalid
											</div>
										) : null}
									</div>
								);
							}}
						</FieldControl>
						<FieldControl strict={false} name="method" style={{ marginBottom: 0 }}>
							{({ handler }) => {
								return (
									<Form.Item label="Method" colon={false} required>
										<Select {...handler()} style={{ width: '100%' }}>
											<Select.Option key="POST">POST</Select.Option>
											<Select.Option key="PUT">PUT</Select.Option>
											<Select.Option key="PATCH">PATCH</Select.Option>
											<Select.Option key="GET">GET</Select.Option>
											<Select.Option key="DELETE">DELETE</Select.Option>
										</Select>
									</Form.Item>
								);
							}}
						</FieldControl>

						<Form.Item label="Headers" colon={false}>
							<CodeEditor
								name="headers"
								strict={false}
								control={newForm.current.get('headers')}
								height={100}
							/>
						</Form.Item>
					</div>
				</Modal>
			)}
		</FieldGroup>
	);
};

EndpointModal.defaultProps = {
	showForm: false,
	setShowForm: () => {},
	customFields: [],
	setCustomFields: () => {},
	control: {},
};

EndpointModal.propTypes = {
	showForm: bool,
	setShowForm: func,
	customFields: array,
	setCustomFields: func,
	control: object,
};
export default EndpointModal;
