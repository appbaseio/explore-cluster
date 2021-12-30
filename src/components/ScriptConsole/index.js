import { Button, Col, Icon, Row, Select, Tag, Tooltip } from 'antd';
import { css } from 'emotion';
import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import get from 'lodash/get';
import Monaco from '../../batteries/components/SearchSandbox/containers/MonacoEditor';
import Flex from '../../batteries/components/shared/Flex';
import { withErrorToaster } from '../../batteries/components/shared/ErrorToaster/ErrorToaster';
import { clearValidatedScriptRule, validateScript } from '../../batteries/modules/actions';
import {
	DEFAULT_EXECUTION_CONTEXT_VALUE,
	generateScriptValidationRequestBody,
	sanitizeScriptString,
} from './utils';
import scriptTemplates from './scriptTemplates';

const { Option } = Select;

const monacoOptions = {
	cursorStyle: 'line',
	lineNumbersMinChars: 2,
	fontFamily: 'Monaco, monospace !important',
	fontSize: 14,
	autoIndent: true,
	padding: {
		top: 10,
		bottom: 10,
	},
	minimap: {
		enabled: false,
	},
	comments: 'insertSpace',
};
const scriptConsoleCss = css`
	display: flex !important;
	align-items: stretch;
	height: 100% !important;
	min-height: 500px;
	position: relative !important;

	.monaco-wrapper {
		width: 100% !important;
		height: calc(100% - 42px) !important;
	}

	.save-script-btn {
		font-size: 14px;
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
			}

			&.template-area {
			}

			&.response-area {
			}

			&-wrapper {
				height: 50%;
			}
		}
	}
`;

const queryAreaTooltipTable = css`
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
			<table css={queryAreaTooltipTable}>
				<tr>
					<th>Package name</th>
					<th>Use Global as</th>
					<th>Typical use-case</th>
					<th />
				</tr>
				<tr>
					<td>fetch</td>
					<td>
						<code>fetch</code>
					</td>
					<td>
						Perform additional HTTP requests, supported in both sync and async modes.
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
						Cryptographic utilities, useful for implementing request authorization using
						any cryptographic scheme.
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
						NLP utilities for parts of speech tagging, parsing natural language, dates,
						numbers, and doing basic named entity recognition.
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
						<a href="https://lodash.com/docs/4.17.15" target="_blank" rel="noreferrer">
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
			</table>
			<a href="https://docs.appbase.io/" target="_blank" rel="noreferrer">
				Read the docs for script over here
			</a>
		</div>
	),
	'execution-context': (
		<div style={{ padding: '.5rem' }}>
			<p>
				A script typically executes in a request / response cycle. You can simulate this
				context by defining your own request and response bodies as well as environments.
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
	'execute-button': <div>Execute the script request</div>,
};

const ScriptConsole = ({
	validatedscriptRule,
	validateScriptRule,
	clearValidatedScriptRule: clearValidationValueFromStore,
	scriptRule,
	onScriptSave,
}) => {
	const scriptEditorRef = useRef(null);
	const [scriptRuleValue, setScriptRuleValue] = useState(
		scriptTemplates[Object.keys(scriptTemplates)[0]],
	);
	const [executionContext, setExecutionContext] = useState('');
	const [scriptRuleValidationResponse, setScriptRuleValidationResponse] = useState('');

	const [selectedTemplateKey, setSelectedTemplateKey] = useState(Object.keys(scriptTemplates)[0]);

	useEffect(() => {
		return () => {
			clearValidationValueFromStore();
		};
	}, []);
	useEffect(() => {
		if (scriptEditorRef && scriptEditorRef.current) {
			scriptEditorRef.current.trigger('', 'editor.action.formatDocument');
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
			if (
				typeof validatedscriptRule.results === 'object' &&
				Object.keys(validatedscriptRule.results).length
			) {
				setScriptRuleValidationResponse(
					JSON.stringify(validatedscriptRule.results, null, '\t'),
				);
			}
			if (validatedscriptRule.error) {
				setScriptRuleValidationResponse(
					JSON.stringify(validatedscriptRule.error.message, null, '\t'),
				);
			}
		} catch (error) {
			// eslint-disable-next-line
			console.log(error);
		}
	}, [validatedscriptRule]);

	const triggerScriptRuleValidation = () => {
		try {
			validateScriptRule(
				generateScriptValidationRequestBody(scriptRuleValue, executionContext),
			);
		} catch (error) {
			// eslint-disable-next-line
			console.log(error);
		}
	};

	const getTemplateDropdownOptions = () => {
		return Object.keys(scriptTemplates).map((key) => (
			<Option key={key} value={key}>
				<Tooltip title={key}>{key}</Tooltip>
			</Option>
		));
	};

	const onTemplateSelect = (value) => {
		setScriptRuleValue(scriptTemplates[value]);
		setSelectedTemplateKey(value);
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

					<Select
						showSearch
						size="small"
						style={{ width: '300px' }}
						placeholder="Select a Script Template"
						defaultValue={Object.keys(scriptTemplates)[0]}
						onChange={onTemplateSelect}
						value={selectedTemplateKey}
					>
						{getTemplateDropdownOptions()}
					</Select>
				</Flex>
				<Monaco
					defaultValue="// query here"
					language="javascript"
					value={scriptRuleValue}
					onChange={(value) => setScriptRuleValue(value)}
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
				<Row className="script-console__col-wrapper">
					<Col span={24} className="script-console__col template-area">
						<Flex justifyContent="space-between" alignItems="center">
							<h3>
								Execution Context
								<Tooltip
									overlayStyle={{
										width: '450px',
										height: 'max-content',
										maxWidth: 'max-content',
									}}
									placement="bottom"
									title={getTooltipTitle['execution-context']}
									autoAdjustOverflow={false}
									visible
								>
									<span style={{ marginLeft: 5 }}>
										<Icon type="info-circle" />
									</span>
								</Tooltip>
							</h3>
							<Button
								className="save-script-btn"
								type="primary"
								onClick={() => onScriptSave(sanitizeScriptString(scriptRuleValue))}
							>
								Save Script
							</Button>
						</Flex>

						<Monaco
							defaultValue={DEFAULT_EXECUTION_CONTEXT_VALUE}
							language="json"
							value={executionContext}
							onChange={(value) => setExecutionContext(value)}
							theme="vs-dark"
							options={monacoOptions}
							readOnly={false}
							wrapperClass="monaco-wrapper"
						/>
					</Col>
				</Row>
				<Row className="script-console__col-wrapper">
					<Col span={24} className="script-console__col response-area">
						<Flex justifyContent="space-between">
							<h3>
								Response{' '}
								<Tooltip placement="right" title={getTooltipTitle['response-area']}>
									<span style={{ marginLeft: 5 }}>
										<Icon type="info-circle" />
									</span>
								</Tooltip>
							</h3>

							{renderResponseCodeTime()}
						</Flex>
						<Monaco
							defaultValue="// Validation Response "
							language="json"
							value={scriptRuleValidationResponse}
							theme="vs-dark"
							options={monacoOptions}
							readOnly
							wrapperClass="monaco-wrapper"
						/>
					</Col>
				</Row>
			</Col>
		</Row>
	);
};

ScriptConsole.defaultProps = {
	scriptRule: '',
	validatedscriptRule: {},
	onScriptSave: () => {},
};

ScriptConsole.propTypes = {
	validatedscriptRule: PropTypes.object,
	validateScriptRule: PropTypes.func.isRequired,
	clearValidatedScriptRule: PropTypes.func.isRequired,
	scriptRule: PropTypes.string,
	onScriptSave: PropTypes.func,
};

const mapStateToProps = (state) => ({
	validatedscriptRule: get(state, '$validateAppScriptRules'),
});

const mapDispatchToProps = (dispatch) => ({
	validateScriptRule: (requestBody) => dispatch(validateScript(requestBody)),
	clearValidatedScriptRule: () => dispatch(clearValidatedScriptRule()),
});

export default withErrorToaster(connect(mapStateToProps, mapDispatchToProps)(ScriptConsole));
