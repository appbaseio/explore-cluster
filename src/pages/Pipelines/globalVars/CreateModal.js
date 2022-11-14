import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import get from 'lodash/get';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Icon as LegacyIcon } from '@ant-design/compatible';
import { Modal, Input, InputNumber, Select, Alert, Button, Tooltip } from 'antd';
import Ace from '../../../batteries/components/SearchSandbox/containers/AceEditor';
import { getURL } from '../../../constants/config';
import { globalVarsMessages } from '../utils/messages';
import { modalContainer } from './styles';

const CreateModal = ({
	mode,
	open,
	setOpen,
	pipelineKey,
	credentials,
	handleClose,
	globalVars,
}) => {
	const [modalFormData, setModalFormData] = useState({
		key: '',
		label: '',
		value: '',
		description: '',
		validate: {
			expected_status: '',
			method: undefined,
			headers: '',
			body: '',
			url: '',
		},
	});
	const [errorMessage, setErrorMessage] = useState('');
	const [iconType, setIconType] = useState('');

	const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

	useEffect(() => {
		if (pipelineKey && mode === 'Update' && open) {
			getGlobalVar();
		}
	}, [open]);

	const getGlobalVar = () => {
		const ACC_API = getURL();
		fetch(`${ACC_API}/_pipelines/env/${pipelineKey}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Basic ${btoa(credentials)}`,
			},
		})
			.then((res) => res.json())
			.then((data) => {
				const newData = { ...data };
				if (data.validate) {
					const newValidateObj = { ...data.validate };
					if (data.validate.body)
						newValidateObj.body = JSON.stringify(data.validate.body);
					if (data.validate.headers)
						newValidateObj.headers = JSON.stringify(data.validate.headers);
					newData.validate = newValidateObj;
				}
				setModalFormData(newData);
			})
			.catch((error) => {
				console.error(error);
			});
	};

	const handleInputChange = (key, val) => {
		setErrorMessage('');
		const newFormData = { ...modalFormData, [key]: val };
		setModalFormData(newFormData);
	};

	const validateInput = (key, val) => {
		if (key === 'key' && !val.match('^[a-zA-Z0-9_]*$')) {
			setErrorMessage('A key can consist of [A-Z], [a-z], [0-9] and _ characters only ');
			return false;
		}
		if (val && (key === 'body' || key === 'headers')) {
			try {
				JSON.parse(val);
			} catch (err) {
				setErrorMessage('Body and Headers should be a valid JSON.');
				return false;
			}
		}
		return true;
	};

	const handleError = (obj) => {
		if (obj) {
			// eslint-disable-next-line
			for (const [key, value] of Object.entries(obj)) {
				if (typeof value === 'object') {
					handleError(value);
				} else if (!validateInput(key, value)) return true;
			}
		}
		return false;
	};

	const handleSave = () => {
		if (!handleError(modalFormData)) {
			const ACC_API = getURL();
			const transformedModalFormData = Object.fromEntries(
				Object.entries(modalFormData).filter(([_, v]) => v), // eslint-disable-line
			);
			const transformedValidateObj = Object.fromEntries(
				Object.entries(modalFormData.validate).filter(([_, v]) => v), // eslint-disable-line
			);
			const newValidateObj = { ...transformedValidateObj };

			if (newValidateObj.headers) {
				newValidateObj.headers = {
					...JSON.parse(newValidateObj.headers),
				};
			}
			if (newValidateObj.body) {
				newValidateObj.body = {
					...JSON.parse(newValidateObj.body),
				};
			}
			if (newValidateObj?.validate?.method === 'GET') {
				delete newValidateObj.body;
			}
			if (newValidateObj && Object.keys(newValidateObj).length) {
				transformedModalFormData.validate = newValidateObj;
			} else {
				delete transformedModalFormData.validate;
			}

			if (pipelineKey && mode === 'Update') {
				fetch(`${ACC_API}/_pipelines/env/${pipelineKey}`, {
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Basic ${btoa(credentials)}`,
					},
					body: JSON.stringify(transformedModalFormData),
				})
					.then((res) => res.json())
					.then((data) => {
						if (!data.error) {
							handleModalClose();
						} else {
							setErrorMessage(data.error.message);
						}
					})
					.catch((error) => {
						setErrorMessage('Failed to update');
						console.error('Failed to update', error);
					});
			} else {
				fetch(`${ACC_API}/_pipelines/env`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Basic ${btoa(credentials)}`,
					},
					body: JSON.stringify(transformedModalFormData),
				})
					.then((res) => res.json())
					.then((data) => {
						if (!data.error) {
							handleModalClose();
						} else {
							setErrorMessage(data.error.message);
						}
					})
					.catch((error) => {
						setErrorMessage('Failed to save');
						console.error('Failed to save', error);
					});
			}
		}
	};

	const transformValidateObj = (validateObj, regex, varRegex, pipelineVariables) => {
		// object traversal to find ${variable}
		// eslint-disable-next-line
		for (const key in validateObj) {
			if (typeof validateObj[key] === 'object') {
				// eslint-disable-next-line
				validateObj[key] = transformValidateObj(
					validateObj[key],
					regex,
					varRegex,
					pipelineVariables,
				);
			} else if (typeof validateObj[key] === 'string' && validateObj[key].match(regex)) {
				// validateObj[key].match(regex) -> returns array of ${variable} available in the string
				validateObj[key].match(regex).forEach((data) => {
					if (varRegex.exec(data) && varRegex.exec(data)[1]) {
						// Extract variable from ${variable}
						const keyVariable = varRegex.exec(data)[1];
						const reqObject = pipelineVariables.filter((i) => i.key === keyVariable);
						const newRegex = `\${${keyVariable}}`;
						if (reqObject.length) {
							// eslint-disable-next-line
							validateObj[key] = validateObj[key].replace(
								newRegex,
								reqObject[0].value,
							);
						} else {
							setErrorMessage('Error in processing the template variable');
							setIconType('close-circle');
						}
					} else {
						setErrorMessage('Error in processing the template variable');
						setIconType('close-circle');
					}
				});
			}
		}
		return validateObj;
	};

	const validateForm = () => {
		const regex = /\${[a-zA-Z0-9_]*}/gm;
		const varRegex = /(?<=\${)(.*?)(?=\})/;
		const pipelineVariables = globalVars.map((data) => {
			if (data.key === modalFormData.key) {
				return modalFormData;
			}
			return data;
		});
		const validateObj = transformValidateObj(
			{ ...modalFormData.validate },
			regex,
			varRegex,
			pipelineVariables,
		);

		setErrorMessage('');
		if (!handleError(validateObj)) {
			let obj = {};
			try {
				obj = {
					method: validateObj.method,
					headers: {
						...JSON.parse(validateObj.headers),
					},
				};
			} catch (err) {
				console.log(err);
			}

			setIconType('loading');
			if (validateObj.method !== 'GET') {
				obj.body = validateObj.body || '{}';
			}

			if (
				obj.headers.Authorization &&
				obj.headers.Authorization.includes('Basic') &&
				obj.headers.Authorization.includes('btoa')
			) {
				const varRegexBtoa = /(?<=\${btoa\()(.*?)(?=\)})/;
				if (varRegexBtoa.exec(obj.headers.Authorization)) {
					const keyVariable = varRegexBtoa.exec(obj.headers.Authorization)[1];
					const creds = btoa(keyVariable);
					obj.headers.Authorization = `Basic ${creds}`;
				} else {
					setIconType('close-circle');
				}
			}
			handleValidation(validateObj, obj);
		}
	};

	const handleValidation = (validateObj, obj) => {
		if (validateObj.url) {
			// eslint-disable-line
			fetch(validateObj.url, obj) // eslint-disable-next-line
				.then((res) => res.json())
				.then((res) => {
					if (res.error) {
						setIconType('close-circle');
						return Promise.reject(res.error);
					}
					setIconType('check-circle');
					return Promise.resolve(res);
				})
				.catch((err) => {
					if (err.ok && err.status === validateObj.expected_status) {
						setIconType('check-circle');
					} else {
						setIconType('close-circle');
						if (JSON.stringify(err, null, 4) !== '{}') {
							setErrorMessage(JSON.stringify(err, null, 4));
						} else if (err.status && err.status !== validateObj.expected_status) {
							setErrorMessage(
								`Expected status is ${validateObj.expected_status}, but received ${err.status}`,
							);
						} else {
							setErrorMessage('Cannot make the API request. Is your input valid?');
						}
					}
					console.error('Error in Validate api', err);
				});
		} else {
			setErrorMessage('Enter a valid URL.');
		}
	};

	const handleModalClose = () => {
		handleClose();
		setErrorMessage('');
		setIconType('');
		setModalFormData({
			key: '',
			label: '',
			value: '',
			description: '',
			validate: {
				expected_status: '',
				method: undefined,
				headers: '',
				body: '',
				url: '',
			},
		});
	};

	const getStringifiedJSON = (data) => {
		if (data) {
			if (typeof data !== 'string') {
				try {
					return JSON.stringify(data, null, 2);
				} catch (e) {
					return '{}';
				}
			} else {
				return data;
			}
		} else {
			return '';
		}
	};

	return (
		<div>
			<Modal
				title={`${mode} global env`}
				visible={open}
				destroyOnClose
				onOk={() => handleSave()}
				onCancel={() => {
					handleModalClose();
					setOpen(false);
				}}
				okText={`${mode} Global Env`}
				okButtonProps={{
					disabled: !modalFormData.key || !modalFormData.label || !modalFormData.value,
				}}
			>
				<div css={modalContainer}>
					<div className="form-field-container">
						<div>
							Key{' '}
							<Tooltip title={globalVarsMessages.key}>
								<InfoCircleOutlined />
							</Tooltip>
						</div>
						<Input
							value={modalFormData.key}
							disabled={mode === 'Update'}
							onChange={(e) => {
								handleInputChange('key', e.target.value);
							}}
						/>
					</div>
					<div className="form-sub-field-container">
						<div className="form-field-container">
							<div>
								Label{' '}
								<Tooltip title={globalVarsMessages.label}>
									<InfoCircleOutlined />
								</Tooltip>
							</div>
							<Input
								value={modalFormData.label}
								onChange={(e) => {
									handleInputChange('label', e.target.value);
								}}
							/>
						</div>
						<div className="form-field-container">
							<div>
								Description{' '}
								<Tooltip title={globalVarsMessages.description}>
									<InfoCircleOutlined />
								</Tooltip>
							</div>
							<Input
								value={modalFormData.description}
								onChange={(e) => {
									handleInputChange('description', e.target.value);
								}}
							/>
						</div>
					</div>
					<div className="form-field-container">
						<div>
							Value{' '}
							<Tooltip title={globalVarsMessages.value}>
								<InfoCircleOutlined />
							</Tooltip>
						</div>
						<Input
							value={modalFormData.value}
							onChange={(e) => {
								handleInputChange('value', e.target.value);
							}}
						/>
					</div>
					<div className="form-field-container" style={{ marginTop: 20 }}>
						Validation{' '}
						<div className="validate-container">
							<div
								className="form-field-container"
								style={{ display: 'flex', flexDirection: 'column' }}
							>
								<div>
									Expected Status{' '}
									<Tooltip title={globalVarsMessages.expected_status}>
										<InfoCircleOutlined />
									</Tooltip>
								</div>
								<InputNumber
									className="dropdown-container"
									value={modalFormData.validate.expected_status}
									min={200}
									max={599}
									onChange={(e) => {
										const newValidateObj = {
											...modalFormData.validate,
											expected_status: e,
										};
										handleInputChange('validate', newValidateObj);
									}}
								/>
							</div>
							<div className="form-field-container">
								<div>
									URL{' '}
									<Tooltip title={globalVarsMessages.url}>
										<InfoCircleOutlined />
									</Tooltip>
								</div>
								<Input
									value={modalFormData.validate.url}
									onChange={(e) => {
										const newValidateObj = {
											...modalFormData.validate,
											url: e.target.value,
										};
										handleInputChange('validate', newValidateObj);
									}}
								/>
							</div>
							<div
								className="form-field-container"
								style={{ display: 'flex', flexDirection: 'column' }}
							>
								<div>
									Method{' '}
									<Tooltip title={globalVarsMessages.method}>
										<InfoCircleOutlined />
									</Tooltip>
								</div>
								<Select
									allowClear
									className="dropdown-container"
									value={modalFormData.validate.method}
									onChange={(e) => {
										const newValidateObj = {
											...modalFormData.validate,
											method: e,
										};
										handleInputChange('validate', newValidateObj);
									}}
								>
									{methods.map((i) => (
										<Select.Option key={i}>{i}</Select.Option>
									))}
								</Select>
							</div>
							<div className="form-field-container">
								<div>
									Headers{' '}
									<Tooltip title={globalVarsMessages.headers}>
										<InfoCircleOutlined />
									</Tooltip>
								</div>
								<Ace
									mode="json"
									theme="monokai"
									name="editor-JSON"
									fontSize={14}
									width="100%"
									showGutter={false}
									setOptions={{
										showLineNumbers: false,
									}}
									minLines={6}
									maxLines={6}
									editorProps={{ $blockScrolling: true }}
									value={getStringifiedJSON(modalFormData.validate.headers) || ''}
									onChange={(e) => {
										const newValidateObj = {
											...modalFormData.validate,
											headers: e,
										};
										handleInputChange('validate', newValidateObj);
									}}
								/>
							</div>
							<div className="form-field-container">
								<div>
									Body{' '}
									<Tooltip title={globalVarsMessages.body}>
										<InfoCircleOutlined />
									</Tooltip>
								</div>
								<Ace
									mode="json"
									theme="monokai"
									name="editor-JSON"
									fontSize={14}
									width="100%"
									showGutter={false}
									setOptions={{
										showLineNumbers: false,
									}}
									minLines={6}
									maxLines={6}
									editorProps={{ $blockScrolling: true }}
									value={getStringifiedJSON(modalFormData.validate.body)}
									onChange={(e) => {
										const newValidateObj = {
											...modalFormData.validate,
											body: e,
										};
										handleInputChange('validate', newValidateObj);
									}}
								/>
							</div>
							<Button
								className="form-field-container"
								disabled={
									!modalFormData.validate.method || !modalFormData.validate.url
								}
								type="primary"
								onClick={() => validateForm()}
							>
								Validate {iconType ? <LegacyIcon type={iconType} /> : null}
							</Button>
						</div>
					</div>
					{errorMessage ? (
						<Alert style={{ marginTop: 15 }} message={errorMessage} type="error" />
					) : null}
				</div>
			</Modal>
		</div>
	);
};

CreateModal.propTypes = {
	mode: PropTypes.string,
	open: PropTypes.bool,
	setOpen: PropTypes.func,
	globalVars: PropTypes.array,
	pipelineKey: PropTypes.string,
	credentials: PropTypes.string.isRequired,
	handleClose: PropTypes.func.isRequired,
};

CreateModal.defaultProps = {
	mode: 'Create',
	open: false,
	setOpen: () => {},
	pipelineKey: '',
	globalVars: [],
};

const mapStateToProps = (state) => {
	const { username, password } = get(state, 'user.data', {});
	return {
		credentials: username ? `${username}:${password}` : null,
	};
};

export default connect(mapStateToProps, null)(CreateModal);
