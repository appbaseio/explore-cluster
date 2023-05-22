import React from 'react';
import PropTypes from 'prop-types';
import { css } from 'emotion';
import { CaretRightOutlined, LockOutlined, SettingOutlined } from '@ant-design/icons';
import { Modal, Input, Radio, Tooltip, Button, Select, Switch, Collapse, Row, Col } from 'antd';
import {
	FieldArray,
	FormBuilder,
	FormArray,
	Validators,
	FieldGroup,
	FieldControl,
	FormControl,
	FormGroup,
} from 'react-reactive-form';
import { connect } from 'react-redux';
import get from 'lodash/get';
import result from 'lodash/result';
import find from 'lodash/find';
import styles from './styles';
import Flex from '../../batteries/components/shared/Flex';
import Loader from '../../batteries/components/shared/Loader/Spinner';
import { displayErrors } from '../../utils/helper';
import { getPermission } from '../../batteries/modules/actions/permission';
import Grid from './Grid';
import { getAppMappings, getPipelines } from '../../batteries/modules/actions';
import { getMessages, hoverMessage } from '../../utils/messages';
import {
	getTraversedMappingsByAppName,
	getAppPermissionsByName,
} from '../../batteries/modules/selectors';
import { BACKENDS, CLUSTER_PLANS } from '../../batteries/utils';
import {
	Types,
	getDefaultAclOptionsByVersion,
	isNegative,
	isNegativeTTL,
	isZero,
	mapFormToValues,
	mapValuesToForm,
	getAllowedActionsByVersion,
	defaultRateLimits,
	defaultTagValues,
	shouldHavePipelines,
	shouldHaveIndices,
	shouldHaveFieldsFiltering,
} from './utils';
import Acl from './Acl';
import WhiteList from './WhiteList';
import PasswordInput from './PasswordInput';
import { ALLOWED_ACTIONS_LABELS, ALLOWED_SLS } from '../../constants';
import SwitchGroup from '../SwitchGroup';
import RsApiRestrictions from './RsApiRestrictions';
import { versionCompare } from '../../batteries/utils/helpers';
import { PipelineTags } from './PipelineTags';

const { Option } = Select;

const modal = css`
	.ant-modal-content {
		width: 100%;
	}
	.input-error {
		border-color: tomato;
	}
`;
const calculateValue = (value) => {
	const index = value.indexOf('*');
	if (index > -1) {
		if (index === 0 && value.length !== 1) {
			value.splice(index, 1);
			return value;
		}
		return ['*'];
	}
	return value;
};

class CreateCredentials extends React.Component {
	constructor(props) {
		super(props);

		this.isApp = !window.location.pathname.startsWith(
			props.isUserManagement ? '/cluster/user-management' : '/cluster/credentials',
		);
		this.state = {
			filteredMappings: {},
		};
		const { backendImage, backend } = props;

		this.allowStoredQuery = versionCompare(props.appbaseVersion, '7.52.0') !== -1;

		const pipelines = shouldHavePipelines(backendImage) ? [['*']] : undefined;
		let indices = this.isApp
			? [{ value: [props.appName], disabled: false }]
			: [{ value: ['*'], disabled: false }];
		indices = shouldHaveIndices(backendImage) ? indices : undefined;

		this.form = props.isUserManagement
			? FormBuilder.group({
					username: ['', Validators.required],
					password: ['', Validators.required],
					email: [undefined, Validators.email],
					isAdmin: [false],
					indices: this.isApp
						? [{ value: [props.appName], disabled: false }]
						: [{ value: ['*'], disabled: false }],
					allowedActions: [[], Validators.required],
					...(this.allowStoredQuery
						? {
								sources: [{ value: ['0.0.0.0/0'], disabled: false }],
								sources_xff_value: [
									{ value: undefined, disabled: false },
									[isNegative, isZero],
								],
						  }
						: null),
			  })
			: FormBuilder.group({
					description: '',
					operationType: [Types.read, Validators.required],
					categories: new FormArray(
						getDefaultAclOptionsByVersion(props.appbaseVersion).map(
							(acl) =>
								new FormGroup({
									acl: new FormControl(acl),
									tag: new FormControl(defaultTagValues[acl]),
									rateLimit: new FormControl(defaultRateLimits[acl], [
										Validators.min(1),
									]),
								}),
						),
					),
					referers: [{ value: ['*'], disabled: false }],
					sources: [{ value: ['0.0.0.0/0'], disabled: false }],
					sources_xff_value: [
						{ value: undefined, disabled: false },
						[isNegative, isZero],
					],
					rsApiRestrictions: new FormGroup({
						maxQuerySize: new FormControl(undefined, [
							Validators.min(0),
							Validators.max(10000),
						]),
						maxAggregationSize: new FormControl(undefined, [
							Validators.min(0),
							Validators.max(100000),
						]),
						allowDirectDSL: new FormControl(true),
					}),
					indices,
					pipelines,
					ip_limit: [
						{ value: 7200, disabled: !props.isPaidUser },
						[Validators.required, isNegative],
					],
					ttl: [
						{ value: -1, disabled: !props.isPaidUser },
						[Validators.required, isNegativeTTL],
					],
					...(shouldHaveFieldsFiltering(backendImage, backend)
						? {
								include_fields: [['*']],
								exclude_fields: [{ value: [], disabled: true }],
						  }
						: {}),
			  });

		this.initialFormValues = this.form.value;
	}

	componentDidMount() {
		const {
			disabled,
			initialValues,
			isUserManagement,
			appbaseCredentials,
			appbaseVersion,
			backend,
			mappings,
			backendImage,
			pipelines,
			fetchPipelines,
		} = this.props;
		if (appbaseCredentials) {
			this.getMappings();
		}
		const indicesHandler = this.form.get('indices');
		if (!this.isApp) {
			indicesHandler.valueChanges.subscribe((indices) => {
				this.setState({
					filteredMappings: this.getFilteredMappings(mappings, indices),
				});
			});
		}
		if (disabled) {
			this.form.disable();
		} else {
			const adminHandler = this.form.get('isAdmin');
			const allowedActionsHandler = this.form.get('allowedActions');
			if (adminHandler) {
				adminHandler.valueChanges.subscribe((value) => {
					if (value) {
						if (allowedActionsHandler) {
							allowedActionsHandler.setValue(
								Object.values(getAllowedActionsByVersion(appbaseVersion, backend)),
							);
							allowedActionsHandler.disable();
						}
					} else if (allowedActionsHandler) {
						allowedActionsHandler.setValue([]);
						allowedActionsHandler.enable();
					}
				});
			}
			if (!isUserManagement && shouldHaveFieldsFiltering(backendImage, backend)) {
				const includeFieldsHandler = this.form.get('include_fields');
				const excludeFieldsHandler = this.form.get('exclude_fields');
				includeFieldsHandler.valueChanges.subscribe((value) => {
					if (value && value.includes('*')) {
						excludeFieldsHandler.disable({ emitEvent: false });
						excludeFieldsHandler.reset([]);
					} else {
						excludeFieldsHandler.enable({ emitEvent: false });
					}
				});
				excludeFieldsHandler.valueChanges.subscribe((value) => {
					if (value && value.includes('*')) {
						includeFieldsHandler.disable({ emitEvent: false });
						includeFieldsHandler.reset([]);
					} else {
						includeFieldsHandler.enable({ emitEvent: false });
					}
				});
			}
		}
		if (initialValues) {
			this.form.patchValue(
				mapValuesToForm(
					JSON.parse(JSON.stringify(initialValues)),
					!isUserManagement,
					appbaseVersion,
					backendImage,
				),
				{
					emitEvent: !isUserManagement,
				},
			);
			// Disable the password handler to avoid re-setting the password in patch request
			if (isUserManagement) {
				const passwordHandler = this.form.get('password');
				passwordHandler.disable();
			}

			if (get(initialValues, 'is_admin')) {
				const allowedActionsHandler = this.form.get('allowedActions');
				if (allowedActionsHandler) {
					allowedActionsHandler.disable();
				}
				if (indicesHandler) {
					indicesHandler.disable();
				}
			}
		}
		// If pipelines not fetched before
		if (!(pipelines && pipelines.length)) {
			fetchPipelines();
		}
	}

	componentDidUpdate(prevProps) {
		const { errors, mappings, initialValues, isUserManagement, appbaseVersion } = this.props;

		displayErrors(errors, prevProps.errors);
		if (!this.isApp && mappings !== prevProps.mappings) {
			const indices = this.form.get('indices') ? this.form.get('indices').value : [];
			// eslint-disable-next-line
			this.setState({
				filteredMappings: this.getFilteredMappings(mappings, indices),
			});
		}

		if (initialValues && initialValues !== prevProps.initialValues) {
			this.form.patchValue(
				mapValuesToForm(
					JSON.parse(JSON.stringify(initialValues)),
					!isUserManagement,
					appbaseVersion,
				),
				{
					emitEvent: !isUserManagement,
				},
			);
			// Disable the password handler to avoid re-setting the password in patch request
			if (isUserManagement) {
				const passwordHandler = this.form.get('password');
				passwordHandler.disable();
			}

			if (get(initialValues, 'is_admin')) {
				const allowedActionsHandler = this.form.get('allowedActions');
				const indicesHandler = this.form.get('indices');
				if (allowedActionsHandler) {
					allowedActionsHandler.disable();
				}
				if (indicesHandler) {
					indicesHandler.disable();
				}
			}
		} else if (!initialValues) {
			this.form.patchValue(
				mapValuesToForm(
					JSON.parse(JSON.stringify(this.initialFormValues)),
					!isUserManagement,
					appbaseVersion,
				),
				{
					emitEvent: !isUserManagement,
				},
			);
		}
	}

	componentWillUnmount() {
		const indicesHandler = this.form.get('indices');
		const adminHandler = this.form.get('isAdmin');
		const categoriesHandler = this.form.get('categories');
		const rsApiRestrictionsHandler = this.form.get('rsApiRestrictions');
		const includeFieldsHandler = this.form.get('include_fields');
		const excludeFieldsHandler = this.form.get('exclude_fields');
		if (indicesHandler) {
			indicesHandler.valueChanges.unsubscribe();
		}
		if (adminHandler) {
			adminHandler.valueChanges.unsubscribe();
		}
		if (includeFieldsHandler) {
			includeFieldsHandler.valueChanges.unsubscribe();
		}
		if (excludeFieldsHandler) {
			excludeFieldsHandler.valueChanges.unsubscribe();
		}
		if (categoriesHandler) {
			categoriesHandler.valueChanges.unsubscribe();
		}
		if (rsApiRestrictionsHandler) {
			rsApiRestrictionsHandler.valueChanges.unsubscribe();
		}
	}

	getFilteredMappings = (mappings = {}, indices) => {
		const filteredMappings = {};
		if (Array.isArray(mappings)) {
			return filteredMappings;
		}
		if (indices && Array.isArray(indices)) {
			const compliedIndices = [];
			indices.forEach((index) => {
				Object.keys(mappings).forEach((originalIndex) => {
					if (
						originalIndex.match(new RegExp(index.replace('*', '.*'))) &&
						!originalIndex.startsWith('metricbeat')
					) {
						compliedIndices.push(originalIndex);
					}
				});
			});
			compliedIndices.forEach((index) => {
				filteredMappings[index] = mappings[index].filter((field) => !field.includes('.'));
			});
			return filteredMappings;
		}
		return mappings;
	};

	getMappings() {
		const { appName, fetchMappings, appbaseCredentials, backend, isUIBuilder } = this.props;
		if (appbaseCredentials && backend !== BACKENDS.FUSION.name) {
			// Fetch Mappings if permissions are present
			if (!isUIBuilder) fetchMappings(appName, appbaseCredentials);
			else if (appName) fetchMappings(appName, appbaseCredentials);
		}
	}

	get getText() {
		const { titleText } = this.props;
		return titleText || (this.isEditing ? 'Edit credential' : 'Create a new credential');
	}

	get isEditing() {
		const { initialValues } = this.props;
		return !!initialValues;
	}

	handleSubmit = () => {
		const { onSubmit, isUserManagement, appbaseVersion } = this.props;
		this.form.mappedValues = JSON.parse(
			JSON.stringify(mapFormToValues(this.form.value, !isUserManagement, appbaseVersion)),
		);

		onSubmit(this.form, get(this.props, 'initialValues.username'));
	};

	shouldRenderRsApiRestrictions = () => {
		const { appbaseVersion } = this.props;
		return (
			result(
				find(this.form.get('categories').value, (obj) => {
					return obj.acl === 'reactivesearch';
				}),
				'tag',
			) && versionCompare(appbaseVersion, '7.48.1') !== -1
		);
	};

	render() {
		const {
			show,
			handleCancel,
			isPaidUser,
			isSubmitting,
			disabled,
			saveButtonText,
			isLoadingMappings,
			isUserManagement,
			indices,
			arcPlan,
			mappings: rawMappings,
			appbaseVersion,
			readOnly,
			backend,
			backendImage,
			pipelines,
		} = this.props;
		const mappings = Array.isArray(rawMappings) ? rawMappings : [];
		const { filteredMappings } = this.state;
		const Messages = getMessages(isUserManagement);
		const isClusterPlan = Object.values(CLUSTER_PLANS).includes(arcPlan);
		const allowedActions = getAllowedActionsByVersion(appbaseVersion, backend);

		// don't show downtime alerts in case of hosted / self hosted arc
		const actionOptions = (
			isClusterPlan
				? Object.values(allowedActions).map((i) => ({
						value: i,
						label: ALLOWED_ACTIONS_LABELS[i],
				  }))
				: Object.values(allowedActions)
						.filter((i) => i !== allowedActions.DOWNTIME_ALERTS)
						.map((i) => ({ value: i, label: ALLOWED_ACTIONS_LABELS[i] }))
		).filter((i) => i.value !== 'overview');
		return (
			<FieldGroup
				strict={false}
				control={this.form}
				render={({ invalid, pristine }) => (
					<Modal
						style={{
							width: '600px',
						}}
						title={this.getText}
						className={modal}
						footer={
							!disabled
								? [
										<Button key="back" onClick={handleCancel}>
											Cancel
										</Button>,
										<Button
											loading={isSubmitting}
											disabled={invalid || pristine}
											key="submit"
											type="primary"
											onClick={this.handleSubmit}
										>
											{saveButtonText ||
												(this.isEditing ? 'Save' : 'Generate')}
										</Button>,
								  ]
								: [
										<Button key="back" onClick={handleCancel}>
											Cancel
										</Button>,
								  ]
						}
						open={show}
						onCancel={handleCancel}
						width="750px"
					>
						{isLoadingMappings ? (
							<Loader style={{ marginTop: '-100px', marginBottom: '120px' }} />
						) : (
							<React.Fragment>
								<fieldset style={{ border: 0 }} disabled={readOnly}>
									<div style={{ position: 'relative' }}>
										{isUserManagement && (
											<React.Fragment>
												<FieldControl
													strict={false}
													control={this.form.get('username')}
													render={({ handler }) => (
														<Grid
															label="Username"
															toolTipMessage={Messages.username}
															component={
																<Input
																	autoFocus={!this.isEditing}
																	placeholder="Enter username"
																	{...handler()}
																/>
															}
														/>
													)}
												/>
												<FieldControl
													strict={false}
													control={this.form.get('password')}
													render={({ handler }) => (
														<Grid
															label="Password"
															toolTipMessage={Messages.password}
															component={
																<PasswordInput
																	placeholder="Enter password"
																	{...handler()}
																	control={this.form.get(
																		'password',
																	)}
																	isEditing={this.isEditing}
																/>
															}
														/>
													)}
												/>
												<FieldControl
													strict={false}
													control={this.form.get('email')}
													render={({ handler }) => (
														<Grid
															label="Email"
															toolTipMessage={Messages.email}
															component={
																<Input
																	placeholder="Enter email"
																	{...handler()}
																/>
															}
														/>
													)}
												/>
												<FieldControl
													strict={false}
													control={this.form.get('isAdmin')}
													render={({ handler }) => (
														<Grid
															label="Admin"
															toolTipMessage={Messages.admin}
															component={
																<Switch {...handler('checkbox')} />
															}
														/>
													)}
												/>

												<FieldControl
													strict={false}
													control={this.form.get('allowedActions')}
													render={({ handler }) => (
														<Grid
															label="Scopes"
															toolTipMessage={Messages.allowedActions}
															component={
																<SwitchGroup
																	options={actionOptions}
																	{...handler()}
																/>
															}
														/>
													)}
												/>
											</React.Fragment>
										)}
										{!isUserManagement && (
											<FieldControl
												strict={false}
												name="description"
												render={({ handler }) => (
													<Grid
														label="Description"
														toolTipMessage={Messages.description}
														component={
															<Input
																autoFocus={
																	!isUserManagement &&
																	!this.isEditing
																}
																placeholder="Add an optional description for this credential"
																{...handler()}
															/>
														}
													/>
												)}
											/>
										)}
										{!isUserManagement && (
											<FieldControl
												name="operationType"
												render={({ handler }) => (
													<Grid
														label="Access Type"
														toolTipMessage={Messages.operationType}
														component={
															<Radio.Group
																{...handler()}
																className="label { font-weight: 100 }"
															>
																{Object.keys(Types).map((type) => (
																	<Radio
																		key={type}
																		value={Types[type]}
																	>
																		{Types[type].description}
																	</Radio>
																))}
															</Radio.Group>
														}
													/>
												)}
											/>
										)}
										{!isPaidUser && (
											<div className={styles.overlay}>
												<div className={styles.upgradePlan}>
													<div style={{ marginBottom: 20 }}>
														<LockOutlined style={{ fontSize: 40 }} />
													</div>
													Upgrade to a paid plan to add advanced security
													permissions.
													<Tooltip
														overlay={hoverMessage}
														mouseLeaveDelay={0}
													>
														<i className="fas fa-info-circle" />
													</Tooltip>
													<Button
														type="primary"
														href="billing"
														target="_blank"
														style={{
															marginTop: 20,
														}}
													>
														Upgrade Now
													</Button>
												</div>
											</div>
										)}
										{!isUserManagement && (
											<FieldArray
												name="categories"
												render={(control) => (
													<Grid
														label="Categories"
														toolTipMessage={Messages.categories}
														component={
															<Acl
																control={control}
																isRateLimitPresent={
																	!isUserManagement
																}
															/>
														}
													/>
												)}
											/>
										)}
										<Collapse
											bordered={false}
											expandIcon={({ isActive }) => (
												<CaretRightOutlined
													style={{ marginTop: '10px', display: 'block' }}
													rotate={isActive ? 90 : 0}
												/>
											)}
										>
											<Collapse.Panel
												header={
													<Button type="link" icon={<SettingOutlined />}>
														Advanced Settings
													</Button>
												}
												style={{ border: 0 }}
												key="1"
											>
												<>
													{(!isUserManagement ||
														this.allowStoredQuery) && (
														<>
															{!isUserManagement && (
																<Grid
																	label="Security"
																	toolTipMessage={
																		Messages.security
																	}
																/>
															)}
															{!isUserManagement && (
																<FieldControl
																	name="referers"
																	render={(control) => (
																		<WhiteList
																			toolTipMessage={
																				Messages.referers
																			}
																			control={control}
																			type="dropdown"
																			defaultSuggestionValue="https://example.com/"
																			label="HTTP Referers"
																			defaultValue="*"
																			handleWarningMessage={(
																				defaultValue,
																			) =>
																				`Warning! You don't have the Allow All Referers (${defaultValue}) set.`
																			}
																			inputProps={{
																				placeholder:
																					'Add a HTTP Referer',
																			}}
																			labelClassName={
																				isUserManagement
																					? ''
																					: styles.subHeader
																			}
																		/>
																	)}
																/>
															)}
															<FieldControl
																name="sources"
																render={(control) => (
																	<WhiteList
																		control={control}
																		toolTipMessage={
																			Messages.sources
																		}
																		label="IP Sources"
																		handleWarningMessage={(
																			defaultValue,
																		) =>
																			`Warning! You don't have the Allow All IP sources (${defaultValue}) set.`
																		}
																		defaultValue="0.0.0.0/0"
																		inputProps={{
																			placeholder:
																				'Add an IP Source in CIDR format',
																		}}
																		labelClassName={
																			isUserManagement
																				? ''
																				: styles.subHeader
																		}
																	/>
																)}
															/>
															<FieldControl
																name="sources_xff_value"
																render={({ handler, hasError }) => {
																	const inputHandler = handler();
																	return (
																		<Grid
																			label={
																				<span
																					className={
																						isUserManagement
																							? ''
																							: styles.subHeader
																					}
																				>
																					IP Source Depth
																				</span>
																			}
																			toolTipMessage={
																				Messages.sourcesXFFValue
																			}
																			component={
																				<div>
																					<Input
																						type="number"
																						placeholder="Enter a positive depth value"
																						{...inputHandler}
																						value={
																							inputHandler.value
																								? inputHandler.value
																								: ''
																						}
																						min={1}
																					/>
																					{hasError(
																						'isNegative',
																					) && (
																						<div
																							className={
																								styles.error
																							}
																						>
																							IP
																							Source
																							Depth
																							value
																							can&apos;t
																							be
																							negative.
																						</div>
																					)}
																					{hasError(
																						'isZero',
																					) && (
																						<div
																							className={
																								styles.error
																							}
																						>
																							IP
																							Source
																							Depth
																							value
																							should
																							be
																							greater
																							than
																							zero.
																						</div>
																					)}
																				</div>
																			}
																		/>
																	);
																}}
															/>

															{!isUserManagement && (
																<React.Fragment>
																	{this.isApp ||
																	ALLOWED_SLS.includes(
																		backendImage,
																	) ? null : (
																		<FieldControl
																			strict={false}
																			name="indices"
																			render={({
																				handler,
																			}) => {
																				const inputHandler =
																					handler();
																				const { value } =
																					this.form.get(
																						'indices',
																					);
																				return (
																					<Grid
																						label="Indices"
																						toolTipMessage={
																							Messages.indices
																						}
																						component={
																							<Select
																								placeholder="Select indices"
																								mode="tags"
																								style={{
																									width: '100%',
																								}}
																								tokenSeparators={[
																									',',
																								]}
																								value={
																									value
																								}
																								{...inputHandler}
																								onChange={(
																									val,
																								) => {
																									inputHandler.onChange(
																										calculateValue(
																											val,
																										),
																									);
																								}}
																							>
																								<Option key="*">
																									*
																									(Include
																									all
																									indices)
																								</Option>
																								{(
																									indices ||
																									[]
																								)
																									.filter(
																										(
																											i,
																										) =>
																											!i.startsWith(
																												'.',
																											) &&
																											!i.startsWith(
																												'metricbeat',
																											),
																									)
																									.map(
																										(
																											index,
																										) => (
																											<Select.Option
																												key={
																													index
																												}
																											>
																												{
																													index
																												}
																											</Select.Option>
																										),
																									)}
																							</Select>
																						}
																					/>
																				);
																			}}
																		/>
																	)}
																	{backendImage ===
																	ALLOWED_SLS.includes(
																		backendImage,
																	) ? (
																		<FieldControl
																			strict={false}
																			name="pipelines"
																			render={({
																				handler,
																				value,
																			}) => {
																				const inputHandler =
																					handler();
																				return (
																					<Grid
																						label="Pipelines"
																						toolTipMessage={
																							Messages.pipelines
																						}
																						component={
																							<Select
																								placeholder="Select pipelines"
																								mode="tags"
																								style={{
																									width: '100%',
																								}}
																								tokenSeparators={[
																									',',
																								]}
																								tagRender={
																									PipelineTags
																								}
																								{...inputHandler}
																								value={
																									value
																								}
																								onChange={(
																									val,
																								) => {
																									inputHandler.onChange(
																										calculateValue(
																											val,
																										),
																									);
																								}}
																							>
																								<Option key="*">
																									*
																									(Include
																									all
																									pipelines)
																								</Option>
																								{(
																									pipelines ||
																									[]
																								).map(
																									(
																										pipeline,
																									) => (
																										<Select.Option
																											key={
																												pipeline.id
																											}
																											style={{
																												borderBottom:
																													'1px solid gray',
																											}}
																										>
																											<Row
																												style={{
																													padding: 15,
																												}}
																											>
																												<Col>
																													<h4
																														style={{
																															textOverflow:
																																'ellipsis',
																															overflow:
																																'hidden',
																															display:
																																'block',
																															fontSize:
																																'1rem',
																														}}
																													>
																														<Tooltip
																															title={
																																pipeline.id
																															}
																														>
																															{
																																pipeline.id
																															}
																														</Tooltip>
																													</h4>

																													<p
																														style={{
																															textOverflow:
																																'ellipsis',
																															overflow:
																																'hidden',
																															display:
																																'block',
																														}}
																													>
																														{
																															pipeline.description
																														}
																													</p>
																												</Col>
																												<Col
																													md={
																														8
																													}
																												>
																													<div>
																														{pipeline &&
																															pipeline.routes &&
																															pipeline.routes.map(
																																({
																																	path,
																																	method,
																																}) => (
																																	<span>
																																		<b>
																																			{
																																				method
																																			}{' '}
																																			&nbsp;
																																		</b>
																																		<code
																																			key={
																																				path
																																			}
																																		>
																																			{
																																				path
																																			}
																																		</code>
																																		<br />
																																	</span>
																																),
																															)}
																													</div>
																												</Col>
																											</Row>
																										</Select.Option>
																									),
																								)}
																							</Select>
																						}
																					/>
																				);
																			}}
																		/>
																	) : null}

																	{this.shouldRenderRsApiRestrictions() && (
																		<>
																			<Grid
																				label={
																					<b>
																						ReactiveSearch
																						API
																						Restrictions
																					</b>
																				}
																				gridRatio={1}
																				toolTipMessage={
																					Messages.rsApiRestrictions
																				}
																			/>
																			<RsApiRestrictions
																				control={this.form.get(
																					'rsApiRestrictions',
																				)}
																				Messages={Messages}
																			/>
																		</>
																	)}

																	{shouldHaveFieldsFiltering(
																		backendImage,
																		backend,
																	) ? (
																		<>
																			<Grid
																				label="Fields Filtering"
																				toolTipMessage={
																					Messages.fieldFiltering
																				}
																			/>
																			<FieldControl
																				strict={false}
																				name="include_fields"
																				render={({
																					handler,
																				}) => {
																					const inputHandler =
																						handler();
																					const excludedFields =
																						this.form.get(
																							'exclude_fields',
																						).value;
																					const uniqueMappings =
																						{};
																					return (
																						<Grid
																							label={
																								<span
																									className={
																										styles.subHeader
																									}
																								>
																									Include
																								</span>
																							}
																							toolTipMessage={
																								Messages.include
																							}
																							component={
																								<Select
																									placeholder="Select field value"
																									mode="multiple"
																									notFoundContent={
																										null
																									}
																									style={{
																										width: '100%',
																									}}
																									tokenSeparators={[
																										',',
																									]}
																									{...inputHandler}
																									value={
																										inputHandler.value ||
																										[]
																									}
																									onChange={(
																										value,
																									) => {
																										inputHandler.onChange(
																											calculateValue(
																												value,
																											),
																										);
																									}}
																								>
																									<Option key="*">
																										*
																										(Include
																										all
																										fields)
																									</Option>
																									{this
																										.isApp
																										? mappings.map(
																												(
																													v,
																												) => {
																													if (
																														!(
																															excludedFields ||
																															[]
																														).includes(
																															v,
																														)
																													) {
																														return (
																															<Option
																																key={
																																	v
																																}
																																title={
																																	v
																																}
																															>
																																{
																																	v
																																}
																															</Option>
																														);
																													}
																													return null;
																												},
																										  )
																										: Object.keys(
																												filteredMappings,
																										  ).map(
																												(
																													i,
																												) =>
																													filteredMappings[
																														i
																													].map(
																														(
																															v,
																														) => {
																															// duplicate keys cause re-rendering issues
																															if (
																																uniqueMappings[
																																	v
																																]
																															) {
																																return null;
																															}
																															uniqueMappings[
																																v
																															] = true;
																															if (
																																!(
																																	excludedFields ||
																																	[]
																																).includes(
																																	v,
																																)
																															) {
																																return (
																																	<Option
																																		key={
																																			v
																																		}
																																		value={
																																			v
																																		}
																																		title={
																																			v
																																		}
																																	>
																																		{
																																			v
																																		}
																																		<span
																																			className={
																																				styles.fieldBadge
																																			}
																																		>
																																			{
																																				i
																																			}
																																		</span>
																																	</Option>
																																);
																															}
																															return null;
																														},
																													),
																										  )}
																								</Select>
																							}
																						/>
																					);
																				}}
																			/>
																			<FieldControl
																				strict={false}
																				name="exclude_fields"
																				render={({
																					handler,
																				}) => {
																					const inputHandler =
																						handler();
																					const includedFields =
																						this.form.get(
																							'include_fields',
																						).value;
																					const uniqueMappings =
																						{};
																					return (
																						<Grid
																							label={
																								<span
																									className={
																										styles.subHeader
																									}
																								>
																									Exclude
																								</span>
																							}
																							toolTipMessage={
																								Messages.exclude
																							}
																							component={
																								<Select
																									placeholder="Select field value"
																									mode="multiple"
																									notFoundContent={
																										null
																									}
																									style={{
																										width: '100%',
																									}}
																									{...inputHandler}
																									value={
																										inputHandler.value ||
																										[]
																									}
																									onChange={(
																										value,
																									) => {
																										inputHandler.onChange(
																											calculateValue(
																												value,
																											),
																										);
																									}}
																								>
																									<Option key="*">
																										*
																										(Exclude
																										all
																										fields)
																									</Option>
																									{this
																										.isApp
																										? mappings.map(
																												(
																													v,
																												) => {
																													if (
																														!(
																															includedFields ||
																															[]
																														).includes(
																															v,
																														)
																													) {
																														return (
																															<Option
																																key={
																																	v
																																}
																																title={
																																	v
																																}
																															>
																																{
																																	v
																																}
																															</Option>
																														);
																													}
																													return null;
																												},
																										  )
																										: Object.keys(
																												filteredMappings,
																										  ).map(
																												(
																													i,
																												) =>
																													filteredMappings[
																														i
																													].map(
																														(
																															v,
																														) => {
																															// duplicate keys cause re-rendering issues
																															if (
																																uniqueMappings[
																																	v
																																]
																															) {
																																return null;
																															}
																															uniqueMappings[
																																v
																															] = true;
																															if (
																																!(
																																	includedFields ||
																																	[]
																																).includes(
																																	v,
																																)
																															) {
																																return (
																																	<Option
																																		key={
																																			v
																																		}
																																		title={
																																			v
																																		}
																																	>
																																		{
																																			v
																																		}
																																		<span
																																			className={
																																				styles.fieldBadge
																																			}
																																		>
																																			{
																																				i
																																			}
																																		</span>
																																	</Option>
																																);
																															}
																															return null;
																														},
																													),
																										  )}
																								</Select>
																							}
																						/>
																					);
																				}}
																			/>
																		</>
																	) : null}
																	<FieldControl
																		name="ip_limit"
																		render={({
																			handler,
																			hasError,
																		}) => (
																			<Grid
																				label="Max API calls/IP/hour"
																				toolTipMessage={
																					Messages.ipLimit
																				}
																				component={
																					<Flex
																						justifyContent="center"
																						alignItems="center"
																					>
																						<Input
																							type="number"
																							style={{
																								border: '1px solid  #9195A2 !important',
																								width: 120,
																							}}
																							{...handler()}
																						/>
																						{hasError(
																							'isNegative',
																						) && (
																							<span
																								style={{
																									color: 'red',
																									marginLeft: 10,
																								}}
																							>
																								Field
																								value
																								can&apos;t
																								be
																								negative.
																							</span>
																						)}
																					</Flex>
																				}
																			/>
																		)}
																	/>
																	<FieldControl
																		name="ttl"
																		render={({
																			handler,
																			hasError,
																		}) => (
																			<Grid
																				label="TTL"
																				toolTipMessage={
																					Messages.ttl
																				}
																				component={
																					<Flex
																						justifyContent="center"
																						alignItems="center"
																					>
																						<Input
																							type="number"
																							min="0"
																							style={{
																								border: '1px solid  #9195A2 !important',
																								width: 120,
																							}}
																							{...handler()}
																						/>
																						{hasError(
																							'isNegative',
																						) && (
																							<span
																								style={{
																									color: 'red',
																									marginLeft: 10,
																								}}
																							>
																								Field
																								value
																								can&apos;t
																								be
																								negative.
																							</span>
																						)}
																					</Flex>
																				}
																			/>
																		)}
																	/>
																</React.Fragment>
															)}
														</>
													)}
												</>
											</Collapse.Panel>
										</Collapse>
									</div>
								</fieldset>
							</React.Fragment>
						)}
					</Modal>
				)}
			/>
		);
	}
}
CreateCredentials.defaultProps = {
	show: false,
	isSubmitting: false,
	isPaidUser: false,
	initialValues: undefined,
	disabled: false,
	saveButtonText: undefined,
	permissions: undefined,
	titleText: undefined,
	isUserManagement: false,
	mappings: [],
	indices: [],
	readOnly: false,
	backend: BACKENDS.ELASTICSEARCH.name,
	onSubmit: () => {},
	backendImage: '',
	isUIBuilder: false,
};
CreateCredentials.propTypes = {
	isPaidUser: PropTypes.bool,
	isSubmitting: PropTypes.bool,
	show: PropTypes.bool,
	onSubmit: PropTypes.func,
	fetchPermissions: PropTypes.func.isRequired,
	initialValues: PropTypes.shape({
		description: PropTypes.string,
		read: PropTypes.bool,
		write: PropTypes.bool,
		operationType: PropTypes.object,
		categories: PropTypes.arrayOf(PropTypes.string),
		sources: PropTypes.arrayOf(PropTypes.string),
		include_fields: PropTypes.arrayOf(PropTypes.string),
		ip_limit: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
		ttl: PropTypes.number,
		meta: PropTypes.object,
	}),
	isPermissionPresent: PropTypes.bool.isRequired,
	appName: PropTypes.string, // eslint-disable-line
	handleCancel: PropTypes.func.isRequired,
	isLoadingMappings: PropTypes.bool.isRequired,
	disabled: PropTypes.bool,
	permissions: PropTypes.array,
	saveButtonText: PropTypes.string,
	errors: PropTypes.array.isRequired,
	plan: PropTypes.oneOf(['free', 'growth', 'bootstrap']).isRequired,
	pipelines: PropTypes.array.isRequired,
	titleText: PropTypes.string,
	isUserManagement: PropTypes.bool,
	appbaseCredentials: PropTypes.string.isRequired,
	fetchMappings: PropTypes.func.isRequired,
	mappings: PropTypes.oneOfType([
		PropTypes.array,
		PropTypes.object, // at cluster level
	]),
	indices: PropTypes.array,
	arcPlan: PropTypes.string.isRequired,
	appbaseVersion: PropTypes.string.isRequired,
	readOnly: PropTypes.bool,
	backend: PropTypes.string,
	backendImage: PropTypes.string,
	fetchPipelines: PropTypes.func.isRequired,
	isUIBuilder: PropTypes.bool,
};

const mapStateToProps = (state) => {
	const mappings = getTraversedMappingsByAppName(state);
	const appPermissions = getAppPermissionsByName(state);
	const { username, password } = get(state, 'user.data', {});
	const indices = get(state, 'apps.data');

	return {
		appbaseCredentials: username ? `${username}:${password}` : null,
		isPaidUser: true,
		appName: get(state, '$getCurrentApp.name'),
		mappings,
		appbaseVersion: get(state, '$getAppPlan.results.version'),
		isPermissionPresent: !!appPermissions,
		indices: Object.keys(indices || {}),
		isLoadingMappings:
			get(state, '$getAppMappings.isFetching') || get(state, '$getAppPermissions.isFetching'),
		plan: 'growth',
		pipelines: get(state, '$getAppPipelines.results'),
		arcPlan: get(state, '$getAppPlan.results.tier'),
		backendImage: get(state, '$getAppPlan.results.image_type'),
		isSubmitting:
			get(state, '$createAppPermission.isFetching') ||
			get(state, '$updateAppPermission.isFetching') ||
			get(state, '$createClusterUser.isFetching') ||
			get(state, '$updateClusterUser.isFetching'),
		errors: [
			get(state, '$getAppMappings.error'),
			get(state, '$createAppPermission.error'),
			get(state, '$updateAppPermission.error'),
			get(state, '$createClusterUser.error'),
			get(state, '$updateClusterUser.error'),
		],
		backend: get(state, '$getAppPlan.results.backend'),
	};
};

const mapDispatchToProps = (dispatch) => ({
	fetchMappings: (appName, credentials) => dispatch(getAppMappings(appName, credentials)),
	fetchPermissions: (appName) => dispatch(getPermission(appName)),
	fetchPipelines: () => dispatch(getPipelines()),
});

export default connect(mapStateToProps, mapDispatchToProps)(CreateCredentials);
