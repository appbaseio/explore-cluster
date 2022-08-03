/* eslint-disable camelcase */
import React, { useEffect, useRef, useState } from 'react';

import PropTypes from 'prop-types';
import { css } from 'emotion';
import { Affix, Button, notification, Tabs } from 'antd';
import { get, isEmpty } from 'lodash';
import { connect } from 'react-redux';
import { FormBuilder, Validators } from 'react-reactive-form';
import Banner from '../../batteries/components/shared/UpgradePlan/Banner';
import ApplicationSettings from './components/ApplicationSettings';
import Providers from './components/Providers/index';
import {
	fetchAuth0Preferences,
	getAuth0ClientConnections,
	patchAuth0Client,
	putAuth0ClientConnections,
	postAuth0Client,
	putAuth0Preferences,
	postAuth0ClientConnection,
	getAuth0ClientConnection,
	patchAuth0ClientConnection,
} from '../../batteries/modules/actions';
import { FormContext } from '../IntegrationsPage/utils';
import {
	atleastOneCheckBoxValidator,
	commaSeparatedStringsValidator,
	urlValidator,
	validDomainPattern,
	validUrlPattern,
} from './utils';
import Loader from '../../batteries/components/shared/Loader/Spinner';
import VersionController from '../../batteries/components/shared/VersionController';

const { TabPane } = Tabs;

const bannerDetails = {
	title: 'UI Builder: Auth Settings',
	description: 'Configure authentication settings and login providers for UI Builder',
	buttonText: 'Read Docs',
	href: 'http://docs.appbase.io/docs/reactivesearch/ui-builder/search/',
};

const container = css`
	background: white;
	padding: 10px 50px;
	position: relative;
	margin: 1rem;
	height: max-content;
	min-height: 60vh;
`;

const footer = css`
	display: flex;
	align-items: center;
	justify-content: space-between;
	width: 100%;
	padding: 20px;
	background: white;
	box-sizing: border-box;
	border: 1px solid #e8e8e8;
	box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.15);
	flex-direction: row-reverse;
`;

const CONNECTIONS_CONSTANTS = {
	AUTH0: 'auth0',
	GOOGLE_AUTH: 'google-oauth2',
	SAML: 'samlp',
};

const SearchAuth0Settings = (props) => {
	const {
		getAuth0Preferences,
		isLoading,
		clientId,
		clientData,
		updateAuth0Client,
		createAuth0Client,
		isClientSaving,
		updateAuth0Preferences,
		fetchAuth0ClientConnections,
		clientConnections,
		updateAuth0ClientConnections,
		createAuth0ClientConnection,
		samlConnectionId,
		fetchAuth0Connection,
		updateAuth0ClientConnection,
	} = props;
	const [showOverlay, setShowOverlay] = useState(true);
	const samlConfigInitialValue = useRef('');
	const applicationFormInitialData = useRef('');
	const providersFormInitialData = useRef('');

	const auth0Form = useRef(
		FormBuilder.group({
			applicationForm: FormBuilder.group({
				name: ['', Validators.required],
				logo_uri: '',
				callbacks: [
					'',
					[(control) => commaSeparatedStringsValidator(control, validUrlPattern)],
				],
				allowed_origins: [
					'',
					[(control) => commaSeparatedStringsValidator(control, validUrlPattern)],
				],
				allowed_logout_urls: [
					'',
					[(control) => commaSeparatedStringsValidator(control, validUrlPattern)],
				],
				web_origins: [
					'',
					[(control) => commaSeparatedStringsValidator(control, validUrlPattern)],
				],
			}),
			providersForm: FormBuilder.group(
				{
					[CONNECTIONS_CONSTANTS.AUTH0]: false,
					[CONNECTIONS_CONSTANTS.GOOGLE_AUTH]: false,
					[CONNECTIONS_CONSTANTS.SAML]: false,
					samlpConfigForm: FormBuilder.group({
						signin_url: ['', [Validators.required, urlValidator]],
						enable_sign_out: false,
						signout_url: ['', [urlValidator]],
						signing_cert: ['', [Validators.required]],
						user_id_attr: '',
						debug_mode: false,
						idp_domains: [
							'',
							[
								(control) =>
									commaSeparatedStringsValidator(control, validDomainPattern),
							],
						],
						display_button: true,
						display_button_name: ['', [Validators.required]],
						button_logo_url: ['', [urlValidator]],
						// protocol_binding: 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect',
					}),
				},
				{
					validators: atleastOneCheckBoxValidator,
				},
			),
		}),
	);
	useEffect(() => {
		getAuth0Preferences();
	}, []);

	useEffect(() => {
		if (clientId) {
			fetchAuth0ClientConnections(clientId);
		}
	}, [clientId]);

	useEffect(() => {
		if (samlConnectionId) {
			fetchAuth0Connection(samlConnectionId).then((res) => {
				const {
					cert,
					signInEndpoint,
					signOutEndpoint = '',
					debug = false,
					user_id_attribute = '',
					disableSignout = true,
					domain_aliases,
					show_as_button,
					icon_url,
					display_name,
				} = res.payload.options;
				auth0Form.current.controls.providersForm.patchValue({
					samlpConfigForm: {
						...auth0Form.current.value.providersForm.samlpConfigForm,
						signing_cert: cert,
						signin_url: signInEndpoint,
						signout_url: signOutEndpoint,
						enable_sign_out: !disableSignout,
						user_id_attr: user_id_attribute,
						debug_mode: debug,
						idp_domains: domain_aliases ? domain_aliases.join(',') : '',
						// protocol_binding: protocolBinding,
						display_button: show_as_button,
						button_logo_url: icon_url,
						display_button_name: display_name,
					},
				});

				samlConfigInitialValue.current = JSON.stringify(
					auth0Form.current.controls.providersForm.value.samlpConfigForm,
				);
			});
		}
	}, [samlConnectionId]);

	useEffect(() => {
		if (clientId && clientData instanceof Object && !isEmpty(clientData)) {
			// eslint-disable-next-line camelcase
			const { logo_uri, name } = clientData;
			const applicationFormValue = {
				allowed_logout_urls: clientData.allowed_logout_urls.join(','),
				allowed_origins: clientData.allowed_origins.join(','),
				callbacks: clientData.callbacks.join(','),
				web_origins: clientData.web_origins.join(','),
				logo_uri,
				name,
			};
			auth0Form.current.patchValue({
				applicationForm: applicationFormValue,
			});
			applicationFormInitialData.current = JSON.stringify(applicationFormValue);
			auth0Form.current.controls.applicationForm.touched = true;
			auth0Form.current.controls.applicationForm.handleSubmit();
		}
	}, [clientData]);

	useEffect(() => {
		if (clientId && clientConnections instanceof Object && !isEmpty(clientConnections)) {
			// eslint-disable-next-line camelcase
			const { ...rest } = clientConnections;
			const providersFormValue = {
				[CONNECTIONS_CONSTANTS.AUTH0]: rest[CONNECTIONS_CONSTANTS.AUTH0]?.enabled,
				[CONNECTIONS_CONSTANTS.GOOGLE_AUTH]:
					rest[CONNECTIONS_CONSTANTS.GOOGLE_AUTH]?.enabled,
				[CONNECTIONS_CONSTANTS.SAML]: rest[CONNECTIONS_CONSTANTS.SAML]?.enabled ?? false,
			};
			auth0Form.current.patchValue({
				providersForm: providersFormValue,
			});
			providersFormInitialData.current = JSON.stringify(providersFormValue);
		}
	}, [clientConnections]);

	const handleCreateSamlConnection = (clientIdParam) => {
		const {
			controls: {
				providersForm: {
					controls: { samlpConfigForm },
				},
			},
		} = auth0Form.current;
		const {
			value: {
				signin_url,
				signing_cert,
				debug_mode,
				enable_sign_out,
				signout_url,
				user_id_attr,
				display_button,
				button_logo_url,
				display_button_name,
				idp_domains,
			},
		} = samlpConfigForm;
		const samlConnectionPayload = {
			strategy: 'samlp',
			options: {
				cert: signing_cert,
				signingCert: btoa(signing_cert),
				...(display_button
					? {
							show_as_button: display_button,
							icon_url: button_logo_url,
							display_name: display_button_name,
					  }
					: {
							domain_aliases: idp_domains
								? idp_domains
										.trim()
										.split(',')
										.filter((item) => !!item)
								: undefined,
					  }),
				signInEndpoint: signin_url,
				signOutEndpoint: signout_url,
				disableSignout: !enable_sign_out,
				user_id_attribute: user_id_attr ?? '',
				debug: debug_mode,
				// signatureAlgorithm: '',
				// digestAlgorithm: '',
				// protocolBinding: protocol_binding,
				// fieldsMap: {},
				// idpinitiated: {},
				// signSAMLRequest:false,
			},
			name: clientIdParam,
		};
		createAuth0ClientConnection(samlConnectionPayload);
	};

	const updateSamlConfig = (connectionId) => {
		const {
			controls: {
				providersForm: {
					controls: { samlpConfigForm },
				},
			},
		} = auth0Form.current;
		if (samlConfigInitialValue.current === JSON.stringify(samlpConfigForm.value)) {
			return;
		}
		const {
			value: {
				signin_url,
				signing_cert,
				debug_mode,
				enable_sign_out,
				signout_url,
				user_id_attr,
				display_button,
				button_logo_url,
				display_button_name,
				idp_domains,
			},
		} = samlpConfigForm;
		const samlConnectionPayload = {
			options: {
				cert: signing_cert,
				signingCert: btoa(signing_cert),
				...(display_button
					? {
							show_as_button: display_button,
							icon_url: button_logo_url,
							display_name: display_button_name,
					  }
					: { domain_aliases: idp_domains ? idp_domains.trim().split(',') : undefined }),

				signInEndpoint: signin_url,
				signOutEndpoint: signout_url,
				disableSignout: !enable_sign_out,
				user_id_attribute: user_id_attr ?? '',
				debug: debug_mode,
				// signatureAlgorithm: '',
				// digestAlgorithm: '',
				// protocolBinding: protocol_binding,
				// fieldsMap: {},
				// idpinitiated: {},
				// signSAMLRequest:false,
			},
		};
		updateAuth0ClientConnection(connectionId, samlConnectionPayload, clientId)
			.then((res1) => {
				if (res1.payload) {
					notification.success({
						message: 'Saml config updated successfully!',
					});
				} else if (res1.error) {
					notification.error({
						message: <p>Something went wrong while updating the Saml config!</p>,
					});
				}
			})
			.catch((updateError) => {
				notification.error({
					message: updateError,
				});
			});
	};

	// handler for updating enabled connections
	// eslint-disable-next-line consistent-return
	const handleClientConnectionsUpdate = async (clientIdParam = clientId) => {
		if (clientIdParam) {
			const {
				controls: { providersForm },
			} = auth0Form.current;
			if (providersForm.value.samlp) {
				providersForm.controls.samlpConfigForm.handleSubmit();
				providersForm.controls.samlpConfigForm.touched = true;
			} else {
				providersForm.value.samlp = false;
			}
			const { value: providersFormValue } = providersForm;
			if (!providersForm.pristine) {
				const payload = {
					[clientConnections[CONNECTIONS_CONSTANTS.AUTH0].id]:
						providersFormValue[CONNECTIONS_CONSTANTS.AUTH0],
					[clientConnections[CONNECTIONS_CONSTANTS.GOOGLE_AUTH].id]:
						providersFormValue[CONNECTIONS_CONSTANTS.GOOGLE_AUTH],
				};

				if (clientConnections[CONNECTIONS_CONSTANTS.SAML] || samlConnectionId) {
					payload[clientConnections[CONNECTIONS_CONSTANTS.SAML].id ?? samlConnectionId] =
						providersFormValue[CONNECTIONS_CONSTANTS.SAML];

					updateSamlConfig(
						clientConnections[CONNECTIONS_CONSTANTS.SAML].id ?? samlConnectionId,
					);
				}

				// logic to avoid API calls if change hasn't happened
				if (
					providersFormInitialData.current ===
					JSON.stringify({
						[CONNECTIONS_CONSTANTS.AUTH0]:
							providersFormValue[CONNECTIONS_CONSTANTS.AUTH0],
						[CONNECTIONS_CONSTANTS.GOOGLE_AUTH]:
							providersFormValue[CONNECTIONS_CONSTANTS.GOOGLE_AUTH],
						[CONNECTIONS_CONSTANTS.SAML]:
							providersFormValue[CONNECTIONS_CONSTANTS.SAML],
					})
				) {
					return;
				}
				updateAuth0ClientConnections(clientIdParam, payload)
					.then((res) => {
						if (!clientConnections[CONNECTIONS_CONSTANTS.SAML] && !samlConnectionId) {
							// SAML data not available => create a SAML connection
							handleCreateSamlConnection(clientId)
								.then((res1) => {
									if (res1.payload) {
										notification.success({
											message: 'Auth connections updated!',
										});
									} else if (res1.error) {
										notification.error({
											message: (
												<p>
													Something went wrong while updating the
													connections!
												</p>
											),
										});
									}
								})
								.catch((updateError) => {
									notification.error({
										message: updateError,
									});
								});
						} else if (res.payload) {
							notification.success({
								message: 'Auth connections updated!',
							});
						} else if (res.error) {
							notification.error({
								message: (
									<p>Something went wrong while updating the connections!</p>
								),
							});
						}
					})
					.catch((updateError) => {
						notification.error({
							message: updateError,
						});
					});
			}
		}
	};

	const handleSave = (e) => {
		e.preventDefault();
		auth0Form.current.handleSubmit();

		const {
			controls: { applicationForm, providersForm },
		} = auth0Form.current;

		if (applicationForm.invalid || providersForm.invalid) {
			return;
		}

		if (providersForm.value.samlp && providersForm.controls.samlpConfigForm.invalid) {
			return;
		}

		const { value: applicationFormValue } = applicationForm;
		const payload = {
			name: applicationFormValue.name,
			logo_uri: applicationFormValue.logo_uri,
			callbacks: applicationFormValue.callbacks
				? applicationFormValue.callbacks.split(',')
				: [],
			allowed_origins: applicationFormValue.allowed_origins
				? applicationFormValue.allowed_origins.split(',')
				: [],
			web_origins: applicationFormValue.web_origins
				? applicationFormValue.web_origins.split(',')
				: [],
			allowed_logout_urls: applicationFormValue.allowed_logout_urls
				? applicationFormValue.allowed_logout_urls.split(',')
				: [],
		};
		if (!clientId) {
			createAuth0Client(payload)
				.then((res) => {
					if (res.payload) {
						notification.success({
							message: 'Auth settings configured!',
						});
						updateAuth0Preferences({ client_id: res.payload.client_id });
						handleClientConnectionsUpdate(res.payload.client_id);
					} else if (res.error) {
						notification.error({
							message: <p>Something went wrong!</p>,
						});
					}
				})
				.catch((createError) => {
					notification.error({
						message: createError,
					});
				});
		} else {
			handleClientConnectionsUpdate(clientId);
			if (
				!applicationForm.pristine &&
				applicationFormInitialData.current !== JSON.stringify(applicationFormValue)
			) {
				updateAuth0Client(clientId, payload)
					.then((res) => {
						if (res.payload) {
							notification.success({
								message: 'Auth settings updated!',
							});
						} else if (res.error) {
							notification.error({
								message: <p>Something went wrong!</p>,
							});
						}
					})
					.catch((updateError) => {
						notification.error({
							message: updateError,
						});
					});
			}
		}
	};
	if (isLoading) {
		return <Loader />;
	}

	return (
		<>
			<Banner {...bannerDetails} />
			<div css={container}>
				{!clientId && showOverlay ? (
					<div>
						<p>
							You don’t have authentication settings configured for your search UIs.
							Your search UIs will be publicly accessible on the deployed domains.
						</p>
						<p>
							Once you configure authentication and enable it within a search UI, your
							search UI will turn into an authentication based search experience.
						</p>
						<Button
							style={{ float: 'right' }}
							type="primary"
							onClick={() => setShowOverlay(false)}
						>
							Continue Configuring Authentication
						</Button>
					</div>
				) : (
					<VersionController version="8.4.0">
						<FormContext.Provider value={auth0Form.current}>
							<Tabs defaultActiveKey="application-settings">
								<TabPane tab="Application Settings" key="application-settings">
									<ApplicationSettings />
								</TabPane>
								<TabPane tab="Providers" key="providers">
									<Providers />
								</TabPane>
							</Tabs>
						</FormContext.Provider>
						<Affix
							offsetBottom={0}
							style={{
								padding: '15px 10px',
								width: '100%',
							}}
						>
							<div className={footer}>
								<Button
									type="primary"
									size="default"
									className="save-btn"
									onClick={handleSave}
									loading={isClientSaving}
								>
									Save
								</Button>
							</div>
						</Affix>
					</VersionController>
				)}
			</div>
		</>
	);
};

SearchAuth0Settings.defaultProps = {
	clientId: '',
	samlConnectionId: '',
	clientData: {},
	isClientSaving: false,
	clientConnections: {},
};

SearchAuth0Settings.propTypes = {
	getAuth0Preferences: PropTypes.func.isRequired,
	isLoading: PropTypes.bool.isRequired,
	clientId: PropTypes.string,
	clientData: PropTypes.object,
	updateAuth0Client: PropTypes.func.isRequired,
	createAuth0Client: PropTypes.func.isRequired,
	updateAuth0Preferences: PropTypes.func.isRequired,
	isClientSaving: PropTypes.bool,
	fetchAuth0ClientConnections: PropTypes.func.isRequired,
	fetchAuth0Connection: PropTypes.func.isRequired,
	updateAuth0ClientConnections: PropTypes.func.isRequired,
	createAuth0ClientConnection: PropTypes.func.isRequired,
	updateAuth0ClientConnection: PropTypes.func.isRequired,
	clientConnections: PropTypes.object,
	samlConnectionId: PropTypes.string,
};

const mapStateToProps = (state) => {
	return {
		isLoading:
			get(state, '$getAuth0Preferences.isFetching') ||
			get(state, '$getAuth0Client.isFetching'),
		clientId: get(state, '$getAuth0Preferences.results')?.['_client_id'],
		samlConnectionId: get(state, '$getAuth0Preferences.results')?.['_saml_conn_id'],
		clientData: get(state, '$getAuth0Client.results'),
		isClientSaving:
			get(state, '$saveAuth0Client.isFetching') ||
			get(state, '$createAuth0Client.isFetching') ||
			get(state, '$saveAuth0ClientConnections.isFetching'),
		clientConnections: get(state, '$getAuth0ClientConnections.results'),
	};
};

const mapDispatchToProps = (dispatch) => ({
	getAuth0Preferences: () => dispatch(fetchAuth0Preferences()),
	fetchAuth0ClientConnections: (clientId) => dispatch(getAuth0ClientConnections(clientId)),
	fetchAuth0Connection: (connectionId) => dispatch(getAuth0ClientConnection(connectionId)),
	updateAuth0Client: (clientId, payload) => dispatch(patchAuth0Client(clientId, payload)),
	createAuth0Client: (payload) => dispatch(postAuth0Client(payload)),
	updateAuth0Preferences: (payload) => dispatch(putAuth0Preferences(payload)),
	updateAuth0ClientConnections: (clientId, payload) =>
		dispatch(putAuth0ClientConnections(clientId, payload)),
	createAuth0ClientConnection: (payload) => dispatch(postAuth0ClientConnection(payload)),
	updateAuth0ClientConnection: (connectionId, payload, clientId) =>
		dispatch(patchAuth0ClientConnection(connectionId, payload, clientId)),
});

export default connect(mapStateToProps, mapDispatchToProps)(SearchAuth0Settings);
