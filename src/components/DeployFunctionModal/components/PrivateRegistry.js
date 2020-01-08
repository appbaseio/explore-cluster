import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
 Button, Collapse, Form, Input, notification, Row, message,
} from 'antd';
import { Validators } from 'react-reactive-form';
import { handleInputClosure, renderInputField } from '../helper';
import { modalHeading } from '../../../pages/HomePage/styles';
import { setPrivateRegistry } from '../../../utils';

const PrivateRegistry = ({ globalError, setGlobalError }) => {
	const [loading, setLoading] = useState(false);
	const [username, setUserName] = useState('');
	const [password, setPassword] = useState('');
	const [email, setEmail] = useState('');
	const [url, setURL] = useState('');

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		try {
			const response = await setPrivateRegistry({
				username,
				password,
				email,
				registry_url: url,
			});
			message.success(response);
		} catch (e) {
			notification.error({
				message: 'Error',
				description: e,
			});
		}
		setLoading(false);
	};
	const handleInputRequired = handleInputClosure(setGlobalError, globalError);

	const handleEmailChange = (e) => {
		const { value } = e.target;
		const hasError = Validators.email({ value }) || {};
		setEmail(value);
		setGlobalError({ ...globalError, email: hasError.email });
	};

	return (
		<>
			<Collapse style={{ marginTop: '20px' }}>
				<Collapse.Panel
					key="private-registry"
					header={(
      <span className={modalHeading} style={{ fontSize: '16px' }}>
							Set Private Registry Info
						</span>
    )}
				>
					<>
						{' '}
						<Row>
							<Row>
								<h3 className={modalHeading} style={{ marginTop: 0 }}>
									Username
								</h3>
								{renderInputField({
									globalError,
									fieldName: 'username',
									fieldValue: username,
									handleInputRequired,
									setterFunc: setUserName,
								})}
							</Row>
							<Row>
								<h3 className={modalHeading}>Password</h3>
								{renderInputField({
									globalError,
									fieldName: 'password',
									fieldValue: password,
									handleInputRequired,
									setterFunc: setPassword,
									extraProps: {
										type: 'password',
									},
								})}
							</Row>
							<Row>
								<h3 className={modalHeading}>Email</h3>
								<Form.Item
									validateStatus={globalError.email ? 'error' : null}
									help={globalError.email ? 'Enter a valid email id' : ''}
									style={{ marginBottom: 0 }}
								>
									<Input value={email} onChange={handleEmailChange} />
								</Form.Item>
							</Row>
							<Row>
								<h3 className={modalHeading}>Registry URL</h3>
								{renderInputField({
									globalError,
									fieldName: 'url',
									fieldValue: url,
									handleInputRequired,
									setterFunc: setURL,
								})}
							</Row>
						</Row>
						<Row style={{ marginTop: '16px' }}>
							<Button onClick={handleSubmit} loading={loading} type="primary">
								Save Private Registry
							</Button>
						</Row>
					</>
				</Collapse.Panel>
			</Collapse>
		</>
	);
};

PrivateRegistry.propTypes = {
	globalError: PropTypes.object.isRequired,
	setGlobalError: PropTypes.func.isRequired,
};

export default PrivateRegistry;
