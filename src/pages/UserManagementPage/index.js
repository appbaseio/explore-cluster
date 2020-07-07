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
import ErrorToaster from '../../components/ErrorToaster';
import { withErrorToaster } from '../../components/ErrorToaster/ErrorToaster';

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
	state = {
		showForm: false,
		currentPermissionInfo: undefined,
	};

	componentDidMount() {
		this.refetchPermissions();
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
		const { users, isFetching, isAdmin } = this.props;
		const { showForm, currentPermissionInfo } = this.state;
		if (isFetching) {
			return <Loader />;
		}
		return (
			<Container>
				<Card
					title="Manage Users"
					extra={
						<a
							href="https://docs.appbase.io/docs/security/user-management/"
							target="_blank"
							rel="noopener noreferrer"
						>
							Read Docs
						</a>
					}
				>
					<Paragraph strong>Login URL for this cluster:</Paragraph>
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
										text: `https://arc-dashboard.appbase.io?url=${getURL()}`,
									}}
								>
									{`https://arc-dashboard.appbase.io?url=${getURL()}`}
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
					disabled={!isAdmin}
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
	isAdmin: PropTypes.bool.isRequired,
	deleteUser: PropTypes.func.isRequired,
	fetchUsers: PropTypes.func.isRequired,
	isFetching: PropTypes.bool.isRequired,
	users: PropTypes.array, // eslint-disable-line
};
const mapStateToProps = (state) => {
	const { username, password } = get(state, 'user.data', {});
	return {
		credentials: username ? `${username}:${password}` : null,
		users: get(state, '$getClusterUsers.results', []),
		isFetching: get(state, '$getClusterUsers.isFetching', false),
		isAdmin: get(state, 'user.data.isAdmin'),
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
