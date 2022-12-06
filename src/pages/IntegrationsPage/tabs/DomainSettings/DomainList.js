import React, { useState } from 'react';
import { DeleteOutlined, SyncOutlined } from '@ant-design/icons';
import { Tag, Button, Tooltip, Modal, Input, message, Table } from 'antd';
import { func, object, string } from 'prop-types';
import { hoverStyles } from './styles';
import { deleteDomain } from '../../utils/domain-apis';

const DomainList = ({
	domain: response,
	getDomainStatus,
	domainStatus,
	preferenceId,
	fetchAllDomains,
}) => {
	const [value, setValue] = useState('');
	const [visible, setVisible] = useState(false);
	const columns = [
		{
			title: 'Code',
			key: 'code',
			dataIndex: 'code',
		},
		{
			title: 'Message',
			key: 'message',
			dataIndex: 'message',
		},
	];

	const handleDelete = (domainId) => {
		deleteDomain(preferenceId, domainId)
			.then((res) => res.json())
			.then((res) => {
				if (res.error) {
					message.error('Error in deleting domain');
				} else {
					fetchAllDomains();
				}
				setVisible(false);
			})
			.catch((err) => {
				setVisible(false);
				console.error('Error to fetch domain status', err);
				if (err?.error.message) message.error(err?.error.message);
			});
	};

	return (
		<div>
			{response.name ? (
				<>
					<div className="domain-status-container" css={hoverStyles}>
						<div className="domain-row">
							<div className="domain-name">{response.name}</div>
							<div>
								{response.verified ? (
									<Tag className="tag-container" color="blue">
										Verified
									</Tag>
								) : (
									<>
										<Tag className="tag-container">Verification Pending</Tag>
										<Tooltip title="Refresh verification status">
											<Button
												type="primary"
												disabled={response.verified}
												onClick={() => getDomainStatus(response.name)}
											>
												<SyncOutlined className="restore-icon" />
											</Button>
										</Tooltip>
									</>
								)}
							</div>
							<div>
								<DeleteOutlined
									className="delete-icon show-on-hover"
									onClick={() => setVisible(true)}
								/>
							</div>
						</div>
					</div>
					{domainStatus.name && domainStatus.name === response.name ? (
						<Table
							columns={columns}
							dataSource={[{ ...domainStatus.status.error, key: '1' }]}
							pagination={{
								position: ['none', 'none'],
							}}
						/>
					) : null}
				</>
			) : null}
			<Modal
				open={visible}
				title="Confirm domain deletion"
				onOk={() => {
					handleDelete(response.name);
				}}
				onCancel={() => setVisible(false)}
				okButtonProps={{
					disabled: response.name !== value,
				}}
			>
				<div>
					<div>
						Enter the domain name: <b>{response.name}</b> below to confirm the domain
						deletion. You can always add it back!
					</div>
					<Input value={value} onChange={(e) => setValue(e.target.value)} />
				</div>
			</Modal>
		</div>
	);
};

DomainList.defaultProps = {
	domain: {},
	domainStatus: {},
	preferenceId: '',
};

DomainList.propTypes = {
	domain: object,
	domainStatus: object,
	getDomainStatus: func.isRequired,
	preferenceId: string,
	fetchAllDomains: func.isRequired,
};

export default DomainList;
