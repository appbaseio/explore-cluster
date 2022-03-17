import { Button, Col, Icon, Row, Select, Tag, Tooltip, Modal, Tabs } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import get from 'lodash/get';
import { css } from 'emotion';
import Monaco from '../../batteries/components/SearchSandbox/containers/MonacoEditor';
import Flex from '../../batteries/components/shared/Flex';
import { withErrorToaster } from '../../batteries/components/shared/ErrorToaster/ErrorToaster';
import { clearValidatedScriptRule, validateScript } from '../../batteries/modules/actions';
import {
	DEFAULT_QUERY_EDITOR_VALUE,
	generateScriptValidationRequestBody,
	getDefaultExecutionContextValue,
	monacoOptions,
	sanitizeScriptString,
} from './utils';

import scriptTemplates, { TEMPLATE_KEYS } from './scriptTemplates';
import ConsoleLogger from './ConsoleLogger';

const {
	MODIFY_INDEXING_REQUEST,
	MODIFY_BULK_REQUEST,
	CRON_SCRIPT,
	MODIFY_REQUEST_COMPROMISE,
	ASYNC_FETCH,
	SYNC_FETCH,
	MODIFY_REQUEST_CRYPTOJS,
} = TEMPLATE_KEYS;
const { Option } = Select;
const { confirm } = Modal;
const { TabPane } = Tabs;
const queryAreaTooltipTableCss = css`
	td,
	th {
		border: 1px solid #fff;
		text-align: left;
		vertical-align: middle;
		padding: 3px;
	}

	th {
		white-space: no-wrap;
	}

	td {
		max-width: 400px;
	}

	table {
		a:firstchild {
			margin-bottom: 1px;
		}
	}
`;
const scriptConsoleCss = css`
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
			}
		}
	}

	.monaco-wrapper {
		width: 100% !important;
		height: calc(100% - 42px) !important;
	}

	.save-script-btn-wrapper {
		padding: 0 5px 5px;
		background: white;

		button {
			font-size: 14px;
		}
	}
	.script-console {
		&__col {
			height: 100%;
			padding: 0.1rem 0.3rem;

			h3 {
				padding: 12px 0rem;
				margin-bottom: 0;
			}

			&.query-area {
				min-height: 500px;
				position: relative;
				.validate-script-btn {
					box-sizing: border-box;
					position: absolute;
					top: 50%;
					right: 0rem;
					z-index: 15;
					transform: translate(50%, 83%);
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
			}

			&.template-area,
			&.response-area {
				min-height: 250px;
				height: 100%;

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
			}

			&.template-area {
			}

			&.response-area {
				position: relative;
				.response-stats-wrapper {
					width: max-content;
					position: absolute;
					z-index: 1;
					right: 10px;
					top: 6px;
				}
			}

			&-wrapper {
				height: 100%;
			}
		}
	}

	@media only screen and (max-width: 1024px) {
		h3 {
			font-size: 12px;
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

const getTooltipTitle = {
	'query-area': (
		<div style={{ padding: '.5rem' }}>
			<p>Define your JavaScript handlers over here.</p>
			<p>
				For modifying the request, define the <code>handleRequest</code> function.
			</p>
			<p>
				For modifying the response, define the <code>handleResponse</code> function.
			</p>
			<p>Following global packages are available and can be used directly:</p>
			<table css={queryAreaTooltipTableCss}>
				<thead>
					<tr>
						<th>Package name</th>
						<th>Use Global as</th>
						<th>Typical use-case</th>
						<th />
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>fetch</td>
						<td>
							<code>fetch</code>
						</td>
						<td>
							Perform additional HTTP requests, supported in both sync and async
							modes.
						</td>
						<td>
							<a
								href="https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch"
								target="_blank"
								rel="noreferrer"
							>
								Docs Reference
							</a>
						</td>
					</tr>
					<tr>
						<td>crypto-js@4.1.1</td>
						<td>
							<code>CryptoJS</code>
						</td>
						<td>
							Cryptographic utilities, useful for implementing request authorization
							using any cryptographic scheme.
						</td>
						<td>
							<a
								href="https://cryptojs.gitbook.io/docs/"
								target="_blank"
								rel="noreferrer"
							>
								Docs Reference
							</a>
							<br />
							<a
								href="https://www.npmjs.com/package/crypto-js"
								target="_blank"
								rel="noreferrer"
							>
								npm module link
							</a>
						</td>
					</tr>
					<tr>
						<td>compromise@13.11.4</td>
						<td>
							<code>nlp</code>
						</td>
						<td>
							Blazing fast{' '}
							<span role="img" aria-label="lightning-emoji">
								⚡️
							</span>{' '}
							NLP utilities for parts of speech tagging, parsing natural language,
							dates, numbers, and doing basic named entity recognition.
						</td>
						<td>
							<a href="http://compromise.cool/" target="_blank" rel="noreferrer">
								Docs Reference
							</a>
							<br />
							<a
								href="https://www.npmjs.com/package/compromise"
								target="_blank"
								rel="noreferrer"
							>
								npm module link
							</a>
						</td>
					</tr>
					<tr>
						<td>lodash@4.17.21</td>
						<td>
							<code>_</code>
						</td>
						<td>Utility library delivering modularity, performance, and extras.</td>
						<td>
							<a
								href="https://lodash.com/docs/4.17.15"
								target="_blank"
								rel="noreferrer"
							>
								Docs Reference
							</a>
							<br />
							<a
								href="https://www.npmjs.com/package/lodash"
								target="_blank"
								rel="noreferrer"
							>
								npm module link
							</a>
						</td>
					</tr>
				</tbody>
			</table>
			<a
				href="https://docs.appbase.io/docs/search/scripts/gettingstarted"
				target="_blank"
				rel="noreferrer"
			>
				Read the docs for ReactiveSearch scripts over here
			</a>
		</div>
	),
	'execution-context': (
		<div style={{ padding: '.5rem' }}>
			<p>
				A script typically executes in a request / response cycle. You can simulate this
				context by defining your own request and response bodies as well as environments.
				The execution context is only meant to validate the script and isn’t available at
				the runtime.
			</p>
			<p>Your handler function has access to the execution context via the context global.</p>
			<p>Access Examples:</p>
			<ol
				style={{
					margin: '0',
					padding: '0',
					paddingLeft: '15px',
				}}
			>
				<li>
					Access the request headers as <code>context.request.headers</code>
				</li>
				<li>
					Access the response body as <code>context.response.body</code>
				</li>
				<li>
					Access the environments as <code>context.envs</code>
				</li>
			</ol>
		</div>
	),
	'response-area': <div>Script response can be seen here once you play the request.</div>,
	'execute-button': <div>Execute the script request.</div>,
	'console-logs': <div>View console logs.</div>,
};

const TABS_KEYS = {
	EXECUTION_CONTEXT: 'Execution Context',
	RESPONSE_OUTPUT_SHORT: 'Response',
	RESPONSE_OUTPUT: 'Response Output',
	CONSOLE_LOGS: 'Console Logs',
	CONSOLE_LOGS_SHORT: 'Console',
};

const {
	EXECUTION_CONTEXT,
	RESPONSE_OUTPUT,
	RESPONSE_OUTPUT_SHORT,
	CONSOLE_LOGS,
	CONSOLE_LOGS_SHORT,
} = TABS_KEYS;

const ScriptConsole = ({
	validatedscriptRule,
	validateScriptRule,
	clearValidatedScriptRule: clearValidationValueFromStore,
	scriptRule,
	onScriptSave,
	envs,
	savedExecutionContext,
}) => {
	const scriptEditorRef = useRef(null);
	const executionContextEditorRef = useRef(null);
	const triggerExecutionContextFormatter = useRef(false);
	const isNewScriptRule = useRef(!scriptRule);
	const [scriptRuleValue, setScriptRuleValue] = useState('');

	const [executionContext, setExecutionContext] = useState('');
	const [scriptRuleValidationResponse, setScriptRuleValidationResponse] = useState('');

	const [selectedTemplateKey, setSelectedTemplateKey] = useState('');

	const [activeTabKey, setActiveTabKey] = useState(EXECUTION_CONTEXT);

	const [isSmallScreen, setIsSmallScreen] = useState(false);
	useEffect(() => {
		if (!scriptRule) {
			isNewScriptRule.current = true;
		}

		if (savedExecutionContext instanceof Object && Object.keys(savedExecutionContext).length) {
			try {
				const { request, response } = savedExecutionContext || {};
				const processedExecutionObject = {};
				if (request instanceof Object && Object.keys(request).length) {
					Object.assign(processedExecutionObject, {
						request: {
							...request,
							...(typeof request.body === 'string' && {
								body: JSON.parse(request.body),
							}),
						},
					});
				}
				if (response instanceof Object && Object.keys(response).length) {
					Object.assign(processedExecutionObject, {
						response: {
							...response,
							...(typeof response.body === 'string' && {
								body: JSON.parse(response.body),
							}),
						},
					});
				}

				if (envs instanceof Object && Object.keys(envs).length) {
					Object.assign(processedExecutionObject, {
						envs,
					});
				}

				setExecutionContext(JSON.stringify(processedExecutionObject));
			} catch (error) {
				// eslint-disable-next-line no-console
				console.error(error);
			}
		}

		const updateSmallScreenVariable = () => {
			setIsSmallScreen(window.innerWidth <= 1320);
		};
		window.addEventListener('resize', updateSmallScreenVariable);
		return () => {
			window.removeEventListener('resize', updateSmallScreenVariable);
			clearValidationValueFromStore();
		};
	}, []);

	useEffect(() => {
		if (scriptEditorRef && scriptEditorRef.current) {
			scriptEditorRef.current.trigger('', 'editor.action.formatDocument');
		}
		if (selectedTemplateKey) {
			let parsedExecutionContextValue = JSON.parse(executionContext);

			const { executionContextOverride } = scriptTemplates[selectedTemplateKey];
			if (executionContextOverride) {
				parsedExecutionContextValue = { ...executionContextOverride };
				// setting env values from external ui ---> "Set Environments"
				parsedExecutionContextValue.envs = { ...parsedExecutionContextValue.envs, ...envs };
			} else {
				parsedExecutionContextValue = JSON.parse(getDefaultExecutionContextValue({ envs }));
				switch (selectedTemplateKey) {
					case CRON_SCRIPT:
						break;
					case MODIFY_BULK_REQUEST:
						break;
					case MODIFY_INDEXING_REQUEST:
						break;
					case MODIFY_REQUEST_COMPROMISE:
						delete parsedExecutionContextValue.response;
						break;
					case ASYNC_FETCH:
						delete parsedExecutionContextValue.response;
						break;
					case SYNC_FETCH:
						delete parsedExecutionContextValue.response;
						break;
					case MODIFY_REQUEST_CRYPTOJS:
						delete parsedExecutionContextValue.response;
						break;
					default:
						break;
				}
			}

			// set overridden execution context value
			setExecutionContext(JSON.stringify(parsedExecutionContextValue));
			triggerExecutionContextFormatter.current = true;

			// reset tab values after template is changed
			setActiveTabKey(EXECUTION_CONTEXT);
			clearValidationValueFromStore();
			setScriptRuleValidationResponse('');
		}
	}, [selectedTemplateKey]);

	useEffect(() => {
		if (scriptRule) {
			setScriptRuleValue(scriptRule);
			setSelectedTemplateKey(undefined);
		}
	}, [scriptRule]);

	useEffect(() => {
		try {
			let shouldSwitchToResponseTab = false;
			if (
				typeof validatedscriptRule.results === 'object' &&
				Object.keys(validatedscriptRule.results).length
			) {
				setScriptRuleValidationResponse(
					JSON.stringify(validatedscriptRule.results, null, '\t'),
				);
				shouldSwitchToResponseTab = true;
			}
			if (validatedscriptRule.error) {
				setScriptRuleValidationResponse(
					JSON.stringify(validatedscriptRule.error.message, null, '\t'),
				);
				shouldSwitchToResponseTab = true;
			}

			if (shouldSwitchToResponseTab) {
				setActiveTabKey(RESPONSE_OUTPUT);
			}
		} catch (error) {
			// eslint-disable-next-line
			console.error(error);
		}
	}, [validatedscriptRule]);

	useEffect(() => {
		if (
			isNewScriptRule.current &&
			!!scriptRuleValue &&
			scriptRuleValue.trim() !== DEFAULT_QUERY_EDITOR_VALUE.trim()
		) {
			isNewScriptRule.current = false;
		}
	}, [scriptRuleValue]);

	useEffect(() => {
		if (triggerExecutionContextFormatter.current === true && executionContext) {
			if (executionContextEditorRef && executionContextEditorRef.current) {
				executionContextEditorRef.current.trigger('', 'editor.action.formatDocument');
				triggerExecutionContextFormatter.current = false;
			}
		}
	}, [triggerExecutionContextFormatter.current]);
	const triggerScriptRuleValidation = () => {
		try {
			validateScriptRule(
				generateScriptValidationRequestBody(scriptRuleValue, executionContext),
			);
		} catch (error) {
			// eslint-disable-next-line
			console.error(error);
		}
	};

	const camelize = (str) => {
		return str
			.replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
				return index === 0 ? word.toLowerCase() : word.toUpperCase();
			})
			.replace(/\s+/g, '');
	};

	const getTemplateDropdownOptions = () => {
		return Object.keys(scriptTemplates).map((key) => (
			<Option key={key} value={key} data-cy={camelize(key)}>
				<Tooltip title={key}>{key}</Tooltip>
			</Option>
		));
	};

	const onTemplateSelect = (value) => {
		const actionCallback = () => {
			setScriptRuleValue(scriptTemplates[value].script);
			setSelectedTemplateKey(value);
			if (isNewScriptRule.current) {
				isNewScriptRule.current = false;
			}
		};

		if (!isNewScriptRule.current && !selectedTemplateKey) {
			confirm({
				title: 'Do you want to proceed?',
				content:
					'By choosing this script template, your existing script will get overridden.',
				onOk() {
					actionCallback();
				},
				onCancel() {},
			});
		} else {
			actionCallback();
		}
	};

	const renderResponseCodeTime = () => {
		let statusCode;
		let timeTook;
		if (validatedscriptRule?.error) {
			statusCode = validatedscriptRule?.error?.actual?.code;
		} else if (validatedscriptRule?.results) {
			statusCode = validatedscriptRule?.results?.response?.code;
			timeTook = validatedscriptRule?.results?.['script_took'];
		}

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

	const saveScriptHandler = () => {
		try {
			const savePayload = { script: sanitizeScriptString(scriptRuleValue) };

			const parsedExecutionContext = JSON.parse(executionContext || {});
			const { request, response } = parsedExecutionContext || {};

			const payloadExecutionContextObj = {};
			if (request instanceof Object && Object.keys(request).length) {
				Object.assign(payloadExecutionContextObj, {
					request: {
						...request,
						...(typeof request.body === 'object' && {
							body: JSON.stringify(request.body),
						}),
					},
				});
			}

			if (response instanceof Object && Object.keys(response).length) {
				Object.assign(payloadExecutionContextObj, {
					response: {
						...response,
						...(typeof response.body === 'object' && {
							body: JSON.stringify(response.body),
						}),
					},
				});
			}
			onScriptSave({
				...savePayload,
				payloadExecutionContextObj,
			});
		} catch (error) {
			// eslint-disable-next-line no-console
			console.error(error);
		}
	};
	return (
		<Row justify="space-between" css={scriptConsoleCss}>
			<Col span={12} className="script-console__col query-area">
				<Tooltip placement="bottom" title={getTooltipTitle['execute-button']}>
					<button
						className="validate-script-btn"
						type="button"
						onClick={triggerScriptRuleValidation}
					>
						<div className="play-triangle" />
					</button>
				</Tooltip>
				<Flex justifyContent="space-between" alignItems="center">
					<h3>
						Script Editor
						<Tooltip
							overlayStyle={{
								width: 'max-content',
								maxWidth: '70vw',
								minWidth: '500px',
								height: '75vh',
								left: '8px',
							}}
							placement="bottom"
							title={getTooltipTitle['query-area']}
						>
							<span style={{ marginLeft: 5 }}>
								<Icon type="info-circle" />
							</span>
						</Tooltip>
					</h3>
					<Tooltip
						visible={isNewScriptRule.current}
						placement="top"
						title="Choose a template to start with!"
					>
						<Select
							defaultOpen={isNewScriptRule.current}
							showSearch
							size="small"
							placeholder="Select a Script Template"
							onChange={onTemplateSelect}
							value={selectedTemplateKey}
							data-cy="script-template"
						>
							{getTemplateDropdownOptions()}
						</Select>
					</Tooltip>
				</Flex>
				<Monaco
					defaultValue={DEFAULT_QUERY_EDITOR_VALUE}
					language="javascript"
					value={scriptRuleValue}
					onChange={(value) => {
						setScriptRuleValue(value);
					}}
					theme="vs-dark"
					options={monacoOptions}
					readOnly={false}
					customizeMonacoInstance={(monaco, editorRef) => {
						scriptEditorRef.current = editorRef;
					}}
					wrapperClass="monaco-wrapper"
				/>
			</Col>
			<Col span={12}>
				<Tabs
					tabBarExtraContent={
						<div className="save-script-btn-wrapper">
							<Button
								type="primary"
								onClick={saveScriptHandler}
								data-cy="query-rule-save-script"
							>
								{isSmallScreen ? (
									<Tooltip title="Save Script" trigger="hover">
										<Icon type="save" title="" />{' '}
									</Tooltip>
								) : (
									'Save Script'
								)}
							</Button>
						</div>
					}
					className="tabs-container"
					defaultActiveKey={EXECUTION_CONTEXT}
					onChange={(key) => setActiveTabKey(key)}
					activeKey={activeTabKey}
				>
					<TabPane
						className="script-console__col-wrapper"
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
									title={getTooltipTitle['execution-context']}
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
						<Col span={24} className="script-console__col template-area">
							<Monaco
								defaultValue={getDefaultExecutionContextValue({
									envs,
								})}
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
					<TabPane
						className="script-console__col-wrapper"
						tab={
							<h3>
								{isSmallScreen ? RESPONSE_OUTPUT_SHORT : RESPONSE_OUTPUT}{' '}
								<Tooltip placement="right" title={getTooltipTitle['response-area']}>
									<span style={{ marginLeft: 5 }}>
										<Icon type="info-circle" />
									</span>
								</Tooltip>
							</h3>
						}
						key={RESPONSE_OUTPUT}
					>
						<Col span={24} className="script-console__col response-area">
							<div className="response-stats-wrapper">{renderResponseCodeTime()}</div>
							{scriptRuleValidationResponse ? (
								<Monaco
									defaultValue="// Run the request to see the response output"
									language="json"
									value={scriptRuleValidationResponse}
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
								<Tooltip placement="right" title={getTooltipTitle['console-logs']}>
									<span style={{ marginLeft: 5 }}>
										<Icon type="info-circle" />
									</span>
								</Tooltip>
							</h3>
						}
						key={CONSOLE_LOGS}
					>
						<ConsoleLogger
							consoleArray={
								validatedscriptRule?.results?.['console_logs'] ||
								validatedscriptRule?.results?.response?.['console_logs'] ||
								validatedscriptRule?.results?.response?.['logs']
							}
						/>
					</TabPane>
				</Tabs>
			</Col>
		</Row>
	);
};

ScriptConsole.defaultProps = {
	scriptRule: '',
	validatedscriptRule: {},
	onScriptSave: () => {},
	envs: {},
	savedExecutionContext: {},
};

ScriptConsole.propTypes = {
	validatedscriptRule: PropTypes.object,
	validateScriptRule: PropTypes.func.isRequired,
	clearValidatedScriptRule: PropTypes.func.isRequired,
	scriptRule: PropTypes.string,
	onScriptSave: PropTypes.func,
	envs: PropTypes.object,
	savedExecutionContext: PropTypes.object,
};

const mapStateToProps = (state) => ({
	validatedscriptRule: get(state, '$validateAppScriptRules'),
});

const mapDispatchToProps = (dispatch) => ({
	validateScriptRule: (requestBody) => dispatch(validateScript(requestBody)),
	clearValidatedScriptRule: () => dispatch(clearValidatedScriptRule()),
});

export default withErrorToaster(connect(mapStateToProps, mapDispatchToProps)(ScriptConsole));
