import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Collapse, Form, Input, notification, Row, message } from 'antd';
import { Validators } from 'react-reactive-form';
import get from 'lodash/get';
import { connect } from 'react-redux';
import { handleInputClosure, renderInputField } from './helper';
import { modalHeading } from '../../pages/HomePage/styles';
import { updatePrivateRegistry } from '../../batteries/modules/actions/registry';
import { isAbsoluteURL } from '../../utils';

const PrivateRegistry = ({ registry, updateRegistry, error, success, loading }) => {
	const [didMount, setDidMount] = useState(false);
	const [username, setUserName] = useState(registry && registry.username);
	const [password, setPassword] = useState(registry && registry.password);
	const [email, setEmail] = useState(registry && registry.email);
	const [url, setURL] = useState(registry && registry.registry_url);
	const [localError, setLocalError] = useState({});

	useEffect(() => {
		if (didMount) {
			if (success) {
				message.success('Secret saved successfully');
			} else if (error) {
				notification.error({
					message: 'Error',
					description: error,
				});
			}
		} else setDidMount(true);
	}, [error, success]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLocalError({
			email: !email,
			password: !password,
			url: !url,
			username: !username,
		});
		if ([email, password, url, username].some((item) => !item)) return;
		updateRegistry({
			username,
			password,
			email,
			registry_url: url,
		});
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
					header={<span className={modalHeading}>Set Private Registry Info</span>}
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
									extraProps: { placeholder: 'Enter Username' },
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
										placeholder: 'Enter Password',
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
									<Input
										value={email}
										onChange={handleEmailChange}
										placeholder="Enter Email"
									/>
								</Form.Item>
							</Row>
							<Row>
								<h3 className={modalHeading}>Registry URL</h3>
								{renderInputField({
									globalError: localError,
									fieldName: 'url',
									fieldValue: url,
									handleInputRequired: (e, fieldName, setterFunc) => {
										const { value } = e.target;
										setterFunc(value);
										setLocalError({
											...localError,
											[fieldName]: !isAbsoluteURL(value),
										});
									},
									setterFunc: setURL,
									extraProps: { placeholder: 'Enter Registry URL' },
									errorMessage: 'Enter Valid URL',
								})}
							</Row>
						</Row>
						<Row style={{ marginTop: '16px' }}>
							<Button
								disabled={Object.values(localError).some((item) => item)}
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

PrivateRegistry.propTypes = {
	registry: PropTypes.object,
	updateRegistry: PropTypes.func.isRequired,
	error: PropTypes.string,
	success: PropTypes.bool,
	loading: PropTypes.bool,
};

PrivateRegistry.defaultProps = {
	registry: {},
	error: undefined,
	success: false,
	loading: false,
};

const mapStateToProps = (state) => ({
	registry: get(state, '$getAppRegistries'),
	loading: get(state, '$getAppRegistries.updating'),
	success: get(state, '$getAppRegistries.success'),
	error: get(state, '$getAppRegistries.error'),
});

const mapDispatchToProps = (dispatch) => ({
	updateRegistry: (payload) => dispatch(updatePrivateRegistry(payload)),
});

export default connect(mapStateToProps, mapDispatchToProps)(PrivateRegistry);
