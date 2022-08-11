import React from 'react';

import { number, object, oneOf, string } from 'prop-types';
import { FieldControl } from 'react-reactive-form';
import Monaco from '../../../../batteries/components/SearchSandbox/containers/MonacoEditor';

const monacoOptions = {
	cursorStyle: 'line',
	fontFamily: 'Monaco, monospace',
	fontSize: 12,
	autoIndent: true,
	scrollBeyondLastLine: false,
	padding: {
		top: 10,
		bottom: 10,
	},
	minimap: {
		enabled: false,
	},
	comments: 'insertSpace',
	automaticLayout: true,
};

const CodeEditor = ({ defaultValue, language, height, control, name, ...controlProps }) => {
	return (
		<FieldControl name={name} control={control} {...controlProps}>
			{({ handler }) => (
				<Monaco
					defaultValue={defaultValue}
					language={language}
					theme="vs-dark"
					height={height}
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
					{...handler()}
				/>
			)}
		</FieldControl>
	);
};

CodeEditor.defaultProps = {
	defaultValue: '',
	language: 'json',
	height: 400,
	control: {},
	name: '',
};

CodeEditor.propTypes = {
	language: oneOf(['javascript', 'json']),
	defaultValue: string,
	height: number,
	control: object,
	name: string,
};
export default CodeEditor;
