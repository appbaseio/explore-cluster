import { PlusOutlined } from '@ant-design/icons';
import { Avatar, Button, notification, Spin, Table, Tooltip } from 'antd';
import { css } from 'emotion';
import { array, bool, func } from 'prop-types';
import { get } from 'lodash';
import moment from 'moment';
import React, { useState, useLayoutEffect } from 'react';
import { connect } from 'react-redux';
import {
	getAuth0Users,
	createAuth0User as createAuth0UserAction,
} from '../../../../batteries/modules/actions';
import ActionMenu from './ActionMenu';
import CreateNewUserModal from './ActionMenu/CreateNewUserModal';

const container = css`
	.create-user-btn {
		float: right;
		margin-bottom: 1rem;
		z-index: 2;
	}
`;

const UserManagement = ({
	fetchAuthUsers,
	authUsers,
	isLoading,
	createAuth0User,
	isCreatingUser,
}) => {
	const [showCreateUserModal, setShowCreateUserModal] = useState(false);

	const handleCreateUser = (payload) => {
		createAuth0User(payload)
			.then((res) => {
				if (res.payload) {
					notification.success({
						message: `User "${res.payload.email}" created successfully!`,
					});
				} else if (res.error) {
					if (res.error.actual.code === 409) {
						notification.error({
							message: <p>User already exists!</p>,
						});
						return;
					}
					notification.error({
						message: <p>Something went wrong while creating the user!</p>,
					});
				}
			})
			.catch((error) => {
				notification.error({
					message: error,
				});
			})
			.finally(() => {
				setShowCreateUserModal(false);
			});
	};

	useLayoutEffect(() => {
		fetchAuthUsers();
	}, []);

	const columns = [
		{
			rowKey: 'name',
			title: 'Name',
			render: (record) => {
				return (
					<span>
						<Avatar
							src={record.picture}
							alt=""
							style={{
								marginRight: '10px',
							}}
						/>
						{record.name}
					</span>
				);
			},
		},
		{
			rowKey: 'Connection',
			title: 'Connection',
			render: (record) => {
				const identities = record.identities
					.map((identity) => identity.connection)
					.join(', ');
				return <Tooltip title={identities}>{identities}</Tooltip>;
			},
		},
		{
			rowKey: 'logins_count',
			title: 'Logins',
			render: (record) => {
				const LoginsCount = record.logins_count;
				return <Tooltip title={LoginsCount}>{LoginsCount}</Tooltip>;
			},
		},
		{
			rowKey: 'last_login',
			title: 'Last Login',
			render: (record) => {
				const lastLogin = record.last_login;
				const timestamp = lastLogin ? moment(lastLogin).format('ddd D MMM, hh:mm A') : '';
				return <Tooltip title={timestamp}>{timestamp}</Tooltip>;
			},
		},
		{
			rowKey: 'actions',
			title: '',
			render: (record) => {
				return <ActionMenu userItem={record} />;
			},
		},
	];
	return (
		<>
			<Spin spinning={isLoading}>
				<div className={container}>
					<Button
						className="create-user-btn"
						onClick={() => setShowCreateUserModal(true)}
						icon={<PlusOutlined />}
						type="primary"
						size="large"
					>
						Create User
					</Button>
					<Table columns={columns} dataSource={authUsers} />
				</div>
			</Spin>
			{showCreateUserModal && (
				<CreateNewUserModal
					handleCreateUser={handleCreateUser}
					handleClose={() => setShowCreateUserModal(false)}
					visible={showCreateUserModal}
					isCreatingUser={isCreatingUser}
				/>
			)}
		</>
	);
};

UserManagement.defaultProps = {};

UserManagement.propTypes = {
	authUsers: array.isRequired,
	isLoading: bool.isRequired,
	fetchAuthUsers: func.isRequired,
	createAuth0User: func.isRequired,
	isCreatingUser: bool.isRequired,
};
const mapStateToProps = (state) => {
	return {
		authUsers: get(state, '$getAuth0Users.results') || [],
		isLoading: get(state, '$getAuth0Users.isFetching'),
		isCreatingUser: get(state, '$createAuth0User.isFetching'),
	};
};

const mapDispatchToProps = (dispatch) => ({
	fetchAuthUsers: () => dispatch(getAuth0Users()),
	createAuth0User: (payload) => dispatch(createAuth0UserAction(payload)),
});

export default connect(mapStateToProps, mapDispatchToProps)(UserManagement);
