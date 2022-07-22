import React, { useState } from 'react';
import { Modal } from 'antd';

import { bool, func, oneOf, string } from 'prop-types';
import styled from 'react-emotion';
import Monaco from '../../../../../batteries/components/SearchSandbox/containers/MonacoEditor';

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

const EditorContainer = styled.div`
	padding: 20px;
`;

const CodeEditorModal = ({ visible, onSave, onCancel, defaultValue, language }) => {
	const [code, setCode] = useState('');
	return (
		<Modal
			width="80%"
			visible={visible}
			onCancel={onCancel}
			onOk={() => onSave(code)}
			okText="Save"
		>
			<EditorContainer>
				<Monaco
					defaultValue={defaultValue}
					language={language}
					value={code}
					onChange={(value) => setCode(value)}
					theme="vs-dark"
					height={400}
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
				/>
			</EditorContainer>
		</Modal>
	);
};

CodeEditorModal.defaultProps = {
	onSave: () => {},
	onCancel: () => {},
	defaultValue: '',
	language: 'json',
};

CodeEditorModal.propTypes = {
	language: oneOf(['javascript', 'json']),
	defaultValue: string,
	visible: bool.isRequired,
	onSave: func,
	onCancel: func,
};
export default CodeEditorModal;
