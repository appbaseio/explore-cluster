// import Dashboard from '@uppy/dashboard';
import { Input, Typography } from 'antd';
import { css } from 'emotion';
// import ImageKitUppyPlugin from 'imagekit-uppy-plugin';
// import { IKContext, IKImage } from 'imagekitio-react';
import React, { useContext, useEffect } from 'react';
import { FieldControl, FieldGroup } from 'react-reactive-form';
// import Uppy from '@uppy/core';
import Grid from '../../../components/CreateCredentials/Grid';
import '@uppy/core/dist/style.css';
import '@uppy/dashboard/dist/style.css';
import { FormContext } from '../../IntegrationsPage/utils';

const { TextArea } = Input;

const Messages = {
	name: 'Name of the Auth application',
	white_list_url:
		'By default, authentication will work on the deployed Search UI domains for your cluster. You can add custom domains you intend to use for authentication here. This is required to configure post login callback URL, set CORS, and web origins.',
	uri_logo:
		'The URL of the logo to display for the application, if none is set the default badge for this type of application will be shown. Recommended size is 150x150 pixels.',
	callbacks:
		'After the user authenticates we will only call back to any of these URLs. You can specify multiple valid URLs by comma-separating them (typically to handle different environments like QA or testing). Make sure to specify the protocol (https://) otherwise the callback may fail in some cases. With the exception of custom URI schemes for native clients, all callbacks should use protocol https://.',
	allowed_origins:
		'Allowed Origins are URLs that will be allowed to make requests from JavaScript to Auth0 API (typically used with CORS). By default, all your callback URLs will be allowed. This field allows you to enter other origins if you need to. You can specify multiple valid URLs by comma-separating them or one by line, and also use wildcards at the subdomain level (e.g.: https://*.contoso.com). Query strings and hash information are not taken into account when validating these URLs.',
	allowed_logout_urls:
		'A set of URLs that are valid to redirect to after logout from Auth0. After a user logs out from Auth0 you can redirect them with the returnTo query parameter. The URL that you use in returnTo must be listed here. You can specify multiple valid URLs by comma-separating them. You can use the star symbol as a wildcard for subdomains (*.google.com). Query strings and hash information are not taken into account when validating these URLs. Read more about this at https://auth0.com/docs/authenticate/login/logout',
	web_origins:
		'Comma-separated list of allowed origins for use with Cross-Origin Authentication, Device Flow, and web message response mode, in the form of <scheme> "://" <host> [ ":" <port> ], such as https://login.mydomain.com or http://localhost:3000. You can use wildcards at the subdomain level (e.g.: https://*.contoso.com). Query strings and hash information are not taken into account when validating these URLs.',
};
const container = css`
	div#application-settings-form {
		width: 50%;
		.uppy-Dashboard {
			height: 180px;
		}
		.uppy-Dashboard-inner {
			z-index: 0;
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

const ApplicationSettings = () => {
	const parentForm = useContext(FormContext);
	// const {
	// 	controls: { applicationForm },
	// } = parentForm;
	useEffect(() => {
		// eslint-disable-next-line
		// const uppy = new Uppy({ debug: true, autoProceed: false })
		// 	.use(Dashboard, {
		// 		inline: true,
		// 		target: '#uppyDashboard', // your element
		// 	})
		// 	.use(ImageKitUppyPlugin, {
		// 		id: 'appbaseio',
		// 		publicKey: 'REDACTED_IMAGEKIT_PUBLIC_KEY=',
		// 		authenticationEndpoint: '/.netlify/functions/imagekit-upload/',
		// 	})
		// 	.on('upload-success', onUploadSuccess());
	}, []);

	// const onUploadSuccess = () => (file, response) => {
	// 	const imgUrl = response.uploadURL;
	// 	applicationForm.get('logo_uri').setValue(imgUrl);
	// 	applicationForm.pristine = false;
	// };
	const renderErrorSpan = (message) => {
		return <span className="error-span">{message}</span>;
	};

	return (
		<>
			<div className={container}>
				<FieldGroup
					parent={parentForm}
					name="applicationForm"
					render={({ touched }) => {
						return (
							<div id="application-settings-form">
								<FieldControl
									name="name"
									render={({ handler, errors }) => {
										const showError = touched && errors?.required;
										return (
											<Grid
												label="Name"
												toolTipMessage={Messages.name}
												className={`field-wrapper ${
													showError ? 'error' : ''
												}`}
												component={
													<>
														<Input
															placeholder="Add name for application"
															{...handler()}
														/>
														{showError &&
															renderErrorSpan(
																'Application Name is required',
															)}
													</>
												}
											/>
										);
									}}
								/>
								{/* <FieldControl name="logo_uri" strict={false}>
									{({ value }) => {
										return (
											<Grid
												label="Set Logo"
												className="field-wrapper"
												component={
													<div>
														<IKContext
															urlEndpoint="https://ik.imagekit.io/appbaseio/"
															publicKey="REDACTED_IMAGEKIT_PUBLIC_KEY="
															authenticationEndpoint="/.netlify/functions/imagekit-upload/"
														>
															<div
																style={{
																	display: 'flex',
																	alignItems: 'center',
																	gap: '25px',
																	position: 'relative',
																}}
															>
																<div
																	id="uppyDashboard"
																	style={{
																		width: '186px',
																	}}
																/>{' '}
																<IKImage
																	src={
																		value ||
																		'https://ik.imagekit.io/appbaseio/logo_1kuKgCrZg.jpg'
																	}
																	style={{
																		marginBottom: 10,
																		width: 100,
																	}}
																/>
															</div>
														</IKContext>
														<div />
													</div>
												}
												gridRatio={0.2}
											/>
										);
									}}
								</FieldControl> */}
								<FieldControl
									name="callbacks" // use callbacks as a uniersal field for other hidden Auth0 relevant settings
									strict={false}
									render={({ handler, errors }) => {
										const showError =
											touched &&
											(errors?.required || errors?.invalidTextAreaInput);

										return (
											<Grid
												label="Whitelist URLs for Authentication Use"
												toolTipMessage={Messages.white_list_url}
												className={`field-wrapper ${
													showError ? 'error' : ''
												}`}
												component={
													<div>
														<div style={{ position: 'relative' }}>
															{' '}
															<TextArea
																rows={4}
																placeholder="Enter comma-separated URLs"
																{...handler()}
																style={{
																	width: '100%',
																	marginBottom: '2rem',
																}}
															/>
															{showError &&
																renderErrorSpan(
																	errors?.required
																		? 'This is a required field'
																		: 'Enter comma-separated valid URLs',
																)}
														</div>
														<Typography.Paragraph>
															{Messages.white_list_url}
														</Typography.Paragraph>
													</div>
												}
											/>
										);
									}}
								/>
								{/* <FieldControl
									name="allowed_origins"
									strict={false}
									render={({ handler, errors }) => {
										const showError = touched && errors?.invalidTextAreaInput;

										return (
											<Grid
												label="Allowed Origins (CORS)"
												toolTipMessage={Messages.allowed_origins}
												className={`field-wrapper ${
													showError ? 'error' : ''
												}`}
												component={
													<>
														<TextArea
															rows={4}
															placeholder="Enter comma-separated URLs"
															{...handler()}
														/>
														{showError &&
															renderErrorSpan(
																'Enter comma-separated valid URLs',
															)}
													</>
												}
											/>
										);
									}}
								/>
								<FieldControl
									name="allowed_logout_urls"
									strict={false}
									render={({ handler, errors }) => {
										const showError = touched && errors?.invalidTextAreaInput;

										return (
											<Grid
												label="Allowed Logout URLs"
												toolTipMessage={Messages.allowed_logout_urls}
												className={`field-wrapper ${
													showError ? 'error' : ''
												}`}
												component={
													<>
														<TextArea
															rows={4}
															placeholder="Enter comma-separated URLs"
															{...handler()}
														/>
														{showError &&
															renderErrorSpan(
																'Enter comma-separated valid URLs',
															)}
													</>
												}
											/>
										);
									}}
								/>
								<FieldControl
									name="web_origins"
									strict={false}
									render={({ handler, errors }) => {
										const showError = touched && errors?.invalidTextAreaInput;

										return (
											<Grid
												label="Allowed Web Origins"
												toolTipMessage={Messages.web_origins}
												className={`field-wrapper ${
													showError ? 'error' : ''
												}`}
												component={
													<>
														<TextArea
															rows={4}
															placeholder="Enter comma-separated URLs"
															{...handler()}
														/>
														{showError &&
															renderErrorSpan(
																'Enter comma-separated valid URLs',
															)}
													</>
												}
											/>
										);
									}}
								/> */}
							</div>
						);
					}}
				/>
			</div>
		</>
	);
};

export default React.memo(ApplicationSettings);
