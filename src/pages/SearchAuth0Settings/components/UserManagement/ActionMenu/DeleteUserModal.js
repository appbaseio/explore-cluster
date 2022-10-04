/* eslint-disable camelcase */
import { Modal } from 'antd';
import React from 'react';
import { bool, func, string } from 'prop-types';
import { css } from 'emotion';

const deleteUserCss = css``;

const DeleteUserModal = ({ username, visible, handleClose, handleDeleteUser, isLoading }) => {
	return (
		<Modal
			className={deleteUserCss}
			visible={visible}
			onCancel={handleClose}
			title={<h3>Delete User</h3>}
			width="max(50vw, 300px)"
			onOk={handleDeleteUser}
			okType="danger"
			okText="Delete"
			okButtonProps={{ loading: isLoading }}
		>
			<p>
				Are you really sure you want to delete &quot;<b>{username}</b>&quot;? This cannot be
				undone!
			</p>
		</Modal>
	);
};

DeleteUserModal.propTypes = {
	handleDeleteUser: func.isRequired,
	username: string.isRequired,
	visible: bool.isRequired,
	handleClose: func.isRequired,
	isLoading: bool.isRequired,
};
export default DeleteUserModal;
