import React from 'react';
import PropTypes from 'prop-types';
import { css } from 'emotion';
import {
 Icon, Modal, Input, Radio, Tooltip, Button, Select, Checkbox,
} from 'antd';
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
import styles from './styles';
import Flex from '../../batteries/components/shared/Flex';
import Loader from '../../batteries/components/shared/Loader/Spinner';
import { displayErrors } from '../../utils/helper';
import { getPermission } from '../../batteries/modules/actions/permission';
import Grid from './Grid';
import { getAppMappings } from '../../batteries/modules/actions';
import { getMessages, hoverMessage } from '../../utils/messages';
import {
	getTraversedMappingsByAppName,
	getAppPermissionsByName,
} from '../../batteries/modules/selectors';
import {
	Types,
	getDefaultAclOptionsByPlan,
	isNegative,
	defaultRateLimits,
	mapFormToValues,
	mapValuesToForm,
	defaultAclOptions,
} from './utils';
import Acl from './Acl';
import WhiteList from './WhiteList';
import PasswordInput from './PasswordInput';

// const { Option } = Select;
const modal = css`
	.ant-modal-content {
		width: 580px;
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

const CheckboxGroup = Checkbox.Group;
class CreateCredentials extends React.Component {
	constructor(props) {
		super(props);

		this.isApp = !window.location.pathname.startsWith('/cluster/user-management');

		this.form = props.isUserManagement
			? FormBuilder.group({
					username: ['', Validators.required],
					password: ['', Validators.required],
					email: [undefined, Validators.email],
					isAdmin: [false],
					operationType: [Types.read],
					categories: [defaultAclOptions],
					indices: this.isApp
						? [{ value: [props.appName], disabled: false }]
						: [{ value: ['*'], disabled: false }],
			  })
			: FormBuilder.group({
					description: '',
					operationType: [Types.read, Validators.required],
					categories: new FormArray(
						getDefaultAclOptionsByPlan(props.plan).map(
							acl => new FormGroup({
									acl: new FormControl(acl),
									tag: new FormControl(true),
									rateLimit: new FormControl(
										defaultRateLimits[acl],
										isNegative,
									),
								}),
						),
					),
					referers: [{ value: ['*'], disabled: false }],
					sources: [{ value: ['0.0.0.0/0'], disabled: false }],
					indices: this.isApp
						? [{ value: [props.appName], disabled: false }]
						: [{ value: ['*'], disabled: false }],
					ip_limit: [
						{ value: 7200, disabled: !props.isPaidUser },
						[Validators.required, isNegative],
					],
					ttl: [
						{ value: 0, disabled: !props.isPaidUser },
						[Validators.required, isNegative],
					],
			  });
	}

	componentDidMount() {
		const { disabled, initialValues, isUserManagement } = this.props;
		if (disabled) {
			this.form.disable();
		} else {
			const indicesHandler = this.form.get('indices');
			const adminHandler = this.form.get('isAdmin');
			const opsHandler = this.form.get('operationType');
			const categoriesHandler = this.form.get('categories');
			if (adminHandler) {
				adminHandler.valueChanges.subscribe((value) => {
					if (value) {
						opsHandler.setValue(Types.admin);
						categoriesHandler.setValue(defaultAclOptions);
						opsHandler.disable();
						categoriesHandler.disable();
						indicesHandler.disable();
					} else {
						opsHandler.setValue(Types.read);
						categoriesHandler.setValue(defaultAclOptions);
						opsHandler.enable();
						categoriesHandler.enable();
						indicesHandler.enable();
					}
				});
			}
			if (indicesHandler) {
				indicesHandler.valueChanges.subscribe((value) => {
					if (value && value.includes('*')) {
						indicesHandler.disable({ emitEvent: false });
						indicesHandler.reset([]);
					} else if (adminHandler && !adminHandler.value) {
						indicesHandler.enable({ emitEvent: false });
					}
				});
			}
		}
		if (initialValues) {
			this.form.patchValue(mapValuesToForm(JSON.parse(JSON.stringify(initialValues)), !isUserManagement));
		}
	}

	componentDidUpdate(prevProps) {
		const { errors, credentials } = this.props;
		if (credentials && credentials !== prevProps.credentials) {
			this.getMappings();
		}
		displayErrors(errors, prevProps.errors);
	}

	componentWillUnmount() {
		const indicesHandler = this.form.get('indices');
		const adminHandler = this.form.get('isAdmin');
		const categoriesHandler = this.form.get('categories');
		if (indicesHandler) {
			indicesHandler.valueChanges.unsubscribe();
		}
		if (adminHandler) {
			adminHandler.valueChanges.unsubscribe();
		}
		categoriesHandler.valueChanges.unsubscribe();
	}

	getMappings() {
		const { appName, fetchMappings, credentials } = this.props;
		if (credentials) {
			// Fetch Mappings if permissions are present
			const { username, password } = credentials;
			fetchMappings(appName, `${username}:${password}`);
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
		const { onSubmit, isUserManagement } = this.props;
		this.form.mappedValues = JSON.parse(JSON.stringify(mapFormToValues(this.form.value, !isUserManagement)));
		onSubmit(this.form, get(this.props, 'initialValues.username'));
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
		} = this.props;
		const Messages = getMessages(isUserManagement);
		return (
			<FieldGroup
				strict={false}
				control={this.form}
				render={({ invalid }) => (
					<Modal
						style={{
							width: '600px',
						}}
						title={this.getText}
						css={modal}
						footer={
							!disabled
								? [
										<Button key="back" onClick={handleCancel}>
											Cancel
										</Button>,
										<Button
											loading={isSubmitting}
											disabled={invalid}
											key="submit"
											type="primary"
											onClick={this.handleSubmit}
										>
											{saveButtonText
												|| (this.isEditing ? 'Save' : 'Generate')}
										</Button>,
								  ]
								: [
										<Button key="back" onClick={handleCancel}>
											Cancel
										</Button>,
								  ]
						}
						visible={show}
						onCancel={handleCancel}
					>
						{isLoadingMappings ? (
							<Loader style={{ marginTop: '-100px', marginBottom: '120px' }} />
						) : (
							<React.Fragment>
								<div css="position: relative">
									{isUserManagement && (
										<React.Fragment>
											<FieldControl
												strict={false}
												control={this.form.get('username')}
												render={({ handler }) => (
													<Grid
														label="Username"
														toolTipMessage={Messages.username}
														component={(
<Input
																autoFocus={!this.isEditing}
																placeholder="Enter username"
																{...handler()}
/>
)}
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
														component={(
															<PasswordInput
																placeholder="Enter password"
																{...handler()}
															/>
														)}
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
															<Checkbox {...handler('checkbox')} />
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
														component={(
<Input
																placeholder="Enter email"
																{...handler()}
/>
)}
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
													component={(
<Input
															autoFocus={
																!isUserManagement && !this.isEditing
															}
															placeholder="Add an optional description for this credential"
															{...handler()}
/>
)}
												/>
											)}
										/>
									)}
									<FieldControl
										name="operationType"
										render={({ handler }) => (
											<Grid
												label="Access Type"
												toolTipMessage={Messages.operationType}
												component={(
<Radio.Group
														{...handler()}
														css="label { font-weight: 100 }"
>
														{Object.keys(Types).map(type => (
															<Radio key={type} value={Types[type]}>
																{Types[type].description}
															</Radio>
														))}
</Radio.Group>
)}
											/>
										)}
									/>
									{!isPaidUser && (
										<div css={styles.overlay}>
											<div css={styles.upgradePlan}>
												<div style={{ marginBottom: 20 }}>
													<Icon type="lock" css="font-size: 40px" />
												</div>
												Upgrade to a paid plan to add advanced security
												permissions.
												<Tooltip overlay={hoverMessage} mouseLeaveDelay={0}>
													<i className="fas fa-info-circle" />
												</Tooltip>
												<Button
													type="primary"
													css="margin-top: 10px"
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
									{
										isUserManagement ? (
											<FieldControl
												name="categories"
												render={({ handler }) => (
													<Grid
														label="Categories"
														toolTipMessage={Messages.categories}
														component={(
															<CheckboxGroup
																css="label { font-weight: 100 }"
																options={defaultAclOptions}
																{...handler()}
															/>
														)}
													/>
												)}
											/>)
											: (
												<FieldArray
													name="categories"
													render={control => (
														<Grid
															label="Categories"
															toolTipMessage={Messages.categories}
															component={(
																<Acl
																	control={control}
																	isRateLimitPresent={!isUserManagement}
																/>
															)}
														/>
													)}
												/>
											)}
									{this.isApp ? null : (
										<FieldControl
											strict={false}
											name="indices"
											render={({ handler }) => {
												const inputHandler = handler();
												const { value } = this.form.get('indices');
												return (
													<Grid
														label="Indices"
														toolTipMessage={Messages.indices}
														component={(
<Select
																placeholder="Enter indices"
																mode="tags"
																style={{ width: '100%' }}
																tokenSeparators={[',']}
																value={value}
																{...inputHandler}
																onChange={(val) => {
																	inputHandler.onChange(
																		calculateValue(val),
																	);
																}}
/>
)}
													/>
												);
											}}
										/>
									)}
									{!isUserManagement && (
										<React.Fragment>
											<Grid
												label="Security"
												toolTipMessage={Messages.security}
											/>
											<FieldControl
												name="referers"
												render={control => (
													<WhiteList
														toolTipMessage={Messages.referers}
														control={control}
														type="dropdown"
														defaultSuggestionValue="https://example.com/"
														label="HTTP Referers"
														inputProps={{
															placeholder: 'Add a HTTP Referer',
														}}
													/>
												)}
											/>
											<FieldControl
												name="sources"
												render={control => (
													<WhiteList
														control={control}
														toolTipMessage={Messages.sources}
														label="IP Sources"
														defaultValue={{
															value: '0.0.0.0/0 (default)',
															description: 'Matches all IP sources',
														}}
														inputProps={{
															placeholder:
																'Add an IP Source in CIDR format',
														}}
													/>
												)}
											/>
											<FieldControl
												name="ip_limit"
												render={({ handler, hasError }) => (
													<Grid
														label="Max API calls/IP/hour"
														toolTipMessage={Messages.ipLimit}
														component={(
<Flex
																justifyContent="center"
																alignItems="center"
>
																<Input
																	type="number"
																	css="border: solid 1px #9195A2!important;width: 120px"
																	{...handler()}
																/>
																{hasError('isNegative') && (
																	<span css="color: red;margin-left: 10px">
																		Field value can{"'"}t be
																		negative.
																	</span>
																)}
</Flex>
)}
													/>
												)}
											/>
											<FieldControl
												name="ttl"
												render={({ handler, hasError }) => (
													<Grid
														label="TTL"
														toolTipMessage={Messages.ttl}
														component={(
<Flex
																justifyContent="center"
																alignItems="center"
>
																<Input
																	type="number"
																	min="0"
																	css="border: solid 1px #9195A2!important;width: 120px"
																	{...handler()}
																/>
																{hasError('isNegative') && (
																	<span css="color: red;margin-left: 10px">
																		Field value can{"'"}t be
																		negative.
																	</span>
																)}
</Flex>
)}
													/>
												)}
											/>
										</React.Fragment>
									)}
								</div>
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
};
CreateCredentials.propTypes = {
	isPaidUser: PropTypes.bool,
	isSubmitting: PropTypes.bool,
	show: PropTypes.bool,
	onSubmit: PropTypes.func.isRequired,
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
	titleText: PropTypes.string,
	isUserManagement: PropTypes.bool,
};

const mapStateToProps = (state) => {
	const mappings = getTraversedMappingsByAppName(state);
	const appPermissions = getAppPermissionsByName(state);
	return {
		isPaidUser: true,
		appName: get(state, '$getCurrentApp.name'),
		mappings: mappings || [],
		isPermissionPresent: !!appPermissions,
		isLoadingMappings:
			get(state, '$getAppMappings.isFetching') || get(state, '$getAppPermissions.isFetching'),
		credentials: get(appPermissions, 'credentials'),
		plan: 'growth',
		isSubmitting:
			get(state, '$createAppPermission.isFetching')
			|| get(state, '$updateAppPermission.isFetching')
			|| get(state, '$createClusterUser.isFetching')
			|| get(state, '$updateClusterUser.isFetching'),
		errors: [
			get(state, '$getAppMappings.error'),
			get(state, '$createAppPermission.error'),
			get(state, '$updateAppPermission.error'),
			get(state, '$createClusterUser.error'),
			get(state, '$updateClusterUser.error'),
		],
	};
};

const mapDispatchToProps = dispatch => ({
	fetchMappings: (appName, credentials) => dispatch(getAppMappings(appName, credentials)),
	fetchPermissions: appName => dispatch(getPermission(appName)),
});

export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(CreateCredentials);
