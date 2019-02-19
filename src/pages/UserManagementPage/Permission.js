import React from 'react';
import { Button, Popconfirm, Tooltip } from 'antd';
import { css } from 'react-emotion';
import { connect } from 'react-redux';
import { object, func, bool } from 'prop-types';
import get from 'lodash/get';
import Flex from '../../batteries/components/shared/Flex';

const container = css`
	padding-right: 10px;
`;
class Permission extends React.Component {
	handleEditCred = () => {
		const { permissionInfo, showForm } = this.props;
		const formPayload = {
			...permissionInfo,
			meta: {
				username: permissionInfo.username,
			},
		};
		showForm(formPayload);
	};

	handleDeleteCred = async () => {
		const { permissionInfo, deletePermission } = this.props;
		deletePermission(permissionInfo.username);
	};

	render() {
		const { isAdmin } = this.props;
		const disabled = !isAdmin;
		return (
			<Flex alignItems="center">
				<Flex justifyContent="space-between" alignItems="center" css={container}>
					<Flex>
						<Tooltip placement="topLeft" title="Edit User">
							<Button disabled={disabled} onClick={this.handleEditCred} type="normal">
								Update
							</Button>
						</Tooltip>
					</Flex>
				</Flex>
				<Tooltip placement="topLeft" title="Delete User">
					<Popconfirm
						title="Are you sure delete this key?"
						onConfirm={this.handleDeleteCred}
						okText="Yes"
						cancelText="No"
					>
						<Button disabled={disabled} type="danger">
							Delete
						</Button>
					</Popconfirm>
				</Tooltip>
			</Flex>
		);
	}
}

Permission.propTypes = {
	permissionInfo: object.isRequired,
	isAdmin: bool.isRequired,
	showForm: func.isRequired,
	deletePermission: func.isRequired,
};

const mapStateToProps = state => ({
	isAdmin: get(state, 'user.data.isAdmin'),
});

export default connect(mapStateToProps)(Permission);
