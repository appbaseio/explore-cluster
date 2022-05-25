import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Card, Skeleton } from 'antd';
import Editor from './Editor';
import { deployStatusMapper, timeDifference } from '../../utils/index';
import { deployModalStyles, pastVersionsStyles } from './styles';
import '../styles.css';

const DeployModal = ({
	open,
	handleCancel,
	deploymentStatus,
	errMsg,
	deployLogs,
	uiBuilderName,
}) => {
	return (
		<div css={deployModalStyles}>
			<Modal
				title={<div style={{ fontWeight: 'bold' }}>Deploy Status</div>}
				visible={open}
				onOk={() => handleCancel()}
				onCancel={() => handleCancel()}
				footer={null}
				width={1000}
			>
				<Card
					title={
						<div style={{ maxHeight: 200 }} css={pastVersionsStyles}>
							<div className="row-data">
								<div className="label">{uiBuilderName}</div>
								<div>
									<span className="label">Deploy Status: </span>
									{deploymentStatus.status}{' '}
									{deployStatusMapper[deploymentStatus.status]}
								</div>
							</div>
							<div className="row-data">
								{deploymentStatus.deployed_at ? (
									<div>
										<span className="label">Deployed: </span>
										{timeDifference(
											new Date(),
											new Date(deploymentStatus.deployed_at * 1000),
										)}
									</div>
								) : null}

								<div>
									<span className="label">Environment:</span>{' '}
									{deploymentStatus.environment}
								</div>
							</div>
							<div className="row-data">
								<div>
									<span className="label">Version:</span>{' '}
									{deploymentStatus.version_id}
								</div>
								<div>
									<span className="label">URL: </span>
									{deploymentStatus.site_url}
								</div>
							</div>
							{/* <Row>
								<Col span={12}>ui_builder_name</Col>
								<Col span={12}>Deploy Status: {deploymentStatus.status}</Col>
							</Row>
							<Row>
								<Col span={12}>Deployed: {deploymentStatus.deployed_at}</Col>
								<Col span={12}>Environment: {deploymentStatus.environment}</Col>
							</Row>
							<Row>
								<Col span={12}>Version: {deploymentStatus.version_id}</Col>
								<Col span={12}>URL: {deploymentStatus.site_url}</Col>
							</Row> */}
						</div>
					}
				>
					{!deployLogs.length ? (
						<Skeleton active />
					) : (
						<Editor logs={deployLogs} errMsg={errMsg} />
					)}
				</Card>
			</Modal>
		</div>
	);
};

DeployModal.propTypes = {
	open: PropTypes.bool,
	handleCancel: PropTypes.func.isRequired,
	deployLogs: PropTypes.array,
	errMsg: PropTypes.string,
	deploymentStatus: PropTypes.object,
	uiBuilderName: PropTypes.string,
};

DeployModal.defaultProps = {
	open: false,
	deployLogs: [],
	errMsg: '',
	deploymentStatus: {},
	uiBuilderName: '',
};

export default DeployModal;
