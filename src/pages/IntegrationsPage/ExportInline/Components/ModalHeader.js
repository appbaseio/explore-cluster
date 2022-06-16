import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import { Button, Tooltip, Icon, Modal, message } from 'antd';
import CommitModal from './CommitModal';
import PastVersionsDrawer from './PastVersionsDrawer';
import DeployLogsModal from './DeployLogsModal';
import DeployModal from './DeployModal';
import { deployStatusMapper } from '../../utils/index';
import {
	commitCode,
	getAllVersions,
	getByVersionId,
	getDeploymentStatus,
	deployUiBuilder,
} from '../../utils/sandpack-generator';

export async function asyncCallWithTimeout(asyncPromise, timeLimit) {
	let timeoutHandle;

	const timeoutPromise = new Promise((_resolve, reject) => {
		timeoutHandle = setTimeout(
			() => reject(new Error('Async call timeout limit reached')),
			timeLimit,
		);
	});

	return Promise.race([asyncPromise, timeoutPromise]).then((result) => {
		clearTimeout(timeoutHandle);
		return result;
	});
}

export function transformContent(content) {
	const newContent = {};
	Object.keys(content).forEach((path) => {
		if (path[0] !== '/') {
			const newPath = `/${path}`;
			newContent[newPath] = content[path];
		} else {
			newContent[path] = content[path];
		}
	});
	return newContent;
}

const ModalHeader = ({
	history,
	match,
	updateSandpackCode,
	updatedCode,
	setUpdatedCode,
	currentVersion,
	setCurrentVersion,
	setInitialCode,
	initialCode,
	uiBuilderName,
	handleSave,
	collapsed,
	setIsCollapsed,
	modalType,
	setModalType,
	setOpenCommitModal,
}) => {
	const [visible, setVisible] = useState(false);
	const [allVersions, setAllVersions] = useState([]);
	const [errMsg, setErrMsg] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [deploymentStatus, setDeploymentStatus] = useState({});
	const preferenceId = match.params.id;
	let myInterval = null;

	useEffect(() => {
		fetchAllVersions();
		fetchDeploymentStatus();
	}, []);

	useEffect(() => {
		if (modalType === 'error') {
			Modal.warning({
				title: (
					<div>
						Commit code for <b>{uiBuilderName}</b>
					</div>
				),
				content: 'You need to make some changes before you can commit',
				onOk: () => handleCancel(),
			});
		}
	}, [modalType]);

	const fetchAllVersions = () => {
		getAllVersions(preferenceId)
			.then((res) => {
				setAllVersions(res.versions);
			})
			.catch((err) => {
				console.error(err);
				// setErrMsg(err);
			});
	};

	const fetchByVersionId = (versionId) => {
		getByVersionId(preferenceId, versionId)
			.then((res) => {
				setCurrentVersion({
					version_id: res.version_id,
					updated_at: res.updated_at || res.created_at,
					commit: res?.metadata?.commit || '',
				});
				const newContent = transformContent(res.content);
				updateSandpackCode(newContent);
				setUpdatedCode(newContent);
				setInitialCode(newContent);
			})
			.catch((err) => {
				console.error(err);
				// setErrMsg(err);
			});
	};

	const handleCommitCode = (commitMessage) => {
		const newObj = {};
		Object.keys(updatedCode).forEach((path) => {
			if (path[0] === '/') {
				const newPath = path.slice(1);
				newObj[newPath] = updatedCode[path];
			} else {
				newObj[path] = updatedCode[path];
			}
		});

		const body = {
			metadata: {
				commit: commitMessage,
			},
			content: newObj,
		};

		commitCode(preferenceId, body)
			.then((res) => {
				setCurrentVersion({
					version_id: res.version_id,
					updated_at: res.updated_at || res.created_at,
					commit: commitMessage,
				});
				fetchAllVersions();
				handleCancel();
				setIsLoading(false);
				setInitialCode(updatedCode);

				message.info('Code is committed successfully');
			})
			.catch((err) => {
				console.error('Error to commit code', err);
				setErrMsg('Error to commit code');
				setIsLoading(false);
			});
	};

	const handleDeploy = (body) => {
		if (body.version_id === '') {
			// eslint-disable-next-line
			delete body.version_id;
		}
		deployUiBuilder(preferenceId, body)
			.then(() => {
				message.info('Deployed successfully');
				fetchDeploymentStatus('deployed');
				myInterval = setInterval(() => fetchDeploymentStatus(), 7000);
			})
			.catch((err) => {
				console.error(err);
				setIsLoading(false);
				if (err.message) setErrMsg(err.message);
				else setErrMsg('Error in deployment');
			});
	};

	const fetchDeploymentStatus = (status = 'notDeployed') => {
		getDeploymentStatus(preferenceId)
			.then((res) => {
				const state = deploymentStatus.status || deploymentStatus.state;
				setDeploymentStatus(res);
				if (status === 'deployed') {
					setIsLoading(false);
					setModalType('');
				}
				if (state === 'ERROR' || state === 'READY' || state === 'CANCELED')
					clearInterval(myInterval);
			})
			.catch((err) => {
				console.error(err);
				// setErrMsg(err);
			});
	};

	const handleCancel = () => {
		setModalType('');
		setOpenCommitModal(false);
		setErrMsg('');
	};

	return (
		<>
			<div className="header-container">
				<div className="header-title-container">
					<div className="header-font">Code Editor</div>
					{currentVersion.version_id && currentVersion.commit ? (
						<div className="header-title-container">
							<Tooltip title={currentVersion.commit}>
								<p
									style={{ maxWidth: 200 }}
									className="overflow-container commit-font"
								>
									{currentVersion.commit}
								</p>
							</Tooltip>

							<img
								src="/static/images/commit.png"
								alt="commit-icon"
								width={20}
								style={{ margin: '0px 5px 0px 5px' }}
							/>
							<Tooltip title={currentVersion.version_id}>
								<p
									style={{ maxWidth: 150 }}
									className="overflow-container  versionid-font"
								>
									{currentVersion.version_id}
								</p>
							</Tooltip>
						</div>
					) : null}

					<div className="right-partition">
						<Button
							disabled={JSON.stringify(initialCode) === JSON.stringify(updatedCode)}
							onClick={() => setModalType('commit')}
						>
							Commit
						</Button>
						<Button
							type="primary"
							onClick={() => setModalType('deploy-modal')}
							disabled={!currentVersion.version_id}
						>
							Deploy
						</Button>

						<Tooltip title="Past Versions" style={{ fontSize: 14 }}>
							{/* Past Versions */}
							<Icon
								style={{
									cursor: currentVersion.version_id ? 'pointer' : 'not-allowed',
									color: currentVersion.version_id
										? 'rgba(0,0,0,0.65)'
										: '#bbb7b7',
								}}
								type="clock-circle"
								onClick={() => {
									if (currentVersion.version_id) setVisible(true);
								}}
							/>
						</Tooltip>
						<Icon
							type="close"
							onClick={() => {
								history.push(`/cluster/search-builder/${preferenceId}`);
								handleSave();
							}}
						/>
					</div>
				</div>
				{deploymentStatus.status || deploymentStatus.state ? (
					<div className="status-container" onClick={() => setModalType('deploy-logs')}>
						<Button type="link" style={{ padding: 0 }}>
							Deploy Status
						</Button>
						{deployStatusMapper[deploymentStatus.status || deploymentStatus.state]}
					</div>
				) : null}
				<div>
					<Icon
						styles={{ cursor: 'pointer' }}
						type={collapsed ? 'menu-unfold' : 'menu-fold'}
						onClick={() => setIsCollapsed(!collapsed)}
					/>
				</div>
			</div>

			<CommitModal
				errMsg={errMsg}
				setErrMsg={setErrMsg}
				open={modalType === 'commit'}
				isLoading={isLoading}
				handleOk={(commitMessage) => {
					setIsLoading(true);
					handleCommitCode(commitMessage);
				}}
				handleCancel={handleCancel}
				uiBuilderName={uiBuilderName}
			/>
			<PastVersionsDrawer
				visible={visible}
				setVisible={setVisible}
				currentVersion={currentVersion}
				allVersions={allVersions}
				fetchByVersionId={fetchByVersionId}
			/>
			<DeployLogsModal
				open={modalType === 'deploy-logs'}
				handleCancel={handleCancel}
				deploymentStatus={deploymentStatus}
				uiBuilderName={uiBuilderName}
				preferenceId={preferenceId}
			/>
			<DeployModal
				errMsg={errMsg}
				setErrMsg={setErrMsg}
				open={modalType === 'deploy-modal'}
				uiBuilderName={uiBuilderName}
				handleOk={(deployObj) => {
					setIsLoading(true);
					handleDeploy(deployObj);
				}}
				isLoading={isLoading}
				handleCancel={handleCancel}
				allVersions={allVersions}
			/>
		</>
	);
};

ModalHeader.propTypes = {
	history: PropTypes.object.isRequired,
	match: PropTypes.object.isRequired,
	updateSandpackCode: PropTypes.func,
	uiBuilderName: PropTypes.string,
	updatedCode: PropTypes.object,
	setUpdatedCode: PropTypes.func,
	initialCode: PropTypes.object,
	currentVersion: PropTypes.object,
	setCurrentVersion: PropTypes.func,
	setInitialCode: PropTypes.func,
	handleSave: PropTypes.func,
	setIsCollapsed: PropTypes.func,
	collapsed: PropTypes.bool,
	modalType: PropTypes.string,
	setModalType: PropTypes.func,
	setOpenCommitModal: PropTypes.func,
};

ModalHeader.defaultProps = {
	updateSandpackCode: () => {},
	updatedCode: {},
	initialCode: {},
	currentVersion: {},
	setCurrentVersion: () => {},
	setInitialCode: () => {},
	setUpdatedCode: () => {},
	handleSave: () => {},
	setIsCollapsed: () => {},
	uiBuilderName: '',
	collapsed: false,
	modalType: '',
	setModalType: () => {},
	setOpenCommitModal: () => {},
};

export default withRouter(ModalHeader);
