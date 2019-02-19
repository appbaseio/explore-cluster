import React from 'react';
import { connect } from 'react-redux';
import {
 Card, Button, Table, Alert,
} from 'antd';
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
		title: 'Password',
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
		render: permission => <Permission {...permission} />,
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
					extra={(
<Button
							disabled={!isAdmin}
							onClick={this.handleShow}
							size="large"
							type="primary"
>
							Create User
</Button>
)}
				>
					<Alert
						message="Create/Manage additional users that can access Arc."
						type="info"
						css={{ marginBottom: 20 }}
					/>
					<Table
						scroll={{ x: 900 }}
						dataSource={users.map(user => ({
							permissionInfo: user,
							deletePermission: this.deletePermission,
							showForm: this.showForm,
						}))}
						rowKey={row => `${get(row, 'permissionInfo.username')}:${get(
								row,
								'permissionInfo.password',
							)}`
						}
						columns={columns}
						css={tableCls}
					/>
				</Card>
				{showForm && (
					<CredentialsForm
						handleCancel={this.handleCancel}
						isUserManagement
						show={showForm}
						saveButtonText={!currentPermissionInfo ? 'Create' : 'Save'}
						onSubmit={this.handleSubmit}
						initialValues={currentPermissionInfo}
						titleText={!currentPermissionInfo ? 'Create User' : 'Edit User'}
					/>
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
const mapDispatchToProps = dispatch => ({
	fetchUsers: credentials => dispatch(getClusterUsers(credentials)),
	createUser: (credentials, payload) => dispatch(createClusterUser(credentials, payload)),
	deleteUser: (credentials, username) => dispatch(deleteClusterUser(credentials, username)),
	updateUser: (credentials, username, payload) => dispatch(updateClusterUser(credentials, username, payload)),
});

export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(UserManagementPage);
