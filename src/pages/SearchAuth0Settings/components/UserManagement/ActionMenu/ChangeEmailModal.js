import { Input, Modal } from 'antd';
import React, { useRef } from 'react';
import { bool, func, string } from 'prop-types';
import { css } from 'emotion';
import { FieldControl, FieldGroup, FormBuilder, Validators } from 'react-reactive-form';
import Grid from '../../../../../components/CreateCredentials/Grid';

const changeEmailCss = css`
	.field-wrapper {
		margin-bottom: 1.5rem;
		flex-wrap: wrap;
		gap: 1rem;
		position: relative;
		& > div:last-child {
			margin-left: 0;
		}

		&.error {
			input,
			textarea {
				border: 1px solid red;
			}
		}
	}
	.error-span {
		position: absolute;
		color: red;
		bottom: -22px;
		left: 2px;
		display: block;
		width: max-content;
	}
`;

const ChangeEmailModal = ({ email, visible, handleClose, handleChangeEmail, isLoading }) => {
	const form = useRef(
		FormBuilder.group({ email: [email, [Validators.required, Validators.email]] }),
	);
	const renderErrorSpan = (message) => {
		return <span className="error-span">{message}</span>;
	};

	return (
		<Modal
			className={changeEmailCss}
			open={visible}
			onCancel={handleClose}
			title={<h3>Edit E-mail</h3>}
			width="max(50vw, 300px)"
			onOk={() => {
				if (form.current.invalid) return;
				handleChangeEmail(form.current.get('email').value);
			}}
			okType="primary"
			okText="Save"
			okButtonProps={{ loading: isLoading }}
		>
			<FieldGroup
				control={form.current}
				render={() => {
					return (
						<FieldControl
							name="email"
							render={({ handler, errors }) => {
								const showError = (errors?.required || errors?.email) ?? false;
								let errorMessage = errors?.required ? 'Email is required.' : '';
								if (errors?.email) {
									errorMessage = 'Enter as valid email.';
								}
								return (
									<Grid
										label="Email"
										className={`field-wrapper ${showError ? 'error' : ''}`}
										component={
											<>
												<Input placeholder={email} {...handler()} />
												{showError && renderErrorSpan(errorMessage)}
											</>
										}
									/>
								);
							}}
						/>
					);
				}}
			/>
		</Modal>
	);
};

ChangeEmailModal.propTypes = {
	handleChangeEmail: func.isRequired,
	email: string.isRequired,
	visible: bool.isRequired,
	handleClose: func.isRequired,
	isLoading: bool.isRequired,
};
export default ChangeEmailModal;
