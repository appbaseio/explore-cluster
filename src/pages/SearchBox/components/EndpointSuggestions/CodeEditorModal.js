import React, { useState } from 'react';
import { Modal } from 'antd';
import { bool, func, object, string } from 'prop-types';
import FunctionEditor, {
	FUNCTION_EDITOR_TABS_KEYS,
} from '../DesignAndLayout/SearchBoxPreview/AddSuggestionModal/FunctionEditor';

function CodeEditorModal({
	visible,
	onSave,
	onCancel,
	width,
	defaultExecutionContext,
	defaultCode,
	customFunctionExecutor,
}) {
	const [code, setCode] = useState('');
	return (
		<Modal
			visible={visible}
			onOk={() => onSave(code)}
			onCancel={() => onCancel()}
			okText="Save"
			width={width}
			bodyStyle={{ paddingTop: '41px' }}
		>
			<FunctionEditor
				openAsModal={false}
				defaultExecutionContext={defaultExecutionContext}
				defaultCode={defaultCode}
				customFunctionExecutor={customFunctionExecutor}
				onChange={(funcString) => setCode(funcString)}
				allowedTabs={[
					FUNCTION_EDITOR_TABS_KEYS.CONSOLE_LOGS,
					FUNCTION_EDITOR_TABS_KEYS.EXECUTION_CONTEXT,
				]}
			/>
		</Modal>
	);
}

CodeEditorModal.defaultProps = {
	customFunctionExecutor: null,
	onSave: () => {},
	onCancel: () => {},
	defaultCode: '',
	defaultExecutionContext: {},
	width: '90%',
};

CodeEditorModal.propTypes = {
	visible: bool.isRequired,
	defaultCode: string,
	onSave: func,
	onCancel: func,
	width: string,
	defaultExecutionContext: object,
	customFunctionExecutor: func,
};

export default CodeEditorModal;
