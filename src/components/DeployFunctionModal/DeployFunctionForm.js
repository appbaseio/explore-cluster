import { Radio, Row } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';
import { modalHeading } from '../../pages/HomePage/styles';
import { renderInputField } from './helper';
import PrivateRegistry from './PrivateRegistry';

function DeployFunctionForm(props) {
	const {
		functionName,
		dockerImage,
		setFunctionName,
		setDockerImage,
		value,
		node,
		setGlobalError,
		onChange,
		handleInputRequired,
		globalError,
	} = props;
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
					extraProps: {
						disabled: !!node,
						placeholder: 'Enter Function Name',
					},
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
					extraProps: { placeholder: 'Enter Docker Image' },
				})}
			</Row>
			<Row>
				<h3 className={modalHeading}>Is your docker image public?</h3>
				<Radio.Group onChange={onChange} value={value}>
					<Radio value="yes">Yes</Radio>
					<Radio value="no">No</Radio>
				</Radio.Group>
			</Row>
			{value === 'no' && (
				<Row>
					<PrivateRegistry globalError={globalError} setGlobalError={setGlobalError} />
				</Row>
			)}
			{/**
					<Row>
						<EnvTable dataSource={envDataSource} setData={setEnvData} />
					</Row>
			 */}
		</>
	);
}

DeployFunctionForm.propTypes = {
	functionName: PropTypes.string,
	dockerImage: PropTypes.string,
	setFunctionName: PropTypes.func.isRequired,
	setDockerImage: PropTypes.func.isRequired,
	value: PropTypes.string,
	node: PropTypes.object,
	setGlobalError: PropTypes.func.isRequired,
	onChange: PropTypes.func.isRequired,
	handleInputRequired: PropTypes.func.isRequired,
	globalError: PropTypes.object,
};

DeployFunctionForm.defaultProps = {
	functionName: undefined,
	dockerImage: undefined,
	value: undefined,
	globalError: {},
	node: null,
};

export default DeployFunctionForm;
