import React from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'antd';
import CodeDiff from './CodeDiff';
import { filePathCorrection } from '../../../../utils/sandpack-generator';

const CodeDiffModal = ({ open, handleCancel, oldCode, newCode, currentVersion, time }) => {
	return (
		<div>
			<Modal
				open={open}
				onCancel={handleCancel}
				footer={null}
				title="Code Changes"
				bodyStyle={{ height: '90%' }}
				width="90%"
			>
				<CodeDiff
					oldCode={filePathCorrection(oldCode)}
					newCode={filePathCorrection(newCode)}
					currentVersion={currentVersion}
					time={time}
				/>
			</Modal>
		</div>
	);
};

CodeDiffModal.propTypes = {
	handleCancel: PropTypes.func,
	open: PropTypes.bool,
	oldCode: PropTypes.object,
	newCode: PropTypes.object,
	currentVersion: PropTypes.object,
	time: PropTypes.string,
};

CodeDiffModal.defaultProps = {
	open: false,
	handleCancel: () => {},
	oldCode: {},
	newCode: {},
	currentVersion: {},
	time: '',
};

export default CodeDiffModal;
