import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
 message, Modal, notification, Row,
} from 'antd';
import { connect } from 'react-redux';
import get from 'lodash/get';
import PrivateRegistry from './components/PrivateRegistry';
import { handleInputClosure, isTrue, renderInputField } from './helper';
import EnvTable from './components/EnvTable';
import { modalHeading } from '../../pages/HomePage/styles';
import { createFunction } from '../../batteries/modules/actions';

const DeployFunctionModal = ({
	dockerImg,
	funcName,
	envData,
	handleCancel,
	deployFunction,
	loading,
	error,
	success,
}) => {
	const [didMount, setDidMount] = useState(false);
	const [functionName, setFunctionName] = useState(funcName);
	const [dockerImage, setDockerImage] = useState(dockerImg);
	const [globalError, setGlobalError] = useState({});
	const [envDataSource, setEnvData] = useState(
		envData.length === 0 ? [{ key: '', value: '' }] : envData,
	);

	const handleInputRequired = handleInputClosure(setGlobalError, globalError);

	useEffect(() => {
		if (didMount) {
			if (success) {
				message.success(`${functionName} function deployed successfully`);
				handleCancel();
			} else if (error) {
				notification.error({
					message: 'Error',
					description: error,
				});
			}
		} else if (!didMount) setDidMount(true);
	}, [error, success]);

	const handleSubmit = () => {
		const parsedEnvData = envDataSource.reduce((objAcc, envSource) => {
			const { key, value } = envSource;
			if (key && value) objAcc[key] = value;
			return objAcc;
		}, {});
		deployFunction(functionName, { image: dockerImage, envVars: parsedEnvData });
	};

	return (
		<Modal
			title="Deploy Function"
			onCancel={handleCancel}
			okText="Deploy"
			visible
			okButtonProps={{ disabled: Object.values(globalError).some(isTrue) }}
			onOk={handleSubmit}
			confirmLoading={loading}
		>
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
					<EnvTable dataSource={envDataSource} setData={setEnvData} />
				</Row>
			</>
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

const mapStateToProps = state => ({
	loading: get(state, '$getAppFunctions.isCreating'),
	error: get(state, '$getAppFunctions.error'),
	success: get(state, '$getAppFunctions.success'),
});

const mapDispatchToProps = dispatch => ({
	deployFunction: (name, payload) => dispatch(createFunction(name, payload)),
});

export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(DeployFunctionModal);
