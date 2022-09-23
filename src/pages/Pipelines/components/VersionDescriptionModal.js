import { Input, Modal } from 'antd';
import React, { useState } from 'react';
import { bool, func } from 'prop-types';

const VersionDescriptionModal = (props) => {
	const { visible, onSave, onCancel } = props;
	const [value, setValue] = useState('');
	return visible ? (
		<Modal
			visible
			okText="Save"
			title="Enter an optional version description"
			onCancel={onCancel}
			onOk={() => onSave(value)}
			width="min(75vw, 400px)"
		>
			<Input
				value={value}
				onChange={(e) => setValue(e.target.value)}
				placeholder="Enter a version description"
			/>
		</Modal>
	) : null;
};

VersionDescriptionModal.propTypes = {
	visible: bool.isRequired,
	onSave: func.isRequired,
	onCancel: func.isRequired,
};

export default VersionDescriptionModal;
