import React, { useState } from 'react';
import { Modal } from 'antd';
import { any, arrayOf, bool, func, object, shape, string } from 'prop-types';
import FunctionEditor, { FUNCTION_EDITOR_TABS_KEYS } from './FunctionEditor';

function CodeEditorModal({ visible, onSave, onCancel, width, slot, header, ...props }) {
	const [code, setCode] = useState('');
	return (
		<Modal
			open={visible}
			onOk={() => onSave(code)}
			onCancel={() => onCancel()}
			okText="Save"
			width={width}
			bodyStyle={{ paddingTop: 50 }}
			title={header}
		>
			<FunctionEditor
				openAsModal={false}
				onChange={(funcString) => setCode(funcString)}
				allowedTabs={[
					FUNCTION_EDITOR_TABS_KEYS.CONSOLE_LOGS,
					FUNCTION_EDITOR_TABS_KEYS.EXECUTION_CONTEXT,
				]}
				{...props}
			/>
			{slot}
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
	slot: null,
	additionalControlledTabs: [],
	header: null,
};

CodeEditorModal.propTypes = {
	visible: bool.isRequired,
	defaultCode: string,
	onSave: func,
	onCancel: func,
	width: string,
	defaultExecutionContext: object,
	customFunctionExecutor: func,
	slot: any,
	additionalControlledTabs: arrayOf(shape({ label: string, value: string, onChange: func })),
	header: any,
};

export default CodeEditorModal;
