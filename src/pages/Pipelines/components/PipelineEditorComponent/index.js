import { css } from 'emotion';
import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import yamlToJson from 'js-yaml';
import { Button, Dropdown, Icon, Menu } from 'antd';
import Container from '../../../../components/Container';
import Monaco from '../../../../batteries/components/SearchSandbox/containers/MonacoEditor';
import { monacoOptions } from '../../utils';
import { getPipelineSchema } from '../../../../batteries/utils/app';
import { isJson } from '../../../../components/ScriptConsole/utils';
// REMOVE IT LATER ON
const fakeSchema = {
	$schema: 'http://json-schema.org/draft-04/schema#',
	properties: {
		id: {
			type: 'string',
		},
		enabled: {
			type: 'boolean',
		},
		description: {
			type: 'string',
		},
		priority: {
			type: 'integer',
		},
		routes: {
			items: {
				properties: {
					path: {
						type: 'string',
					},
					method: {
						type: 'string',
					},
					recordLogs: {
						type: 'boolean',
					},
					classify: {
						properties: {
							category: {
								type: 'integer',
							},
							acl: {
								type: 'integer',
							},
						},
						additionalProperties: false,
						type: 'object',
					},
				},
				additionalProperties: false,
				type: 'object',
			},
			type: 'array',
		},
		envs: {
			patternProperties: {
				'.*': {
					additionalProperties: true,
				},
			},
			type: 'object',
		},
		trigger: {
			properties: {
				type: {
					type: 'integer',
				},
				expression: {
					type: 'string',
				},
				timeframe: {
					properties: {
						start_time: {
							type: 'integer',
						},
						end_time: {
							type: 'integer',
						},
					},
					additionalProperties: false,
					type: 'object',
				},
			},
			additionalProperties: false,
			type: 'object',
		},
		stages: {
			items: {
				oneOf: [
					{
						required: ['id'],
					},
					{
						required: ['use'],
					},
				],
				properties: {
					use: {
						type: 'string',
						enum: [
							'classifyCategory',
							'classifyACL',
							'logsRecorder',
							'authorization',
							'validateRatelimits',
							'validateSources',
							'validateReferers',
							'validateIndices',
							'validateCategory',
							'validateOperation',
							'validatePermissionExpiryvalidatePermissionExpiry',
							'elasticsearchQuery',
							'reactivesearchQuery',
						],
						additionalProperties: {
							stages: {
								elasticsearchQuery: {
									description: 'Stage to query elasticsearch BE',
									inputs: {
										properties: {
											method: {
												type: 'string',
											},
										},
									},
								},
								authorization: {
									description: 'To authorize user',
									inputs: {
										properties: {
											type: {
												type: 'string',
												enum: ['basic', 'bearer'],
											},
										},
									},
								},
							},
						},
					},
					id: {
						type: 'string',
					},
					enabled: {
						type: 'boolean',
					},
					async: {
						type: 'boolean',
					},
					script: {
						type: 'string',
					},
					scriptRef: {
						type: 'string',
					},
					continueOnError: {
						type: 'boolean',
					},
					envs: {
						patternProperties: {
							'.*': {
								additionalProperties: true,
							},
						},
						type: 'object',
					},
					needs: {
						items: {
							type: 'string',
						},
						type: 'array',
					},
					description: {
						type: 'string',
					},
				},
				additionalProperties: false,
				type: 'object',
			},
			type: 'array',
		},
	},
	required: ['routes'],
	additionalProperties: false,
	type: 'object',
	definitions: {
		ClassifyRoute: {
			properties: {
				category: {
					type: 'integer',
				},
				acl: {
					type: 'integer',
				},
			},
			additionalProperties: false,
			type: 'object',
		},
		ESPipelineRoutes: {
			properties: {
				path: {
					type: 'string',
				},
				method: {
					type: 'string',
				},
				recordLogs: {
					type: 'boolean',
				},
				classify: {
					properties: {
						category: {
							type: 'integer',
						},
						acl: {
							type: 'integer',
						},
					},
					additionalProperties: false,
					type: 'object',
				},
			},
			additionalProperties: false,
			type: 'object',
		},
		ESPipelineStage: {
			properties: {
				use: {
					enum: [
						'classifyCategory',
						'classifyACL',
						'logsRecorder',
						'authorization',
						'validateRatelimits',
						'validateSources',
						'validateReferers',
						'validateIndices',
						'validateCategory',
						'validateOperation',
						'validatePermissionExpiry',
						'elasticsearchQuery',
						'reactivesearchQuery',
					],
					additionalProperties: {
						stages: {
							elasticsearchQuery: {
								description: 'Stage to query elasticsearch BE',
								inputs: {
									properties: {
										method: {
											type: 'string',
										},
									},
								},
							},
							authorization: {
								description: 'To authorize user',
								inputs: {
									properties: {
										type: {
											type: 'string',
											enum: ['basic', 'bearer'],
										},
									},
								},
							},
						},
					},
					type: 'string',
				},
				id: {
					type: 'string',
				},
				enabled: {
					type: 'boolean',
				},
				async: {
					type: 'boolean',
				},
				script: {
					type: 'string',
				},
				scriptRef: {
					type: 'string',
				},
				continueOnError: {
					type: 'boolean',
				},
				envs: {
					patternProperties: {
						'.*': {
							additionalProperties: true,
						},
					},
					type: 'object',
				},
				needs: {
					items: {
						type: 'string',
					},
					type: 'array',
				},
				description: {
					type: 'string',
				},
			},
			additionalProperties: false,
			type: 'object',
		},
		PreBuiltStage: {
			enum: [
				'elasticsearchQueryelasticsearchQueryelasticsearchQuery',
				'classifyCategory',
				'classifyACL',
				'logsRecorder',
				'authorization',
				'validateRatelimits',
				'validateSources',
				'validateReferers',
				'validateIndices',
				'validateCategory',
				'validateOperation',
				'validatePermissionExpiryvalidatePermissionExpiry',

				'reactivesearchQuery',
			],
			type: 'string',
			additionalProperties: {
				stages: {
					elasticsearchQueryelasticsearchQueryelasticsearchQuery: {
						description:
							'Stage to query elasticsearch BEStage to query elasticsearch BEStage to query elasticsearch BEStage to query elasticsearch BEStage to query elasticsearch BE',
						inputs: {
							properties: {
								method: {
									type: 'string',
								},
							},
						},
					},
					authorization: {
						description: 'To authorize user',
						inputs: {
							properties: {
								type: {
									type: 'string',
									enum: ['basic', 'bearer'],
								},
							},
						},
					},
				},
			},
		},
		TimeFrame: {
			properties: {
				start_time: {
					type: 'integer',
				},
				end_time: {
					type: 'integer',
				},
			},
			additionalProperties: false,
			type: 'object',
		},
		Trigger: {
			properties: {
				type: {
					type: 'integer',
				},
				expression: {
					type: 'string',
				},
				timeframe: {
					properties: {
						start_time: {
							type: 'integer',
						},
						end_time: {
							type: 'integer',
						},
					},
					additionalProperties: false,
					type: 'object',
				},
			},
			additionalProperties: false,
			type: 'object',
		},
	},
};
const CSS = css`
	height: 100%;
	width: 100%;
	position: relative;
	.stages-dropdown {
		position: absolute;
		z-index: 100;
		top: 4px;
		right: 17px;
	}

	.monaco-wrapper > button {
		right: 15px;
		top: 31px;
	}
	.myGlyphMarginClass {
		background: red;
	}
	.myContentClass {
		background: rgba(255, 2, 2, 0.2);
	}
	.hover-row:nth-child(2) {
		display: none;
	}
`;

const dropdownMenuCss = css`
	max-height: 300px;
	overflow: auto;
	max-width: 350px;

	.stage-menu-item {
		padding-right: 25px;
		position: relative;
		overflow: hidden;
		.add-icon {
			position: absolute;
			top: 50%;
			transform: translateY(-50%);
			right: 5px;
			font-size: 0;
			transition: all 0.3s;
		}

		h4 {
			font-weight: 600;
			font-size: 16px;
			margin-bottom: 7px;
			overflow: hidden;
			text-overflow: ellipsis;
			margin-top: 4px;
		}

		p {
			margin-bottom: 0;
			overflow: hidden;
			text-overflow: ellipsis;
			max-width: 92%;
			display: inline-block;
			font-size: 14px;
		}

		&:hover {
			.add-icon {
				font-size: 23px;
				transition: all 0.1s;
			}
		}
	}
`;

const QUERY_EDITOR_MODEL_PATH = 'a://b/foo.json';
const PipelineEditorComponent = (props) => {
	const { valueProp, onChange, setErrorFlag } = props;
	const [pipelineSchema, setPipelineSchema] = useState(null);

	const monacoInstance = useRef(null);
	const editorRef = useRef(null);
	const currentModelMarkers = useRef('');
	const oldEditorDecorations = useRef([]);

	const handleValueChange = (val) => {
		if (valueProp !== val) {
			try {
				if (isJson(val)) {
					const verifiedValue = val;

					onChange(verifiedValue);
				}
			} catch (error) {
				// eslint-disable-next-line no-console
				console.log(error);
				onChange(val);
			}
		}
	};

	const assignErrorGlyphs = (modelMarkers) => {
		if (editorRef.current) {
			const decorations = [];
			modelMarkers
				.filter((item) => item.owner === 'json')
				.forEach(({ startLineNumber, startColumn, endLineNumber, endColumn, message }) => {
					decorations.push({
						range: new monacoInstance.current.Range(
							startLineNumber,
							startColumn,
							endLineNumber,
							endColumn,
						),
						options: {
							isWholeLine: true,
							className: 'myContentClass',
							glyphMarginClassName: 'myGlyphMarginClass',
							glyphMarginHoverMessage: [
								{
									value: message,
									isTrusted: true,
								},
							],
							hoverMessage: [
								{
									value: message,
									isTrusted: true,
								},
							],
						},
					});
				});
			oldEditorDecorations.current = editorRef.current.deltaDecorations(
				oldEditorDecorations.current,
				[...decorations],
			);
		}
	};
	const assignMonacoControl = (monaco, editor) => {
		if (editor) {
			editorRef.current = editor;
			// trigger suggestion on enter key press
			editor.onKeyUp((e) => {
				const position = editor.getPosition();
				const text = editor.getModel().getLineContent(position.lineNumber).trim();
				if (e.keyCode === monaco.KeyCode.Enter && !text) {
					editor.trigger('', 'editor.action.triggerSuggest', '');
				}
			});

			editor.onDidChangeModelDecorations(() => {
				const modelMarkers = monaco.editor.getModelMarkers();
				if (currentModelMarkers.current !== JSON.stringify(modelMarkers)) {
					setErrorFlag(modelMarkers.length);
					currentModelMarkers.current = JSON.stringify(modelMarkers);
					assignErrorGlyphs(modelMarkers);
				}
			});

			// listen for paste event
			// the callback in here checks if a yaml is pasted and
			// converts it implicitly to json
			editor.getContainerDomNode().addEventListener(
				'paste',
				(event) => {
					const clipboardData = event.clipboardData || window.clipboardData;
					const pastedData = clipboardData.getData('Text');
					try {
						if (yamlToJson.load(pastedData) && !isJson(pastedData)) {
							onChange(JSON.stringify(yamlToJson.load(pastedData), null, 4));
							event.preventDefault();
							event.stopPropagation();
						}
					} catch (e) {
						// eslint-disable-next-line no-console
						console.log(e);
					}
				},
				true,
			);
		}

		if (monaco) {
			monacoInstance.current = monaco;
		}
	};

	useEffect(() => {
		if (!pipelineSchema) {
			getPipelineSchema()
				.then((res) => {
					const { $schema, definitions, ...rest } = res;
					setPipelineSchema(fakeSchema); // CHANGE IT AFTERWARDS
					monacoInstance.current.languages.json.jsonDefaults.setDiagnosticsOptions({
						validate: true,
						schemaValidation: 'error',
						schemas: [
							{
								uri: 'http://myserver/root-schema.json', // id of the first schema
								fileMatch: [QUERY_EDITOR_MODEL_PATH.toString()], // associate with our model,
								schema: { ...rest },
							},
						],
					});
				})
				.catch((err) => {
					// eslint-disable-next-line no-console
					console.log(err);
				});
		}
	}, [monacoInstance]);

	const getEditorValue = () => {
		try {
			return JSON.parse(editorRef?.current?.getModel()?.getValue() ?? '{}');
		} catch (error) {
			return null;
		}
	};

	const handleMenuClick = (e) => {
		try {
			const editorValue = { ...getEditorValue() };
			if (editorValue?.stages) {
				editorValue.stages.push({
					id: e.key,
					description: 'dummy',
				});
			}

			onChange(JSON.stringify(editorValue, null, 4));
		} catch (error) {
			// eslint-disable-next-line no-console
			console.log(error);
		}
	};
	const getStagesMenu = () => {
		const perbuiltStages = pipelineSchema?.definitions?.PreBuiltStage || {};
		const prebuiltStagesInEditor =
			(getEditorValue()?.stages ?? []).map((item) => item.id) ?? [];
		return (
			<Menu css={dropdownMenuCss} onClick={handleMenuClick}>
				{(perbuiltStages.enum ?? [''])
					.filter((stageKey) => prebuiltStagesInEditor.includes(stageKey) === false)
					.map((stageKey) => {
						return (
							<Menu.Item key={stageKey}>
								<div className="stage-menu-item">
									<h4 title={stageKey}>{stageKey}</h4>
									<p
										title={
											perbuiltStages?.additionalProperties?.stages?.[stageKey]
												?.description ?? ''
										}
									>
										{perbuiltStages?.additionalProperties?.stages?.[stageKey]
											?.description ?? ''}
									</p>
									<Icon type="plus-square" theme="filled" className="add-icon" />
								</div>
							</Menu.Item>
						);
					})}
			</Menu>
		);
	};
	return (
		<Container css={CSS}>
			<Dropdown className="stages-dropdown" overlay={getStagesMenu()}>
				<Button className="ant-dropdown-link" onClick={(e) => e.preventDefault()}>
					Add Stages <Icon type="down" />
				</Button>
			</Dropdown>
			<Monaco
				path={QUERY_EDITOR_MODEL_PATH}
				defaultValue="// JSON config for your pipeline"
				language="json"
				value={valueProp}
				onChange={handleValueChange}
				theme="vs-dark"
				options={{
					...monacoOptions,
					suggest: {
						showEnums: true,
						showEnumMembers: true,
						showConstants: true,
						showStructs: true,
						showFields: true,
						showProperties: true,
						snippetsPreventQuickSuggestions: false,
						insertMode: 'insert',
						shareSuggestSelections: false,
						showFunctions: true,
						showSnippets: true,
						showValues: true,
					},
					autoClosingBrackets: true,
					codeLens: false,
					contextmenu: true,
					cursorBlinking: 'blink',
					cursorStyle: 'line',
					disableLayerHinting: false,
					disableMonospaceOptimizations: false,
					fixedOverflowWidgets: false,
					formatOnType: true,
					quickSuggestions: true,
					suggestOnTriggerCharacters: true,
					wordBasedSuggestions: false,
					snippetSuggestions: 'top',
					inlineSuggest: { enabled: true },
					glyphMargin: true,
				}}
				readOnly={false}
				wrapperClass="monaco-wrapper"
				customizeMonacoInstance={assignMonacoControl}
			/>
		</Container>
	);
};

PipelineEditorComponent.propTypes = {
	valueProp: PropTypes.string.isRequired,
	onChange: PropTypes.func.isRequired,
	setErrorFlag: PropTypes.func.isRequired,
};

export default PipelineEditorComponent;
