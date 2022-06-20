import { css } from 'emotion';
import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import yamlToJson from 'js-yaml';
import { Button, Dropdown, Icon, Input, Menu } from 'antd';
import Container from '../../../../components/Container';
import Monaco from '../../../../batteries/components/SearchSandbox/containers/MonacoEditor';
import { modifySchema, monacoOptions } from '../../utils';
import { getPipelineSchema } from '../../../../batteries/utils/app';
import { isJson } from '../../../../components/ScriptConsole/utils';

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
	max-width: min(95vw, 600px);

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

// eslint-disable-next-line react/prop-types
const DropdownMenu = ({ pipelineSchema, getEditorValue, handleMenuClick }) => {
	// eslint-disable-next-line react/prop-types
	const prebuiltStages = pipelineSchema?.definitions?.PreBuiltStage || {};
	const prebuiltStagesInEditor = (getEditorValue()?.stages ?? []).map((item) => item.id) ?? [];
	const [query, setQuery] = useState('');
	return (
		<>
			<Input value={query} onChange={(e) => setQuery(e.target.value)} />
			<Menu css={dropdownMenuCss} onClick={handleMenuClick}>
				{(prebuiltStages.enum ?? [''])
					.sort((a, b) => {
						const textA = a.toUpperCase();
						const textB = b.toUpperCase();
						if (textA < textB) {
							return -1;
						}
						if (textA > textB) {
							return 1;
						}
						return 0;
					})
					.filter((stageKey) => prebuiltStagesInEditor.includes(stageKey) === false)
					.map((stageKey) => {
						return (
							<Menu.Item key={stageKey}>
								<div className="stage-menu-item">
									<h4 title={stageKey}>{stageKey}</h4>
									<p
										title={
											prebuiltStages?.additionalProperties?.stages?.[stageKey]
												?.description ?? ''
										}
									>
										{prebuiltStages?.additionalProperties?.stages?.[stageKey]
											?.description ?? ''}
									</p>
									<Icon type="plus-square" theme="filled" className="add-icon" />
								</div>
							</Menu.Item>
						);
					})}
			</Menu>
		</>
	);
};

// Editor view when we want to create or edit a pipeline
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
						if (
							yamlToJson.load(pastedData) &&
							isJson(yamlToJson.load(pastedData)) &&
							!isJson(pastedData)
						) {
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
					const processedSchema = modifySchema(res);
					const { $schema, definitions, ...rest } = processedSchema;

					setPipelineSchema(processedSchema); // CHANGE IT AFTERWARDS
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
					// scroll to bottom of the page on mount to let user see full editor window
					window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
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
			const prebuiltStages = pipelineSchema?.definitions?.PreBuiltStage || {};
			const editorValue = { ...getEditorValue() };
			if (editorValue?.stages) {
				editorValue.stages.push({
					id: e.key,
					description:
						prebuiltStages?.additionalProperties?.stages?.[e.key]?.description ?? '',
				});
			} else {
				editorValue.stages = [
					{
						id: e.key,
						description:
							prebuiltStages?.additionalProperties?.stages?.[e.key]?.description ??
							'',
					},
				];
			}

			onChange(JSON.stringify(editorValue, null, 4));
		} catch (error) {
			// eslint-disable-next-line no-console
			console.log(error);
		}
	};

	return (
		<Container css={CSS}>
			<Dropdown
				className="stages-dropdown"
				overlay={
					<DropdownMenu
						pipelineSchema={pipelineSchema}
						getEditorValue={getEditorValue}
						handleMenuClick={handleMenuClick}
					/>
				}
			>
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
