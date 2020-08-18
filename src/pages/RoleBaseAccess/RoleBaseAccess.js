/* eslint-disable react/jsx-curly-brace-presence */
import React from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import { Button, Card, Form, Icon, Input, notification, Popover, Skeleton, Table } from 'antd';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { css } from 'emotion';
import Container from '../../components/Container';
import { getAppPermissionsByName, getAppPlanByName } from '../../batteries/modules/selectors';

import { getPermission, getPublicKey, updatePublicKey } from '../../batteries/modules/actions';
import { setRole } from '../../utils';
import { isBase64 } from '../../utils/helper';
import Banner from '../../batteries/components/shared/UpgradePlan/Banner';
import ErrorToaster from '../../batteries/components/shared/ErrorToaster';
import { withErrorToaster } from '../../batteries/components/shared/ErrorToaster/ErrorToaster';

const { Column } = Table;

const formLabelStyle = css`
	label {
		font-weight: 600;
		color: #595959;
	}
`;

const labelMargin = {
	marginBottom: 5,
};

const bannerMessage = {
	title: 'Role Based Access',
	description: 'Setup Role Based Access Control to secure your app.',
	buttonText: 'Read Docs',
};

class RoleBaseAccess extends React.Component {
	constructor() {
		super();
		this.state = {
			publicKey: '',
			roleKey: '',
			loadingKey: {},
			visibleKey: {},
		};
	}

	componentDidMount() {
		const {
 			 fetchPublicKey, appName, fetchPermissions,
		} = this.props; // prettier-ignore
		fetchPublicKey(appName);
		fetchPermissions(appName);
	}

	componentDidUpdate(prevProps) {
		const {
			publicKey,
			roleKey,
			updatedKey,
			fetchPublicKey,
			appName,
			isPublicKeyLoading,
			updateKeyError,
			publicKeyError,
		} = this.props;

		const {
			publicKey: prevPublicKey,
			roleKey: prevRoleKey,
			updateKeyError: prevUpdateError,
			publicKeyError: prevKeyError,
		} = prevProps;

		if (publicKey !== prevPublicKey || roleKey !== prevRoleKey) {
			this.handleKeyes({
				publicKey,
				roleKey,
			});
		}

		const isNewKeyEncoded = updatedKey && isBase64(updatedKey.public_key);
		const isOldKeyEncoded = isBase64(publicKey);

		const oldKey = isOldKeyEncoded ? atob(publicKey) : publicKey;
		const newKey = isNewKeyEncoded
			? updatedKey && atob(updatedKey.public_key)
			: updatedKey.public_key;

		if (
			updatedKey &&
			!isPublicKeyLoading &&
			(newKey !== oldKey || updatedKey.role_key !== roleKey)
		) {
			notification.success({
				message: updatedKey.message,
			});
			fetchPublicKey(appName);
		}

		if (updateKeyError && prevUpdateError !== updateKeyError) {
			notification.error({
				message:
					updateKeyError.message ||
					updateKeyError.reason ||
					'Error while updating the Public Key.',
			});
		}
		if (publicKeyError && prevKeyError !== publicKeyError) {
			notification.error({
				message:
					publicKeyError.message ||
					publicKeyError.reason ||
					'Error while fetching the Public Key.',
			});
		}
	}

	handleKeyes = ({ publicKey, roleKey }) => {
		this.setState({
			publicKey,
			roleKey,
		});
	};

	handleChange = (e) => {
		this.setState({
			[e.target.name]: e.target.value,
		});
	};

	handleRole = (e) => {
		this.setState({
			[e.target.name]: e.target.value,
		});
	};

	setLoading = (id) => {
		this.setState((prevState) => ({
			loadingKey: {
				...prevState.loadingKey,
				[id]: get(prevState, `loadingKey.${id}`)
					? !get(prevState, `loadingKey.${id}`)
					: true,
			},
		}));
	};

	showKey = (id) => {
		this.setState((prevState) => ({
			visibleKey: {
				...prevState.visibleKey,
				[id]: get(prevState, `visibleKey.${id}`)
					? !get(prevState, `visibleKey.${id}`)
					: true,
			},
		}));
	};

	saveRole = async (value) => {
		const { props, setLoading, state } = this;
		try {
			setLoading(value.username);
			const { fetchPermissions } = props;
			const role = state && state[value.username];
			const response = await setRole(value.username, role);
			if (response.code === 200) {
				notification.success({ message: 'Role updated successfully.' });
			} else {
				notification.error({ message: 'Something went wrong while updating the role.' });
			}

			fetchPermissions();
			setLoading(value.username);
		} catch (e) {
			setLoading(value.username);
			notification.error({ message: e.message });
		}
	};

	handleSave = () => {
		const { publicKey, roleKey } = this.state;
		const { setKeys, appName } = this.props;
		let newRoleKey = roleKey;

		if (!newRoleKey) {
			newRoleKey = 'role';
		}
		setKeys(appName, publicKey, newRoleKey);
	};

	render() {
		const {
			permissions,
			isPermissionsLoading,
			isPublicKeyLoading,
			publicKey: currentPublicKey,
			roleKey: currentRoleKey,
			updatingKeys,
		} = this.props;
		const {
			roleKey, publicKey, loadingKey, visibleKey,
		} = this.state; // prettier-ignore

		const emptyData = {
			emptyText: (
				<p>
					You don{"'"}t have any API credentials currently. Create one{' '}
					<Link to="/cluster/credentials">now</Link>.
				</p>
			),
		};
		return (
			<React.Fragment>
				<Banner
					{...bannerMessage}
					onClick={() =>
						window.open('https://docs.appbase.io/docs/security/Role/', '_blank')
					}
				/>
				<Container>
					<Card title="JWT Public Key">
						<p>
							The public key is used for verifying the integrity of Javascript Web
							Tokens (JWTs) for this cluster.
						</p>
						{isPublicKeyLoading ? (
							<Skeleton />
						) : (
							<ErrorToaster>
								<Form layout="vertical" className={formLabelStyle}>
									<Form.Item label="Public Key" style={labelMargin}>
										<Input.TextArea
											name="publicKey"
											autosize={{ minRows: 3 }}
											value={publicKey}
											placeholder="Enter Public Key"
											onChange={this.handleChange}
										/>
									</Form.Item>
									<Form.Item
										label={
											<Popover
												content={
													<>
														Key in JWT Object that helps
														<br /> in asserting the role information.{' '}
														<a
															href="https://docs.appbase.io/docs/security/Role/"
															target="_blank"
															rel="noopener noreferrer"
														>
															Read More
														</a>
														<br />
														<img
															src="https://www.dropbox.com/s/lnjpfglm4wt89q9/Screenshot%202020-02-10%2011.32.01.png?raw=1"
															alt="role info"
															style={{
																height: 100,
															}}
														/>
													</>
												}
											>
												Role Claim <Icon type="question-circle" />
											</Popover>
										}
										style={labelMargin}
									>
										<Input
											placeholder="Enter the key name in your JWT token that will contain the role value"
											value={roleKey || 'role'}
											onChange={this.handleChange}
											name="roleKey"
										/>
									</Form.Item>
									<Form.Item style={labelMargin}>
										<Button
											disabled={
												currentRoleKey === roleKey &&
												currentPublicKey === publicKey
											}
											type="primary"
											onClick={this.handleSave}
										>
											<Icon type={updatingKeys ? 'loading' : 'save'} />
											Save
										</Button>
									</Form.Item>
								</Form>
							</ErrorToaster>
						)}
					</Card>
					<Card title="Map Roles to API Credentials" style={{ marginTop: 20 }}>
						<p>
							You can map your existing API Credentials to any role name. This role
							name should be present in your Roles Key field of the JWT token.
						</p>
						{isPermissionsLoading ? (
							<Skeleton />
						) : (
							<ErrorToaster>
								<Table
									rowKey={(record) => record.username || 'permissions'}
									dataSource={permissions}
									locale={emptyData}
								>
									<Column
										title="Description"
										key="description"
										render={(value) =>
											(value && value.description) || 'No Description'
										}
									/>
									<Column
										title="Credentials"
										key="credentials"
										render={(value) => (
											<div>
												{visibleKey[`${value.username}`]
													? `${value.username}:${value.password}`
													: '#####################################'}
												<Button
													style={{
														marginLeft: 8,
														border: 0,
														background: 'transparent',
													}}
													type="normal"
													onClick={() => this.showKey(value.username)}
												>
													<Icon
														type={
															visibleKey[`${value.username}`]
																? 'eye-invisible'
																: 'eye'
														}
													/>
												</Button>
											</div>
										)}
									/>

									<Column
										title="Role"
										key="role"
										render={(value) => (
											<Input
												defaultValue={value && value.role}
												name={value.username}
												onChange={this.handleRole}
												placeholder="Define Role"
											/>
										)}
									/>

									<Column
										title=""
										key="action"
										render={(value) => {
											const { saveRole: saveRoleFunc, state } = this;
											return (
												<Button
													disabled={
														(state[`${value.username}`] || '') ===
														value.role
													}
													onClick={() => saveRoleFunc(value)}
													type="primary"
												>
													<Icon
														type={
															loadingKey && loadingKey[value.username]
																? 'loading'
																: 'save'
														}
													/>
													Save
												</Button>
											);
										}}
									/>
								</Table>
							</ErrorToaster>
						)}
					</Card>
				</Container>
			</React.Fragment>
		);
	}
}

RoleBaseAccess.propTypes = {
	publicKey: PropTypes.string,
	roleKey: PropTypes.string,
	updatedKey: PropTypes.string,
	fetchPublicKey: PropTypes.func.isRequired,
	appName: PropTypes.string.isRequired,
	isPublicKeyLoading: PropTypes.bool,
	updateKeyError: PropTypes.string,
	publicKeyError: PropTypes.string,
	setKeys: PropTypes.func.isRequired,
	permissions: PropTypes.array,
	isPermissionsLoading: PropTypes.bool,
	updatingKeys: PropTypes.bool,
	fetchPermissions: PropTypes.func.isRequired,
};

RoleBaseAccess.defaultProps = {
	publicKey: '',
	roleKey: '',
	updatedKey: '',
	isPublicKeyLoading: false,
	updateKeyError: '',
	publicKeyError: '',
	permissions: [],
	isPermissionsLoading: false,
	updatingKeys: false,
};

const mapStateToProps = (state) => {
	const planState = getAppPlanByName(state);
	const appPermissions = getAppPermissionsByName(state);

	return {
		appName: get(state, '$getCurrentApp.name'),
		plan: get(planState, 'plan'),
		permissions: get(appPermissions, 'results', []),
		isPermissionsLoading: get(state, '$getAppPermissions.isFetching'),
		isPublicKeyLoading: get(state, '$getAppPublicKey.isFetching'),
		publicKey: atob(get(state, '$getAppPublicKey.results.public_key', '')),
		publicKeyError: get(state, '$getAppPublicKey.error.actual.error', ''),
		updateKeyError: get(state, '$updateAppPublicKey.error.actual.error', ''),
		updatedKey: get(state, '$updateAppPublicKey.results', ''),
		updatingKeys: get(state, '$updateAppPublicKey.isFetching'),
		roleKey: get(state, '$getAppPublicKey.results.role_key', ''),
	};
};
const mapDispatchToProps = (dispatch) => ({
	fetchPermissions: (appName) => dispatch(getPermission(appName)),
	fetchPublicKey: (appName) => dispatch(getPublicKey(appName)),
	setKeys: (appName, publicKey, roleKey) =>
		dispatch(
			updatePublicKey(appName, isBase64(publicKey) ? publicKey : btoa(publicKey), roleKey),
		),
});

export default withErrorToaster(connect(mapStateToProps, mapDispatchToProps)(RoleBaseAccess));
