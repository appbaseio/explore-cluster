import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { Button, Tooltip, Icon } from 'antd';
import CommitModal from './CommitModal';
import PastVersionsDrawer from './PastVersionsDrawer';
// import { deployStatusMapper } from '../../utils/index';
import { commitCode, getAllVersions, getByVersionId } from '../../utils/sandpack-generator';

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
}) => {
	const [modalType, setModalType] = useState('');
	const [visible, setVisible] = useState(false);
	const [allVersions, setAllVersions] = useState([]);
	const [errMsg, setErrMsg] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	const preferenceId = match.params.id;

	useEffect(() => {
		fetchAllVersions();
	}, []);

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
				updateSandpackCode(res.content);
				setUpdatedCode(res.content);
				setInitialCode(res.content);
			})
			.catch((err) => {
				console.error(err);
				// setErrMsg(err);
			});
	};

	const handleCommitCode = (commitMessage) => {
		const body = {
			metadata: {
				commit: commitMessage,
			},
			content: updatedCode,
		};
		commitCode(preferenceId, body)
			.then((res) => {
				setCurrentVersion({
					version_id: res.version_id,
					updated_at: res.updated_at || res.created_at,
					commit: commitMessage,
				});
				fetchAllVersions();
				setModalType('');
				setIsLoading(false);
				setInitialCode(updatedCode);
			})
			.catch((err) => {
				console.error(err);
				setErrMsg('Error to commit code');
				setIsLoading(false);
			});
	};

	const handleCancel = () => {
		setModalType('');
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
			</div>

			<CommitModal
				errMsg={errMsg}
				setErrMsg={setErrMsg}
				open={modalType === 'commit'}
				setOpen={setModalType}
				isLoading={isLoading}
				preferenceId={preferenceId}
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
		</>
	);
};

ModalHeader.propTypes = {
	history: PropTypes.object.isRequired,
	match: PropTypes.object.isRequired,
	updateSandpackCode: PropTypes.func,
	updatedCode: PropTypes.object,
	setUpdatedCode: PropTypes.func,
	initialCode: PropTypes.object,
	currentVersion: PropTypes.object,
	setCurrentVersion: PropTypes.func,
	setInitialCode: PropTypes.func,
	uiBuilderName: PropTypes.string,
	handleSave: PropTypes.func,
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
	uiBuilderName: '',
};

export default withRouter(ModalHeader);
