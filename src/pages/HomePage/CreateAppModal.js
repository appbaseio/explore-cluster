import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
	Icon,
	Input,
	InputNumber,
	List,
	Modal,
	notification,
	Popover,
	Radio,
	Row,
	Select,
} from 'antd';
import _get from 'lodash/get';
import PropTypes from 'prop-types';

import { input, modalHeading, radiobtn } from './styles';
import { validateAppName, validationsList } from '../../utils/helper';

import { createApp, resetCreatedApp } from '../../actions';
import { LanguageDropdown } from '../../components/LanguageDropdown';
import languages from '../../constants/language';
import { getDefaultSettings, putSettings } from '../../batteries/modules/actions';
import { getLanguageFallback } from '../../utils/language';
import { validSettingsPlans } from '../../utils';

const RadioGroup = Radio.Group;

class CreateAppModal extends Component {
	constructor(props) {
		super(props);
		this.state = {
			appName: '',
			hasJSON: false,
			validationPopOver: false,
			shards: 1,
			replicas: 0,
			language: 'universal',
		};
	}

	componentDidMount() {
		const { resetApp } = this.props;
		resetApp();
	}

	componentDidUpdate = async () => {
		const {
			createdApp,
			history,
			updateSettingsAction,
			defaultSettings,
			getDefaultSettingsAction,
			tier,
		} = this.props;
		const { hasJSON, appName } = this.state;
		let { language } = this.state;
		language = getLanguageFallback(language);

		const updateSettings = async settings => {
			await updateSettingsAction(appName, {
				...settings,
				language: {
					...settings.language,
					language,
				},
			});
		};

		const handleSettingsUpdate = async () => {
			if (defaultSettings) {
				await updateSettings(defaultSettings);
			} else {
				getDefaultSettingsAction().then(async res => {
					if (res && res.payload) {
						await updateSettings(res.payload);
					}
				});
			}
		};

		if (createdApp.data && createdApp.data.acknowledged) {
			// restrict calling API if it's not a valid plan
			if (tier && validSettingsPlans.indexOf(tier) !== -1) await handleSettingsUpdate();
			if (hasJSON === 'sample') {
				history.push(`app/${appName}/import?load-data=true`);
			} else if (hasJSON) {
				history.push(`app/${appName}/import`);
			} else {
				history.push(`app/${appName}`);
			}
		}
	};

	handleOk = async () => {
		const { appName, shards, replicas } = this.state;
		const { handleCreateApp } = this.props;
		let { language } = this.state;
		language = getLanguageFallback(language);
		const options = {
			appName,
			settings: {
				number_of_shards: shards,
				number_of_replicas: replicas,
				analysis: _get(languages, [language, 'analysis']),
			},
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

	handleChange = e => {
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

	handleInputNumber = (name, value) => {
		this.setState({
			[name]: value,
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
			shards,
			replicas,
			language,
		} = this.state;
		const { createdApp, showModal } = this.props;

		return (
			<Modal
				visible={showModal}
				onOk={this.handleOk}
				destroyOnClose
				okButtonProps={{ loading: createdApp.isLoading }}
				okText="Create Index"
				title="Create Index"
				onCancel={this.handleCancel}
				width={600}
			>
				<div>
					<Row type="flex" justify="space-between" align="middle">
						<h3 style={{ marginTop: 0 }} className={modalHeading}>
							Index Name
						</h3>
						<Popover
							placement="right"
							content={(
								<List
									size="small"
									dataSource={validationsList}
									renderItem={item => <List.Item>{item}</List.Item>}
								/>
							)} // prettier-ignore
							title="Index name validations"
							trigger="click"
							visible={validationPopOver}
						>
							<Icon type="info-circle" onClick={this.handleValidationPopOver} />
						</Popover>
					</Row>
					<p css={{ fontSize: 14, margin: '-4px 0 8px 0', lineHeight: '20px' }}>
						Index names are unique across the cluster and should use lowercase
						alphabets. Click
						<span style={{ color: '#1890ff' }} onClick={this.handleValidationPopOver}>
							{' '}
							here
						</span>{' '}
						to see more rules.
					</p>
					<Input
						autoComplete="new-appname"
						placeholder="Enter a unique index name"
						name="appName"
						className={input}
						onChange={this.handleChange}
						value={appName}
					/>
					<h3 style={{ marginTop: 20 }} className={modalHeading}>
						Select Language
					</h3>
					<LanguageDropdown
						style={{ width: '100%' }}
						value={language}
						onSelect={value => this.setState({ language: value })}
						renderOption={lang => (
							<Select.Option key={lang.value} value={lang.value}>
								{lang.label}
							</Select.Option>
						)}
					/>
					<h3 style={{ marginTop: 20 }} className={modalHeading}>
						Shards
					</h3>
					<InputNumber
						placeholder="Enter number of shards"
						name="shards"
						max={100}
						style={{ width: '100%' }}
						min={0}
						step={1}
						onChange={value => this.handleInputNumber('shards', value)}
						value={shards}
					/>
					<h3 style={{ marginTop: 20 }} className={modalHeading}>
						Replicas
					</h3>
					<InputNumber
						placeholder="Enter number of replicas"
						name="replicas"
						max={2}
						min={0}
						style={{ width: '100%' }}
						step={1}
						onChange={value => this.handleInputNumber('replicas', value)}
						value={replicas}
					/>
					{createdApp && createdApp.error ? (
						<div css={{ color: 'tomato', marginTop: 8 }}>
							{createdApp.error.actual.message}
						</div>
					) : null}
				</div>

				<div>
					<h3 className={modalHeading}>
						Do you have a JSON or CSV dataset to import into this index?
					</h3>
					<RadioGroup value={hasJSON} name="hasJSON" onChange={this.handleChange}>
						<Radio className={radiobtn} value>
							Yes
						</Radio>
						<Radio className={radiobtn} value={false}>
							No
						</Radio>
						<Radio className={radiobtn} value="sample">
							Load Sample Data
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

const mapStateToProps = state => ({
	apps: state.apps,
	appsMetrics: state.appsMetrics,
	createdApp: state.createdApp,
	defaultSettings: _get(state, '$getAppSettings.defaultSettings'),
	tier: _get(state, '$getAppPlan.results.tier'),
});

const mapDispatchToProps = dispatch => ({
	handleCreateApp: options => dispatch(createApp(options)),
	resetApp: () => dispatch(resetCreatedApp()),
	updateSettingsAction: (name, payload) => dispatch(putSettings(name, payload)),
	getDefaultSettingsAction: () => dispatch(getDefaultSettings()),
});

export default connect(mapStateToProps, mapDispatchToProps)(CreateAppModal);
