import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
 Row, Col, Icon, Modal, Input, Radio, List, Popover, notification,
} from 'antd';
import PropTypes from 'prop-types';

import {
	modalHeading,
	input,
	radiobtn,
} from './styles';
import { validateAppName, validationsList } from '../../utils/helper';

import { createApp, resetCreatedApp } from '../../actions';

const RadioGroup = Radio.Group;

class CreateAppModal extends Component {
	constructor(props) {
		super(props);
		this.state = {
			appName: '',
			hasJSON: false,
			validationPopOver: false,
		};
	}

	componentDidMount() {
		const { resetApp } = this.props;
		resetApp();
	}

	componentDidUpdate = () => {
		const { createdApp, history } = this.props; //eslint-disable-line
		const { hasJSON, appName } = this.state;
		if (createdApp.data && createdApp.data.acknowledged) {
			if (hasJSON) {
				history.push(`app/${appName}/import`);
			} else {
				history.push(`app/${appName}`);
			}
		}
	};

	handleOk = async () => {
		const { appName } = this.state;
		const { handleCreateApp } = this.props;
		const options = {
			appName,
		};

		const isValid = validateAppName(appName);
		if (isValid) {
			handleCreateApp(options);
		} else {
			notification.error({
				message: 'Invalid App name',
				description: 'Please follow the validations rule.',
			});
			this.setState({
				validationPopOver: true,
			});
		}
	};

	handleChange = (e) => {
		const {
			target: { name, value },
		} = e;

		let inputValue = value;
		if (name === 'appName') {
			inputValue = inputValue.toLowerCase();
		}

		this.setState({
			[name]: inputValue,
		});
	};

	handleCancel = () => {
		const { handleModal } = this.props;
		handleModal();
	};

	handleValidationPopOver = () => {
		this.setState(({ validationPopOver }) => ({
			validationPopOver: !validationPopOver,
		}));
	};

	render() {
		const {
			// prettier-ignore
			appName,
			hasJSON,
			validationPopOver,
		} = this.state;
		const { createdApp, showModal } = this.props;

		return (
			<Modal
				visible={showModal}
				onOk={this.handleOk}
				destroyOnClose
				okButtonProps={{ loading: createdApp.isLoading }}
				okText="Create App"
				title="Create App"
				onCancel={this.handleCancel}
				width={600}
			>
				<div>
					<Row type="flex" justify="space-between" align="middle">
						<h3 style={{ marginTop: 0 }} className={modalHeading}>App Name</h3>
						<Popover
							placement="right"
							content={(
								<List
									size="small"
									dataSource={validationsList}
									renderItem={item => <List.Item>{item}</List.Item>}
								/>
							)} // prettier-ignore
							title="App name validations"
							trigger="click"
							visible={validationPopOver}
						>
							<Icon type="info-circle" onClick={this.handleValidationPopOver} />
						</Popover>
					</Row>
					<p css={{ fontSize: 14, margin: '-4px 0 8px 0', lineHeight: '20px' }}>
						App names are unique across the cluster and should use lowercase alphabets. Click
						<span style={{ color: '#1890ff' }} onClick={this.handleValidationPopOver}>
							{' '}
							here
						</span>{' '}
						to see more rules.
					</p>
					<Input
						placeholder="Enter a unique app name"
						name="appName"
						className={input}
						onChange={this.handleChange}
						value={appName}
					/>
					{createdApp && createdApp.error ? (
						<div css={{ color: 'tomato', marginTop: 8 }}>
							{createdApp.error.actual.message}
						</div>
					) : null}
				</div>

				<div>
					<h3 className={modalHeading}>
						Do you have a JSON or CSV dataset to import into this app?
					</h3>
					<RadioGroup value={hasJSON} name="hasJSON" onChange={this.handleChange}>
						<Radio className={radiobtn} value>
							Yes
						</Radio>
						<Radio className={radiobtn} value={false}>
							No
						</Radio>
					</RadioGroup>
				</div>
			</Modal>
		);
	}
}

CreateAppModal.propTypes = {
	showModal: PropTypes.bool.isRequired,
	handleModal: PropTypes.func.isRequired,
	createdApp: PropTypes.object.isRequired,
	resetApp: PropTypes.func.isRequired,
};

const mapStateToProps = ({ apps, appsMetrics, createdApp }) => ({
	apps,
	appsMetrics,
	createdApp,
});

const mapDispatchToProps = dispatch => ({
	handleCreateApp: options => dispatch(createApp(options)),
	resetApp: () => dispatch(resetCreatedApp()),
});

export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(CreateAppModal);
