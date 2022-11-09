import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Alert, Icon, Input, Modal } from 'antd';
import { commitModalStyles } from './styles';
import '../styles.css';
import CodeDiff from './CodeDiff/CodeDiff';

const CommitModal = ({
	open,
	handleOk,
	handleCancel,
	errMsg,
	setErrMsg,
	isLoading,
	uiBuilderName,
	updatedCode,
	initialCode,
}) => {
	const [value, setValue] = useState('');

	useEffect(() => {
		if (!open) setValue('');
	}, [open]);

	const handleInputChange = (val) => {
		setValue(val);
		if (val.length > 256) setErrMsg('Commit message can be up to 256 chars');
		else if (errMsg && errMsg !== 'Manifest is missing') setErrMsg('');
	};

	return (
		<Modal
			title={
				<div>
					Commit code for <b>{uiBuilderName}</b>
				</div>
			}
			visible={open}
			onOk={() => {
				handleOk(value);
			}}
			onCancel={() => {
				handleCancel();
			}}
			okText="Commit"
			okButtonProps={{
				disabled: errMsg || !value,
				loading: isLoading,
			}}
			width="80%"
		>
			<div className={commitModalStyles}>
				<div className="label-container">Commit Message</div>
				<Input
					placeholder="Enter commit message"
					value={value}
					allowClear
					onChange={(e) => handleInputChange(e.target.value)}
				/>
				<div style={{ height: 60, marginTop: 10 }}>
					{errMsg ? (
						<Alert
							message={errMsg}
							type="error"
							showIcon
							icon={<Icon type="exclamation-circle" />}
						/>
					) : null}
				</div>
				<div style={{ marginTop: 10 }}>
					<CodeDiff newCode={updatedCode} oldCode={initialCode} />
				</div>
			</div>
		</Modal>
	);
};

CommitModal.propTypes = {
	open: PropTypes.bool,
	errMsg: PropTypes.string,
	setErrMsg: PropTypes.func,
	handleOk: PropTypes.func.isRequired,
	handleCancel: PropTypes.func.isRequired,
	isLoading: PropTypes.bool,
	uiBuilderName: PropTypes.string,
	initialCode: PropTypes.object,
	updatedCode: PropTypes.object,
};

CommitModal.defaultProps = {
	open: false,
	errMsg: '',
	setErrMsg: () => {},
	isLoading: false,
	uiBuilderName: '',
	initialCode: {},
	updatedCode: {},
};

export default CommitModal;
