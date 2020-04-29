import React, { Component } from 'react';

import { Button, notification, Result, Spin } from 'antd';
import {
	deploymentCheck,
	handleInputClosure,
} from '../../../../../components/DeployFunctionModal/helper';
import DeployFunctionForm from '../../../../../components/DeployFunctionModal/DeployFunctionForm';
import { createFunction, getSingleFunction } from '../../../../../batteries/utils/app';
import TestFunction from './TestFunction';

class NewFunctionForm extends Component {
	state = { error: {}, deploymentStatus: null };

	setFormValue = (key, value) => {
		this.setState({ [key]: value });
	};

	setError = (error) => this.setState({ error });

	handleSubmit = async (e) => {
		e.preventDefault();
		const { functionName, dockerImage } = this.state;
		const { onSuccess, onChange } = this.props;
		this.setError({
			functionName: !functionName,
			dockerImage: !dockerImage,
		});
		if ([functionName, dockerImage].some((item) => !item)) return;
		let myInterval = null;
		const handleDeploymentCheck = async () => {
			const res = await deploymentCheck(getSingleFunction, functionName, myInterval);
			this.setState({ deploymentStatus: res.deploymentStatus });
		};
		this.setState({ loading: true });
		try {
			const response = await createFunction(functionName, { image: dockerImage });
			myInterval = setInterval(handleDeploymentCheck, 7000);
			// setActiveKey('trigger');
			if (onChange) onChange(response);
			if (onSuccess) onSuccess(functionName);
			this.setState({ loading: false, deploymentStatus: 'in_progress' });
			// eslint-disable-next-line no-shadow
		} catch (e) {
			notification.error({
				message: 'Error',
				description: e.message,
			});
			this.setState({ loading: false });
		}
	};

	render() {
		const {
			functionName,
			dockerImage,
			radioValue,
			error,
			loading,
			deploymentStatus,
		} = this.state;
		const handleInputRequired = handleInputClosure(this.setError, error);
		if (deploymentStatus === 'in_progress')
			return (
				<div
					style={{
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						flexDirection: 'column',
						paddingTop: 30,
					}}
				>
					<Spin />
					<h3> Hang tight deployment in progress!</h3>
				</div>
			);
		if (deploymentStatus === 'failed')
			return <Result status="500" subTitle="Sorry, the function failed to deploy." />;
		if (deploymentStatus === 'active') return <TestFunction functionName={functionName} />;
		return (
			<>
				<DeployFunctionForm
					globalError={error}
					setGlobalError={this.setError}
					functionName={functionName}
					handleInputRequired={handleInputRequired}
					setFunctionName={(value) => this.setFormValue('functionName', value)}
					dockerImage={dockerImage}
					setDockerImage={(value) => this.setFormValue('dockerImage', value)}
					onChange={(e) => this.setFormValue('radioValue', e.target.value)}
					value={radioValue || 'yes'}
				/>
				<Button
					loading={loading}
					style={{ marginTop: '24px' }}
					type="primary"
					onClick={this.handleSubmit}
				>
					Deploy Function
				</Button>
			</>
		);
	}
}

export default NewFunctionForm;
