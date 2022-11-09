import React, { useState } from 'react';
import { Icon, Modal, Spin, Tooltip } from 'antd';
import PropTypes from 'prop-types';
import UploadFiles from './UploadFiles';

const UploadModal = ({
	setModalType,
	handleCancel,
	open,
	handleCommitCode,
	isLoading,
	errMsg,
	setErrMsg,
	setIsLoading,
}) => {
	const [fileContent, setFileContent] = useState({});
	const [isFilesFetching, setIsFilesFetching] = useState(false);

	const handleOK = () => {
		setIsLoading(true);
		handleCommitCode('system commit: Project import', fileContent);
	};

	const renderErrorMsg = () => {
		if (errMsg !== 'Validated') return <div style={{ color: 'red' }}>{errMsg}</div>;
		return <></>;
	};

	return (
		<div>
			<Tooltip title="Upload project to sandpack editor.">
				<Icon type="upload" onClick={() => setModalType('upload')} />
			</Tooltip>

			<Modal
				title="Upload Project"
				visible={open}
				onOk={handleOK}
				okText="Upload"
				onCancel={() => {
					setIsFilesFetching(false);
					handleCancel();
				}}
				okButtonProps={{ loading: isLoading, disabled: errMsg !== 'Validated' }}
			>
				<UploadFiles
					setFileContent={setFileContent}
					setErrMsg={setErrMsg}
					setIsFilesFetching={setIsFilesFetching}
					setIsLoading={setIsLoading}
				/>
				<div style={{ margin: '10px 0px' }}>
					{!errMsg && isFilesFetching ? <Spin /> : renderErrorMsg()}
				</div>
			</Modal>
		</div>
	);
};

UploadModal.propTypes = {
	open: PropTypes.bool,
	errMsg: PropTypes.string,
	setErrMsg: PropTypes.func,
	setIsLoading: PropTypes.func,
	handleCommitCode: PropTypes.func.isRequired,
	handleCancel: PropTypes.func.isRequired,
	isLoading: PropTypes.bool,
	setModalType: PropTypes.func,
};

UploadModal.defaultProps = {
	open: false,
	errMsg: '',
	setErrMsg: () => {},
	setModalType: () => {},
	setIsLoading: () => {},
	isLoading: false,
};

export default UploadModal;
