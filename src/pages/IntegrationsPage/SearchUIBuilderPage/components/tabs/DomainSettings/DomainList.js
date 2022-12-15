import React, { useState } from 'react';
import { CloseCircleFilled, DeleteOutlined, SyncOutlined } from '@ant-design/icons';
import { Tag, Button, Tooltip, Modal, Input, message, Table, Spin } from 'antd';
import { bool, func, object, string } from 'prop-types';
import { hoverStyles } from './styles';
import { deleteDomain } from '../../../../utils/domain-apis';

const DomainList = ({
	domain: response,
	getDomainStatus,
	domainStatus,
	preferenceId,
	fetchAllDomains,
	isRefreshing,
	setIsRefreshing,
}) => {
	const [value, setValue] = useState('');
	const [visible, setVisible] = useState(false);
	const columns = [
		{
			title: 'Type',
			key: 'type',
			dataIndex: 'type',
		},
		{
			title: 'Name',
			key: 'name',
			dataIndex: 'name',
		},
		{
			title: 'Value',
			key: 'value',
			dataIndex: 'value',
		},
		{
			title: 'Action',
			key: 'delete',
			dataIndex: 'delete',
			render: () => {
				return (
					<>
						<SyncOutlined
							className="restore-icon"
							style={{ marginRight: 5, color: '#1890ff' }}
							onClick={() => {
								setIsRefreshing(true);
								getDomainStatus(response.name);
							}}
						/>

						<DeleteOutlined
							className="delete-icon show-on-hover"
							onClick={() => setVisible(true)}
						/>
					</>
				);
			},
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
						{domainStatus.misconfigured === true ? (
							<>
								<p>
									<CloseCircleFilled theme="filled" style={{ color: 'red' }} />{' '}
									Invalid Configuration
								</p>
								{isRefreshing ? (
									<Spin />
								) : (
									<Table
										columns={columns}
										dataSource={[
											{
												type: 'CNAME',
												name: response.name,
												value: 'cname.vercel-dns.com',
												key: '1',
											},
										]}
										pagination={{
											position: ['none', 'none'],
										}}
									/>
								)}
							</>
						) : (
							<div className="domain-row">
								<div className="domain-name">{response.name}</div>
								<div>
									{response.verified ? (
										<Tag className="tag-container" color="blue">
											Verified
										</Tag>
									) : (
										<>
											<Tag className="tag-container">
												Verification Pending
											</Tag>
											<Tooltip title="Refresh verification status">
												<Button
													type="primary"
													disabled={
														response.verified &&
														domainStatus.misconfigured !== true
													}
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
						)}
					</div>
				</>
			) : null}
			<Modal
				visible={visible}
				title="Confirm domain deletion"
				onOk={() => {
					handleDelete(response.name);
					setValue('');
				}}
				onCancel={() => {
					setVisible(false);
					setValue('');
				}}
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
	isRefreshing: false,
	setIsRefreshing: () => {},
};

DomainList.propTypes = {
	domain: object,
	domainStatus: object,
	getDomainStatus: func.isRequired,
	preferenceId: string,
	fetchAllDomains: func.isRequired,
	setIsRefreshing: func,
	isRefreshing: bool,
};

export default DomainList;
