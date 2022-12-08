import React, { useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { object, func, bool } from 'prop-types';
import get from 'lodash/get';
import { css } from 'react-emotion';
import { SandpackProvider } from '@codesandbox/sandpack-react';
import { sandpackDark, githubLight } from '@codesandbox/sandpack-themes';
// eslint-disable-next-line
import SandPackIntegration from './Components/SandpackIntegration/SandpackIntegration';
import ModalHeader, { transformContent } from './Components/ModalHeader';
import Loader from '../../../../components/Loader';
import {
	generateInlineSandboxURL,
	tabSettings,
	replaceWithPreferences,
} from '../../utils/sandpack-generator';
import {
	saveSearchPreference,
	getSearchPreferences as getSearchPreferencesAction,
	getSearchPreferenceLatestVersion,
	getSearchPreferenceVersionCodeByVersion,
} from '../../../../batteries/modules/actions';
import AppConstants from '../../../../batteries/modules/constants';

import { getTemplate } from '../../utils/index';

const modalStyles = css`
	padding-bottom: 0 !important;
	position: absolute;
	right: 0;
	left: 0;
	z-index: 999;
	bottom: 0;
	top: 80px;

	.ant-modal {
		top: 0;
	}
	.ant-modal-content {
		border-radius: 0;
		min-height: 100%;
		.ant-modal-body {
			padding: 0;
		}
	}
	@media (max-width: 767px) {
		margin: 0 !important;
	}
`;

export const SandpackCodeContext = React.createContext();

const ExportInline = ({
	preferences,
	history,
	match,
	control,
	updateSearchPreferences,
	getPreferencesPayload,
	getSearchPreferences,
	versionState,
	getLatestVersionCode,
	getCodeByVersionId,
	isLoading,
	updateVersionStateForPreference,
}) => {
	const preferenceId = match.params.id;
	const { currentVersion, sandpackCode, initialCode, updatedCode } =
		versionState[preferenceId] ?? {};

	const [searchIndex, setSearchIndex] = useState({});
	const [collapsed, setIsCollapsed] = useState(false);
	const [modalType, setModalType] = useState('');
	const [openCommitModal, setOpenCommitModal] = useState(false);
	const [themeType, setThemeType] = useState(localStorage.getItem('theme') || 'light');

	useEffect(() => {
		fetchLatestVersion();
	}, [preferences]);

	useEffect(() => {
		if (openCommitModal) {
			if (JSON.stringify(initialCode) === JSON.stringify(updatedCode)) {
				// Open error modal on cntr+s or cmd+s
				setModalType('error');
			} else {
				// Open commit modal on cntr+s or cmd+s
				setModalType('commit');
			}
		}
	}, [openCommitModal]);

	const getSandPackCode = async () => {
		const searchIndexObj = {};
		const response = await generateInlineSandboxURL(preferences);
		Object.entries(response).forEach(([key, val]) => {
			const newFilesArr = val.split('\n').map((line, index) => {
				return {
					line: index + 1,
					path: key,
					text: line,
				};
			});
			searchIndexObj[key] = [...newFilesArr];
		});
		setSearchIndex(searchIndexObj);
		updateVersionStateForPreference({
			updatedCode: response,
			sandpackCode: response,
			initialCode: response,
		});
	};

	const trasformSearchIndex = (code) => {
		const searchIndexObj = {};
		Object.entries(code).forEach(([key, val]) => {
			const newFilesArr = val.split('\n').map((line, index) => {
				return {
					line: index + 1,
					path: key,
					text: line,
				};
			});
			searchIndexObj[key] = [...newFilesArr];
		});
		setSearchIndex(searchIndexObj);
	};

	const updateSearchIndex = (data) => {
		setSearchIndex(data);
	};

	const closeModal = () => {
		// closeModal
		history.push(`/cluster/search-builder/${preferenceId}`);
	};

	const fetchLatestVersion = () => {
		getLatestVersionCode(preferenceId)
			.then(async (response) => {
				const { res } = response.payload;
				if (res.content) {
					const newContent = transformContent(res.content);
					const updatedCodeResponse = await replaceWithPreferences(
						newContent,
						preferences,
					);
					trasformSearchIndex(updatedCodeResponse);
					updateVersionStateForPreference({
						preferenceId,
						patchPayload: {
							updatedCode: updatedCodeResponse,
							sandpackCode: updatedCodeResponse,
							initialCode: newContent,
						},
					});
				}
			})
			.catch((err) => {
				console.error('Error to fetch latest version', err);
				getSandPackCode();
			});
	};

	const fetchByVersionId = (versionId) => {
		getCodeByVersionId(preferenceId, versionId)
			.then((response) => {
				const { res } = response.payload;

				const newContent = transformContent(res.content);
				trasformSearchIndex(newContent);
				updateVersionStateForPreference({
					preferenceId,
					patchPayload: {
						updatedCode: newContent,
						sandpackCode: newContent,
						initialCode: newContent,
					},
				});
			})
			.catch((err) => {
				console.error(err);
				// setErrMsg(err);
			});
	};

	const handleCreateFile = (val, path, sandpack) => {
		const regex = /\/\//gm;
		const newPath = path.replace(regex, `/${val}`);
		const newSandpackCode = {
			...sandpackCode,
			[newPath]: '',
		};
		trasformSearchIndex(newSandpackCode);

		updateVersionStateForPreference({
			preferenceId,
			patchPayload: {
				updatedCode: newSandpackCode,
				sandpackCode: newSandpackCode,
			},
		});

		const newSearchIndex = { ...searchIndex };
		newSearchIndex[newPath] = [
			{
				line: 1,
				path: newPath,
				text: '',
			},
		];
		updateSearchIndex(newSearchIndex);
		setTimeout(() => {
			sandpack.openFile(newPath);
		}, 0);
	};

	const handleRenameFile = (data, path) => {
		const newSandpackCode = {
			...updatedCode,
		};
		const fileName = path.split('/').filter(Boolean).pop();

		// eslint-disable-next-line
		if (newSandpackCode[path] || newSandpackCode[path] === '') {
			const newKey = path.replace(fileName, data);
			newSandpackCode[newKey] = newSandpackCode[path];
			delete newSandpackCode[path];
		}
		trasformSearchIndex(newSandpackCode);

		updateVersionStateForPreference({
			preferenceId,
			patchPayload: {
				updatedCode: newSandpackCode,
				sandpackCode: newSandpackCode,
			},
		});

		const newSearchIndex = { ...searchIndex };
		if (newSearchIndex[path]) {
			const newKey = path.replace(fileName, data);
			newSearchIndex[path].forEach((line) => {
				// eslint-disable-next-line
				line[newKey] = line[path];
				// eslint-disable-next-line
				delete line[path];
			});
			newSearchIndex[newKey] = newSearchIndex[path];
			delete newSearchIndex[path];
		}
		updateSearchIndex(newSearchIndex);
	};

	const handleRenameFolder = (data, path) => {
		const regex = /\/\//gm;
		const fileName = path.split('/').filter(Boolean).pop();
		const newPath = path.replace(regex, `/`);
		const newSandpackCode = {
			...updatedCode,
		};
		const newSearchIndex = { ...searchIndex };
		// eslint-disable-next-line
		for (const [key, val] of Object.entries(newSandpackCode)) {
			if (key.indexOf(newPath) !== -1) {
				const newKey = key.replace(fileName, data);
				newSandpackCode[newKey] = newSandpackCode[key];
				delete newSandpackCode[key];
			}
		}
		trasformSearchIndex(newSandpackCode);

		updateVersionStateForPreference({
			preferenceId,
			patchPayload: {
				updatedCode: newSandpackCode,
				sandpackCode: newSandpackCode,
			},
		});

		// eslint-disable-next-line
		for (const [key, val] of Object.entries(newSearchIndex)) {
			if (key.indexOf(newPath) !== -1) {
				const newKey = key.replace(fileName, data);
				newSearchIndex[newKey] = newSearchIndex[key];
				delete newSearchIndex[key];
			}
		}
		updateSearchIndex(newSearchIndex);
	};

	const handleDelete = (path) => {
		const fileName = path.split('/').filter(Boolean).pop();
		const newSandpackCode = {
			...sandpackCode,
		};
		// eslint-disable-next-line
		for (const [key, val] of Object.entries(newSandpackCode)) {
			if (key.indexOf(fileName) !== -1) {
				delete newSandpackCode[key];
			}
		}
		trasformSearchIndex(newSandpackCode);

		updateVersionStateForPreference({
			preferenceId,
			patchPayload: {
				updatedCode: newSandpackCode,
				sandpackCode: newSandpackCode,
			},
		});

		const newSearchIndex = { ...searchIndex };
		// eslint-disable-next-line
		for (const [key, val] of Object.entries(newSearchIndex)) {
			if (key.indexOf(fileName) !== -1) {
				delete newSearchIndex[key];
			}
		}
		updateSearchIndex(newSearchIndex);
	};

	const handleSave = () => {
		if (control.get('versionId').value !== currentVersion.version_id) {
			control.get('versionId').setValue(currentVersion.version_id);
			updateSearchPreferences(getPreferencesPayload()).then((action) => {
				if (!(action && action.error)) {
					// fetch preferences
					getSearchPreferences();
				}
			});
		}
	};

	const theme = get(preferences, 'themeSettings.type', 'classic');
	const uiBuilderName = get(preferences, 'name', '');
	const pageSettings = get(preferences, 'pageSettings', {});
	const templateObj = getTemplate(theme);
	const { currentPage } = pageSettings;
	const route = templateObj.pages ? templateObj.pages[currentPage] || '/' : '/';

	if (isLoading || !sandpackCode) return <Loader />;

	return (
		<div className={`${themeType}-theme-wrapper`}>
			<ModalHeader
				uiBuilderName={uiBuilderName}
				updatedCode={updatedCode}
				handleSave={handleSave}
				fetchByVersionId={fetchByVersionId}
				setIsCollapsed={setIsCollapsed}
				collapsed={collapsed}
				modalType={modalType}
				setModalType={setModalType}
				setOpenCommitModal={setOpenCommitModal}
				preferences={preferences}
				themeType={themeType}
				setThemeType={setThemeType}
			/>
			<div className={modalStyles}>
				<SandpackProvider
					template={templateObj.template || 'react'}
					files={{ ...sandpackCode }}
					customSetup={{
						entry: 'src/index.js',
					}}
					options={{
						activeFile: tabSettings[theme]?.activePath, // used to be activePath
						visibleFiles: tabSettings[theme]?.openPaths, // used to be openPaths
						startRoute: route,
					}}
					theme={themeType === 'light' ? githubLight : sandpackDark}
				>
					<SandpackCodeContext.Provider
						value={{
							sandpackCode,
							searchIndex,
							preferences,
							updateSandpackCode: (code) => {
								trasformSearchIndex(code);

								updateVersionStateForPreference({
									preferenceId,
									patchPayload: {
										sandpackCode: code,
									},
								});
							},
							updateSearchIndex,
							handleCreateFile,
							handleRenameFile,
							handleRenameFolder,
							handleDelete,
							setModalType,
							themeType,
						}}
					>
						<SandPackIntegration
							closeModal={closeModal}
							trasformSearchIndex={trasformSearchIndex}
							updatedCode={updatedCode}
							setOpenCommitModal={setOpenCommitModal}
							setUpdatedCode={(code) =>
								updateVersionStateForPreference({
									preferenceId,
									patchPayload: {
										updatedCode: code,
									},
								})
							}
							collapsed={collapsed}
						/>
					</SandpackCodeContext.Provider>
				</SandpackProvider>
			</div>
		</div>
	);
};

ExportInline.propTypes = {
	history: object.isRequired,
	match: object.isRequired,
	preferences: object.isRequired,
	control: object.isRequired,
	getPreferencesPayload: func.isRequired,
	updateSearchPreferences: func.isRequired,
	getSearchPreferences: func.isRequired,
	versionState: object.isRequired,
	getLatestVersionCode: func.isRequired,
	getCodeByVersionId: func.isRequired,
	isLoading: bool.isRequired,
	updateVersionStateForPreference: func.isRequired,
};
const mapStateToProps = (state) => {
	return {
		versionState: get(state, '$getSearchPreferencesVersions.results', {}),
		isLoading: get(state, '$getSearchPreferencesVersions.isLoading', false),
	};
};

const mapDispatchToProps = (dispatch, props) => ({
	getSearchPreferences: () => dispatch(getSearchPreferencesAction()),
	updateSearchPreferences: (payload) =>
		dispatch(saveSearchPreference(props.preferenceId, payload)),
	getLatestVersionCode: (preferenceId) =>
		dispatch(getSearchPreferenceLatestVersion(preferenceId)),
	getCodeByVersionId: (preferenceId, versionId) =>
		dispatch(getSearchPreferenceVersionCodeByVersion(preferenceId, versionId)),
	updateVersionStateForPreference: (payload) =>
		dispatch({
			type: AppConstants.APP.UI_BUILDER.SEARCH_PREFERENCE_VERSIONS
				.UPDATE_PREFERENCE_STATE_SUCCESS,
			payload,
		}),
});

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(ExportInline));
