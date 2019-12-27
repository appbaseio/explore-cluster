import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
 Button, Collapse, Form, Input, Row, Skeleton,
} from 'antd';
import { Validators } from 'react-reactive-form';
import { handleInputClosure, later, renderInputField } from '../helper';
import { modalHeading } from '../../../pages/HomePage/styles';

const PrivateRegistry = ({ globalError, setGlobalError }) => {
	const [loading, setLoading] = useState(false);
	const [username, setUserName] = useState('');
	const [password, setPassword] = useState('');
	const [email, setEmail] = useState('');
	const [url, setURL] = useState('');

	// useEffect(() => {
	// 	const apiCall = async () => {
	// 		setLoading(true);
	// 		// TODO: replace with API
	// 		await later(500);
	// 		setUserName('anuj');
	// 		setPassword('shah');
	// 		setLoading(false);
	// 	};
	// 	apiCall();
	// }, []);

	const handleSubmit = (e) => {
		e.preventDefault();
		//	TODO: handle POST method
	};
	const handleInputRequired = handleInputClosure(setGlobalError, globalError);

	const handleEmailChange = (e) => {
		const { value } = e.target;
		const hasError = Validators.email({ value }) || {};
		setEmail(value);
		setGlobalError({ ...globalError, email: hasError.email });
	};

	if (loading) return <Skeleton />;

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
							<Button onClick={handleSubmit} type="primary">
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
