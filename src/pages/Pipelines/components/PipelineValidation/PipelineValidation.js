import { Col, Icon, Tabs, Tag, Tooltip } from 'antd';
import { css } from 'emotion';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import RequestDiff from '../../../../batteries/components/analytics/components/RequestLogs/RequestDiff';
import Monaco from '../../../../batteries/components/SearchSandbox/containers/MonacoEditor';
import Flex from '../../../../batteries/components/shared/Flex';
import ConsoleLogger from '../../../../components/ScriptConsole/ConsoleLogger';
import { isJson } from '../../../../components/ScriptConsole/utils';
import { monacoOptions } from '../../utils';
import ButtonLoadingSvg from './ButtonLoadingSvg';

const container = css`
	display: flex !important;
	align-items: stretch;
	height: 100% !important;
	min-height: 500px;
	position: relative !important;

	.ant-select-sm.ant-select {
		width: 300px;
	}
	.tabs-container {
		height: calc(100% + 4px);
		width: 100%;
		.ant-tabs-extra-content {
			line-height: 35px;
			margin-right: 1px;
			margin-left: 2px;
		}
		.ant-tabs-bar {
			margin: 6px 0 9px 5px;
		}
		.ant-tabs-content {
			height: 100%;
		}
		.ant-tabs-tab {
			margin: 0;
			padding: 5px 16px;

			h3 {
				margin-bottom: 0;
				padding: 0;
			}
		}
	}

	.monaco-wrapper {
		width: 100% !important;
	}

	h3 {
		padding: 12px 0rem;
		margin-bottom: 0;
	}
	.pipeline-console {
		height: 100%;
		padding: 0.1rem 0.3rem;

		&.template-area,
		&.response-area {
			min-height: 250px;
			height: calc(100% - 50px);
		}

		&.response-area {
			position: relative;
		}
	}
	.response-stats-wrapper {
		width: max-content;
		position: absolute;
		z-index: 1;
		right: 10px;
		top: 6px;
	}
	#response-area-placeholder {
		position: absolute;
		width: 100%;
		height: 100%;
		background: #151515;
		h2 {
			color: white;
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			width: 80%;
			text-align: center;
			font-weight: 400 !important;
		}
	}
	.validate-script-btn {
		box-sizing: border-box;
		position: absolute;
		top: 50%;
		left: 0rem;
		z-index: 15;
		transform: translate(-50%, -50%);
		display: flex;
		height: 60px;
		width: 60px;
		-webkit-box-align: center;
		align-items: center;
		-webkit-box-pack: center;
		justify-content: center;
		background: rgb(24, 24, 24);
		cursor: pointer;
		user-select: none;
		border-radius: 50%;
		border: 3px solid rgb(87, 92, 102);

		&:active {
			box-shadow: rgb(87 92 102) 0px 0px 4px inset;
		}

		.play-triangle {
			height: 0;
			border-right: none;
			width: 0;
			border-left: 16px solid WHITE;
			border-top: 10px solid transparent;
			border-bottom: 10px solid transparent;
			position: relative;
			left: 2px;
		}
	}

	@media only screen and (min-width: 624px) {
		h3 {
			font-size: 14px;
		}

		.ant-select-sm.ant-select {
			width: 200px;
			font-size: 12px;
		}

		.ant-tabs-tab {
			padding: 5px 4px;
		}
	}
`;
const { TabPane } = Tabs;
const TABS_KEYS = {
	EXECUTION_CONTEXT: 'Execution Context',
	RESPONSE_OUTPUT_SHORT: 'Response',
	RESPONSE_OUTPUT: 'Response Output',
	CONSOLE_LOGS: 'Console Logs',
	CONSOLE_LOGS_SHORT: 'Console',
	STAGE_CHANGES: 'Stage Changes',
	STAGE_CHANGES_SHORT: 'Stages',
};

const {
	EXECUTION_CONTEXT,
	RESPONSE_OUTPUT,
	RESPONSE_OUTPUT_SHORT,
	CONSOLE_LOGS,
	CONSOLE_LOGS_SHORT,
	STAGE_CHANGES,
	STAGE_CHANGES_SHORT,
} = TABS_KEYS;

const PipelineValidation = ({
	isVisible,
	executionContext,
	setExecutionContext,
	responseTabValue,
	onPlayButtonClick,
	consoleLogsArray,
	isScriptValidation,
	showStageChanges,
	isValidating,
}) => {
	const [activeTabKey, setActiveTabKey] = useState(EXECUTION_CONTEXT);
	const [validationResponse, setValidationResponse] = useState('');
	const [stageChanges, setStateChanges] = useState([]);
	const executionContextEditorRef = useRef(null);
	const [isSmallScreen, setIsSmallScreen] = useState(false);
	useEffect(() => {
		const updateSmallScreenVariable = () => {
			setIsSmallScreen(window.innerWidth <= 1600);
		};
		window.addEventListener('resize', updateSmallScreenVariable);
		return () => {
			window.removeEventListener('resize', updateSmallScreenVariable);
			// clearValidationValueFromStore();
		};
	}, []);

	useEffect(() => {
		if (validationResponse !== responseTabValue) {
			const { request, response, error } = JSON.parse(responseTabValue);
			const filteredResponseTabValue = JSON.stringify(
				{
					request,
					response,
					error,
				},
				null,
				4,
			);
			setValidationResponse(filteredResponseTabValue);
			setActiveTabKey(RESPONSE_OUTPUT);
			if (showStageChanges) {
				// compute stage changes' tab value
				const getDataForStageChangesTab = (json) => {
					const finalStageChangesData = {};

					const requestVal = json.request ?? {};
					if (requestVal.body) {
						if (typeof requestVal.body === 'string' && isJson(requestVal.body)) {
							requestVal.body = JSON.parse(requestVal.body);
						}
					}

					const stageChangesValue = [];

					if (Array.isArray(json.stageChanges)) {
						json.stageChanges.forEach((stageItem) => {
							if (stageItem) {
								const stage = { ...stageItem };
								if (stage?.context?.request?.body) {
									if (
										typeof stage.context.request.body === 'string' &&
										isJson(stage.context.request.body)
									) {
										stage.context.request.body = JSON.parse(
											stage.context.request.body,
										);
									}
								}
								if (stage?.context?.response?.body) {
									if (
										typeof stage.context.response.body === 'string' &&
										isJson(stage.context.response.body)
									) {
										stage.context.response.body = JSON.parse(
											stage.context.response.body,
										);
									}
								}
								stageChangesValue.push(stage);
							}
						});
					}

					finalStageChangesData.request = requestVal;
					finalStageChangesData.headers = json?.request?.headers;
					finalStageChangesData.url = json?.envs?.path;
					finalStageChangesData.stageChanges = stageChangesValue;
					return { ...finalStageChangesData };
				};
				const processStageChanges = getDataForStageChangesTab(JSON.parse(responseTabValue));
				setStateChanges(processStageChanges);
			}
		}
	}, [responseTabValue]);
	const renderResponseCodeTime = () => {
		const parsedResponseTabValue = isJson(responseTabValue);
		let statusCode;
		let timeTook;
		if (!isScriptValidation) {
			timeTook = parsedResponseTabValue.took;
			statusCode = parsedResponseTabValue?.response?.code;
		} else {
			timeTook = parsedResponseTabValue.scriptTook;
		}
		// if (validatedscriptRule?.error) {
		// 	statusCode = validatedscriptRule?.error?.actual?.code;
		// } else if (validatedscriptRule?.results) {
		// 	statusCode = validatedscriptRule?.results?.response?.code;
		// 	timeTook = validatedscriptRule?.results?.['script_took'];
		// }

		return (
			<Flex alignItems="center" justifyContent="space-between">
				{statusCode ? (
					<Tag
						style={{
							marginLeft: '6px',
							marginRight: '0',
							...(statusCode === 200
								? {
										color: '#256a07',
										background: '#b1e57e',
										borderColor: '#b7eb8f',
								  }
								: {}),
						}}
						// eslint-disable-next-line
						color={statusCode >= 400 ? 'red' : ''}
					>
						{statusCode}
						{statusCode === 200 ? ' OK' : ''}
					</Tag>
				) : null}

				{timeTook >= 0 ? (
					<Tag
						style={{
							marginRight: '0',
							color: '#f96b04',
							background: '#ffca59',
							borderColor: '#ffd591',
							marginLeft: '6px',
						}}
					>
						{timeTook} ms
					</Tag>
				) : null}
			</Flex>
		);
	};

	if (!isVisible) {
		return null;
	}

	return (
		<div className={container}>
			<Tooltip
				placement="bottom"
				title={isValidating ? 'Validating...' : 'Click to validate'}
			>
				<button className="validate-script-btn" type="button" onClick={onPlayButtonClick}>
					{isValidating ? <ButtonLoadingSvg /> : <div className="play-triangle" />}
				</button>
			</Tooltip>
			<Tabs
				className="tabs-container"
				defaultActiveKey={EXECUTION_CONTEXT}
				onChange={(key) => setActiveTabKey(key)}
				activeKey={activeTabKey}
			>
				<TabPane
					tab={
						<h3>
							{EXECUTION_CONTEXT}
							<Tooltip
								overlayStyle={{
									width: '450px',
									height: 'max-content',
									maxWidth: 'max-content',
								}}
								placement="bottom"
								title="Execution Context"
								autoAdjustOverflow={false}
							>
								<span style={{ marginLeft: 5 }}>
									<Icon type="info-circle" />
								</span>
							</Tooltip>
						</h3>
					}
					key={EXECUTION_CONTEXT}
				>
					<Col span={24} className="pipeline-console template-area">
						<Monaco
							defaultValue={JSON.stringify(executionContext)}
							language="json"
							value={JSON.stringify(executionContext, null, 4)}
							onChange={(value) => setExecutionContext(JSON.parse(value))}
							customizeMonacoInstance={(monaco, editorRef) => {
								executionContextEditorRef.current = editorRef;
							}}
							theme="vs-dark"
							options={monacoOptions}
							readOnly={false}
							wrapperClass="monaco-wrapper"
						/>
					</Col>
				</TabPane>
				<TabPane
					tab={
						<h3>
							{isSmallScreen ? RESPONSE_OUTPUT_SHORT : RESPONSE_OUTPUT}{' '}
							<Tooltip placement="right" title="Validated Response">
								<span style={{ marginLeft: 5 }}>
									<Icon type="info-circle" />
								</span>
							</Tooltip>
						</h3>
					}
					key={RESPONSE_OUTPUT}
				>
					<Col span={24} className="pipeline-console response-area">
						<div className="response-stats-wrapper">{renderResponseCodeTime()}</div>
						{validationResponse ? (
							<Monaco
								defaultValue="// Run the request to see the response output"
								language="json"
								value={validationResponse}
								theme="vs-dark"
								options={monacoOptions}
								readOnly
								wrapperClass="monaco-wrapper"
							/>
						) : (
							<div id="response-area-placeholder">
								<h2>Run the request to see the response output</h2>
							</div>
						)}
					</Col>
				</TabPane>
				<TabPane
					tab={
						<h3>
							{isSmallScreen ? CONSOLE_LOGS_SHORT : CONSOLE_LOGS}
							<Tooltip placement="right" title="Console Logs">
								<span style={{ marginLeft: 5 }}>
									<Icon type="info-circle" />
								</span>
							</Tooltip>
						</h3>
					}
					key={CONSOLE_LOGS}
				>
					<ConsoleLogger consoleArray={consoleLogsArray} />
				</TabPane>
				{showStageChanges && (
					<TabPane
						tab={
							<h3>
								{isSmallScreen ? STAGE_CHANGES_SHORT : STAGE_CHANGES}
								<Tooltip placement="right" title="Stage changes">
									<span style={{ marginLeft: 5 }}>
										<Icon type="info-circle" />
									</span>
								</Tooltip>
							</h3>
						}
						key={STAGE_CHANGES}
					>
						<div style={{ overflow: 'auto', maxHeight: '80%', paddingLeft: '1rem' }}>
							<RequestDiff
								requestBody={stageChanges?.request?.body}
								url={stageChanges.rul}
								headers={stageChanges.headers}
								method="POST"
								requestChanges={stageChanges.stageChanges ?? []}
								shouldDecode={false}
							/>
						</div>
					</TabPane>
				)}
			</Tabs>
		</div>
	);
};

PipelineValidation.propTypes = {
	executionContext: PropTypes.object.isRequired,
	setExecutionContext: PropTypes.func.isRequired,
	isVisible: PropTypes.bool,
	onPlayButtonClick: PropTypes.func,
	responseTabValue: PropTypes.string,
	consoleLogsArray: PropTypes.array,
	isScriptValidation: PropTypes.bool,
	showStageChanges: PropTypes.bool,
	isValidating: PropTypes.bool,
};

PipelineValidation.defaultProps = {
	isVisible: false,
	onPlayButtonClick: () => {},
	responseTabValue: '',
	consoleLogsArray: null,
	isScriptValidation: false,
	showStageChanges: false,
	isValidating: false,
};

export default PipelineValidation;
