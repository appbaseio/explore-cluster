import React, { Component } from 'react';

import { Button, notification, message } from 'antd';
import { handleInputClosure } from '../../../../../components/DeployFunctionModal/helper';
import { DeployFunctionForm } from '../../../../../components/DeployFunctionModal/DeployFunctionForm';
import { createFunction } from '../../../../../batteries/utils/app';
import TestFunction from './TestFunction';

class NewFunctionForm extends Component {
	state = { error: {}, success: false };

	setFormValue = (key, value) => {
		this.setState({ [key]: value });
	};

	setError = error => this.setState({ error });

	handleSubmit = async e => {
		e.preventDefault();
		const { functionName, dockerImage } = this.state;
		const { onSuccess, setActiveKey, onChange } = this.props;
		this.setError({
			functionName: !functionName,
			dockerImage: !dockerImage,
		});
		if ([functionName, dockerImage].some(item => !item)) return;
		this.setState({ loading: true });
		try {
			const response = await createFunction(functionName, { image: dockerImage });
			message.success(`${functionName} deployed successfully`);
			// setActiveKey('trigger');
			if (onChange) onChange(response);
			if (onSuccess) onSuccess(functionName);
			this.setState({ loading: false, success: true });
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
		const { functionName, dockerImage, radioValue, error, loading, success } = this.state;
		const handleInputRequired = handleInputClosure(this.setError, error);
		if (success) return <TestFunction functionName={functionName} />;
		return (
			<>
				<DeployFunctionForm
					globalError={error}
					setGlobalError={this.setError}
					functionName={functionName}
					handleInputRequired={handleInputRequired}
					setFunctionName={value => this.setFormValue('functionName', value)}
					dockerImage={dockerImage}
					setDockerImage={value => this.setFormValue('dockerImage', value)}
					onChange={e => this.setFormValue('radioValue', e.target.value)}
					value={radioValue}
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
