/* eslint-disable camelcase */
import { Modal } from 'antd';
import React from 'react';
import { bool, func, string } from 'prop-types';
import { css } from 'emotion';

const blockUserCss = css``;

const BlockUserModal = ({
	username,
	visible,
	handleClose,
	handleBlockUser,
	isLoading,
	blocked,
}) => {
	return (
		<Modal
			className={blockUserCss}
			visible={visible}
			onCancel={handleClose}
			title={<h3>{blocked ? 'Unblock' : 'Block'} User</h3>}
			width="max(50vw, 300px)"
			onOk={handleBlockUser}
			okType={blocked ? 'primary' : 'danger'}
			okText={blocked ? 'Unblock' : 'Block'}
			okButtonProps={{ loading: isLoading }}
		>
			<p>
				{blocked ? (
					<>
						This operation will unblock &quot;<b>{username}</b>&quot;. Are you sure?
					</>
				) : (
					<>
						This operation will block any attempt of sign-in of &quot;
						<b>{username}</b>&quot;. Are you sure?
					</>
				)}
			</p>
		</Modal>
	);
};

BlockUserModal.propTypes = {
	handleBlockUser: func.isRequired,
	username: string.isRequired,
	visible: bool.isRequired,
	handleClose: func.isRequired,
	isLoading: bool.isRequired,
	blocked: bool.isRequired,
};
export default BlockUserModal;
