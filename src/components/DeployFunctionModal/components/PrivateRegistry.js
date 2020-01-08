import React, { useEffect, useState } from 'react';
import {
 Button, Collapse, Form, Input, notification, Row, message,
} from 'antd';
import { Validators } from 'react-reactive-form';
import { handleInputClosure, renderInputField } from '../helper';
import { modalHeading } from '../../../pages/HomePage/styles';
import { setPrivateRegistry } from '../../../utils';

const PrivateRegistry = () => {
	const [loading, setLoading] = useState(false);
	const [username, setUserName] = useState('');
	const [password, setPassword] = useState('');
	const [email, setEmail] = useState('');
	const [url, setURL] = useState('');
	const [localError, setLocalError] = useState({});

	useEffect(() => {
		setLocalError({
			...localError,
			username: true,
			email: true,
			password: true,
			url: true,
		});
	}, []);

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
		} catch (error) {
			notification.error({
				message: 'Error',
				description: error,
			});
		}
		setLoading(false);
	};
	const handleInputRequired = handleInputClosure(setLocalError, localError);

	const handleEmailChange = (e) => {
		const { value } = e.target;
		const hasError = Validators.email({ value }) || {};
		setEmail(value);
		setLocalError({ ...localError, email: hasError.email });
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
									globalError: localError,
									fieldName: 'username',
									fieldValue: username,
									handleInputRequired,
									setterFunc: setUserName,
								})}
							</Row>
							<Row>
								<h3 className={modalHeading}>Password</h3>
								{renderInputField({
									globalError: localError,
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
									validateStatus={localError.email ? 'error' : null}
									help={localError.email ? 'Enter a valid email id' : ''}
									style={{ marginBottom: 0 }}
								>
									<Input value={email} onChange={handleEmailChange} />
								</Form.Item>
							</Row>
							<Row>
								<h3 className={modalHeading}>Registry URL</h3>
								{renderInputField({
									globalError: localError,
									fieldName: 'url',
									fieldValue: url,
									handleInputRequired,
									setterFunc: setURL,
								})}
							</Row>
						</Row>
						<Row style={{ marginTop: '16px' }}>
							<Button
								disabled={Object.values(localError).some(item => item)}
								onClick={handleSubmit}
								loading={loading}
								type="primary"
							>
								Save Private Registry
							</Button>
						</Row>
					</>
				</Collapse.Panel>
			</Collapse>
		</>
	);
};

export default PrivateRegistry;
