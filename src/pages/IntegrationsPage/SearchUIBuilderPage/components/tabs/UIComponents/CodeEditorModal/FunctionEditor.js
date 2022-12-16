import React, { useEffect, useRef, useState } from 'react';

import { CloseOutlined, InfoCircleOutlined } from '@ant-design/icons';

import { Button, Col, Tabs, Tooltip } from 'antd';
import { css } from 'emotion';
import PropTypes from 'prop-types';
import styled from 'react-emotion';
import Monaco from '../../../../../../../batteries/components/SearchSandbox/containers/MonacoEditor';
import { monacoOptions } from '../../../../../../../components/ScriptConsole/utils';
import ConsoleLogger from '../../../../../../../components/ScriptConsole/ConsoleLogger';
import Flex from '../../../../../../../batteries/components/shared/Flex';
import getConsoleLogs from '../getConsoleLogs';
import LivePreview from '../LivePreview';

/**/

/* eslint-disable */
export function overrideConsoleLog() {
	console.stdlog = console.log.bind(console);
	console.logs = [];
	console.log = function () {
		console.logs.push(Array.from(arguments));
		console.stdlog.apply(console, arguments);
	};
}

export function resetConsoleOverride() {
	console.log = console.stdlog.bind(console);
}
/* eslint-enable */

export const DEFAULT_DESIGN_COLORS = {
	light: {
		primaryColor: '#4A90E2',
		textColor: '#333',
	},
	dark: {
		primaryColor: '#4A90E2',
		textColor: '#ABABAB',
	},
};
const LivePreviewModal = styled.div`
	width: 100%;
	height: 100%;
	position: absolute;
	top: 0px;
	background: white;
	z-index: 500;
`;
const IconContainer = styled.div`
	display: flex;
	justify-content: flex-end;
`;
const CloseIcon = styled(CloseOutlined)`
	font-size: 1rem;
	padding: 10px;
	cursor: pointer;
`;
const Footer = styled.div`
	padding: 10px;
	display: flex;
	justify-content: flex-end;
	border-top: 1px solid rgb(220, 220, 220);
`;
const container = css`
	display: flex !important;
	align-items: stretch;
	position: relative !important;
	max-width: 100%;
	margin-top: 2.5rem;
	min-height: 500px;
	.save-btn {
		position: absolute;
		left: 0;
		z-index: 4;
		bottom: 0;
	}
	h3.container-heading {
		position: absolute;
		top: -60px;
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
		position: relative;
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
	.live-preview-area-wrapper {
		height: 100%;
		padding: 0.1rem 0.3rem;

		&.template-area,
		&.live-preview-area {
			min-height: 250px;
			height: calc(100% - 50px);
		}

		&.live-preview-area {
			position: relative;
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
const { TabPane } = Tabs;
export const FUNCTION_EDITOR_TABS_KEYS = {
	EXECUTION_CONTEXT: 'Execution Context',
	CONSOLE_LOGS: 'Console Logs',
	CONSOLE_LOGS_SHORT: 'Console',
	RESPONSE_OUTPUT: 'Response Output',
	LIVE_PREVIEW: 'Live Preview',
};

const { EXECUTION_CONTEXT, CONSOLE_LOGS, CONSOLE_LOGS_SHORT } = FUNCTION_EDITOR_TABS_KEYS;

const DEFAULT_FUNCTION_EDITOR_VALUE =
	"/* Put your logic inside \n the function body */ \n \n /* CAUTION: MAKE CHANGES ONLY \nINSIDE THE FUNCTION BODY */ \n \n function testFunc({ suggestion, value, customEvents }) {    \n /* change code below this line */ \n console.log('Hello World!');\n };";

const FunctionEditor = ({
	onChange,
	onSaveFunction,
	showSaveFunctionButton,
	saveButtonEnabledInitially,
	functionProperty,
	componentConfig,
	showConsoleLogs,
	showExecutionContext,
	showLivePreview,
	showResponseOutput,
	pipeline,
}) => {
	const [activeTabKey, setActiveTabKey] = useState(EXECUTION_CONTEXT);
	const [functionValue, setFunctionValue] = useState(
		componentConfig[functionProperty] || DEFAULT_FUNCTION_EDITOR_VALUE,
	);
	const [consoleArray, setConsoleArray] = useState([]);
	const executionContextEditorRef = useRef(null);
	const functionEditorRef = useRef(null);
	const saveButtonRef = useRef(null);
	const [isSmallScreen, setIsSmallScreen] = useState(false);
	const [saveButtonText, setSaveButtonText] = useState('Save Function');
	const [disableSaveButton, setDisableSaveButton] = useState(!saveButtonEnabledInitially);
	const [state, setState] = useState({ executionContext: '', responseOutput: '' });
	const [showLivePreviewModal, setShowLivePreviewModal] = useState(true);

	useEffect(() => {
		const updateSmallScreenVariable = () => {
			setIsSmallScreen(window.innerWidth <= 1600);
		};

		window.addEventListener('resize', updateSmallScreenVariable);
		saveButtonRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
		return () => {
			window.removeEventListener('resize', updateSmallScreenVariable);
		};
	}, []);

	const triggerFunctionTest = () => {
		// Parse a stringified function(arrow, regular, ending in semicolon, etc.)
		// eslint-disable-next-line
		const func = eval(`const myFunc = ${functionValue}; myFunc`);
		const parsedExecutionContext = JSON.parse(state.executionContext);
		const logsArray = getConsoleLogs({
			func,
			executionContext: parsedExecutionContext,
		});
		setConsoleArray(logsArray);
		setActiveTabKey(CONSOLE_LOGS);
	};

	const handleFunctionSave = () => {
		onSaveFunction(functionValue);
		setSaveButtonText('Function Saved');
		setTimeout(() => {
			setSaveButtonText('Save Function');
		}, 1500);
	};
	let parsedExecutionContext;
	try {
		parsedExecutionContext = JSON.parse(state.executionContext);
	} catch (e) {
		console.error(e);
	}
	// Value selected by the filter component
	const selectedValue = parsedExecutionContext && parsedExecutionContext[0];

	return (
		<div className={container}>
			{showSaveFunctionButton && (
				<Button
					className="save-btn"
					disabled={disableSaveButton}
					type="primary"
					onClick={handleFunctionSave}
				>
					{saveButtonText}
				</Button>
			)}
			<Tooltip placement="bottom" title="Click to validate">
				<button className="validate-script-btn" type="button" onClick={triggerFunctionTest}>
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
						onChange={(code) => {
							if (typeof onChange === 'function') {
								onChange(code);
							}
							setFunctionValue(code);
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
					{showExecutionContext && (
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
								<div style={{ height: 500, position: 'relative' }}>
									<Monaco
										language="json"
										value={state.executionContext}
										customizeMonacoInstance={(monaco, editorRef) => {
											executionContextEditorRef.current = editorRef;
										}}
										theme="vs-dark"
										readOnly={false}
										wrapperClass="monaco-wrapper"
									/>
									{
										<>
											{showLivePreview && (
												<Button
													style={{
														position: 'absolute',
														bottom: 0,
														right: 0,
													}}
													onClick={() => setShowLivePreviewModal(true)}
												>
													Re-populate execution context
												</Button>
											)}
											<LivePreviewModal
												style={{
													visibility:
														showLivePreviewModal && showLivePreview
															? 'visible'
															: 'hidden',
												}}
											>
												<IconContainer>
													<CloseIcon
														onClick={() =>
															setShowLivePreviewModal(false)
														}
													/>
												</IconContainer>
												<LivePreview
													pipeline={pipeline}
													prefix={functionProperty}
													hookOwnRender={(data) => {
														if (functionProperty === 'defaultQuery') {
															setState((s) => ({
																...s,
																responseOutput: JSON.stringify(
																	data,
																	null,
																	2,
																),
															}));
														}
														if (functionProperty === 'setOption') {
															setState((s) => ({
																...s,
																executionContext: JSON.stringify(
																	data,
																	null,
																	2,
																),
															}));
														}
													}}
													componentConfig={{
														...componentConfig,
														[functionProperty]:
															functionValue ||
															componentConfig[functionProperty],
													}}
													hookCustomQuery={(...args) => {
														// Since same parameters are passed to defaultQuery and customQuery
														if (functionProperty !== 'setOption') {
															setState((s) => ({
																...s,
																executionContext: JSON.stringify(
																	args,
																	null,
																	2,
																),
															}));
														}
													}}
													hookResultRender={(data) => {
														if (functionProperty === 'customQuery') {
															setState((s) => ({
																...s,
																responseOutput: JSON.stringify(
																	data,
																	null,
																	2,
																),
															}));
														}
													}}
												/>
												{selectedValue
													? `Value selected: ${selectedValue}`
													: 'Select a value to populate the execution context'}
												<Footer>
													<Button
														type="primary"
														onClick={() =>
															setShowLivePreviewModal(false)
														}
													>
														Set Value
													</Button>
												</Footer>
											</LivePreviewModal>
										</>
									}
								</div>
							</Col>
						</TabPane>
					)}
					{showConsoleLogs && (
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
					{showResponseOutput && (
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
								{state.responseOutput ? (
									<Monaco
										defaultValue="// Run the request to see the response output"
										language="json"
										value={state.responseOutput}
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
				</Tabs>
			</Flex>
			<div ref={saveButtonRef} />
		</div>
	);
};

FunctionEditor.defaultProps = {
	onSaveFunction: () => {},
	onChange: () => {},
	showSaveFunctionButton: false,
	saveButtonEnabledInitially: false,
	showConsoleLogs: true,
	showExecutionContext: true,
	showResponseOutput: true,
	showLivePreview: true,
	componentConfig: {},
	pipeline: '',
};

FunctionEditor.propTypes = {
	onChange: PropTypes.func,
	onSaveFunction: PropTypes.func,
	showSaveFunctionButton: PropTypes.bool,
	saveButtonEnabledInitially: PropTypes.bool,
	showConsoleLogs: PropTypes.bool,
	showExecutionContext: PropTypes.bool,
	showResponseOutput: PropTypes.bool,
	showLivePreview: PropTypes.bool,
	functionProperty: PropTypes.oneOf(['defaultQuery', 'setOption', 'customQuery']).isRequired,
	componentConfig: PropTypes.object,
	pipeline: PropTypes.string,
};
export default React.memo(FunctionEditor, (prevProps, nextProps) => {
	let propsAreEqual = true;
	Object.keys(nextProps.componentConfig).forEach((prop) => {
		if (!(nextProps.componentConfig[prop] === prevProps.componentConfig[prop])) {
			propsAreEqual = false;
		}
	});
	return propsAreEqual;
});

export function shouldUpdateExecutionContext(prevValue, nextValue) {
	const isArray = Array.isArray(nextValue);
	const isObject = !isArray && typeof nextValue === 'object' && nextValue !== null;
	const isEmptyObject = isObject && Object.keys(nextValue).length === 0;
	if (isEmptyObject) {
		return false;
	}
	if (isArray && nextValue.length) {
		return true;
	}
	if (!isArray && nextValue) {
		return true;
	}
	if (!prevValue) {
		return true;
	}
	return false;
}
