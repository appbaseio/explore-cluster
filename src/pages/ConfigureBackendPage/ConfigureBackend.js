import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { LoadingOutlined } from '@ant-design/icons';
import {
	Col,
	Row,
	Layout,
	Alert,
	Card,
	Typography,
	Radio,
	Input,
	Button,
	notification,
	Spin,
	Form,
} from 'antd';
import { css } from 'emotion';
import get from 'lodash/get';
import { connect } from 'react-redux';
import { FieldControl, FieldGroup, FormBuilder, Validators } from 'react-reactive-form';
import { withErrorToaster } from '../../batteries/components/shared/ErrorToaster/ErrorToaster';
import { BACKENDS } from '../../batteries/utils';
import Banner from '../../batteries/components/shared/UpgradePlan/Banner';
import Flex from '../../batteries/components/shared/Flex';
import { getAppPlan, updateBackendConnection } from '../../batteries/utils/app';
import { ALLOWED_SLS } from '../../constants';

const container = css`
	padding: 50px;
	margin-bottom: 70px;
	background-color: white;
	margin-top: 5px;

	.card-wrapper {
		gap: 1rem;
		width: 100%;
		.ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled) {
			background: #eaf5ff;
		}
		&.error-class {
			border: 1px solid #f5222d;
			position: relative;
			border-radius: 4px;

			&:before {
				content: 'Select a search backend';
				position: absolute;
				top: -22px;
				left: 0;
				color: red;
				z-index: 3;
				font-size: 14px;
			}
		}

		.field-label {
			display: flex;
			align-items: center;
			flex-wrap: wrap;
			background-color: rgb(234, 245, 255);
			font-weight: bold;
		}

		.fields-wrapper {
			flex-grow: 1;
		}

		.ant-row.ant-form-item {
			display: flex;
			.ant-form-item-label {
				flex-grow: 0;
				flex-basis: 100px;
			}

			.ant-col.ant-form-item-control-wrapper {
				flex-grow: 1;
				input {
					width: 100%;
				}
			}
			.error-span {
				color: red;
			}
		}
		.radio-group {
			display: flex;
			align-items: center;
			flex-wrap: wrap;
			gap: 1rem;
			padding: 1rem 0;

			.ant-radio-button-wrapper {
				height: 152px;
				width: 160px;
				display: flex;
				align-items: center;
				justify-content: center;
			}
		}
	}
`;

const spinnerStyle = css`
	&.ant-spin.ant-spin-spinning.ant-spin-show-text {
		.ant-spin-text {
			top: 65%;
			font-size: 1rem;
			color: black;
		}
	}
`;

const submitButtonCss = css`
	margin-right: 0;
	margin-top: 2rem;
	margin-left: calc(100% - 188px);
`;

const spinnerWrapperStyle = css`
	.ant-spin-container.ant-spin-blur {
		&:after {
			opacity: 0.7;
		}
	}
`;

const urlValidator = (control) => {
	try {
		if (!control.value) {
			return null;
		}

		const urlRegex =
			// eslint-disable-next-line no-useless-escape
			/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
		const credentialsRegex = /(?<=:\/\/)(.*)(?=@)/;

		const urlMatches = control.value.match(urlRegex);
		const credentialsMatches = control.value.match(credentialsRegex);

		if (!urlMatches || !urlMatches[0]) {
			return { invalidLink: true };
		}
		if (credentialsMatches && !credentialsMatches[0]) {
			return {
				invalidCredentials: true,
			};
		}
		return null;
	} catch (e) {
		return {
			invalidLink: true,
		};
	}
};

const { Header } = Layout;
const ConfigureBackend = (props) => {
	const { backendImage, backend: backendProp } = props;
	const bannerDetails = {
		title: 'Search Backend Configuration',
		description: `This will setup a connector pipeline so you can make search API requests and build search UIs with the configured search engine.`,
		buttonText: 'Read Docs',
		href: 'https://docs.appbase.io/docs/pipelines/concepts/',
	};
	const [disabledSave, setDisabledSave] = useState(true);
	const [isLoading, setIsLoading] = useState(false);
	const [isURLRequired, setIsURLRequired] = useState(true);
	const form = useRef(
		FormBuilder.group({
			backend: ['', [Validators.required]],
			url: ['', [Validators.required, urlValidator]],
		}),
	);

	const _urlInputRef = useRef(null);

	const handeConfigureBackend = () => {
		setIsLoading(true);
		const { backend, url } = form.current.value;
		const payload = {
			backend,
		};
		if (backend !== BACKENDS.SYSTEM.name) {
			const { host, protocol, username, password } = new URL(url);
			payload.host = host;
			payload.protocol = `${protocol.substring(0, protocol.length - 1)}`;
			payload.basic_auth = `${username}:${password}`;
		}

		const checkForServerRestart = () => {
			// insist user to not leave the current page
			window.onbeforeunload = () => {
				return 'You have unsaved changes, are you sure you want to leave?';
			};

			getAppPlan()
				.then(() => {
					// set loading to false, it unlocks to page
					setIsLoading(false);
					// show a toaster on success
					notification.success({
						message: 'Success',
						description: 'Successfully updated search backend.',
					});
					form.current.get('url').markAsPristine();
					form.current.get('url').markAsUntouched();
					// reset form values, exception is selected backend
					form.current.reset({ url: '', backend });

					// remove unload event listener
					window.onbeforeunload = null;
				})
				.catch(() => {
					// hit the plan api after 5 seconds to check if the server has restarted
					setTimeout(() => {
						checkForServerRestart();
					}, 5000);
				});
		};

		updateBackendConnection(payload)
			.then((res) => {
				if (res.code === 200) checkForServerRestart();
			})
			.catch(() => {
				notification.error({
					message: 'Error',
					description: 'Updating search backend failed!',
				});
			})
			.finally(() => {
				setIsLoading(false);
			});
	};

	useLayoutEffect(() => {
		const valueChangeListener = (status) => {
			setDisabledSave(status === 'INVALID');
		};

		const backendValListener = (val) => {
			if (!isURLRequired && val !== BACKENDS.SYSTEM.name) {
				form.current.get('url').setValue('');
				form.current.get('url').markAsUntouched();
			}
			setIsURLRequired(val !== BACKENDS.SYSTEM.name);
			if (val === BACKENDS.SYSTEM.name && disabledSave) {
				setDisabledSave(false);
			} else {
				setDisabledSave(true);
			}
		};

		form.current.get('url').statusChanges.subscribe(valueChangeListener);
		form.current.get('backend').valueChanges.subscribe(backendValListener);
		return () => {
			form.current.statusChanges.unsubscribe(valueChangeListener);
			form.current.get('backend').valueChanges.unsubscribe(backendValListener);
		};
	}, []);

	useEffect(() => {
		if (backendProp) {
			form.current.get('backend').setValue(backendProp);
		}
	}, [backendProp]);

	if (!ALLOWED_SLS.includes(backendImage))
		return (
			<React.Fragment>
				<Banner {...bannerDetails} onClick={() => window.open(bannerDetails.href)} />

				<div
					style={{
						display: 'flex',
						height: '100%',
						width: '100%',
						alignItems: 'center',
						justifyContent: 'center',
					}}
				>
					<Alert
						type="warning"
						message={
							<div>
								<div>
									<b>Configure Search Engine Backend</b>
								</div>
								<br />
								<Typography.Text>
									Configuring a search engine backend isn’t possible for this
									image type. Contact support if you need this.
								</Typography.Text>
							</div>
						}
						style={{ marginBottom: 10, height: 'max-content' }}
					/>
				</div>
			</React.Fragment>
		);

	return (
		<Spin
			spinning={isLoading}
			indicator={<LoadingOutlined style={{ fontSize: 72 }} spin />}
			tip={
				<div>
					<h4>
						Switching backend, hold tight!{' '}
						<span role="img" aria-label="cool-emoji">
							😎
						</span>
					</h4>
					<p>
						Switching backend requires restarting the server which can take upto a
						minute.
					</p>
				</div>
			}
			className={spinnerStyle}
			wrapperClassName={spinnerWrapperStyle}
		>
			<Header style={{ background: 'white', height: 'auto' }}>
				<div
					style={{
						padding: '25px 0px',
						margin: '0 auto',
					}}
				>
					<Row type="flex" justify="space-between" align="middle" gutter={16}>
						<Col lg={24}>
							<h2>
								Configure a search engine backend to continue using ReactiveSearch
								dashboard
							</h2>
							<Row>
								<Col lg={18}>
									<p>
										This will setup a connector pipeline so you can make search
										API requests and build search UIs with the configured search
										engine.
									</p>
								</Col>
							</Row>
						</Col>
					</Row>
				</div>
			</Header>
			<div className={container}>
				<FieldGroup
					strict={false}
					control={form.current}
					render={() => {
						return (
							<Flex style={{ gap: '2rem', flexWrap: 'wrap' }}>
								<FieldControl
									strict={false}
									name="backend"
									render={({ handler, hasError }) => {
										const inputHandler = handler();
										return (
											<Flex
												className={`card-wrapper ${
													hasError('required') ? 'error-class' : ''
												}`}
											>
												<Card className={`field-label `} bordered={false}>
													<Typography.Text>
														<Typography.Text type="danger">
															*
														</Typography.Text>
														&nbsp; Choose search engine{' '}
													</Typography.Text>
													<br />
													{inputHandler.value ===
														BACKENDS.SYSTEM.name && (
														<p
															style={{
																maxWidth: '200px',
																fontWeight: 'normal',
																fontSize: '14px',
															}}
														>
															System backend provides you with 2
															geo-distributed search indexes on
															OpenSearch out of the box.
														</p>
													)}
												</Card>
												<Radio.Group
													{...inputHandler}
													size="large"
													className="radio-group"
												>
													{Object.values(BACKENDS)
														.filter(
															(item) =>
																item.name !==
																	BACKENDS.FUSION.name &&
																item.name !==
																	BACKENDS.MARKLOGIC.name &&
																item.name !== BACKENDS.ZINC.name,
														)
														.map(({ name, logo }) => (
															<Radio.Button
																className="backend-radio-button"
																value={name}
																key={name}
															>
																{name === BACKENDS.SYSTEM.name ? (
																	<h4>System</h4>
																) : (
																	<img
																		src={logo}
																		alt={name}
																		width="120px"
																	/>
																)}
															</Radio.Button>
														))}
												</Radio.Group>
											</Flex>
										);
									}}
								/>
								{isURLRequired && (
									<Flex className="card-wrapper">
										<Card className="field-label" bordered={false}>
											<Typography.Text>
												Connect to your cluster!
											</Typography.Text>
										</Card>
										<div className="fields-wrapper">
											<FieldControl
												strict={false}
												name="url"
												render={({ handler, hasError, touched }) => {
													const inputHandler = handler();
													let errorMessage = '';
													if (hasError && touched) {
														if (hasError('required')) {
															errorMessage =
																'URL is a required field';
														} else if (hasError('invalidLink')) {
															errorMessage = 'Enter a valid link';
														} else if (hasError('invalidCredentials')) {
															errorMessage =
																'The credentials are invalid';
														}
													}

													return (
														<Form.Item
															label="URL"
															name="url"
															required
															labelAlign="left"
															validateStatus={
																errorMessage ? 'error' : undefined
															}
															colon={false}
															extra={
																<span className="error-span">
																	{errorMessage}
																</span>
															}
															tooltip="Include credentials in the URL itself, e.g., https://username:password@example.com"
														>
															<Input
																{...inputHandler}
																ref={_urlInputRef}
															/>
														</Form.Item>
													);
												}}
											/>
										</div>
									</Flex>
								)}
							</Flex>
						);
					}}
				/>

				<Alert
					type="info"
					message="Your URL and credentials will only show up when you configure them for the first time. You can update these in case they’ve changed."
					style={{ marginBottom: 10, marginTop: 20, height: 'max-content' }}
					showIcon
				/>
				{backendProp && (
					<Alert
						type="info"
						message="Your previously configured search engine backend pipelines will continue to work."
						style={{ marginBottom: 10, height: 'max-content' }}
						showIcon
					/>
				)}
				<Button
					disabled={disabledSave}
					type="primary"
					onClick={handeConfigureBackend}
					className={submitButtonCss}
					loading={isLoading}
				>
					Configure Search Engine
				</Button>
			</div>
		</Spin>
	);
};

ConfigureBackend.propTypes = {
	backendImage: PropTypes.string,
	backend: PropTypes.string,
};

ConfigureBackend.defaultProps = {
	backendImage: '',
	backend: '',
};

const mapStateToProps = (state) => ({
	backendImage: get(state, '$getAppPlan.results.image_type'),
	backend: get(state, '$getAppPlan.results.backend'),
});

export default withErrorToaster(connect(mapStateToProps)(ConfigureBackend));
