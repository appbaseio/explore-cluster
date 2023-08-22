/* eslint-disable no-bitwise */
import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { EyeInvisibleOutlined, EyeTwoTone, InfoCircleOutlined } from '@ant-design/icons';
import { Button, Col, Row, Layout, Alert, Switch, Input, message, Spin, notification } from 'antd';
import { css } from 'emotion';
import get from 'lodash/get';
import { connect } from 'react-redux';
import { FieldControl, FieldGroup, FormBuilder, Validators } from 'react-reactive-form';
import { withErrorToaster } from '../../batteries/components/shared/ErrorToaster/ErrorToaster';
import ErrorToaster from '../../batteries/components/shared/ErrorToaster';
import Banner from '../../batteries/components/shared/UpgradePlan/Banner';
import Overlay from '../../components/Overlay';
import { allowedTiers } from '../../utils/prop-types';
import { compareVersion } from '../../utils';
import { AIPreferencesBannerDetails } from './utils';
import Container from '../../components/Container';
import Flex from '../../batteries/components/shared/Flex';
import Grid from '../../components/CreateCredentials/Grid';
import { ALLOWED_SLS } from '../../constants';
import IndexDropdown from '../QueryRules/components/IndexDropdown';
import { getAIPreferences, updateAIPreferences } from '../../batteries/utils/app';
import { features, isValidPlan } from '../../batteries/utils';

const AIpreferencesContainer = css`
	margin-top: 2rem;
	min-height: 50vh;
	padding: 50px;
	margin-bottom: 70px;
	background: white;
	.field-wrapper {
		&:first-child {
			width: 50%;
			min-width: 150px;
		}
		height: 32px;

		align-items: center;
		flex-wrap: nowrap;

		& > div:first-child {
			flex: 54%;
			& > div > span {
				white-space: nowrap;
			}
		}
	}
	.error {
		color: red;
	}
	.required-marker {
		color: red;
		font-size: 1rem;
	}
`;

const { Header } = Layout;

const controlsNameMap = {
	DEFAULT_MAX_TOKENS: 'defaultMaxTokens',
	DEFAULT_MIN_TOKENS: 'defaultMinTokens',
};

const maxMinTokensValidator = (control, name) => {
	try {
		if (name === controlsNameMap.DEFAULT_MAX_TOKENS) {
			if (+control.value < +control._parent.get(controlsNameMap.DEFAULT_MIN_TOKENS).value) {
				return {
					invalidMaxTokenValue: true,
				};
			}
			return null;
		}
		if (name === controlsNameMap.DEFAULT_MIN_TOKENS) {
			if (+control.value > +control._parent.get(controlsNameMap.DEFAULT_MAX_TOKENS).value) {
				return {
					invalidMinTokenValue: true,
				};
			}
			return null;
		}

		return null;
	} catch (e) {
		return {
			invalidMinTokenValue: true,
			invalidMaxTokenValue: true,
		};
	}
};
const AIPreferences = (props) => {
	const { appVersion, backendImage, isAppsLoading, featureAI, tier } = props;
	const bannerDetails = AIPreferencesBannerDetails;
	const [loadingState, setLoadingState] = useState(false);

	const form = useRef(
		FormBuilder.group({
			enable: [false], // id of the selected pipeline
			apiKey: ['', Validators.required],
			defaultModel: ['gpt-3.5-turbo'],
			defaultSystemPrompt: [''],
			enabledIndexes: [[]],
			defaultMinTokens: [
				100,
				(ctrl) => maxMinTokensValidator(ctrl, controlsNameMap.DEFAULT_MIN_TOKENS),
			],
			defaultMaxTokens: [
				800,
				(ctrl) => maxMinTokensValidator(ctrl, controlsNameMap.DEFAULT_MAX_TOKENS),
			],
		}),
	);

	const fetchAIPreferences = () => {
		setLoadingState(true);
		getAIPreferences()
			.then((res) => {
				form.current.patchValue({
					...form.current.value,
					...res,
				});
			})
			.catch(() => {
				message.error('Whoa! There was an error fetching the AI preferences.');
			})
			.finally(() => {
				setLoadingState(false);
			});
	};

	const handleSaveAIPreferences = () => {
		if (form.current.invalid) {
			return;
		}

		const payload = {
			...form.current.value,
			defaultMinTokens: +form.current.value.defaultMinTokens,
			defaultMaxTokens: +form.current.value.defaultMaxTokens,
		};

		setLoadingState(true);
		updateAIPreferences(payload)
			.then(() => {
				notification.success({
					message: `AI Preferences saved successfully!`,
				});
			})
			.catch((e) => {
				notification.error({
					message: `${'Error saving the preferences '} ${JSON.stringify(e)}`,
				});
			})
			.finally(() => {
				setLoadingState(false);
			});
	};

	useEffect(() => {
		if (isValidPlan(tier, featureAI, features.AI)) fetchAIPreferences();
	}, []);

	if (!ALLOWED_SLS.includes(backendImage) && compareVersion(appVersion, '8.12.0') === -1)
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
						flexDirection: 'column',
					}}
				>
					<Alert
						type="warning"
						message="Upgrade reactivesearch.io to v8.12.0 or above for using the ReactiveSearch AI Preferences feature"
						showIcon
						style={{ marginBottom: 10, height: 'max-content' }}
					/>
					<img
						style={{
							width: '90%',
						}}
						src="https://i.imgur.com/0UjCJ4z.gif"
						alt="ReactiveSearch AI Preferences"
					/>
				</div>
			</React.Fragment>
		);

	if (!ALLOWED_SLS.includes(backendImage) && !isValidPlan(tier, featureAI, features.AI)) {
		return (
			<React.Fragment>
				<Banner {...bannerDetails} onClick={() => window.open(bannerDetails.href)} />
				<Overlay
					style={{
						maxWidth: '70%',
					}}
					src="https://i.imgur.com/0UjCJ4z.gif"
					alt="ReactiveSearch AI Preferences"
				/>
			</React.Fragment>
		);
	}

	return (
		<ErrorToaster>
			<Header style={{ background: 'white', height: 'auto' }}>
				<div
					style={{
						padding: '25px 0px',
						margin: '0 auto',
					}}
				>
					<Row type="flex" justify="space-between" align="middle" gutter={16}>
						<Col lg={18}>
							<h2>AI Preferences</h2>
							<Row>
								<Col lg={18}>
									<p>
										ReactiveSearch uses OpenAI for providing AI Answer feature.
										You can configure preferences for this here.
									</p>
								</Col>
							</Row>
						</Col>
						<Col
							lg={6}
							css={{
								display: 'flex',
								flexDirection: 'column',
							}}
						>
							<Button
								style={{ marginTop: 10 }}
								type="primary"
								ghost
								size="large"
								rel="noopener noreferrer"
								onClick={() => window.open(bannerDetails.href)}
								icon={<InfoCircleOutlined />}
							>
								Read Docs
							</Button>
						</Col>
					</Row>
				</div>
			</Header>
			<Container css={AIpreferencesContainer}>
				<Spin spinning={loadingState || isAppsLoading}>
					<FieldGroup
						strict={false}
						control={form.current}
						render={() => {
							return (
								<Flex
									style={{
										gap: '2rem',
										flexWrap: 'wrap',
										flexDirection: 'column',
										marginBottom: '2rem',
									}}
								>
									<FieldControl
										strict={false}
										control={form.current.get('enable')}
										render={({ handler }) => (
											<Grid
												style={{ justifyContent: 'flex-start' }}
												gridRatio={0.4}
												label="Enable"
												toolTipMessage={
													<span>
														Whether AI answers should be enabled or not
													</span>
												}
												component={<Switch {...handler('checkbox')} />}
											/>
										)}
									/>
									<FieldControl
										strict={false}
										control={form.current.get('apiKey')}
										render={({ handler, hasError, touched }) => {
											return (
												<Grid
													gridRatio={0.4}
													label={
														<span>
															<span className="required-marker">
																*
															</span>
															OpenAI API key
														</span>
													}
													toolTipMessage={
														<span>OpenAI API key - secret</span>
													}
													component={
														<Flex
															flexDirection="column"
															alignItems="flex-start"
															style={{ width: '100%' }}
														>
															<Input.Password
																placeholder="Enter OpenAI API key - secret"
																{...handler()}
																iconRender={(visible) =>
																	visible ? (
																		<EyeTwoTone />
																	) : (
																		<EyeInvisibleOutlined />
																	)
																}
																style={{
																	...(hasError('required') &&
																		touched && {
																			borderColor: 'tomato',
																		}),
																	minWidth: '200px',
																}}
															/>
															<span className="error">
																{touched &&
																	hasError('required') &&
																	'OpenAI API key is required'}
															</span>
														</Flex>
													}
												/>
											);
										}}
									/>
									<FieldControl
										strict={false}
										control={form.current.get('defaultModel')}
										render={({ handler }) => (
											<Grid
												label="Default Model"
												gridRatio={0.4}
												toolTipMessage={
													<span>
														OpenAI model to use, defaults to{' '}
														<code>gpt-3.5-turbo</code>. This can also be
														passed at runtime.
													</span>
												}
												component={
													<Input
														placeholder="Enter default model"
														{...handler()}
													/>
												}
											/>
										)}
									/>
									<FieldControl
										strict={false}
										control={form.current.get('defaultMinTokens')}
										render={({ handler, hasError }) => (
											<Grid
												label="Default Min Tokens"
												gridRatio={0.4}
												toolTipMessage={
													<span>
														Minimum number of tokens to generate in the
														response. Whenever possible, max tokens is
														respected, however when the input context +
														max tokens combined exceed the model limit,
														the min tokens value is used to calibrate
														for an optimum output token. Defaults to{' '}
														<code>100</code>
													</span>
												}
												component={
													<Flex
														flexDirection="column"
														alignItems="flex-start"
														style={{ width: '100%' }}
													>
														<Input
															placeholder="Enter min tokens"
															type="number"
															min={1}
															{...handler('number')}
															style={{
																...(hasError(
																	'invalidMinTokenValue',
																) && {
																	borderColor: 'tomato',
																}),
															}}
														/>
														<span className="error">
															{hasError('invalidMinTokenValue') &&
																'Default min tokens should be less than or equal to default max tokens.'}
														</span>
													</Flex>
												}
											/>
										)}
									/>
									<FieldControl
										strict={false}
										control={form.current.get('defaultMaxTokens')}
										render={({ handler, hasError }) => (
											<Grid
												label="Default Max Tokens"
												gridRatio={0.4}
												toolTipMessage={
													<span>
														Maximum number of tokens to generate in the
														response. Defaults to <code>800</code>
													</span>
												}
												component={
													<Flex
														flexDirection="column"
														alignItems="flex-start"
														style={{ width: '100%' }}
													>
														<Input
															placeholder="Enter max tokens"
															type="number"
															min={
																form.current.get('defaultMinTokens')
																	.value
															}
															{...handler('number')}
															style={{
																...(hasError(
																	'invalidMaxTokenValue',
																) && {
																	borderColor: 'tomato',
																}),
															}}
														/>

														<span className="error">
															{hasError('invalidMaxTokenValue') &&
																'Default max tokens should be greater than or equal to default min tokens.'}
														</span>
													</Flex>
												}
											/>
										)}
									/>
									<FieldControl
										strict={false}
										control={form.current.get('defaultSystemPrompt')}
										render={({ handler }) => (
											<Grid
												gridRatio={0.4}
												label="Default System Prompt"
												toolTipMessage={
													<span>
														Set the role of the AIAnswer for your
														use-case. Defaults to &quot;You&apos;re a
														helpful assistant&quot;
													</span>
												}
												component={
													<Input
														placeholder="Enter default system prompt"
														{...handler()}
													/>
												}
											/>
										)}
									/>
									<FieldControl
										strict={false}
										control={form.current.get('enabledIndexes')}
										render={({ handler }) => {
											return (
												<Grid
													gridRatio={0.4}
													label="Enabled Indices"
													toolTipMessage={
														<span>
															Enumerate indexes for which AI answers
															are set. Defaults to not being enabled
															on any index.
														</span>
													}
													component={
														<IndexDropdown
															allowAllIndex={false}
															selectedIndexes={handler().value}
															{...handler()}
														/>
													}
												/>
											);
										}}
									/>
								</Flex>
							);
						}}
					/>
					<Button
						disabled={isAppsLoading || loadingState}
						type="primary"
						onClick={handleSaveAIPreferences}
						style={{
							float: 'right',
						}}
					>
						Save Preferences
					</Button>
				</Spin>
			</Container>
		</ErrorToaster>
	);
};

AIPreferences.propTypes = {
	tier: allowedTiers,
	appVersion: PropTypes.string,
	history: PropTypes.object,
	backendImage: PropTypes.string.isRequired,
	isAppsLoading: PropTypes.bool.isRequired,
	featureAI: PropTypes.bool.isRequired,
};

AIPreferences.defaultProps = {
	tier: undefined,
	appVersion: undefined,
	history: {},
};

const mapStateToProps = (state) => ({
	tier: get(state, '$getAppPlan.results.tier'),
	appVersion: get(state, '$getAppPlan.results.version'),
	backendImage: get(state, '$getAppPlan.results.image_type') ?? '',
	isAppsLoading: get(state, 'apps.isFetching'),
	featureAI: get(state, '$getAppPlan.results.feature_openai', false),
});

const mapDispatchToProps = () => ({});

export default withErrorToaster(connect(mapStateToProps, mapDispatchToProps)(AIPreferences));
