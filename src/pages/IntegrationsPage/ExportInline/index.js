import React, { useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { object, func } from 'prop-types';
import get from 'lodash/get';
import { css } from 'react-emotion';
import { SandpackProvider } from '@codesandbox/sandpack-react';
// eslint-disable-next-line
import SandPackIntegration from './Components/SandpackIntegration/SandpackIntegration';
import ModalHeader, { transformContent } from './Components/ModalHeader';
import Loader from '../../../components/Loader';
import {
	generateInlineSandboxURL,
	tabSettings,
	getLatestVersion,
	getByVersionId,
	replaceWithPreferences,
} from '../utils/sandpack-generator';
import { saveSearchPreferenceN, getSearchPreferencesN } from '../../../batteries/modules/actions';
import { getTemplate } from '../utils/index';

const modalStyles = css`
	padding-bottom: 0 !important;
	position: absolute;
	right: 0;
	left: 0;
	z-index: 999;
	background: white;
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
}) => {
	const preferenceId = match.params.id;
	const [sandpackCode, setSandpackCode] = useState({});
	const [searchIndex, setSearchIndex] = useState({});
	const [initialCode, setInitialCode] = useState({});
	const [updatedCode, setUpdatedCode] = useState({});
	const [currentVersion, setCurrentVersion] = useState({});
	const [isLoading, setIsLoading] = useState(true);
	const [collapsed, setIsCollapsed] = useState(false);
	const [modalType, setModalType] = useState('');
	const [openCommitModal, setOpenCommitModal] = useState(false);

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
		setInitialCode(response);
		setUpdatedCode(response);
		setSandpackCode(response);
		setIsLoading(false);
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

	const updateSandpackCode = (code) => {
		setSandpackCode(code);
		trasformSearchIndex(code);
	};

	const updateSearchIndex = (data) => {
		setSearchIndex(data);
	};

	const closeModal = () => {
		// closeModal
		history.push(`/cluster/search-builder/${preferenceId}`);
	};

	const fetchLatestVersion = () => {
		getLatestVersion(preferenceId)
			.then(async (res) => {
				if (res.content) {
					const newContent = transformContent(res.content);
					setInitialCode(newContent);
					const response = await replaceWithPreferences(newContent, preferences);
					updateSandpackCode(response);
					setUpdatedCode(response);
					setIsLoading(false);
				}
				setCurrentVersion({
					version_id: res.version_id,
					updated_at: res.updated_at || res.created_at,
					commit: res?.metadata?.commit || '',
				});
			})
			.catch((err) => {
				console.error('Error to fetch latest version', err);
				getSandPackCode();
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
				setIsLoading(false);
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
		updateSandpackCode(newSandpackCode);
		setUpdatedCode(newSandpackCode);

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
		updateSandpackCode(newSandpackCode);
		setUpdatedCode(newSandpackCode);

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
		updateSandpackCode(newSandpackCode);
		setUpdatedCode(newSandpackCode);

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
		updateSandpackCode(newSandpackCode);
		setUpdatedCode(newSandpackCode);

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

	if (isLoading) return <Loader />;

	return (
		<div>
			<ModalHeader
				updateSandpackCode={updateSandpackCode}
				uiBuilderName={uiBuilderName}
				updatedCode={updatedCode}
				setUpdatedCode={setUpdatedCode}
				currentVersion={currentVersion}
				setCurrentVersion={setCurrentVersion}
				setInitialCode={setInitialCode}
				initialCode={initialCode}
				handleSave={handleSave}
				fetchByVersionId={fetchByVersionId}
				setIsCollapsed={setIsCollapsed}
				collapsed={collapsed}
				modalType={modalType}
				setModalType={setModalType}
				setOpenCommitModal={setOpenCommitModal}
				preferences={preferences}
			/>
			<div className={modalStyles}>
				<SandpackProvider
					customSetup={{
						files: { ...sandpackCode },
					}}
					openPaths={tabSettings[theme]?.openPaths}
					activePath={tabSettings[theme]?.activePath}
					template="react"
					startRoute={route}
				>
					<SandpackCodeContext.Provider
						value={{
							sandpackCode,
							searchIndex,
							preferences,
							updateSandpackCode,
							updateSearchIndex,
							handleCreateFile,
							handleRenameFile,
							handleRenameFolder,
							handleDelete,
							setModalType,
						}}
						openPaths={tabSettings[theme]?.openPaths}
						activePath={tabSettings[theme]?.activePath}
						template="react"
					>
						<SandPackIntegration
							closeModal={closeModal}
							trasformSearchIndex={trasformSearchIndex}
							updatedCode={updatedCode}
							setOpenCommitModal={setOpenCommitModal}
							setUpdatedCode={setUpdatedCode}
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
};

const mapDispatchToProps = (dispatch, props) => ({
	getSearchPreferences: () => dispatch(getSearchPreferencesN()),
	updateSearchPreferences: (payload) =>
		dispatch(saveSearchPreferenceN(props.preferenceId, payload)),
});

export default connect(null, mapDispatchToProps)(withRouter(ExportInline));
