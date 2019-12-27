import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Modal, Row, Skeleton } from 'antd';
import PrivateRegistry from './components/PrivateRegistry';
import {
 handleInputClosure, isTrue, later, renderInputField,
} from './helper';
import EnvTable from './components/EnvTable';
import { modalHeading } from '../../pages/HomePage/styles';

const DeployFunctionModal = ({
 dockerImg, funcName, envData, handleCancel,
}) => {
	const [loading, setLoading] = useState(false);
	const [functionName, setFunctionName] = useState(funcName);
	const [dockerImage, setDockerImage] = useState(dockerImg);
	const [globalError, setGlobalError] = useState({});

	const handleInputRequired = handleInputClosure(setGlobalError, globalError);

	// useEffect(() => {
	// 	const apiCall = async () => {
	// 		setLoading(true);
	// 		// TODO: replace with API
	// 		await later(500);
	// 		setFunctionName('hello func');
	// 		setDockerImage('hello docker');
	// 		setLoading(false);
	// 	};
	// 	apiCall();
	// }, []);

	function getModalContent() {
		if (loading) return <Skeleton />;
		return (
			<>
				<Row>
					<h3 className={modalHeading} style={{ marginTop: 0 }}>
						Function Name
					</h3>
					{renderInputField({
						globalError,
						fieldName: 'functionName',
						fieldValue: functionName,
						handleInputRequired,
						setterFunc: setFunctionName,
					})}
				</Row>
				<Row>
					<h3 className={modalHeading}>Docker Image</h3>
					{renderInputField({
						globalError,
						fieldName: 'dockerImage',
						fieldValue: dockerImage,
						handleInputRequired,
						setterFunc: setDockerImage,
					})}
				</Row>
				<Row>
					<PrivateRegistry globalError={globalError} setGlobalError={setGlobalError} />
				</Row>
				<Row>
					<EnvTable dataSource={envData} />
				</Row>
			</>
		);
	}

	return (
		<Modal
			title="Deploy Function"
			onCancel={handleCancel}
			okText="Deploy"
			visible
			okButtonProps={{ disabled: Object.values(globalError).some(isTrue) }}
		>
			{getModalContent()}
		</Modal>
	);
};

DeployFunctionModal.propTypes = {
	dockerImg: PropTypes.string,
	funcName: PropTypes.string,
	envData: PropTypes.array,
	handleCancel: PropTypes.func,
};

DeployFunctionModal.defaultProps = {
	dockerImg: '',
	funcName: '',
	envData: [],
	handleCancel: () => {},
};

export default DeployFunctionModal;
