import React, { useState, useEffect } from 'react';
import PropTypes, { object } from 'prop-types';
import { withRouter } from 'react-router-dom';
import get from 'lodash/get';
import {
	ClockCircleOutlined,
	CloseOutlined,
	MenuUnfoldOutlined,
	MenuFoldOutlined,
} from '@ant-design/icons';
import { Button, Tooltip, Modal, message } from 'antd';
import { connect } from 'react-redux';
import CommitModal from './CommitModal';
// eslint-disable-next-line import/no-cycle
import PastVersionsDrawer from './PastVersionsDrawer';
import DeployLogsModal from './DeployLogsModal';
import DeployModal from './DeployModal';
import { deployStatusMapper, getTemplate } from '../../../utils/index';
import {
	commitCode,
	deployUiBuilder,
	transformPreferences,
} from '../../../utils/sandpack-generator';
import UploadModal from './ProjectUpload/UploadModal';
import ThemeSwitch from '../../../../../components/ThemeSwitcher';
import {
	getSearchPreferenceDeploymentStatus,
	getSearchPreferences as getSearchPreferencesAction,
	getSearchPreferenceVersions as getSearchPreferenceVersionsAction,
	saveSearchPreference,
} from '../../../../../batteries/modules/actions';
import AppConstants from '../../../../../batteries/modules/constants';

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
	updatedCode,
	uiBuilderName,

	collapsed,
	setIsCollapsed,
	modalType,
	setModalType,
	setOpenCommitModal,
	preferences,
	themeType: localTheme,
	setThemeType,
	getSearchPreferenceVersions,
	versionState,
	updateVersionStateForPreference,
	getSearchPreferences,
	updateSearchPreferences,
	getDeploymentStatus,
}) => {
	const [visible, setVisible] = useState(false);
	const [errMsg, setErrMsg] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	const preferenceId = match.params.id;
	const {
		allVersions = [],
		currentVersion = {},
		initialCode = {},
	} = versionState[preferenceId] ?? {};
	const themeType = get(preferences, 'themeSettings.type', '');
	const templateObj = getTemplate(themeType);
	let myInterval = null;

	useEffect(() => {
		getSearchPreferenceVersions(preferenceId);
		const { deploymentStatus = {} } = versionState[preferenceId] ?? {};
		if (!Object.keys(deploymentStatus).length) fetchDeploymentStatus();
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

	useEffect(() => {
		// eslint-disable-next-line
		if (templateObj?.manifest_path && !updatedCode[`/${templateObj.manifest_path}`]) {
			setErrMsg('Manifest is missing');
		} else {
			setErrMsg('');
		}
	}, [updatedCode]);

	const handleCommitCode = (commitMessage, fileContent = {}) => {
		let newObj = {};
		const isUploadCommit = fileContent && Object.keys(fileContent).length;
		if (isUploadCommit) {
			newObj = { ...fileContent };
		} else
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
				user: localStorage.getItem('username'),
			},
			content: newObj,
		};

		commitCode(preferenceId, body)
			.then((res) => {
				// fetch all the versions again
				getSearchPreferenceVersions(preferenceId);
				handleCancel();
				setIsLoading(false);
				let initialCodeNew;
				let updatedCodeNew;
				let sandpackCode;
				if (isUploadCommit) {
					const newContent = transformContent(newObj);
					updatedCodeNew = newContent;
					sandpackCode = newContent;
					initialCodeNew = newContent;
				} else initialCodeNew = updatedCode;

				// update current Version in  redux store
				updateVersionStateForPreference({
					preferenceId,
					patchPayload: JSON.parse(
						JSON.stringify({
							currentVersion: {
								version_id: res.version_id,
								updated_at: res.updated_at || res.created_at,
								commit: commitMessage,
							},
							initialCode: initialCodeNew,
							sandpackCode,
							updatedCode: updatedCodeNew,
						}),
					),
				});

				// below code is responsible for syhncing the committed code with what appears in the main settings page
				const newContent = transformContent(body.content);
				const newPreferences = JSON.parse(
					newContent[`/${templateObj.preferences_path}`]
						.replace('const appbasePrefs = ', '')
						.replace('export default JSON.stringify(appbasePrefs);', '')
						.replace(';', '')
						.trim(),
				);

				updateSearchPreferences(
					preferenceId,
					transformPreferences(newPreferences, true),
				).then(() => {
					getSearchPreferenceVersions(preferenceId);
					getSearchPreferences();
				});
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
				const state = res.status || res.state;
				if (status === 'deployed') {
					setIsLoading(false);
					setModalType('deploy-logs');
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
		setIsLoading(false);
		if (errMsg !== 'Manifest is missing') setErrMsg('');
	};

	const iconColor = () => {
		if (localStorage.getItem('theme') === 'dark') {
			return 'brightness(0) invert(1)';
		}

		return 'brightness(0%)';
	};

	const { deploymentStatus = {} } = versionState[preferenceId] ?? {};
	return (
		<>
			<div className="header-container">
				<div className="header-title-container" style={{ width: '100%' }}>
					<div className="header-font">Code Editor</div>
					{currentVersion.version_id && currentVersion.commit ? (
						<div
							className="header-title-container"
							style={{ justifyContent: 'center', maxWidth: '70%' }}
						>
							<Tooltip title={currentVersion.commit}>
								<p
									style={{ maxWidth: '65%', margin: 0 }}
									className="overflow commit-font"
								>
									{currentVersion.commit}
								</p>
							</Tooltip>

							<img
								src="/static/images/commit.png"
								alt="commit-icon"
								width={20}
								style={{ margin: '0px 5px 0px 5px', filter: iconColor() }}
							/>
							<Tooltip title={currentVersion.version_id}>
								<p style={{ margin: 0 }} className="overflow  versionid-font">
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
							<ClockCircleOutlined
								style={{
									cursor: currentVersion.version_id ? 'pointer' : 'not-allowed',
								}}
								onClick={() => {
									if (currentVersion.version_id) setVisible(true);
								}}
							/>
						</Tooltip>
						<CloseOutlined
							onClick={() => {
								history.push(`/cluster/search-builder/${preferenceId}`);
							}}
						/>
					</div>
				</div>
				{/* eslint-disable-next-line */}
				{currentVersion.version_id === deploymentStatus?.meta?.version_id &&
				(deploymentStatus.status || deploymentStatus.state) ? (
					<div className="status-container" onClick={() => setModalType('deploy-logs')}>
						<Button type="link" style={{ padding: 0, marginRight: 5 }}>
							Deploy Status
						</Button>
						{deployStatusMapper[deploymentStatus.status || deploymentStatus.state]}
					</div>
				) : null}
				<div className="header-icons">
					{collapsed ? (
						<MenuUnfoldOutlined
							style={{ cursor: 'pointer' }}
							onClick={() => setIsCollapsed(!collapsed)}
						/>
					) : (
						<MenuFoldOutlined
							style={{ cursor: 'pointer' }}
							onClick={() => setIsCollapsed(!collapsed)}
						/>
					)}
					<UploadModal
						errMsg={errMsg}
						setErrMsg={setErrMsg}
						setIsLoading={setIsLoading}
						isLoading={isLoading}
						open={modalType === 'upload'}
						setModalType={setModalType}
						handleCancel={handleCancel}
						handleCommitCode={handleCommitCode}
					/>
					<ThemeSwitch themeType={localTheme} setThemeType={setThemeType} />
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
				updatedCode={updatedCode}
				initialCode={initialCode}
			/>
			<PastVersionsDrawer
				visible={visible}
				setVisible={setVisible}
				currentVersion={currentVersion}
				allVersions={allVersions}
				preferenceId={preferenceId}
				updatedCode={updatedCode}
				initialCode={initialCode}
				updateVersionStateForPreference={updateVersionStateForPreference}
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
				currentVersion={currentVersion}
				templateObj={templateObj}
				deploymentStatus={deploymentStatus}
			/>
		</>
	);
};

ModalHeader.propTypes = {
	history: PropTypes.object.isRequired,
	match: PropTypes.object.isRequired,
	uiBuilderName: PropTypes.string,
	updatedCode: PropTypes.object,
	setIsCollapsed: PropTypes.func,
	collapsed: PropTypes.bool,
	modalType: PropTypes.string,
	setModalType: PropTypes.func,
	setOpenCommitModal: PropTypes.func,
	preferences: PropTypes.object,
	themeType: PropTypes.string,
	setThemeType: PropTypes.func,
	getSearchPreferenceVersions: PropTypes.func.isRequired,
	versionState: object,
	updateVersionStateForPreference: PropTypes.func.isRequired,
	updateSearchPreferences: PropTypes.func.isRequired,
	getSearchPreferences: PropTypes.func.isRequired,
	getDeploymentStatus: PropTypes.func.isRequired,
};

ModalHeader.defaultProps = {
	updatedCode: {},
	setIsCollapsed: () => {},
	uiBuilderName: '',
	collapsed: false,
	modalType: '',
	setModalType: () => {},
	setOpenCommitModal: () => {},
	preferences: {},
	themeType: localStorage.getItem('theme') || 'light',
	setThemeType: () => {},
	versionState: {},
};
const mapStateToProps = (state) => {
	return {
		versionState: get(state, '$getSearchPreferencesVersions.results', {}),
	};
};

const mapDispatchToProps = (dispatch) => ({
	getSearchPreferences: () => dispatch(getSearchPreferencesAction()),
	getSearchPreferenceVersions: (preferenceId) =>
		dispatch(getSearchPreferenceVersionsAction(preferenceId)),
	updateVersionStateForPreference: (payload) =>
		dispatch({
			type: AppConstants.APP.UI_BUILDER.SEARCH_PREFERENCE_VERSIONS
				.UPDATE_PREFERENCE_STATE_SUCCESS,
			payload,
		}),
	updateSearchPreferences: (preferenceId, payload) =>
		dispatch(saveSearchPreference(preferenceId, payload)),
	getDeploymentStatus: (preferenceId) =>
		dispatch(getSearchPreferenceDeploymentStatus(preferenceId)),
});

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(ModalHeader));
