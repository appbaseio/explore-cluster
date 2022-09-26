/* eslint-disable camelcase */
import { Alert, Button, Card, Icon, Modal, Tooltip } from 'antd';
import React from 'react';
import { bool, func, object } from 'prop-types';
import moment from 'moment';
import { css } from 'emotion';
import Flex from '../../../../../batteries/components/shared/Flex';
import Grid from '../../../../../components/CreateCredentials/Grid';
import Monaco from '../../../../../batteries/components/SearchSandbox/containers/MonacoEditor';
import { monacoOptions } from '../../../../../components/ScriptConsole/utils';

const detailsModalCss = css`
	.detail-card {
		margin: 2rem 0;
	}

	.detail-item {
		flex-direction: column;

		& > div:nth-child(2) {
			margin-left: 0;
		}
	}

	.monaco-wrapper {
		width: 100% !important;
		height: 250px !important;
	}

	.danger-zone-alert-box {
		margin: 10px auto;
		color: rgb(95, 15, 36);
		.content {
			flex-direction: column;
			gap: 10px;

			h3 {
				margin-bottom: 0;
				color: rgb(95, 15, 36);
			}
		}

		.action-btn {
			color: white;
		}
	}
`;

const ViewDetailsModal = ({
	userItem,
	visible,
	handleClose,
	isBasicAuth,
	setShowDeleteUserModal,
	setShowBlockUserModal,
	setShowChangePasswordModal,
}) => {
	const { name, email, email_verified, created_at, last_login, identities, blocked } = userItem;

	const DANGER_ZONE_CONTENT = [
		{
			title: 'Delete user',
			description:
				'The user will be removed and it will no longer have access to your applications.',
			buttonText: 'Delete',
			buttonClickHandler: () => {
				setShowDeleteUserModal(true);
			},
		},
		{
			title: blocked ? 'Unblock' : 'Block User',
			description: blocked
				? 'The user will be unblocked for logging into your applications.'
				: 'The user will be blocked for logging into your applications.',
			buttonText: blocked ? 'Unblock' : 'Block',
			buttonClickHandler: () => {
				setShowBlockUserModal(true);
			},
		},
		...(isBasicAuth
			? [
					{
						title: 'Change Password',
						description:
							'Once you change it, the user will not be able to log in using their previous password.',
						buttonText: 'Change',
						buttonClickHandler: () => {
							setShowChangePasswordModal(true);
						},
					},
			  ]
			: []),
	];

	return (
		<Modal
			className={detailsModalCss}
			visible={visible}
			onCancel={handleClose}
			footer={null}
			title="User Details"
			width="max(80vw, 300px)"
		>
			<Card className="detail-card">
				<Flex style={{ flexWrap: 'wrap', gap: '2rem' }}>
					<Grid className="detail-item" label="Name" component={<span>{name}</span>} />
					<Grid
						className="detail-item"
						label="Email"
						component={
							<span>
								{email} &nbsp;
								<Tooltip
									title={email_verified ? 'Verified' : 'Verification pending'}
								>
									<Icon
										type={email_verified ? 'check-circle' : 'clock-circle'}
										style={{
											color: email_verified ? 'green' : 'red',
										}}
									/>
								</Tooltip>{' '}
							</span>
						}
					/>
					<Grid
						className="detail-item"
						label="Signed Up"
						component={<span>{moment(created_at).format('ddd D MMM, hh:mm A')}</span>}
					/>
					<Grid
						className="detail-item"
						label="Latest Login"
						component={<span>{moment(last_login).format('ddd D MMM, hh:mm A')}</span>}
					/>
				</Flex>
			</Card>

			<Card className="detail-card" title="Identity Provider Attributes">
				<Grid
					label="Identities"
					component={
						<Monaco
							language="javascript"
							value={JSON.stringify(identities, 0, 4)}
							options={monacoOptions}
							readOnly
							wrapperClass="monaco-wrapper"
						/>
					}
				/>
			</Card>
			<h3>Danger Zone</h3>
			{DANGER_ZONE_CONTENT.map(({ title, description, buttonText, buttonClickHandler }) => (
				<Alert
					key={title}
					description={
						<Flex justifyContent="space-between" alignItems="center">
							<Flex className="content">
								<h3>{title}</h3>
								<p>{description}</p>
							</Flex>
							<Button
								onClick={buttonClickHandler}
								className="action-btn"
								type="danger"
							>
								{buttonText}
							</Button>
						</Flex>
					}
					type="error"
					closable={false}
					className="danger-zone-alert-box"
				/>
			))}
		</Modal>
	);
};
ViewDetailsModal.defaultProps = {
	userItem: null,
	visible: false,
	isBasicAuth: false,
};

ViewDetailsModal.propTypes = {
	userItem: object,
	visible: bool,
	handleClose: func.isRequired,
	setShowDeleteUserModal: func.isRequired,
	setShowBlockUserModal: func.isRequired,
	setShowChangePasswordModal: func.isRequired,
	isBasicAuth: bool,
};
export default ViewDetailsModal;
