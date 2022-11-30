/* eslint-disable no-param-reassign,camelcase,jsx-a11y/label-has-associated-control,jsx-a11y/label-has-for,jsx-a11y/no-noninteractive-element-interactions */
import React, { Fragment, useCallback, useEffect, useLayoutEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { css } from 'emotion';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import get from 'lodash/get';
import {
	ArrowLeftOutlined,
	ClockCircleOutlined,
	LinkOutlined,
	PlusOutlined,
	EditOutlined,
} from '@ant-design/icons';
import {
	Affix,
	Button,
	Card,
	Result,
	Skeleton,
	Typography,
	Tabs,
	Alert,
	notification,
	message,
	Switch,
	Tooltip,
	Collapse,
	Tag,
} from 'antd';
import yamlToJson from 'js-yaml';
import { isEqual } from 'lodash';
import Banner from '../../batteries/components/shared/UpgradePlan/Banner';
import Overlay from '../../components/Overlay';
import { mediaKey } from '../../utils/media';
import { isValidPlan } from '../../batteries/utils';

import { allowedTiers } from '../../utils/prop-types';
import {
	addPipeline,
	deletePipeline,
	getPipelines,
	getPipelinesUsageStats,
	getPipelineVersions,
	makePipelineVersionLive as makePipelineVersionLiveAction,
	createPipelineVersion as createPipelineVersionAction,
	updatePipelineVersion as updatePipelineVersionAction,
} from '../../batteries/modules/actions';
import {
	pipelinesBannerDetails,
	DEFAULT_EXECUTION_CONTEXT_VALUE,
	deleteRecursive,
	getConsoleLogsArray,
	TAB_ACTIONS,
	trimExtension,
} from './utils';
import PipelineCard from './components/PipelineCard';
import TabContent from './components/TabContent';
import Flex from '../../batteries/components/shared/Flex';
import { isEmpty } from '../../utils';
import { generatePipelinePayload } from '../../batteries/utils/helpers';
import PipelineValidation from './components/PipelineValidation';
import { validatePipeline } from '../../batteries/utils/app';
import PipelineTemplateChooser from './components/PipelineTemplateChooser';

import PIPELINE_TEMPLATES from './utils/pipeline-templates';
import PipelineEditorComponent from './components/PipelineEditorComponent';
import { isJson } from '../../components/ScriptConsole/utils';
import PipelineVersionsDrawer from './components/PipelineVersionsDrawer';
import VersionDescriptionModal from './components/VersionDescriptionModal';

const { Panel } = Collapse;
const { TabPane } = Tabs;
const link = css`
	font-size: 14px;
	margin-right: 30px;
	cursor: pointer;
	i {
		margin-right: 4px;
	}
	${mediaKey.small} {
		display: block;
		line-height: 48px;
	}
`;

const container = css`
	padding: 10px 50px;
	position: relative;

	.card-header-wrapper {
		position: relative;
		.version-drawer-triggerer {
			position: absolute;
			right: 2px;
			top: 8px;
			font-size: 20px;
		}
	}
	.live-tag {
		display: inline-flex;
		align-items: center;
		gap: 3px;
		font-weight: 500;
		font-size: 16px;
	}
	.space-between {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.flex-end {
		justify-content: flex-end;
	}
	.flex {
		display: flex;
	}
	.ant-affix {
		z-index: 100;
	}
	.card-footer {
		width: 100%;
		padding: 20px;
		background: white;
		box-sizing: border-box;
		border: 1px solid #e8e8e8;
		box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.15);
		& > div {
			flex: 1;
			max-height: 100px;
			overflow-y: scroll;
			.alert-box {
				margin-bottom: 1rem;
				padding: 1px 16px;
				width: 100%;
			}

			button.create-script-file-link-btn {
				width: max-content;
				margin: 0px;
				padding: 0;
				margin-left: 9px;

				i {
					position: relative;
					top: 1px;
				}

				.anticon + span {
					margin-left: 3px;
				}
			}
		}
		.create-save-btn {
			width: max-content;
			max-width: max-content;
			min-width: 150px;
			margin-left: 1rem;
		}
	}
	.ant-tabs .ant-tabs-tab {
		&:nth-last-child(2) {
			padding: 0;
			.add-script-btn {
				background: transparent;
				height: 40px;
				border: none;
				padding: 0 12px;

				span {
					margin-right: 0 !important;
					font-size: 18px;
				}
			}
		}
	}
	.ant-tabs.ant-tabs-card .ant-tabs-card-bar .ant-tabs-tab > div:first-child {
		display: flex;
		align-items: center;

		.edit-tab-input {
			border: none;
			height: 39px;
			outline: none;
			border-bottom: 2px solid;
			border-color: rgb(23, 144, 254);
			width: 120px;
		}
		span.tab-title {
			height: 39px;
			min-width: 1rem;
		}
	}
`;

const editorAreaContainer = css`
	margin: 15px 0;

	.tab-content {
		min-height: 450px;
		height: 60vh;
	}
`;

function DocsLink({ url }) {
	return (
		<a href={url} className={link} target="_blank" rel="noopener noreferrer">
			Learn more <LinkOutlined />
		</a>
	);
}

DocsLink.propTypes = {
	url: PropTypes.string.isRequired,
};

const SCRIPT_FILES_MAP_ACTIONS = {
	ADD: 'add',
	REMOVE: 'remove',
};

const DEFAULT_TAB_KEY = 'pipeline_tab';

const PipelinesForm = (props) => {
	const {
		tier,
		match,
		featurePipelines,
		pipelines,
		fetchPipelines,
		pipelinesLoading,
		pipeline,
		pipelineScripts,
		isCreating,
		isValidating,
		isUpdating,
		history,
		fetchUsageStats,
		fetchPipelineVersions,
		makePipelineVersionLive,
		createPipelineVersion,
		updatePipelineVersion,
		isVersionCreating,
	} = props;
	const isEditPage = get(match, 'params.id');
	const [showTemplateChoser, setShowTemplateChoser] = useState(!isEditPage);
	const [selectedTemplate, setSelectedTemplate] = useState('');

	const [isValidateMode, setIsValidateMode] = useState(false);
	const [isValidatingPipeline, setIsValidatingPipeline] = useState(false);
	const [pipelineValidationRes, setPipelineValidationRes] = useState(null);
	const [executionContext, setExecutionContext] = useState(DEFAULT_EXECUTION_CONTEXT_VALUE);

	const [editorPipelineValue, setEditorPipelineValue] = useState('');
	// eslint-disable-next-line no-unused-vars
	const [hasError, setHasError] = useState(false); // currently accounts for pipeline editor only
	const [tabPanes, setTabPanes] = useState([]);
	const [activeTabKey, setactiveTabKey] = useState(DEFAULT_TAB_KEY);
	const [tabEditMode, setTabEditMode] = useState(''); // key of tab title being edited
	// maintain a map for each script file in the below manner
	// {
	// 	"abc.js": {
	//    scriptValue: "...",
	//	  validatedScripRule: "..."
	// }
	// }
	const [scriptFilesMap, setScriptFilesMap] = useState({});

	// track of script file-names to be added
	const [missingScriptFiles, setMissingScriptFiles] = useState([]);

	// version drawer control
	const [showVersionDrawer, setShowVersionDrawer] = useState(false);
	const [showVDescModal, setShowVDescModal] = useState(false);

	const bannerDetails = pipelinesBannerDetails.allPipelines;

	const validateMissingScriptFiles = () => {
		try {
			if (editorPipelineValue) {
				// validating the json with script files open
				const missingScripts = [];
				const pipelinesStages = JSON.parse(editorPipelineValue)?.stages;
				if (Array.isArray(pipelinesStages) && pipelinesStages.length) {
					pipelinesStages.forEach((stageItem) => {
						if (
							stageItem?.scriptRef &&
							!(
								Object.keys(scriptFilesMap).includes(stageItem?.scriptRef) ||
								Object.keys(scriptFilesMap).includes(
									trimExtension(stageItem?.scriptRef),
								)
							)
						) {
							if (
								!(
									missingScripts.includes(stageItem?.scriptRef) ||
									missingScripts.includes(trimExtension(stageItem?.scriptRef))
								) // avoid duplicates // test and test.js is same
							) {
								missingScripts.push(stageItem.scriptRef);
							}
						}
					});
				}
				setMissingScriptFiles(missingScripts);
			}
		} catch (error) {
			// eslint-disable-next-line no-console
			console.error(error);
		}
	};

	const updateScriptFileMap = (fileKey, action, mapValueObject) => {
		const newFilesMap = { ...scriptFilesMap };
		if (action === SCRIPT_FILES_MAP_ACTIONS.ADD) {
			// add or update works same here
			if (fileKey) {
				const mapValueObjectKeys = Object.keys(mapValueObject);
				if (mapValueObjectKeys.length) {
					mapValueObjectKeys.forEach((key) => {
						newFilesMap[fileKey] = {
							...newFilesMap[fileKey],
							[key]: mapValueObject[key],
						};
					});
				}
			}
		} else if (action === SCRIPT_FILES_MAP_ACTIONS.REMOVE) {
			if (fileKey && Object.keys(newFilesMap).includes(fileKey)) {
				delete newFilesMap[fileKey];
			}
		} else {
			const presentTabsKeys = Array.isArray(tabPanes) ? tabPanes.map((tab) => tab.key) : [];
			if (presentTabsKeys.length) {
				Object.keys(newFilesMap).forEach((fileNameKey) => {
					if (!presentTabsKeys.includes(fileNameKey)) {
						delete newFilesMap[fileNameKey];
					}
				});
			}
		}
		setScriptFilesMap(newFilesMap);
	};

	useLayoutEffect(() => {
		fetchUsageStats();
	}, []);

	useEffect(() => {
		if (!isEditPage && !!selectedTemplate) {
			const templateJson = { ...PIPELINE_TEMPLATES[selectedTemplate] };
			const newScriptFilesMap = {};
			const newTabPanes = [];
			// eslint-disable-next-line no-unused-expressions
			templateJson.stages?.forEach((stageItem) => {
				if (stageItem.scriptRef && stageItem.scriptContent) {
					newScriptFilesMap[stageItem.scriptRef] = {
						scriptValue: stageItem.scriptContent,
						validatedScripRule: '',
					};

					// update new TabPanes

					newTabPanes.push({
						title: stageItem.scriptRef,
						key: stageItem.scriptRef,
					});
				}
			});
			setTabPanes(newTabPanes);
			setScriptFilesMap(newScriptFilesMap);

			// saving pipeline editor value
			setEditorPipelineValue(
				JSON.stringify(deleteRecursive(templateJson, ['scriptContent']), null, 4),
			);
		}
	}, [selectedTemplate]);

	useEffect(() => {
		if (isEmpty(pipeline)) {
			fetchPipelines();
		}
	}, []);

	useEffect(() => {
		if (pipeline?.content) {
			let pipelineValue;
			if (pipeline.extension === 'yaml') {
				pipelineValue = JSON.stringify(yamlToJson.load(pipeline.content));
			} else if (pipeline.extension === 'json') {
				pipelineValue = pipeline.content;
			}
			if (
				!pipeline?.update?.error &&
				!pipeline?.update?.isLoading &&
				!isEqual(pipelineValue, editorPipelineValue)
			) {
				setEditorPipelineValue(pipelineValue);
			}
		}

		if (pipeline?.id) {
			if (!pipeline.versions && !pipeline.isFetchingVersions) {
				fetchPipelineVersions(pipeline?.id);
			}
		}
	}, [pipeline]);

	useEffect(() => {
		const scriptFileNames = Object.keys(pipelineScripts) ?? [];
		if (scriptFileNames.length) {
			const newTabPanes = [];
			const newScriptFilesMap = {};
			scriptFileNames.forEach((fileKey) => {
				if (
					!(newScriptFilesMap[fileKey] || newScriptFilesMap[trimExtension(fileKey)]) ||
					!isEqual(
						pipelineScripts[fileKey]?.content,
						newScriptFilesMap[fileKey]?.scriptValue,
					)
				) {
					Object.assign(newScriptFilesMap, {
						[fileKey]: {
							scriptValue: pipelineScripts[fileKey].content,
							validatedScripRule: '',
						},
					});

					// update new TabPanes
					if (!newTabPanes.find((item) => item.key === fileKey))
						newTabPanes.push({
							title: fileKey,
							key: fileKey,
						});
				}
			});
			setScriptFilesMap(newScriptFilesMap);
			setTabPanes(newTabPanes.filter((file) => scriptFileNames.indexOf(file.key) !== -1));
		} else {
			setScriptFilesMap({});
			setTabPanes([]);
		}
	}, [pipelineScripts]);

	useEffect(() => {
		// validate when either pipeline or script tab is removed
		validateMissingScriptFiles();
	}, [editorPipelineValue, scriptFilesMap]);

	const getCurrentVersion = useCallback(() => {
		if (!pipeline.id) return false;
		return (pipeline?.versions ?? []).find((item) => item._version === pipeline._version);
	}, [pipeline]);

	const getTabTitle = useCallback(
		(title, key) => {
			let currentTabValue = title;
			const handleTabNameChange = (e) => {
				currentTabValue = e.target.value;
			};
			const handleDoubleClick = (e) => {
				switch (e.detail) {
					case 2:
						setTabEditMode(key);
						break;

					default:
				}
			};

			const handleSaveEditedText = () => {
				if (!currentTabValue) return;
				const newTabPanes = [...tabPanes];
				const newFilesMap = { ...scriptFilesMap };

				const currentTabKeys = tabPanes.map((tab) => tab.key);
				if (
					currentTabKeys.includes(currentTabValue) ||
					currentTabKeys.includes(trimExtension(currentTabValue))
				) {
					message.error('File already present!');
					return;
				}
				newTabPanes.forEach((tabItem) => {
					if (tabItem.key === key) {
						// avoid any action incase tab isn't renamed
						if (currentTabValue === tabItem.title) {
							return;
						}
						// remove .js at the end
						tabItem.title = trimExtension(currentTabValue);
						tabItem.key = tabItem.title;

						// set active tab
						setactiveTabKey(tabItem.key);
						// update newFilesMap
						newFilesMap[tabItem.key] = newFilesMap[key];
						delete newFilesMap[key];
					}
				});

				setTabPanes(newTabPanes);
				setTabEditMode(null);

				// update filesmap
				setScriptFilesMap(newFilesMap);
			};

			if (tabEditMode === key) {
				return (
					<input
						className="edit-tab-input"
						onBlur={handleSaveEditedText}
						onKeyPress={(event) => {
							if (event.key === 'Enter') {
								handleSaveEditedText();
							}
						}}
						defaultValue={trimExtension(title)?.trim() ?? ''}
						onChange={handleTabNameChange}
					/>
				);
			}
			return (
				<span className="tab-title" onClick={handleDoubleClick}>
					{trimExtension(title)}.js
				</span>
			);
		},
		[tabPanes, scriptFilesMap, tabEditMode],
	);
	const handleTabChange = (tabKey) => {
		setactiveTabKey(tabKey);
	};

	const handleAddOrRemoveTab = (targetKey, action, fileName) => {
		// currently, action can be 'add' or 'remove',
		// enums in TAB_ACTIONS

		if (action === TAB_ACTIONS.ADD) {
			const newTabPanes = [...tabPanes];
			const newTabKey = (fileName || `New Tab ${tabPanes.length}`).trim();
			newTabPanes.push({
				title: newTabKey,
				key: newTabKey,
			});
			setTabPanes(newTabPanes);

			// reset active tab
			setactiveTabKey(newTabKey);

			// update ScriptFileMap
			updateScriptFileMap(newTabKey, SCRIPT_FILES_MAP_ACTIONS.ADD, {
				scriptValue: '',
				validatedScriptValue: '',
			});
		} else if (action === TAB_ACTIONS.REMOVE) {
			const newTabPanes = tabPanes.filter((tabItem) => {
				return !(tabItem.key === targetKey);
			});
			setTabPanes(newTabPanes);

			// reset active tab
			const activeTab = newTabPanes.length ? newTabPanes.pop().key : DEFAULT_TAB_KEY;
			setactiveTabKey(activeTab);

			// update ScriptFileMap
			updateScriptFileMap(targetKey, SCRIPT_FILES_MAP_ACTIONS.REMOVE);
		}
	};

	// this is used to get rid of script files which aren't part of pipeline yaml
	const filterScriptFilesMap = (pipelineJSONString, scriptFilesMapParam) => {
		const newScriptFilesMap = {};
		const pipelinesStages = JSON.parse(pipelineJSONString)?.stages;
		if (Array.isArray(pipelinesStages) && pipelinesStages.length) {
			pipelinesStages.forEach((stageItem) => {
				if (stageItem?.scriptRef) {
					if (Object.keys(scriptFilesMap).includes(stageItem?.scriptRef)) {
						newScriptFilesMap[stageItem?.scriptRef] =
							scriptFilesMapParam[stageItem?.scriptRef];
					} else if (
						Object.keys(scriptFilesMap).includes(trimExtension(stageItem?.scriptRef))
					) {
						newScriptFilesMap[stageItem?.scriptRef] =
							scriptFilesMapParam[trimExtension(stageItem?.scriptRef)];
					}
				}
			});
		}
		return newScriptFilesMap;
	};

	const handlePipelineValidation = () => {
		try {
			setIsValidatingPipeline(true);
			setPipelineValidationRes({});
			const pipelinePayload = generatePipelinePayload(
				editorPipelineValue,
				filterScriptFilesMap(editorPipelineValue, scriptFilesMap),
			);
			pipelinePayload.append('pipeline_id', pipeline.id);

			const { request = {}, response = {}, envs = {} } = executionContext;
			if (request instanceof Object && !isEmpty(request)) {
				const payloadRequestObject = {};
				Object.assign(payloadRequestObject, {
					request: {
						...request,
						...(typeof request.body === 'object' && {
							body: JSON.stringify(request.body),
						}),
					},
				});

				pipelinePayload.append('request', JSON.stringify(payloadRequestObject.request));
			}
			if (response instanceof Object && !isEmpty(response)) {
				const payloadResponseObject = {};
				Object.assign(payloadResponseObject, {
					response: {
						...response,
						...(typeof response.body === 'object' && {
							body: JSON.stringify(response.body),
						}),
					},
				});
				pipelinePayload.append('response', JSON.stringify(payloadResponseObject));
			}
			if (!isEmpty(envs)) {
				pipelinePayload.append('envs', JSON.stringify(envs));
			}

			validatePipeline(pipelinePayload)
				.then((res) => {
					const parsedResponse = { ...res };

					if (parsedResponse.request) {
						if (isJson(parsedResponse.request.body)) {
							parsedResponse.request.body = isJson(parsedResponse.request.body);
						}
					}
					if (parsedResponse.response) {
						if (isJson(parsedResponse.response.body)) {
							parsedResponse.response.body = isJson(parsedResponse.response.body);
						}
					}
					setPipelineValidationRes(parsedResponse);
					setIsValidatingPipeline(false);
				})
				.catch((e) => {
					const parsedResponse = { ...e };
					notification.error({
						message: `Failed to validate pipeline  ${`${e.response?.code}   ${e.message}`}`,
					});
					if (parsedResponse.request) {
						if (isJson(parsedResponse.request.body)) {
							parsedResponse.request.body = isJson(parsedResponse.request.body);
						}
					}
					if (parsedResponse.response) {
						if (isJson(parsedResponse.response.body)) {
							parsedResponse.response.body = isJson(parsedResponse.response.body);
						}
					}
					setPipelineValidationRes(parsedResponse);
					setIsValidatingPipeline(false);
				});
		} catch (error) {
			console.log('error', error, error.stack);
		}
	};

	// handles -  save/ create
	const handleSave = (versionSave = false, versionDescription) => {
		try {
			const { createPipeline } = props;
			const pipelinePayload = generatePipelinePayload(
				editorPipelineValue,
				filterScriptFilesMap(editorPipelineValue, scriptFilesMap),
			);
			if (versionDescription) {
				pipelinePayload.append('versionDescription', versionDescription);
			}
			if (isEditPage) {
				if (versionSave) {
					createPipelineVersion(
						pipeline.id,
						pipelinePayload,
					) /* eslint-disable react/prop-types */
						.then((res) => {
							if (res?.error) {
								notification.error({
									message: 'Error',
									description: res.error?.actual
										? res.error?.actual?.message
										: res.error?.message,
								});
							} else if (res.payload) {
								message.success(res.payload.message);
								history.push(`/cluster/pipelines/${pipeline.id}`);
								fetchPipelines();
							}
						});
				} else {
					updatePipelineVersion(
						pipeline.id,
						pipeline.activeVersion,
						pipelinePayload,
					) /* eslint-disable react/prop-types */
						.then((res) => {
							if (res?.error) {
								notification.error({
									message: 'Error',
									description: res.error?.actual
										? res.error?.actual?.message
										: res.error?.message,
								});
							} else if (res.payload) {
								message.success(
									`successfully updated pipeline version: ${pipeline.activeVersion}`,
								);
								history.push('/cluster/pipelines');
							}
						});
				}
			} else {
				createPipeline(pipelinePayload).then((res) => {
					if (res?.error) {
						notification.error({
							message: 'Error',
							description: res.error?.actual
								? res.error?.actual?.message
								: res.error?.message,
						});
					} else if (res.payload) {
						message.success('successfully created pipeline');
						history.push('/cluster/pipelines');
					}
				});
			} /* eslint-enable react/prop-types */
		} catch (error) {
			// eslint-disable-next-line no-console
			console.error(error);
		}
	};

	if (!isValidPlan(tier, featurePipelines)) {
		return (
			<React.Fragment>
				<Banner {...bannerDetails} />
				<Overlay
					style={{
						maxWidth: '70%',
					}}
					src="https://i.imgur.com/SL8nuRt.png"
					alt="Pipelines"
				/>
			</React.Fragment>
		);
	}

	if (isEditPage && (!pipelines.length || pipelinesLoading)) {
		return (
			<div className={container}>
				<Card>
					<Skeleton />
				</Card>
			</div>
		);
	}

	if (isEditPage && !pipeline) {
		return (
			<div className={container}>
				<Card>
					<Result
						status="404"
						title="No Pipeline found!"
						subTitle="The pipeline you are looking for does not exist. Try creating a new pipeline."
						extra={
							<Link to="/cluster/pipelines/new">
								<Button type="primary">
									<PlusOutlined style={{ margin: '0.25rem' }} />
									Create Pipeline
								</Button>
							</Link>
						}
					/>
				</Card>
			</div>
		);
	}

	const renderErrorMessges = () => {
		if (Array.isArray(missingScriptFiles) && missingScriptFiles.length) {
			return missingScriptFiles.map((fileName) => {
				return (
					<Alert
						key={fileName}
						className="alert-box"
						message={
							<Fragment>
								<b>{`${trimExtension(fileName)}.js`}</b> is present as a script ref
								but it’s script is missing.
								<Button
									type="link"
									danger
									onClick={() =>
										handleAddOrRemoveTab(null, TAB_ACTIONS.ADD, fileName)
									}
									className="create-script-file-link-btn"
								>
									<PlusOutlined style={{ margin: '0.25rem' }} />
									Add script file
								</Button>
							</Fragment>
						}
						type="error"
					/>
				);
			});
		}
		return null;
	};

	const renderButtonLabel = () => {
		const labelPrefix = !isEditPage ? 'Create' : 'Update';

		return `${labelPrefix} Pipeline`;
	};

	const ButtonIcon = (buttonIconProps) => {
		if (isCreating || isUpdating || isValidating) return null;

		const icon = !isEditPage ? (
			<PlusOutlined {...buttonIconProps} />
		) : (
			<EditOutlined {...buttonIconProps} />
		);

		return icon;
	};

	const renderLiveVersionTag = () => {
		if (isEditPage && pipeline.versions) {
			const { is_live, _version, _version_description } = getCurrentVersion() ?? {};
			if (_version) {
				return (
					<Tooltip title={_version_description}>
						<sup className="live-tag">
							<span>v{_version} </span>
							<Tag color={is_live ? 'green' : 'grey'}>
								{is_live ? 'Live' : 'Draft'}
							</Tag>
						</sup>
					</Tooltip>
				);
			}
		}

		return null;
	};

	return (
		<div className={container}>
			{showTemplateChoser ? (
				<PipelineTemplateChooser
					isVisible={showTemplateChoser}
					closeTemplateChoser={() => setShowTemplateChoser(false)}
					onTemplateClick={(templateKey) => {
						setSelectedTemplate(templateKey);
						setShowTemplateChoser(false);
					}}
				/>
			) : (
				<Fragment>
					<Link to="/cluster/pipelines">
						<Button>
							<ArrowLeftOutlined style={{ margin: '0.25rem' }} />
							Back to Pipelines
						</Button>
					</Link>
					<Card style={{ marginTop: 15 }} bodyStyle={{ paddingBottom: 0 }} hoverable>
						<div className="card-header-wrapper">
							{isEditPage && pipeline?.versions && (
								<Tooltip title="Versions" style={{ fontSize: 14 }}>
									{/* Pipeline Versions Versions */}
									<ClockCircleOutlined
										style={{
											cursor: getCurrentVersion()?._version
												? 'pointer'
												: 'not-allowed',
											color: getCurrentVersion()?._version
												? 'rgba(0,0,0,0.65)'
												: '#bbb7b7',
										}}
										className="version-drawer-triggerer"
										onClick={() => {
											if (getCurrentVersion()?._version)
												setShowVersionDrawer(true);
										}}
									/>
								</Tooltip>
							)}
							<Typography.Title level={3}>
								{isEditPage ? 'Update' : 'Create'} Pipeline {renderLiveVersionTag()}
							</Typography.Title>
							{isEditPage ? (
								<Collapse>
									<Panel
										header={
											<h3 style={{ marginBottom: '0' }}>Pipeline Details</h3>
										}
										key="1"
									>
										<PipelineCard
											pipeline={pipeline}
											showDrag={false}
											showEdit={false}
											showExport
											history={history}
										/>
									</Panel>
								</Collapse>
							) : null}
						</div>
						<section className={editorAreaContainer}>
							<Tabs
								defaultActiveKey="pipeline_tab"
								onChange={handleTabChange}
								onEdit={handleAddOrRemoveTab}
								tabBarExtraContent={
									<div style={{ width: '150px' }}>
										<Flex
											alignItems="center"
											style={{
												width: 'max-content',
											}}
										>
											<span>Edit</span>
											<Switch
												checked={isValidateMode}
												onChange={() => setIsValidateMode(!isValidateMode)}
												style={{ margin: '0 5px' }}
											/>{' '}
											<span>Validate</span>
										</Flex>
									</div>
								}
								tabBarGutter={2}
								type="editable-card"
								hideAdd
								activeKey={activeTabKey}
							>
								<TabPane tab="Pipeline" key="pipeline_tab" closable={false}>
									<div className="tab-content">
										<Flex>
											<div
												className="tab-content"
												style={{
													width: isValidateMode ? '50%' : '100%',
													transition: 'all .3s ease-in',
												}}
											>
												<PipelineEditorComponent
													valueProp={editorPipelineValue}
													onChange={(value) => {
														setEditorPipelineValue(value);
													}}
													setErrorFlag={setHasError}
												/>
											</div>

											<div
												className="tab-content"
												style={{
													width: isValidateMode ? '50%' : '0%',
													transition: 'all .3s ease-in',
												}}
											>
												<PipelineValidation
													showStageChanges
													executionContext={executionContext}
													setExecutionContext={setExecutionContext}
													isVisible={isValidateMode}
													onPlayButtonClick={handlePipelineValidation}
													responseTabValue={
														pipelineValidationRes
															? JSON.stringify(
																	pipelineValidationRes,
																	null,
																	4,
															  )
															: ''
													}
													consoleLogsArray={getConsoleLogsArray(
														pipelineValidationRes,
													)}
													isValidating={isValidatingPipeline}
												/>
											</div>
										</Flex>
									</div>
								</TabPane>
								{tabPanes.map((tab) => (
									<TabPane
										tab={getTabTitle(tab.title, tab.key)}
										key={tab.key}
										closable
									>
										<TabContent
											onScriptFileChange={(value) => {
												updateScriptFileMap(
													tab.key,
													SCRIPT_FILES_MAP_ACTIONS.ADD,
													{
														scriptValue: value,
													},
												);
											}}
											scriptValueProp={
												scriptFilesMap?.[tab.key]?.scriptValue ?? ''
											}
											onValidatedScriptRuleChange={(validatedScriptValue) => {
												updateScriptFileMap(
													tab.key,
													SCRIPT_FILES_MAP_ACTIONS.ADD,
													{
														validatedScripRule: validatedScriptValue,
													},
												);
											}}
											validationComponentProps={{
												showStageChanges: true,
												executionContext,
												setExecutionContext,
												isVisible: isValidateMode,
												onPlayButtonClick: handlePipelineValidation,
												responseTabValue: pipelineValidationRes
													? JSON.stringify(pipelineValidationRes, null, 4)
													: '',
												consoleLogsArray:
													getConsoleLogsArray(pipelineValidationRes),
												isValidating: isValidatingPipeline,
											}}
											isValidateMode={isValidateMode}
										/>
									</TabPane>
								))}
								<TabPane
									tab={
										<Tooltip title="Add script file">
											<Button
												className="add-script-btn"
												onClick={(e) => {
													e.stopPropagation();
													handleAddOrRemoveTab(null, TAB_ACTIONS.ADD);
												}}
											>
												<PlusOutlined />
											</Button>
										</Tooltip>
									}
									key="add_script"
									closable={false}
								/>
							</Tabs>
						</section>
					</Card>
					<Affix offsetBottom={0}>
						<Flex className="card-footer">
							<div>{renderErrorMessges()}</div>{' '}
							<Button
								block
								type="primary"
								size="large"
								rel="noopener noreferrer"
								className="create-save-btn"
								onClick={() => handleSave()}
								loading={isCreating || isUpdating || isValidating}
								disabled={!!missingScriptFiles?.length || isVersionCreating}
								icon={<ButtonIcon />}
							>
								{renderButtonLabel()}
							</Button>
							{isEditPage && (
								<Tooltip title="Save pipeline as a new version">
									<Button
										block
										type="default"
										size="large"
										rel="noopener noreferrer"
										className="create-save-btn"
										onClick={() => setShowVDescModal(true)}
										loading={isVersionCreating}
										icon={<ButtonIcon />}
										disabled={
											!!missingScriptFiles?.length ||
											isCreating ||
											isUpdating ||
											isValidating
										}
									>
										Save Pipeline (as new version)
									</Button>
								</Tooltip>
							)}
						</Flex>
					</Affix>
					<PipelineVersionsDrawer
						visible={showVersionDrawer}
						setVisible={setShowVersionDrawer}
						allVersions={pipeline.versions}
						makePipelineVersionLive={(versionId) => {
							makePipelineVersionLive(pipeline.id, versionId).then((res) => {
								if (res?.error) {
									notification.error({
										message: 'Error',
										description: res.error?.actual
											? res.error?.actual?.message
											: res.error?.message,
									});
								} else if (res.payload) {
									message.success(res.payload.res.message);
									history.push(`/cluster/pipelines/${pipeline.id}`);
								}
							});
						}}
					/>
					<VersionDescriptionModal
						visible={showVDescModal}
						onSave={(value) => {
							handleSave(true, value);
							setShowVDescModal(false);
						}}
						onCancel={() => setShowVDescModal(false)}
					/>
				</Fragment>
			)}
		</div>
	);
};
PipelinesForm.propTypes = {
	isCreating: PropTypes.bool,
	createError: PropTypes.object,
	pipeline: PropTypes.object,
	isUpdating: PropTypes.bool,
	updateError: PropTypes.object,
	deleteError: PropTypes.string,
	isDeleting: PropTypes.bool,
	history: PropTypes.object.isRequired,
	pipelinesLoading: PropTypes.bool,
	pipelines: PropTypes.array,
	removePipeline: PropTypes.func.isRequired,
	tier: allowedTiers,
	fetchPipelines: PropTypes.func.isRequired,
	createPipeline: PropTypes.func.isRequired,
	match: PropTypes.object.isRequired,
	username: PropTypes.string.isRequired,
	password: PropTypes.string.isRequired,
	appbaseCredentials: PropTypes.string.isRequired,
	appName: PropTypes.string,
	featurePipelines: PropTypes.bool,
	pipelineScripts: PropTypes.object,
	isValidating: PropTypes.bool,
	fetchUsageStats: PropTypes.func.isRequired,
	fetchPipelineVersions: PropTypes.func.isRequired,
	makePipelineVersionLive: PropTypes.func.isRequired,
	createPipelineVersion: PropTypes.func.isRequired,
	updatePipelineVersion: PropTypes.func.isRequired,
	isVersionCreating: PropTypes.bool,
};

PipelinesForm.defaultProps = {
	isCreating: false,
	isValidating: false,
	createError: null,
	pipeline: {},
	pipelineScripts: {},
	isUpdating: false,
	updateError: null,
	deleteError: undefined,
	isDeleting: false,
	pipelinesLoading: false,
	pipelines: null,
	tier: undefined,
	featurePipelines: false,
	isVersionCreating: false,
	appName: '',
};

const mapStateToProps = (state, props) => {
	const id = get(props.match, 'params.id');
	const { username, password } = get(state, 'user.data', {});
	const defaultState = {
		isCreating: get(state, '$getAppPipelines.create.isLoading'),
		isVersionCreating: get(state, '$getAppPipelines.createVersion.isLoading'),
		createError: get(state, '$getAppPipelines.create.error.actual'),
		isValidating: get(state, '$getAppPipelines.validating'),
		pipelines: get(state, '$getAppPipelines.results', []),
		pipelinesLoading: get(state, '$getAppPipelines.isFetching'),
		tier: get(state, '$getAppPlan.results.tier'),
		featurePipelines: get(state, '$getAppPlan.results.feature_pipelines', false),
		appbaseCredentials: username ? `${username}:${password}` : null,
		username,
		password,
	};

	if (id) {
		let pipelineData = defaultState.pipelines.find((pipeline) => pipeline.id === id) || {};
		// incase editing a non-live(draft) version for a pipeline
		if (
			pipelineData.activeVersion !== pipelineData._version &&
			Array.isArray(pipelineData.versions)
		) {
			const versionData = pipelineData.versions.find(
				(version) => version._version === pipelineData.activeVersion,
			);
			if (versionData) {
				pipelineData = { ...pipelineData, ...versionData };
			}
		}
		return {
			...defaultState,
			pipeline: pipelineData,
			pipelineScripts: get(state, '$getAppPipelines.scriptResults')?.[id],
			isUpdating: get(pipelineData, 'update.isLoading'),
			updateError: get(pipelineData, 'update.error'),
			isDeleting: get(pipelineData, 'isDeleting'),
			deleteError: get(pipelineData, 'deleteError'),
			username,
			password,
			appName: get(state, '$getCurrentApp.name'),
		};
	}

	return defaultState;
};

const mapDispatchToProps = (dispatch) => ({
	fetchPipelines: () => dispatch(getPipelines()),
	createPipeline: (payload) => dispatch(addPipeline(payload)),
	removePipeline: (id) => dispatch(deletePipeline(id)),
	fetchUsageStats: () => dispatch(getPipelinesUsageStats()),
	fetchPipelineVersions: (id) => dispatch(getPipelineVersions(id)),
	makePipelineVersionLive: (pipelineId, versionId) =>
		dispatch(makePipelineVersionLiveAction(pipelineId, versionId)),
	createPipelineVersion: (pipelineId, payload) =>
		dispatch(createPipelineVersionAction(pipelineId, payload)),
	updatePipelineVersion: (pipelineId, versionId, payload) =>
		dispatch(updatePipelineVersionAction(pipelineId, versionId, payload)),
});

export default connect(mapStateToProps, mapDispatchToProps)(PipelinesForm);
