import React, { useState } from 'react';
import { Col, Form, Icon, Input, message, Modal, notification, Radio, Row, Tooltip } from 'antd';
import { css } from 'emotion';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { cloneApp } from '../../utils';
import { validateAppName } from '../../utils/helper';

const centerAligned = css`
	display: flex;
	align-items: center;
`;

const radioStyle = css`
	display: block;
	height: 30px;
	line-height: 30px;
`;

const CloneIndex = ({ handleCancel, index, existingApps, history }) => {
	const [destIndex, setDestIndex] = useState('');
	const [action, setAction] = useState('mappings');
	const [loading, setLoading] = useState(false);
	const [exists, setExists] = useState(false);

	function resetValues() {
		setLoading(false);
		setDestIndex('');
	}

	const handleSubmit = () => {
		const isValid = validateAppName(destIndex);
		if (!isValid) {
			notification.error({
				message: 'Invalid Index Name',
			});
			return;
		}
		setLoading(true);
		cloneApp(index, destIndex, { action })
			.then(() => {
				message.success(`${destIndex} successfully cloned from ${index}`);
				resetValues();
				history.push(`/app/${destIndex}/overview`);
			})
			.catch(e => {
				message.error(e.message);
				resetValues();
			});
	};

	function handleInputChange(e) {
		setDestIndex(e.target.value);
		setExists(existingApps.includes(e.target.value));
	}

	return (
		<Modal
			title={`Clone Index ${index}`}
			visible
			onOk={handleSubmit}
			onCancel={handleCancel}
			okText="Clone"
			confirmLoading={loading}
			okButtonProps={{ disabled: !destIndex || exists }}
		>
			<Row className={centerAligned}>
				<Col style={{ marginBottom: exists ? '20px' : '1px' }} span={8}>
					Destination Index{' '}
					<Tooltip title="Destination Index should be a new index name that doesn't already exist in the cluster.">
						<Icon style={{ cursor: 'pointer' }} type="info-circle" />
					</Tooltip>
				</Col>
				<Col span={16}>
					<Form.Item
						validateStatus={exists ? 'error' : null}
						help={exists ? 'An index with that name already exists' : ''}
						style={{ marginBottom: 0 }}
					>
						<Input
							value={destIndex}
							onChange={handleInputChange}
							placeholder="Destination Index"
						/>
					</Form.Item>
				</Col>
			</Row>
			<Row style={{ paddingTop: '35px' }}>
				<Radio.Group defaultValue={action} onChange={e => setAction(e.target.value)}>
					<Radio className={radioStyle} value="mappings">
						Clone Mappings
					</Radio>
					<Radio className={radioStyle} value="data">
						Clone Mappings and Copy Data
					</Radio>
				</Radio.Group>
			</Row>
		</Modal>
	);
};

CloneIndex.propTypes = {
	index: PropTypes.string.isRequired,
	handleCancel: PropTypes.func,
};

CloneIndex.defaultProps = {
	handleCancel: () => {},
};

const mapStateToProps = state => ({
	existingApps: Object.keys(state.apps.data || {}),
});

export default withRouter(connect(mapStateToProps)(CloneIndex));
