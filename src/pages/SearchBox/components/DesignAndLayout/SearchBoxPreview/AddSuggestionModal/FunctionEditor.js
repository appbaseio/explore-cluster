import React, { useEffect, useRef, useState } from 'react';

import { InfoCircleOutlined } from '@ant-design/icons';

import { Button, Col, Modal, Tabs, Tooltip } from 'antd';
import { css } from 'emotion';
import PropTypes from 'prop-types';
import Monaco from '../../../../../../batteries/components/SearchSandbox/containers/MonacoEditor';
import { isJson, monacoOptions } from '../../../../../../components/ScriptConsole/utils';
import ConsoleLogger from '../../../../../../components/ScriptConsole/ConsoleLogger';
import Flex from '../../../../../../batteries/components/shared/Flex';
import { overrideConsoleLog, resetConsoleOverride } from '../../../../utils';
import { isValidJSONFormat } from '../../../../../../batteries/components/analytics/utils';

const container = css`
	display: flex !important;
	align-items: stretch;
	min-height: 500px;
	position: relative !important;
	max-width: 100%;
	margin-top: 2.5rem;
	h3.container-heading {
		position: absolute;
		top: -40px;
		z-index: 1;
		font-weight: 500;
		color: black;
	}
	.ant-select-sm.ant-select {
		width: 300px;
	}
	.function-editor {
		width: 50%;
	}
	.tabs-container {
		width: 50%;
		position: relative;
		.ant-tabs-extra-content {
			line-height: 35px;
			margin-right: 1px;
			margin-left: 2px;
		}
		.ant-tabs-bar {
			margin: 0px 6px 3px;
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

	.ant-tabs-tabpane {
		height: 100%;
	}
	.monaco-wrapper {
		width: 100% !important;
		height: 100%;
	}

	h3 {
		padding: 12px 0rem;
		margin-bottom: 0;
	}
	.execution-context-editor-wrap {
		height: 100%;
		padding: 0.1rem 0.3rem;
		min-height: 250px;
		height: 100%;
	}

	.validate-script-btn {
		box-sizing: border-box;
		position: absolute;
		top: 50%;
		left: 50%;
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

	.response-area-wrapper {
		height: 100%;
		padding: 0.1rem 0.3rem;

		&.response-area {
			position: relative;
			background: rgb(21, 21, 21);
			top: 2px;

			#response-area-placeholder h2 {
				position: absolute;
				top: 50%;
				left: 50%;
				transform: translate(-50%, -50%);
				width: 80%;
				text-align: center;
				font-weight: 400 !important;
				color: white;
			}
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

const saveBtn = css`
	margin: 1rem 0rem;
`;

const { TabPane } = Tabs;
export const FUNCTION_EDITOR_TABS_KEYS = {
	EXECUTION_CONTEXT: 'Execution Context',
	CONSOLE_LOGS: 'Console Logs',
	CONSOLE_LOGS_SHORT: 'Console',
	RESPONSE_OUTPUT: 'Response Output',
};

const { EXECUTION_CONTEXT, CONSOLE_LOGS, CONSOLE_LOGS_SHORT, RESPONSE_OUTPUT } =
	FUNCTION_EDITOR_TABS_KEYS;

const DEFAULT_EXECUTION_CONTEXT_VALUE = {
	currentSuggestion: {},
	value: '',
	customEvents: {},
};

const DEFAULT_FUNCTION_EDITOR_VALUE =
	"/* Put your logic inside \n the function body */ \n \n /* CAUTION: MAKE CHANGES ONLY \nINSIDE THE FUNCTION BODY */ \n \n function testFunc({ suggestion, value, customEvents }) {    \n /* change code below this line */ \n console.log('Hello World!');\n };";

const FunctionEditor = ({
	onSaveFunction,
	defaultCode,
	openAsModal,
	title,
	defaultExecutionContext,
	showSaveFunctionButton,
	customFunctionExecutor,
	saveButtonEnabledInitially,
	onChange,
	allowedTabs,
	functionResponse,
	shouldAppendReturnToFunctionConstructor,
}) => {
	const [activeTabKey, setActiveTabKey] = useState(EXECUTION_CONTEXT);
	const [executionContext, setExecutionContext] = useState(
		JSON.stringify(defaultExecutionContext, null, 4),
	);
	const [functionValue, setFunctionValue] = useState(
		defaultCode || DEFAULT_FUNCTION_EDITOR_VALUE,
	);
	const [consoleArray, setConsoleArray] = useState([]);
	const executionContextEditorRef = useRef(null);
	const functionEditorRef = useRef(null);
	const saveButtonRef = useRef(null);
	const [isSmallScreen, setIsSmallScreen] = useState(false);
	const [saveButtonText, setSaveButtonText] = useState('Save Function');
	const [disableSaveButton, setDisableSaveButton] = useState(!saveButtonEnabledInitially);

	const [modalVisible, setModalVisible] = useState(true);
	const [responseOutput, setResponseOutput] = useState(functionResponse ?? '');

	useEffect(() => {
		setExecutionContext(JSON.stringify(defaultExecutionContext, null, 4));
	}, [defaultExecutionContext]);

	useEffect(() => {
		const updateSmallScreenVariable = () => {
			setIsSmallScreen(window.innerWidth <= 1600);
		};

		window.addEventListener('resize', updateSmallScreenVariable);
		if (!openAsModal)
			saveButtonRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
		return () => {
			window.removeEventListener('resize', updateSmallScreenVariable);
		};
	}, []);

	const triggerFunctionTest = () => {
		try {
			overrideConsoleLog();

			// eslint-disable-next-line no-new-func
			const func = new Function(
				`${shouldAppendReturnToFunctionConstructor ? 'return' : ''} ${functionValue}`,
			)();
			if (typeof customFunctionExecutor === 'function') {
				let returnedValue = customFunctionExecutor(func, JSON.parse(executionContext));
				if (returnedValue) {
					if (isJson(returnedValue)) {
						returnedValue = JSON.stringify(returnedValue, 0, 4);
					}
					setResponseOutput(returnedValue);
				}
			} else {
				func(
					...(isJson(executionContext)
						? Object.values(JSON.parse(executionContext))
						: []),
				);
			}

			// eslint-disable-next-line no-console
			const logsArray = console.logs;
			if (Array.isArray(logsArray) && logsArray.length) {
				setConsoleArray(
					logsArray.flat().map((item) => {
						if (typeof item === 'string') return item;

						if (isValidJSONFormat(item)) {
							return JSON.stringify(item);
						}
						return String(item);
					}),
				);
			}

			resetConsoleOverride();
			setActiveTabKey(allowedTabs.includes(RESPONSE_OUTPUT) ? RESPONSE_OUTPUT : CONSOLE_LOGS);
		} catch (error) {
			// eslint-disable-next-line no-console
			console.error(error);
		}
	};

	const handleFunctionSave = () => {
		onSaveFunction(functionValue);
		setSaveButtonText('Function Saved');
		setTimeout(() => {
			setSaveButtonText('Save Function');
		}, 1500);
	};
	const getContent = () => {
		return (
			<>
				<div className={container}>
					<Tooltip placement="bottom" title="Click to validate">
						<button
							className="validate-script-btn"
							type="button"
							onClick={triggerFunctionTest}
						>
							<div className="play-triangle" />
						</button>
					</Tooltip>
					<h3 className="container-heading">
						Function Body{' '}
						{
							<Tooltip
								css="margin-left: 5px;color:#898989"
								overlay="Function Body"
								placement="rightTop"
							>
								<InfoCircleOutlined />
							</Tooltip>
						}
					</h3>
					<Flex style={{ width: '100%', height: 'auto' }}>
						<div className="function-editor">
							<Monaco
								defaultValue={functionValue}
								language="javascript"
								value={functionValue}
								customizeMonacoInstance={(monaco, editorRef) => {
									if (editorRef) {
										functionEditorRef.current = editorRef;
										editorRef.onDidChangeModelDecorations(() => {
											const modelMarkers = monaco.editor.getModelMarkers();
											setDisableSaveButton(!!modelMarkers.length);
										});
									}
								}}
								onChange={(value) => {
									if (typeof onChange === 'function') {
										onChange(value);
									}
									setFunctionValue(value);
								}}
								theme="vs-dark"
								options={monacoOptions}
								readOnly={false}
								wrapperClass="monaco-wrapper"
							/>
						</div>
						<Tabs
							className="tabs-container"
							defaultActiveKey={EXECUTION_CONTEXT}
							onChange={(key) => setActiveTabKey(key)}
							activeKey={activeTabKey}
						>
							{allowedTabs.includes(FUNCTION_EDITOR_TABS_KEYS.EXECUTION_CONTEXT) && (
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
													<InfoCircleOutlined />
												</span>
											</Tooltip>
										</h3>
									}
									key={EXECUTION_CONTEXT}
								>
									<Col span={24} className="execution-context-editor-wrap ">
										<Monaco
											defaultValue={executionContext}
											language="json"
											value={executionContext}
											onChange={(value) => setExecutionContext(value)}
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
							)}
							{allowedTabs.includes(FUNCTION_EDITOR_TABS_KEYS.RESPONSE_OUTPUT) && (
								<TabPane
									tab={
										<h3>
											{isSmallScreen ? 'Response' : 'Response Output'}{' '}
											<Tooltip placement="right" title="Validated Response">
												<span style={{ marginLeft: 5 }}>
													<InfoCircleOutlined />
												</span>
											</Tooltip>
										</h3>
									}
									key={FUNCTION_EDITOR_TABS_KEYS.RESPONSE_OUTPUT}
								>
									<Col span={24} className="response-area-wrapper response-area">
										{responseOutput ? (
											<Monaco
												defaultValue="// Run the request to see the response output"
												language="json"
												value={responseOutput}
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
							)}
							{allowedTabs.includes(FUNCTION_EDITOR_TABS_KEYS.CONSOLE_LOGS) && (
								<TabPane
									tab={
										<h3>
											{isSmallScreen ? CONSOLE_LOGS_SHORT : CONSOLE_LOGS}
											<Tooltip placement="right" title="Console Logs">
												<span style={{ marginLeft: 5 }}>
													<InfoCircleOutlined />
												</span>
											</Tooltip>
										</h3>
									}
									key={CONSOLE_LOGS}
								>
									<ConsoleLogger consoleArray={consoleArray} />
								</TabPane>
							)}
						</Tabs>
					</Flex>

					<div ref={saveButtonRef} />
				</div>
				{showSaveFunctionButton && (
					<Button
						className={saveBtn}
						disabled={disableSaveButton}
						type="primary"
						onClick={handleFunctionSave}
					>
						{saveButtonText}
					</Button>
				)}
			</>
		);
	};

	if (openAsModal) {
		return (
			<Modal
				visible={modalVisible}
				footer={null}
				title={title}
				onCancel={() => {
					setModalVisible(false);
				}}
			>
				{getContent()}
			</Modal>
		);
	}
	return getContent();
};

FunctionEditor.defaultProps = {
	openAsModal: true,
	title: 'Function Editor',
	defaultCode: '',
	defaultExecutionContext: DEFAULT_EXECUTION_CONTEXT_VALUE,
	onSaveFunction: () => {},
	showSaveFunctionButton: false,
	customFunctionExecutor: undefined,
	saveButtonEnabledInitially: false,
	onChange: () => {},
	allowedTabs: [
		FUNCTION_EDITOR_TABS_KEYS.CONSOLE_LOGS,
		FUNCTION_EDITOR_TABS_KEYS.EXECUTION_CONTEXT,
		FUNCTION_EDITOR_TABS_KEYS.RESPONSE_OUTPUT,
	],
	functionResponse: undefined,
	shouldAppendReturnToFunctionConstructor: true,
};

FunctionEditor.propTypes = {
	onSaveFunction: PropTypes.func,
	defaultCode: PropTypes.string,
	defaultExecutionContext: PropTypes.object,
	openAsModal: PropTypes.bool,
	title: PropTypes.any,
	showSaveFunctionButton: PropTypes.bool,
	customFunctionExecutor: PropTypes.func,
	saveButtonEnabledInitially: PropTypes.bool,
	onChange: PropTypes.func,
	allowedTabs: PropTypes.arrayOf(PropTypes.string),
	functionResponse: PropTypes.string,
	shouldAppendReturnToFunctionConstructor: PropTypes.bool,
};
export default React.memo(FunctionEditor);
