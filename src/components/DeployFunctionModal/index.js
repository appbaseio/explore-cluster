import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { message, Modal, notification } from 'antd';
import { connect } from 'react-redux';
import get from 'lodash/get';
import { deploymentCheck, handleInputClosure, isTrue } from './helper';
// import EnvTable from './components/EnvTable';
import {
	createFunction,
	getSingleFunction,
	updateFunctions,
} from '../../batteries/modules/actions';
import { DeployFunctionForm } from './DeployFunctionForm';

const DeployFunctionModal = ({
	node,
	handleCancel,
	deployFunction,
	loading,
	error,
	success,
	putFunctions,
	getFunction,
}) => {
	const oriEnvData = get(node, 'function.envVars', {});
	const revEnvData = Object.keys(oriEnvData).map(key => ({
		key,
		value: oriEnvData[key],
	}));
	const [didMount, setDidMount] = useState(false);
	const [radioValue, setValue] = useState(get(node, 'function.secrets') ? 'no' : 'yes');
	const [functionName, setFunctionName] = useState(get(node, 'function.service'));
	const [dockerImage, setDockerImage] = useState(get(node, 'function.image'));
	const [globalError, setGlobalError] = useState({});
	const [envDataSource, setEnvData] = useState(
		revEnvData.length === 0 ? [{ key: '', value: '' }] : revEnvData,
	);

	const handleInputRequired = handleInputClosure(setGlobalError, globalError);

	useEffect(() => {
		if (didMount) {
			if (node) {
				if (node.success) {
					message.success(`${functionName} function updated successfully`);

					handleCancel();
				} else if (node.error) {
					notification.error({
						message: 'Error',
						description: node.error,
					});
				}
			} else if (success) {
				message.success(`${functionName} function deployment started`);
				handleCancel();
			} else if (error) {
				notification.error({
					message: 'Error',
					description: error,
				});
			}
		} else setDidMount(true);
		// return () => {
		// 	if (myInterval) clearInterval(myInterval);
		// };
	}, [error, success, node]);

	const handleSubmit = () => {
		let myInterval = null;
		function handleDeploymentCheck() {
			deploymentCheck(getFunction, functionName, myInterval);
		}
		const parsedEnvData = envDataSource.reduce((objAcc, envSource) => {
			const { key, value } = envSource;
			if (key && value) objAcc[key] = value;
			return objAcc;
		}, {});
		const payload = {
			image: dockerImage,
			envVars: parsedEnvData,
			secrets: radioValue === 'no' ? ['registry'] : undefined,
		};
		if (node) {
			const newPayload = {
				...node,
				function: {
					...node.function,
					...payload,
				},
			};
			if (node.function.image !== dockerImage) {
				newPayload.deploymentStatus = 'in_progress';
			}
			putFunctions(functionName, newPayload);
			if (node.function.image !== dockerImage) {
				myInterval = setInterval(handleDeploymentCheck, 7000);
			}
		} else {
			deployFunction(functionName, payload).then(res => {
				if (!(res && res.error)) {
					myInterval = setInterval(handleDeploymentCheck, 7000);
				}
			});
		}
	};

	return (
		<Modal
			title={node ? `Update ${node.function.service}` : 'Deploy Function'}
			onCancel={handleCancel}
			okText={node ? 'Update' : 'Deploy'}
			visible
			okButtonProps={{
				disabled: Object.values(globalError).some(isTrue),
			}}
			onOk={handleSubmit}
			confirmLoading={loading || get(node, 'isToggling')}
		>
			<DeployFunctionForm
				globalError={globalError}
				functionName={functionName}
				handleInputRequired={handleInputRequired}
				setFunctionName={setFunctionName}
				node={node}
				dockerImage={dockerImage}
				setDockerImage={setDockerImage}
				onChange={e => setValue(e.target.value)}
				value={radioValue}
				setGlobalError={setGlobalError}
			/>
		</Modal>
	);
};

DeployFunctionModal.propTypes = {
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
	putFunctions: (appName, payload) => dispatch(updateFunctions(appName, payload)),
	getFunction: appName => dispatch(getSingleFunction(appName)),
});

export default connect(mapStateToProps, mapDispatchToProps)(DeployFunctionModal);
