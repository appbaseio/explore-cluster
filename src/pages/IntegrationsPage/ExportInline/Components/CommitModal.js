import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Alert, Icon, Input, Modal } from 'antd';
import { commitModalStyles } from './styles';
import '../styles.css';

const CommitModal = ({
	open,
	handleOk,
	handleCancel,
	errMsg,
	setErrMsg,
	isLoading,
	uiBuilderName,
}) => {
	const [value, setValue] = useState('');

	useEffect(() => {
		if (!open) setValue('');
	}, [open]);

	const handleInputChange = (val) => {
		setValue(val);
		if (val.length > 256) setErrMsg('Commit message can be up to 256 chars');
		else if (errMsg) setErrMsg('');
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
			okText={<>Commit {isLoading ? <Icon type="loading" /> : null}</>}
			okButtonProps={{
				disabled: errMsg || !value,
			}}
		>
			<div css={commitModalStyles}>
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
};

CommitModal.defaultProps = {
	open: false,
	errMsg: '',
	setErrMsg: () => {},
	isLoading: false,
	uiBuilderName: '',
};

export default CommitModal;
