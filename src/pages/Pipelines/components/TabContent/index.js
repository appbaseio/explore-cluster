import { Switch } from 'antd';
import PropTypes from 'prop-types';
import { css } from 'emotion';
import React, { useEffect, useState, useRef } from 'react';
import Monaco from '../../../../batteries/components/SearchSandbox/containers/MonacoEditor';
import Flex from '../../../../batteries/components/shared/Flex';
import { validateScriptRule } from '../../../../batteries/utils/app';
import { DEFAULT_EXECUTION_CONTEXT_VALUE, getConsoleLogsArray, monacoOptions } from '../../utils';
import PipelineValidation from '../PipelineValidation';
import {
	generateScriptValidationRequestBody,
	isJson,
} from '../../../../components/ScriptConsole/utils';

const container = css`
	.validate-script-btn {
		box-sizing: border-box;
		position: absolute;
		top: 50%;
		left: 0%;
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

	.editor-content-wrapper {
		margin: 0 0;
		min-height: 450px;
		max-height: 700px;
		height: 60vh;
		&:first-child {
			border-right: 2px solid blue;
			background: red;
		}
	}
`;

// component to render each script tab content
const TabContent = (props) => {
	const { scriptValueProp, onValidatedScriptRuleChange, onScriptFileChange } = props;
	const scriptEditorRef = useRef(null);
	const [scriptValue, setScriptValue] = useState(scriptValueProp);
	const [validatedScriptRule, setValidatedScriptRule] = useState('');
	const [isValidateMode, setIsValidateMode] = useState(false);
	const [executionContext, setExecutionContext] = useState(DEFAULT_EXECUTION_CONTEXT_VALUE);

	useEffect(() => {
		if (scriptValueProp) {
			if (scriptEditorRef && scriptEditorRef.current) {
				scriptEditorRef.current.trigger('', 'editor.action.formatDocument');
			}
		}
	}, []);

	useEffect(() => {
		onValidatedScriptRuleChange(validatedScriptRule ?? '');
	}, [validatedScriptRule]);
	useEffect(() => {
		if (scriptValueProp !== scriptValue) {
			onScriptFileChange(scriptValue);
		}
	}, [scriptValue]);

	const handleScriptValidation = async () => {
		try {
			setValidatedScriptRule(
				await validateScriptRule(
					generateScriptValidationRequestBody(
						scriptValue,
						isJson(executionContext)
							? JSON.stringify({ isCron: true, executionContext })
							: '{}',
					),
				),
			);
		} catch (error) {
			// eslint-disable-next-line
			console.error(error);
		}
	};

	return (
		<Flex style={{ width: '100%' }} alignItems="center" className={container}>
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
			<div
				className="editor-content-wrapper "
				style={{
					width: isValidateMode ? '50%' : '100%',
					transition: 'all .3s ease-in',
				}}
			>
				<Monaco
					defaultValue={scriptValue}
					language="javascript"
					value={scriptValue}
					onChange={(value) => {
						setScriptValue(value);
					}}
					options={monacoOptions}
					readOnly={false}
					customizeMonacoInstance={(monaco, editorRef) => {
						scriptEditorRef.current = editorRef;
					}}
					wrapperClass="monaco-wrapper"
				/>
			</div>
			<div
				className="editor-content-wrapper "
				style={{
					width: isValidateMode ? '50%' : '0%',
					transition: 'all .3s ease-in',
				}}
			>
				<PipelineValidation
					executionContext={executionContext}
					setExecutionContext={setExecutionContext}
					isVisible={isValidateMode}
					onPlayButtonClick={handleScriptValidation}
					responseTabValue={
						isJson(validatedScriptRule)
							? JSON.stringify(validatedScriptRule, null, 4)
							: ''
					}
					consoleLogsArray={getConsoleLogsArray(validatedScriptRule)}
					isScriptValidation
				/>
			</div>
		</Flex>
	);
};

TabContent.propTypes = {
	scriptValueProp: PropTypes.string,
	onValidatedScriptRuleChange: PropTypes.func.isRequired,
	onScriptFileChange: PropTypes.func.isRequired,
};

TabContent.defaultProps = {
	scriptValueProp: '',
};

export default TabContent;
