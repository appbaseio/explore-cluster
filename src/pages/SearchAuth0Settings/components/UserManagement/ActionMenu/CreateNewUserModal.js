import { Input, Modal, Select } from 'antd';
import React, { useEffect, useRef } from 'react';
import { bool, func } from 'prop-types';
import { css } from 'emotion';
import { FieldControl, FieldGroup, FormBuilder, Validators } from 'react-reactive-form';
import Grid from '../../../../../components/CreateCredentials/Grid';

const createUserCss = css`
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

const CreateNewUserModal = ({ visible, handleClose, handleCreateUser, isCreatingUser }) => {
	const form = useRef(
		FormBuilder.group({
			email: [undefined, [Validators.required, Validators.email]],
			password: [undefined, [Validators.required, Validators.minLength(4)]],
			confirmPassword: [undefined, [Validators.required]],
			connection: ['Username-Password-Authentication', [Validators.required]],
		}),
	);
	const renderErrorSpan = (message) => {
		return <span className="error-span">{message}</span>;
	};

	useEffect(() => {
		const confirmPassControl = form.current.get('confirmPassword');
		const passwordValidator = (value) => {
			const errorsObj = {
				...confirmPassControl.errors,
				...(form.current.value.password !== value ? { passordMismatch: true } : {}),
			};
			confirmPassControl.setErrors(Object.keys(errorsObj).length ? errorsObj : null);
		};

		confirmPassControl.valueChanges.subscribe(passwordValidator);

		return () => {
			confirmPassControl.valueChanges.unsubscribe(passwordValidator);
		};
	}, []);
	return (
		<Modal
			className={createUserCss}
			open={visible}
			onCancel={handleClose}
			title={<h3>Create user</h3>}
			width="max(50vw, 300px)"
			onOk={() => {
				if (form.current.invalid) return;
				const { email, password, connection } = form.current.value;
				const payload = { email, password, connection };
				handleCreateUser(payload);
			}}
			okType="primary"
			okText="Create"
			okButtonProps={{ loading: isCreatingUser }}
		>
			<FieldGroup
				control={form.current}
				render={() => {
					return (
						<>
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
													<Input
														placeholder="Enter Email"
														{...handler()}
													/>
													{showError && renderErrorSpan(errorMessage)}
												</>
											}
										/>
									);
								}}
							/>
							<FieldControl
								name="password"
								render={({ handler, errors, touched }) => {
									const showError = touched
										? errors?.required || errors?.minLength
										: false;
									let errorMessage = errors?.required
										? 'Password is required.'
										: '';
									if (!errorMessage && errors?.minLength) {
										errorMessage = 'Password should be atleast 4 characters';
									}
									return (
										<Grid
											label="Password"
											className={`field-wrapper ${showError ? 'error' : ''}`}
											component={
												<>
													<Input
														placeholder="Password"
														{...handler()}
														type="password"
														autoComplete="off"
													/>
													{showError && renderErrorSpan(errorMessage)}
												</>
											}
										/>
									);
								}}
							/>
							<FieldControl
								name="confirmPassword"
								render={({ handler, errors, touched }) => {
									const showError = touched
										? errors?.required || errors?.passordMismatch
										: false;
									let errorMessage = errors?.required
										? 'Confirm password is required.'
										: '';
									if (!errorMessage && errors?.passordMismatch) {
										errorMessage =
											'Confirm password does not match entered passowrd.';
									}
									return (
										<Grid
											label="Confirm password"
											className={`field-wrapper ${showError ? 'error' : ''}`}
											component={
												<>
													<Input
														placeholder="Password"
														{...handler()}
														type="password"
													/>
													{showError && renderErrorSpan(errorMessage)}
												</>
											}
										/>
									);
								}}
							/>
							<FieldControl
								name="connection"
								render={({ handler }) => {
									return (
										<Grid
											label="Connection"
											className="field-wrapper"
											component={
												<>
													<Select
														placeholder="Select Connection"
														{...handler()}
														disabled
														style={{ width: '100%' }}
													/>
												</>
											}
										/>
									);
								}}
							/>
						</>
					);
				}}
			/>
		</Modal>
	);
};

CreateNewUserModal.propTypes = {
	handleCreateUser: func.isRequired,
	visible: bool.isRequired,
	handleClose: func.isRequired,
	isCreatingUser: bool.isRequired,
};
export default CreateNewUserModal;
