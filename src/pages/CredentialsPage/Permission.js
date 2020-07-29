import React from 'react';
import { Button, Popconfirm, Tooltip, notification, Icon } from 'antd';
import { css } from 'react-emotion';
import { object, func } from 'prop-types';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Flex from '../../batteries/components/shared/Flex';

const main = css`
	.ant-btn {
		border: transparent;
		margin-left: 5px;
		padding: 0 5px;
	}
`;
const container = css`
	border: 1px solid #e8e8e8;
	padding: 2px 10px;
	.ant-btn {
		border: transparent;
		background-color: transparent;
		margin-left: 5px;
		padding: 0 5px;
	}
	width: 500px;
`;
class Permission extends React.Component {
	state = {
		viewKey: false,
	};

	get key() {
		const { permissionInfo } = this.props;
		return `${permissionInfo.username}:${permissionInfo.password}`;
	}

	handleViewClick = () => {
		this.setState((prevState) => ({
			viewKey: !prevState.viewKey,
		}));
	};

	handleCopyCred = () => {
		notification.success({
			message: 'Credentials have been copied successfully!',
		});
	};

	handleEditCred = () => {
		const { permissionInfo, showForm } = this.props;
		const formPayload = {
			...permissionInfo,
			meta: {
				username: permissionInfo.username,
			},
		};
		showForm(permissionInfo, formPayload);
	};

	handleDeleteCred = async () => {
		const { permissionInfo, deletePermission } = this.props;
		deletePermission(permissionInfo.username);
	};

	render() {
		const { viewKey } = this.state;
		const { permissionInfo } = this.props;
		const isExpired = permissionInfo.expired;
		return (
			<Flex css={main} alignItems="center">
				<Flex justifyContent="space-between" alignItems="center" css={container}>
					<span>{viewKey ? this.key : '########################################'}</span>
					<Flex>
						<Tooltip
							placement="topLeft"
							title={viewKey ? 'Hide credentials' : 'View credentials'}
						>
							<Button onClick={this.handleViewClick} type="normal">
								{viewKey ? <Icon type="eye-invisible" /> : <Icon type="eye" />}
							</Button>
						</Tooltip>
						<CopyToClipboard text={this.key} onCopy={this.handleCopyCred}>
							<Tooltip placement="topLeft" title="Copy To Clipboard">
								<Button type="normal">
									<Icon type="copy" />
								</Button>
							</Tooltip>
						</CopyToClipboard>
						<Tooltip placement="topLeft" title="Edit credentials">
							<Button
								disabled={isExpired}
								onClick={this.handleEditCred}
								type="normal"
							>
								<Icon type="edit" />
							</Button>
						</Tooltip>
					</Flex>
				</Flex>
				<Popconfirm
					title="Are you sure delete this key?"
					onConfirm={this.handleDeleteCred}
					okText="Yes"
					cancelText="No"
				>
					<Button type="danger">
						<Icon type="delete" />
					</Button>
				</Popconfirm>
			</Flex>
		);
	}
}

Permission.propTypes = {
	permissionInfo: object.isRequired,
	showForm: func.isRequired,
	deletePermission: func.isRequired,
};

export default Permission;
