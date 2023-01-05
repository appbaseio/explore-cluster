import { ArrowUpOutlined, UploadOutlined } from '@ant-design/icons';
import { Button, Modal, Tooltip } from 'antd';
import { object, string } from 'prop-types';
import React, { useState } from 'react';
import { withRouter } from 'react-router-dom';

const UpgradePlanModal = ({ history, tooltipProps, iconType }) => {
	const [isOpen, setIsOpen] = useState(false);

	const handleCancel = () => {
		setIsOpen(false);
	};

	const handleOpen = () => {
		setIsOpen(true);
	};

	const handleOk = () => {
		history.push('/cluster/billing');
	};

	const IconMapper = () => {
		return (
			<>
				{iconType ? (
					<>
						{iconType === 'UploadOutlined' && <UploadOutlined />}
						{iconType === 'ExternalLink' && (
							<img src="/static/images/external-link.svg" alt="external-link" />
						)}
					</>
				) : (
					<ArrowUpOutlined />
				)}
			</>
		);
	};

	return (
		<div>
			<Tooltip {...tooltipProps}>
				{iconType === 'ExternalLink' ? (
					<Button
						shape="circle"
						size="small"
						className="sp-button sp-icon-standalone"
						style={{ padding: 6, width: 28, height: 28 }}
						onClick={handleOpen}
					>
						<img
							src="/static/images/external-link.svg"
							alt="external-link"
							width="18px"
						/>
					</Button>
				) : (
					<Button
						shape="circle"
						icon={<IconMapper />}
						size="small"
						className="sp-button sp-icon-standalone"
						style={{ padding: 8, width: 28, height: 28 }}
						onClick={handleOpen}
					/>
				)}

				<Modal
					title={tooltipProps.title}
					open={isOpen}
					onOk={handleOk}
					onCancel={handleCancel}
					okText="Upgrade Now"
					cancelButtonProps={{
						style: {
							display: 'none',
						},
					}}
				>
					<p>This feature is only available for Production and Enterprise plans.</p>
				</Modal>
			</Tooltip>
		</div>
	);
};

UpgradePlanModal.defaultProps = {
	tooltipProps: { title: 'Upgrade the plan' },
	iconType: 'ArrowUpOutlined',
};

UpgradePlanModal.propTypes = {
	history: object.isRequired,
	tooltipProps: object,
	iconType: string,
};

export default withRouter(UpgradePlanModal);
