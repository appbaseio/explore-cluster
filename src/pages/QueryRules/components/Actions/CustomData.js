import React from 'react';
import Ace from '../../../../batteries/components/SearchSandbox/containers/AceEditor';

const CustomData = ({ value, onChange }) => {
	return (
		<Ace
			mode="json"
			theme="monokai"
			name="editor-JSON"
			fontSize={14}
			showPrintMargin
			style={{ maxHeight: '250px', width: '100%' }}
			showGutter
			highlightActiveLine
			setOptions={{
				showLineNumbers: true,
				tabSize: 2,
			}}
			editorProps={{ $blockScrolling: true }}
			value={value}
			onChange={data => onChange(data)}
		/>
	);
};

export default CustomData;
