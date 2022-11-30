import { css } from 'emotion';
import React, { useEffect, useRef, useState } from 'react';
import PropTypes, { func, object } from 'prop-types';
import yamlToJson from 'js-yaml';
import { DownOutlined, PlusSquareFilled, SearchOutlined } from '@ant-design/icons';
import { Button, Dropdown, Input, Menu, message } from 'antd';
import { unionWith } from 'lodash';
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
		z-index: 40;
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
	width: min(95vw, 600px);
	border-bottom-left-radius: 4px;
	border-bottom-right-radius: 4px;

	.stage-menu-item {
		padding: 5px 14px !important;
		padding-right: 25px !important;
		position: relative !important;
		height: 60px !important;
		margin-bottom: 0 !important;

		.add-icon {
			position: absolute;
			top: 50%;
			transform: translateY(-50%);
			right: 5px;
			font-size: 0;
			transition: all 0.3s;
		}

		h4 {
			font-weight: 500;
			font-size: 14px;
			margin-bottom: 0;
			overflow: hidden;
			height: 36px;
			text-overflow: ellipsis;
		}
		.ant-dropdown-menu-title-content {
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
			padding: 0px 10px;
		}
		p {
			margin-bottom: 0;
			display: inline;
			font-size: 12px;
			width: 100%;
		}

		&:hover {
			background: #e6f7ff;
			.add-icon {
				font-size: 23px;
				transition: all 0.1s;
			}
		}
	}
`;
const inputStyle = css`
	input {
		border-bottom-left-radius: 0;
		border-bottom-right-radius: 0;
	}
`;

const QUERY_EDITOR_MODEL_PATH = 'a://b/foo.json';

const StagesMenu = ({ pipelineSchema, getEditorValue, handleMenuClick }) => {
	const prebuiltStages = pipelineSchema?.properties?.stages?.items?.properties?.use ?? {};
	const prebuiltStagesInEditor = (getEditorValue()?.stages ?? []).map((item) => item.use) ?? [];
	const [query, setQuery] = useState('');
	const results = (prebuiltStages.enum ?? [''])
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
		.filter((stageKey) => prebuiltStagesInEditor.includes(stageKey) === false);

	const titleResults = results.filter((stageKey) => (query ? stageKey.includes(query) : true));
	const descriptionResults = results.filter((stageKey) => {
		const description = prebuiltStages?.stages?.[stageKey]?.description ?? '';
		return query ? description.includes(query) : true;
	});
	const titleAndDescriptionResults = unionWith(
		titleResults,
		descriptionResults,
		(a, b) => a === b,
	);
	return (
		<>
			<Input
				value={query}
				onChange={(e) => setQuery(e.target.value)}
				allowClear
				placeholder="Search for stages"
				prefix={<SearchOutlined style={{ color: '#1990ff' }} />}
				css={inputStyle}
			/>
			<Menu css={dropdownMenuCss} onClick={handleMenuClick}>
				{titleAndDescriptionResults.map((stageKey) => {
					return (
						<Menu.Item className="stage-menu-item" key={stageKey}>
							<h4 title={stageKey}>{stageKey}</h4>
							<p title={prebuiltStages?.stages?.[stageKey]?.description ?? ''}>
								{prebuiltStages?.stages?.[stageKey]?.description ?? ''}
							</p>
							<PlusSquareFilled className="add-icon" />
						</Menu.Item>
					);
				})}
			</Menu>
		</>
	);
};
StagesMenu.defaultProps = { pipelineSchema: null };
StagesMenu.propTypes = {
	pipelineSchema: object,
	getEditorValue: func.isRequired,
	handleMenuClick: func.isRequired,
};

// Editor view when we want to create or edit a pipeline
const PipelineEditorComponent = (props) => {
	const { valueProp, onChange, setErrorFlag } = props;
	const [pipelineSchema, setPipelineSchema] = useState(null);

	const monacoInstance = useRef(null);
	const editorRef = useRef(null);
	const currentModelMarkers = useRef('');
	const oldEditorDecorations = useRef([]);
	const [showStagesMenu, setShowStagesMenu] = useState(false);

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
				.forEach(
					({
						startLineNumber,
						startColumn,
						endLineNumber,
						endColumn,
						message: markerMessage,
					}) => {
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
										value: markerMessage,
										isTrusted: true,
									},
								],
								hoverMessage: [
									{
										value: markerMessage,
										isTrusted: true,
									},
								],
							},
						});
					},
				);
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
					// get pasted data post removal of trailing commas
					const pastedData = clipboardData.getData('Text').replace(/(^,)|(,$)/g, '');
					try {
						if (
							yamlToJson.load(pastedData) &&
							isJson(yamlToJson.load(pastedData)) &&
							!isJson(pastedData) &&
							// the last condition handles a case
							// where text - '"method": "POST"' isn't a valid JSON but a valid YAML
							// so we put it in between braces and check if it's valid JSON, if it is
							// we don't want to replace the whole content
							!isJson(`{${pastedData}}`)
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
					setPipelineSchema(processedSchema);
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
			if (getEditorValue() == null) {
				message.error(
					'Pipeline editor value is not a valid JSON. Stages can only be added to valid JSON.',
				);
				setTimeout(() => {
					setShowStagesMenu(false);
				}, 200);
				return;
			}

			const prebuiltStages =
				pipelineSchema?.properties?.stages?.items?.properties?.use?.stages ?? {};
			const editorValue = { ...getEditorValue() };

			if (editorValue?.stages) {
				editorValue.stages.push({
					use: e.key,
					description: prebuiltStages?.[e.key]?.description ?? '',
				});
			} else {
				editorValue.stages = [
					{
						use: e.key,
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
				visible={showStagesMenu}
				overlayStyle={{ zIndex: 999 }}
				overlay={
					<StagesMenu
						pipelineSchema={pipelineSchema}
						getEditorValue={getEditorValue}
						handleMenuClick={handleMenuClick}
					/>
				}
			>
				<Button
					className="ant-dropdown-link"
					onClick={() => setShowStagesMenu(!showStagesMenu)}
				>
					Add Stages <DownOutlined />
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
