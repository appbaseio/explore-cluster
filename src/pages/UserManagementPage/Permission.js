import React from 'react';
import { Button, Popconfirm, Tooltip } from 'antd';
import { css } from 'react-emotion';
import { connect } from 'react-redux';
import { object, func, array } from 'prop-types';
import get from 'lodash/get';
import Flex from '../../batteries/components/shared/Flex';
import { ALLOWED_ACTIONS } from '../../constants';

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
		const { allowedActions } = this.props;
		const hasEditAccess = allowedActions.includes(ALLOWED_ACTIONS.USER_MANAGEMENT);
		return (
			<Flex alignItems="center">
				<Flex justifyContent="space-between" alignItems="center" css={container}>
					<Flex>
						<Tooltip placement="topLeft" title="Edit User">
							<Button
								disabled={!hasEditAccess}
								onClick={this.handleEditCred}
								type="default"
							>
								Update
							</Button>
						</Tooltip>
					</Flex>
				</Flex>
				<Tooltip placement="topLeft" title="Delete User">
					<Popconfirm
						title="Are you sure delete this user?"
						onConfirm={this.handleDeleteCred}
						okText="Yes"
						cancelText="No"
					>
						<Button disabled={!hasEditAccess} danger>
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
	showForm: func.isRequired,
	deletePermission: func.isRequired,
	allowedActions: array.isRequired,
};

const mapStateToProps = (state) => ({
	allowedActions: get(state, 'user.data.allowedActions'),
});

export default connect(mapStateToProps)(Permission);
