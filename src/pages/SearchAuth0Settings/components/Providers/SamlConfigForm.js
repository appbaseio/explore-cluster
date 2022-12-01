import { UploadOutlined } from '@ant-design/icons';
import { Button, Input, Switch, Upload } from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import { css } from 'emotion';
import React, { useContext, useRef } from 'react';
import { FieldControl, FieldGroup } from 'react-reactive-form';
import Monaco from '../../../../batteries/components/SearchSandbox/containers/MonacoEditor';
import Flex from '../../../../batteries/components/shared/Flex';
import Grid from '../../../../components/CreateCredentials/Grid';
import { FormContext } from '../../../IntegrationsPage/utils';

const Messages = {
	name: 'Name of the Auth application',
	signin_url: 'Sign-in URL for SAML login',
	enable_signout: 'Enable Sign out',
	signout_url: 'Toggle Sign out functionality.',
	signing_cert: 'SAMLP server public key encoded in PEM or CER format.',
	user_id_attr:
		'Optional: This is the attribute in the SAML token that will be mapped to the user_id property in Auth0.',
	debug_mode: 'Include more verbose logging during the authentication process.',
	idp_domains:
		"The user's email domain will be compared with the identity provider domains. If there is a match, users will be redirected to the identity provider. If there is no match, users will be prompted to enter their password.",
	display_button: 'Display connection as a button',
	display_button_name: 'SAML Auth button label',
	button_logo_url: 'Image will be displayed as a 20x20px square.',
	protocol_binding:
		'Applies only to the SAML Request Binding. The SAML Response Binding only supports HTTP-POST.',
};
const container = css`
	div#saml-config-form {
		width: 100%;
		padding: 14px;
		padding-left: 19px;

		.pos-rel {
			position: relative;
		}

		.required-marker {
			position: absolute;
			left: -9px;
			color: red;
			font-size: 1rem;
			top: -3px;
		}

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
	}
`;

const SamlConfigForm = () => {
	const parentForm = useContext(FormContext);
	const fileList = useRef([]);
	const {
		controls: { providersForm },
	} = parentForm;
	const renderErrorSpan = (message) => {
		return <span className="error-span">{message}</span>;
	};
	return (
		<>
			<div className={container}>
				<FieldGroup
					parent={providersForm}
					name="samlpConfigForm"
					render={({ touched, value }) => {
						return (
							<div id="saml-config-form">
								<FieldControl
									name="signin_url"
									render={({ handler, errors }) => {
										const showError =
											touched && (errors?.required || errors?.invalidLink);
										return (
											<div className="pos-rel">
												<span className="required-marker">*</span>
												<Grid
													label="Sign In URL"
													toolTipMessage={Messages.signin_url}
													className={`field-wrapper ${
														showError ? 'error' : ''
													}`}
													component={
														<>
															<Input
																placeholder="https://samlp.example.com/login"
																{...handler()}
															/>
															{showError
																? (errors?.required &&
																		renderErrorSpan(
																			'Sign In URL is required',
																		)) ||
																  (errors?.invalidLink &&
																		renderErrorSpan(
																			'Sign In URL is invalid',
																		))
																: null}
														</>
													}
												/>
											</div>
										);
									}}
								/>
								<FieldControl
									name="signing_cert"
									render={({ handler, errors, value: certValue }) => {
										const showError = touched && errors?.required;
										return (
											<div className="pos-rel">
												<span className="required-marker">*</span>
												<Grid
													label="X509 Signing Certificate"
													toolTipMessage={Messages.signing_cert}
													className={`field-wrapper ${
														showError ? 'error' : ''
													}`}
													component={
														<Flex
															flexDirection="column"
															style={{ gap: '1rem', width: '100%' }}
														>
															<Upload
																multiple={false}
																fileList={fileList.current}
																onRemove={() => {
																	handler().onChange('');
																	fileList.current = [];
																}}
																beforeUpload={(file) => {
																	fileList.current = [file];
																	const read = new FileReader();

																	read.readAsBinaryString(file);

																	read.onloadend = () => {
																		handler().onChange(
																			read.result,
																		);
																	};
																	return false;
																}}
															>
																<Button icon={<UploadOutlined />}>
																	Click to Upload
																</Button>
															</Upload>
															<h4 style={{ marginBottom: '-10px' }}>
																Certificate Preview
															</h4>
															{certValue && (
																<Monaco
																	defaultValue="{}"
																	readOnly
																	language="text"
																	value={certValue}
																	theme="vs-dark"
																	options={{
																		cursorStyle: 'line',
																		lineNumbersMinChars: 2,
																		fontFamily:
																			'Monaco, monospace',
																		fontSize: 14,
																		padding: {
																			top: 10,
																			bottom: 10,
																		},
																		minimap: {
																			enabled: false,
																		},
																	}}
																	height="200px"
																	width="100%"
																/>
															)}
															{showError &&
																renderErrorSpan(
																	'X509 Signing Certificate is required',
																)}
														</Flex>
													}
												/>
											</div>
										);
									}}
								/>
								<FieldControl
									name="enable_sign_out"
									render={({ handler }) => {
										return (
											<Grid
												label="Enable Sign Out"
												toolTipMessage={Messages.enable_signout}
												className="field-wrapper"
												component={
													<>
														<Switch {...handler('checkbox')} />
													</>
												}
											/>
										);
									}}
								/>
								{value.enable_sign_out && (
									<>
										<FieldControl
											name="signout_url"
											render={({ handler, errors }) => {
												const showError = touched && errors?.required;
												return (
													<Grid
														label="Sign Out URL"
														toolTipMessage={Messages.signout_url}
														className={`field-wrapper ${
															showError ? 'error' : ''
														}`}
														component={
															<>
																<Input
																	placeholder="https://samlp.example.com/logout"
																	{...handler()}
																/>
																{showError &&
																	renderErrorSpan(
																		'Enter valid Sign out URL',
																	)}
															</>
														}
													/>
												);
											}}
										/>
									</>
								)}
								<FieldControl
									name="user_id_attr"
									render={({ handler }) => {
										return (
											<Grid
												label="User ID Attribute"
												toolTipMessage={Messages.signout_url}
												className="field-wrapper"
												component={
													<>
														<Input
															placeholder="http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
															{...handler()}
														/>
													</>
												}
											/>
										);
									}}
								/>
								<FieldControl
									name="debug_mode"
									render={({ handler }) => {
										return (
											<Grid
												label="Debug Mode"
												toolTipMessage={Messages.debug_mode}
												className="field-wrapper"
												component={
													<>
														<Switch {...handler('checkbox')} />
													</>
												}
											/>
										);
									}}
								/>
								{/* <FieldControl
                                name="protocol_binding"
                                render={({ handler }) => {
                                    return (
                                        <Grid
                                            label="Protocol Binding"
                                            toolTipMessage={Messages.protocol_binding}
                                            className="field-wrapper"
                                            component={
                                                <Select
                                                    {...handler()}
                                                    style={{
                                                        maxWidth: 300,
                                                        width: 200,
                                                    }}
                                                >
                                                    <Select.Option key="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect">
                                                        HTTP-Redirect
                                                    </Select.Option>
                                                    <Select.Option key="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST">
                                                        HTTP-POST
                                                    </Select.Option>
                                                </Select>
                                            }
                                        />
                                    );
                                }}
                            /> */}
								<FieldControl
									name="idp_domains"
									strict={false}
									render={({ handler, errors }) => {
										const showError = touched && errors?.invalidTextAreaInput;

										return (
											<Grid
												label="Identity Provider domains"
												toolTipMessage={Messages.idp_domains}
												className={`field-wrapper ${
													showError ? 'error' : ''
												}`}
												component={
													<>
														<TextArea
															rows={4}
															placeholder="Comma-separated list of the domains that can be authenticated in the Identity Provider. Eg - contoso.com, fabrikam.com"
															{...handler()}
														/>
														{showError &&
															renderErrorSpan(
																'Enter comma-separated valid domains',
															)}
													</>
												}
											/>
										);
									}}
								/>
								<FieldControl
									name="display_button"
									render={({ handler }) => {
										return (
											<Grid
												label="Display connection as a button"
												toolTipMessage={Messages.display_button}
												className="field-wrapper"
												component={
													<>
														<Switch
															{...handler('checkbox')}
															disabled={handler('checkbox').checked}
														/>
													</>
												}
											/>
										);
									}}
								/>
								<>
									<FieldControl
										name="display_button_name"
										render={({ handler, errors }) => {
											const showError = touched
												? errors?.required || errors?.minLength
												: false;

											let errorMessage = errors?.required
												? 'Button display name is required'
												: '';
											if (!errorMessage && errors?.minLength) {
												errorMessage = `Button display name should be atleast ${errors?.minLength.requiredLength} chars.`;
											}
											return (
												<Grid
													label="Button display name"
													toolTipMessage={Messages.display_button_name}
													className={`field-wrapper ${
														showError ? 'error' : ''
													}`}
													component={
														<>
															<Input
																placeholder="Enter Button label"
																{...handler()}
															/>
															{showError &&
																renderErrorSpan(errorMessage)}
														</>
													}
												/>
											);
										}}
									/>
									<FieldControl
										name="button_logo_url"
										render={({ handler, errors }) => {
											const showError = touched ? errors?.invalidLink : false;

											const errorMessage = 'Enter a valid URL.';
											return (
												<Grid
													label="Button logo URL"
													toolTipMessage={Messages.button_logo_url}
													className={`field-wrapper ${
														showError ? 'error' : ''
													}`}
													component={
														<>
															<Input
																placeholder="https://cdn.example.com/logo.svg"
																{...handler()}
															/>
															{showError &&
																renderErrorSpan(errorMessage)}
														</>
													}
												/>
											);
										}}
									/>
								</>
							</div>
						);
					}}
				/>
			</div>
		</>
	);
};

export default React.memo(SamlConfigForm);
