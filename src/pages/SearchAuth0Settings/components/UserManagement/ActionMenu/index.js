import { DeleteOutlined, EllipsisOutlined, StopOutlined } from '@ant-design/icons';
import { Button, Divider, Dropdown, Menu, notification } from 'antd';
import React, { useState } from 'react';
import { bool, func, object } from 'prop-types';
import { connect } from 'react-redux';
import { get } from 'lodash';
import ViewDetailsModal from './ViewDetailsModal';
import DeleteUserModal from './DeleteUserModal';
import BlockUserModal from './BlockUserModal';
import ChangeEmailModal from './ChangeEmailModal';
import ChangePasswordModal from './ChangePasswordModal';
import {
	patchAuth0UserSettings,
	deleteAuthUser as deleteAuthUserAction,
} from '../../../../../batteries/modules/actions';

const MENU_KEYS = {
	VIEW_DETAILS: 'view-details',
	CHANGE_EMAIL: 'change-email',
	CHANGE_PASSWORD: 'change-password',
	BLOCK_USER: 'block-user',
	DELETE_USER: 'delete-user',
};

const ActionMenu = ({
	userItem,
	updateAuth0User,
	isUpdatingUser,
	isDeletingUser,
	deleteAuth0User,
}) => {
	// eslint-disable-next-line camelcase
	const { identities, name, email, user_id, blocked } = userItem;
	const [showDetailsModal, setShowDetailsModal] = useState(false);
	const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);
	const [showBlockUserModal, setShowBlockUserModal] = useState(false);
	const [showChangeEmailModal, setShowChangeEmailModal] = useState(false);
	const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

	let isBasicAuth = false;
	if (
		identities.some(
			(identityItem) => identityItem.connection === 'Username-Password-Authentication',
		)
	) {
		isBasicAuth = true;
	}

	const handleMenuClick = ({ key }) => {
		switch (key) {
			case MENU_KEYS.VIEW_DETAILS:
				setShowDetailsModal(true);
				break;
			case MENU_KEYS.DELETE_USER:
				setShowDeleteUserModal(true);
				break;
			case MENU_KEYS.BLOCK_USER:
				setShowBlockUserModal(true);
				break;
			case MENU_KEYS.CHANGE_EMAIL:
				setShowChangeEmailModal(true);
				break;
			case MENU_KEYS.CHANGE_PASSWORD:
				setShowChangePasswordModal(true);
				break;
			default:
				break;
		}
	};

	const handleDeleteUser = () => {
		deleteAuth0User(user_id)
			.then((res) => {
				if (res.payload) {
					notification.success({
						message: `User "${name}" deleted successfully!`,
					});
				} else if (res.error) {
					notification.error({
						message: <p>Something went wrong while deleting the user!</p>,
					});
				}
			})
			.catch((error) => {
				notification.error({
					message: error,
				});
			})
			.finally(() => {
				setShowDeleteUserModal(false);
			});
	};

	const handleBlockUser = () => {
		updateAuth0User(user_id, { blocked: !blocked })
			.then((res) => {
				if (res.payload) {
					notification.success({
						message: `User "${blocked ? 'unblocked' : 'blocked'}" successfully!`,
					});
				} else if (res.error) {
					notification.error({
						message: (
							<p>
								Something went wrong while {blocked ? 'unblocking' : 'blocking'} the
								user!
							</p>
						),
					});
				}
			})
			.catch((error) => {
				notification.error({
					message: error,
				});
			})
			.finally(() => {
				setShowBlockUserModal(false);
			});
	};

	const handleChangeEmail = (emailValue) => {
		updateAuth0User(user_id, { email: emailValue })
			.then((res) => {
				if (res.payload) {
					notification.success({
						message: `
						Email changed successfully!`,
					});
				} else if (res.error) {
					notification.error({
						message: <p>Something went wrong while updating the email!</p>,
					});
				}
			})
			.catch((error) => {
				notification.error({
					message: error,
				});
			})
			.finally(() => {
				setShowChangeEmailModal(false);
			});
	};
	const handleChangePassword = (passwordValue) => {
		updateAuth0User(user_id, { password: passwordValue, verify_password: false })
			.then((res) => {
				if (res.payload) {
					notification.success({
						message: `
						Password changed successfully!`,
					});
				} else if (res.error) {
					notification.error({
						message: <p>Something went wrong while updating the password!</p>,
					});
				}
			})
			.catch((error) => {
				notification.error({
					message: error,
				});
			})
			.finally(() => {
				setShowChangePasswordModal(false);
			});
	};

	const menu = (
		<Menu onClick={handleMenuClick}>
			<Menu.Item key={MENU_KEYS.VIEW_DETAILS}>View Details </Menu.Item>
			{isBasicAuth && <Menu.Item key={MENU_KEYS.CHANGE_EMAIL}>Change Email</Menu.Item>}
			{isBasicAuth && <Menu.Item key={MENU_KEYS.CHANGE_PASSWORD}>Change Password</Menu.Item>}
			<Divider style={{ margin: '8px 0' }} />
			<Menu.Item key={MENU_KEYS.BLOCK_USER}>
				<StopOutlined /> {blocked ? 'Unblock' : 'Block'}
			</Menu.Item>
			<Menu.Item key={MENU_KEYS.DELETE_USER} style={{ color: 'red' }}>
				<DeleteOutlined /> Delete
			</Menu.Item>
		</Menu>
	);

	return (
		<>
			<Dropdown overlay={menu} trigger={['hover', 'click']} placement="bottomRight">
				<Button style={{ width: '32px', padding: 0 }}>
					<EllipsisOutlined />
				</Button>
			</Dropdown>
			{showDetailsModal && (
				<ViewDetailsModal
					userItem={userItem}
					visible={showDetailsModal}
					handleClose={() => {
						setShowDetailsModal(false);
					}}
					isBasicAuth={isBasicAuth}
					setShowDeleteUserModal={setShowDeleteUserModal}
					setShowBlockUserModal={setShowBlockUserModal}
					setShowChangePasswordModal={setShowChangePasswordModal}
				/>
			)}
			{showDeleteUserModal && (
				<DeleteUserModal
					visible={showDeleteUserModal}
					handleDeleteUser={handleDeleteUser}
					username={name}
					handleClose={() => {
						setShowDeleteUserModal(false);
					}}
					isLoading={isDeletingUser}
				/>
			)}
			{showBlockUserModal && (
				<BlockUserModal
					visible={showBlockUserModal}
					handleBlockUser={handleBlockUser}
					username={name}
					handleClose={() => {
						setShowBlockUserModal(false);
					}}
					isLoading={isUpdatingUser}
					blocked={blocked}
				/>
			)}

			{showChangeEmailModal && (
				<ChangeEmailModal
					handleChangeEmail={handleChangeEmail}
					email={email}
					visible={showChangeEmailModal}
					handleClose={() => {
						setShowChangeEmailModal(false);
					}}
					isLoading={isUpdatingUser}
				/>
			)}
			{showChangePasswordModal && (
				<ChangePasswordModal
					handleChangePassword={handleChangePassword}
					visible={showChangePasswordModal}
					handleClose={() => {
						setShowChangePasswordModal(false);
					}}
					isLoading={isUpdatingUser}
				/>
			)}
		</>
	);
};
ActionMenu.defaultProps = {
	userItem: null,
};

ActionMenu.propTypes = {
	userItem: object,
	updateAuth0User: func.isRequired,
	isUpdatingUser: bool.isRequired,
	isDeletingUser: bool.isRequired,
	deleteAuth0User: func.isRequired,
};
const mapStateToProps = (state) => {
	return {
		isUpdatingUser: get(state, '$updateAuth0User.isFetching'),
		isDeletingUser: get(state, '$deleteAuth0User.isFetching'),
	};
};

const mapDispatchToProps = (dispatch) => ({
	updateAuth0User: (userId, payload) => dispatch(patchAuth0UserSettings(userId, payload)),
	deleteAuth0User: (userId) => dispatch(deleteAuthUserAction(userId)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ActionMenu);
