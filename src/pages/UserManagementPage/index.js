/* eslint-disable react/jsx-curly-brace-presence */
import React from 'react';
import { connect } from 'react-redux';
import { Card, Button, Table, Alert, Typography } from 'antd';
import PropTypes from 'prop-types';
import { css } from 'react-emotion';
import get from 'lodash/get';
import CredentialsForm from '../../components/CreateCredentials';
import Permission from './Permission';
import Password from './Password';
import Loader from '../../batteries/components/shared/Loader/Spinner';
import {
	getClusterUsers,
	createClusterUser,
	deleteClusterUser,
	updateClusterUser,
} from '../../batteries/modules/actions';
import Container from '../../components/Container';
import { getURL } from '../../constants/config';
import ErrorToaster from '../../batteries/components/shared/ErrorToaster';
import { withErrorToaster } from '../../batteries/components/shared/ErrorToaster/ErrorToaster';
import { ALLOWED_ACTIONS } from '../../constants';
import { compareVersion } from '../../utils';
import { event, timingEvent } from '../../utils/gtag';
import moment from '../../utils/moment';

const { Paragraph } = Typography;
const tableCls = css`
	tr:hover td {
		background: transparent;
	}
`;
let lastIndex = 0;
const updateIndex = () => {
	lastIndex += 1;
	return lastIndex;
};

const columns = [
	{
		title: 'Username',
		key: `username${updateIndex()}`,
		render: ({ permissionInfo }) => permissionInfo.username,
	},
	{
		title: 'Password (We encrypt all passwords)',
		key: `password${updateIndex()}`,
		// eslint-disable-next-line
		render: ({ permissionInfo }) => <Password password={permissionInfo.password} />,
	},
	{
		title: 'Email',
		key: `email${updateIndex()}`,
		render: ({ permissionInfo }) => permissionInfo.email || 'No email',
	},
	{
		title: 'Actions',
		render: (permission) => <Permission {...permission} />,
		key: 'credentials',
	},
];

class UserManagementPage extends React.Component {
	constructor(props) {
		super(props);
		this.startTime = moment();
		this.state = {
			showForm: false,
			currentPermissionInfo: undefined,
		};
	}

	componentDidMount() {
		// triggering custom event for google analytics
		event({
			action: 'User Management',
			category: 'User Management',
			label: 'visit',
			value: null,
		});
		this.refetchPermissions();
	}

	componentWillUnmount() {
		// Sends the timing event to Google Analytics.
		timingEvent({
			action: 'timing_complete',
			category: 'User Management',
			label: 'user-management-time',
			name: 'time',
			value: this.startTime.fromNow(),
		});
	}

	showForm = (permissionInfo) => {
		if (permissionInfo) {
			this.setState({
				showForm: true,
				currentPermissionInfo: permissionInfo,
			});
		} else {
			this.setState({
				showForm: true,
				currentPermissionInfo: undefined,
			});
		}
	};

	refetchPermissions = () => {
		const { fetchUsers, credentials } = this.props;
		fetchUsers(credentials);
	};

	handleCancel = () => {
		this.setState({
			showForm: false,
			currentPermissionInfo: undefined,
		});
	};

	handleShow = () => {
		this.setState({
			showForm: true,
			currentPermissionInfo: undefined,
		});
	};

	handleSubmit = (form) => {
		const { credentials, createUser, updateUser } = this.props;
		const { currentPermissionInfo } = this.state;
		// handle edit
		if (currentPermissionInfo && currentPermissionInfo.username) {
			updateUser(credentials, currentPermissionInfo.username, form.mappedValues).then(
				({ payload }) => {
					if (payload) {
						this.setState(
							{
								showForm: false,
							},
							() => {
								this.refetchPermissions();
							},
						);
					}
				},
			);
		} else {
			createUser(credentials, form.mappedValues).then(({ payload }) => {
				if (payload) {
					this.setState(
						{
							showForm: false,
						},
						() => {
							this.refetchPermissions();
						},
					);
				}
			});
		}
	};

	deletePermission = (username) => {
		const { credentials, deleteUser } = this.props;
		deleteUser(credentials, username).then(({ payload }) => {
			if (payload) {
				this.refetchPermissions();
			}
		});
	};

	render() {
		const { users, isFetching, allowedActions, version } = this.props;
		const { showForm, currentPermissionInfo } = this.state;
		const hasEditAccess = allowedActions.includes(ALLOWED_ACTIONS.USER_MANAGEMENT);

		if (isFetching) {
			return <Loader />;
		}
		return (
			<Container>
				<Card
					title="Manage Users"
					extra={
						<div style={{ textAlign: 'center' }}>
							<a
								href="https://docs.appbase.io/docs/security/user-management/"
								rel="noopener noreferrer"
								target="_blank"
							>
								Read Docs
							</a>
							<br />
							<a
								href="https://youtu.be/gyvK0b4c4e0"
								rel="noopener noreferrer"
								target="_blank"
							>
								Watch Video
							</a>
						</div>
					}
				>
					<Paragraph strong>Login URL for this cluster:</Paragraph>
					{compareVersion(version, '7.52.0') === -1 && (
						<Alert
							type="warning"
							message="Upgrade appbase.io to v7.52.0 or above for using the new user management features"
							showIcon
							style={{ marginBottom: 10 }}
						/>
					)}
					<Alert
						showIcon
						message={
							<React.Fragment>
								<Paragraph>
									A user added via user management will need to visit the below
									URL and enter their username and password to have access to the
									cluster{"'"}s dashboard view.
								</Paragraph>
								<Paragraph
									strong
									copyable={{
										text: `https://dash.appbase.io?url=${getURL()}`,
									}}
								>
									{`https://dash.appbase.io?url=${getURL()}`}
								</Paragraph>
							</React.Fragment>
						}
						type="info"
						css={{ marginBottom: 20 }}
					/>
					<ErrorToaster inline>
						<Table
							scroll={{ x: 900 }}
							dataSource={users.map((user) => ({
								permissionInfo: user,
								deletePermission: this.deletePermission,
								showForm: this.showForm,
							}))}
							rowKey={(row) =>
								`${get(row, 'permissionInfo.username')}:${get(
									row,
									'permissionInfo.password',
								)}`
							}
							columns={columns}
							css={tableCls}
						/>
					</ErrorToaster>
				</Card>

				<Button
					style={{ marginTop: 10 }}
					disabled={!hasEditAccess}
					onClick={this.handleShow}
					size="large"
					type="primary"
				>
					Create User
				</Button>
				{showForm && (
					<ErrorToaster inline>
						<CredentialsForm
							handleCancel={this.handleCancel}
							isUserManagement
							show={showForm}
							saveButtonText={!currentPermissionInfo ? 'Create' : 'Save'}
							onSubmit={this.handleSubmit}
							initialValues={currentPermissionInfo}
							titleText={!currentPermissionInfo ? 'Create User' : 'Edit User'}
						/>
					</ErrorToaster>
				)}
			</Container>
		);
	}
}

UserManagementPage.propTypes = {
	credentials: PropTypes.string.isRequired,
	createUser: PropTypes.func.isRequired,
	updateUser: PropTypes.func.isRequired,
	deleteUser: PropTypes.func.isRequired,
	fetchUsers: PropTypes.func.isRequired,
	isFetching: PropTypes.bool.isRequired,
	users: PropTypes.array, // eslint-disable-line
	allowedActions: PropTypes.array.isRequired,
	version: PropTypes.string.isRequired,
};
const mapStateToProps = (state) => {
	const { username, password } = get(state, 'user.data', {});
	return {
		credentials: username ? `${username}:${password}` : null,
		users: get(state, '$getClusterUsers.results', []),
		isFetching: get(state, '$getClusterUsers.isFetching', false),
		allowedActions: get(state, 'user.data.allowedActions'),
		version: get(state, '$getAppPlan.results.version'),
	};
};
const mapDispatchToProps = (dispatch) => ({
	fetchUsers: (credentials) => dispatch(getClusterUsers(credentials)),
	createUser: (credentials, payload) => dispatch(createClusterUser(credentials, payload)),
	deleteUser: (credentials, username) => dispatch(deleteClusterUser(credentials, username)),
	updateUser: (credentials, username, payload) =>
		dispatch(updateClusterUser(credentials, username, payload)),
});

export default withErrorToaster(connect(mapStateToProps, mapDispatchToProps)(UserManagementPage));
