/* eslint-disable no-param-reassign,camelcase,jsx-a11y/label-has-associated-control,jsx-a11y/label-has-for,jsx-a11y/no-noninteractive-element-interactions */
import React, { Fragment, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { css } from 'emotion';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import get from 'lodash/get';
import {
	Affix,
	Button,
	Card,
	Icon,
	Result,
	Skeleton,
	Typography,
	Tabs,
	Alert,
	notification,
	message,
	Switch,
	Tooltip,
} from 'antd';
import yamlToJson from 'js-yaml';
import Banner from '../../batteries/components/shared/UpgradePlan/Banner';
import Overlay from '../../components/Overlay';
import { mediaKey } from '../../utils/media';
import { isValidPlan } from '../../batteries/utils';

import { allowedTiers } from '../../utils/prop-types';
import {
	addPipeline,
	deletePipeline,
	getAppMappings,
	getPipelines,
	putPipeline,
} from '../../batteries/modules/actions';
import {
	bannerDetails,
	DEFAULT_EXECUTION_CONTEXT_VALUE,
	getConsoleLogsArray,
	monacoOptions,
	TAB_ACTIONS,
} from './utils';
import PipelineCard from './components/PipelineCard';
import Monaco from '../../batteries/components/SearchSandbox/containers/MonacoEditor';
import TabContent from './components/TabContent';
import Flex from '../../batteries/components/shared/Flex';
import { isEmpty } from '../../utils';
import { generatePipelinePayload } from '../../batteries/utils/helpers';
import PipelineValidation from './components/PipelineValidation';
import { validatePipeline } from '../../batteries/utils/app';

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
	padding: 50px;
	position: relative;
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
		button.create-save-btn {
			width: 35%;
			max-width: 200px;
			min-width: 150px;
			margin-left: 1rem;
		}
	}
	.ant-tabs.ant-tabs-card .ant-tabs-card-bar .ant-tabs-tab {
		&:last-child {
			padding: 0;
			.add-script-btn {
				background: transparent;
				height: 40px;
				border: none;
				padding: 0 12px;

				i {
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
		max-height: 700px;
		height: 60vh;
	}
`;

function DocsLink({ url }) {
	return (
		<a href={url} className={link} target="_blank" rel="noopener noreferrer">
			Learn more <Icon type="link" />
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
	} = props;
	const isEditPage = get(match, 'params.id');
	const [isValidateMode, setIsValidateMode] = useState(false);
	const [pipelineValidationRes, setPipelineValidationRes] = useState(null);
	const [executionContext, setExecutionContext] = useState(DEFAULT_EXECUTION_CONTEXT_VALUE);

	const [editorPipelineValue, setEditorPipelineValue] = useState('');
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

	const validateMissingScriptFiles = () => {
		try {
			if (editorPipelineValue) {
				// validating the yaml with script files open
				const missingScripts = [];
				const pipelinesStages = yamlToJson.load(editorPipelineValue)?.stages;

				if (Array.isArray(pipelinesStages) && pipelinesStages.length) {
					pipelinesStages.forEach((stageItem) => {
						if (
							stageItem?.scriptRef &&
							!Object.keys(scriptFilesMap).includes(
								stageItem?.scriptRef?.replace('.js', ''),
							)
						) {
							missingScripts.push(stageItem.scriptRef.replace('.js', ''));
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

	useEffect(() => {
		if (isEmpty(pipeline)) {
			fetchPipelines();
		}
	}, []);

	useEffect(() => {
		if (pipeline?.content) {
			let pipelineValue;
			if (pipeline.extension === 'yaml') {
				pipelineValue = pipeline.content;
			} else if (pipeline.extension === 'json') {
				pipelineValue = JSON.stringify(pipeline.content);
			}
			if (!pipeline?.update?.error && !pipeline?.update?.isLoading) {
				setEditorPipelineValue(pipelineValue);
			}
		}
	}, [pipeline]);

	useEffect(() => {
		const scriptFileNames = Object.keys(pipelineScripts) ?? [];
		if (scriptFileNames.length) {
			const newTabPanes = [...tabPanes];
			const newScriptFilesMap = {};
			scriptFileNames.forEach((fileKey) => {
				Object.assign(newScriptFilesMap, {
					[fileKey]: {
						scriptValue: pipelineScripts[fileKey].content,
						validatedScripRule: '',
					},
				});

				// update new TabPanes

				newTabPanes.push({
					title: fileKey,
					key: fileKey,
				});
			});
			setScriptFilesMap(newScriptFilesMap);
			setTabPanes(newTabPanes);
		}
	}, [pipelineScripts]);

	useEffect(() => {
		// validate when either pipeline or script tab is removed
		validateMissingScriptFiles();
	}, [editorPipelineValue, scriptFilesMap]);

	const getTabTitle = (title, key) => {
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
			newTabPanes.forEach((tabItem) => {
				if (tabItem.key === key) {
					// remove .js at the end
					if (currentTabValue.length >= 3) {
						if (currentTabValue.slice(-3) === '.js') {
							currentTabValue = currentTabValue.slice(0, currentTabValue.length - 3);
						}
					}

					// avoid any action incase tab isn't renamed
					if (currentTabValue.replace(/[/\\?.%*:|"<>]/g, '-') === tabItem.title) {
						return;
					}
					tabItem.title = currentTabValue.replace(/[/\\?.%*:|"<>]/g, '-');
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
					defaultValue={title?.trim() ?? ''}
					onChange={handleTabNameChange}
				/>
			);
		}
		return (
			<span className="tab-title" onClick={handleDoubleClick}>
				{title}.js
			</span>
		);
	};
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
			const activeTab = newTabPanes.length ? newTabPanes.at(-1).key : DEFAULT_TAB_KEY;
			setactiveTabKey(activeTab);

			// update ScriptFileMap
			updateScriptFileMap(targetKey, SCRIPT_FILES_MAP_ACTIONS.REMOVE);
		}
	};

	// this is used to get rid of script files which aren't part of pipeline yaml
	const filterScriptFilesMap = (pipelineYamlString, scriptFilesMapParam) => {
		const newScriptFilesMap = {};
		const pipelinesStages = yamlToJson.load(pipelineYamlString)?.stages;
		if (Array.isArray(pipelinesStages) && pipelinesStages.length) {
			pipelinesStages.forEach((stageItem) => {
				if (stageItem?.scriptRef) {
					if (Object.keys(scriptFilesMap).includes(stageItem?.scriptRef)) {
						newScriptFilesMap[stageItem?.scriptRef] =
							scriptFilesMapParam[stageItem?.scriptRef];
					}
				}
			});
		}

		return newScriptFilesMap;
	};

	const handlePipelineValidation = () => {
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

			pipelinePayload.append('request', JSON.stringify(payloadRequestObject));
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
				setPipelineValidationRes(res);
			})
			.catch((e) => {
				notification.error({
					message: `Failed to validate pipeline${e}`,
				});
				setPipelineValidationRes(null);
			});
	};

	// handles -  save/ create
	const handleSave = () => {
		try {
			const { createPipeline, updatePipeline } = props;
			const pipelinePayload = generatePipelinePayload(
				editorPipelineValue,
				filterScriptFilesMap(editorPipelineValue, scriptFilesMap),
			);
			if (isEditPage) {
				updatePipeline({
					pipelinePayload,
					id: pipeline.id,
					// enable need to control fron form
				}) /* eslint-disable react/prop-types */
					.then((res) => {
						if (res?.error) {
							notification.error({
								message: 'Error',
								description: res.error?.actual
									? res.error?.actual?.message
									: res.error?.message,
							});
						} else if (res.payload) {
							message.success('successfully updated pipeline');
							history.push('/cluster/pipelines');
						}
					});
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
									<Icon type="plus" />
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
								<b>{`${fileName}.js`}</b> is present as a script ref but it’s script
								is missing.
								<Button
									type="link"
									danger
									onClick={() =>
										handleAddOrRemoveTab(null, TAB_ACTIONS.ADD, fileName)
									}
									className="create-script-file-link-btn"
								>
									<Icon type="plus" />
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
		const labelPrefix = !isEditPage ? 'Create' : 'Save';

		return `${labelPrefix} Pipeline`;
	};

	const renderButtonIcon = () => {
		if (isCreating || isUpdating || isValidating) return null;

		const icon = !isEditPage ? 'plus' : 'edit';

		return icon;
	};

	return (
		<div className={container}>
			<Link to="/cluster/pipelines">
				<Button>
					<Icon type="arrow-left" />
					Back to Pipelines
				</Button>
			</Link>
			<Card style={{ marginTop: 15 }} hoverable>
				<div>
					<Typography.Title level={3}>
						{isEditPage ? 'Update' : 'Create'} Pipeline
					</Typography.Title>
					{isEditPage ? (
						<PipelineCard
							pipeline={pipeline}
							showDrag={false}
							showEdit={false}
							showExport
							history={history}
						/>
					) : null}
				</div>
				<section className={editorAreaContainer}>
					<Tabs
						defaultActiveKey="pipeline_tab"
						onChange={handleTabChange}
						onEdit={handleAddOrRemoveTab}
						tabBarExtraContent={<div style={{ width: '100px' }} />}
						tabBarGutter={2}
						type="editable-card"
						hideAdd
						activeKey={activeTabKey}
					>
						<TabPane tab="Pipeline" key="pipeline_tab" closable={false}>
							<div className="tab-content">
								<Flex
									alignItems="center"
									style={{
										padding: '5px',
										width: 'max-content',
										position: 'absolute',
										right: 0,
										top: 0,
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
								<Flex>
									<div
										className="tab-content"
										style={{
											width: isValidateMode ? '50%' : '100%',
											transition: 'all .3s ease-in',
										}}
									>
										<Monaco
											defaultValue="# pipeline config"
											language="yaml"
											value={editorPipelineValue}
											onChange={(value) => {
												setEditorPipelineValue(value);
											}}
											theme="vs-dark"
											options={monacoOptions}
											readOnly={false}
											wrapperClass="monaco-wrapper"
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
											executionContext={executionContext}
											setExecutionContext={setExecutionContext}
											isVisible={isValidateMode}
											onPlayButtonClick={handlePipelineValidation}
											responseTabValue={
												pipelineValidationRes
													? JSON.stringify(pipelineValidationRes, null, 4)
													: ''
											}
											consoleLogsArray={getConsoleLogsArray(
												pipelineValidationRes,
											)}
										/>
									</div>
								</Flex>
							</div>
						</TabPane>
						{tabPanes.map((tab) => (
							<TabPane tab={getTabTitle(tab.title, tab.key)} key={tab.key} closable>
								<TabContent
									onScriptFileChange={(value) => {
										updateScriptFileMap(tab.key, SCRIPT_FILES_MAP_ACTIONS.ADD, {
											scriptValue: value,
										});
									}}
									scriptValueProp={scriptFilesMap?.[tab.key]?.scriptValue ?? ''}
									onValidatedScriptRuleChange={(validatedScriptValue) => {
										updateScriptFileMap(tab.key, SCRIPT_FILES_MAP_ACTIONS.ADD, {
											validatedScripRule: validatedScriptValue,
										});
									}}
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
										<Icon type="plus" />
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
						onClick={handleSave}
						loading={isCreating || isUpdating || isValidating}
					>
						<Icon type={renderButtonIcon()} />
						{renderButtonLabel()}
					</Button>
				</Flex>
			</Affix>
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
	updatePipeline: PropTypes.func.isRequired,
	match: PropTypes.object.isRequired,
	username: PropTypes.string.isRequired,
	password: PropTypes.string.isRequired,
	appbaseCredentials: PropTypes.string.isRequired,
	appName: PropTypes.string,
	// fetchUsageStats: PropTypes.func.isRequired,
	// usageStats: PropTypes.object.isRequired,
	featurePipelines: PropTypes.bool,
	pipelineScripts: PropTypes.object,
	validatePipelineAction: PropTypes.func.isRequired,
	isValidating: PropTypes.bool,
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
	appName: '',
};

const mapStateToProps = (state, props) => {
	const id = get(props.match, 'params.id');
	const { username, password } = get(state, 'user.data', {});
	const defaultState = {
		isCreating: get(state, '$getAppPipelines.create.isLoading'),
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
		const pipelineData = defaultState.pipelines.find((pipeline) => pipeline.id === id) || {};

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
	updatePipeline: (payload) => dispatch(putPipeline(payload)),
	removePipeline: (id) => dispatch(deletePipeline(id)),
	fetchMappings: (appName, credentials) => dispatch(getAppMappings(appName, credentials)),
});

export default connect(mapStateToProps, mapDispatchToProps)(PipelinesForm);
