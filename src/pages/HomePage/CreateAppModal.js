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
import PropTypes from 'prop-types';

import get from 'lodash/get';
import { input, modalHeading, radiobtn } from './styles';
import { validateAppName, validationsList, validateJSON } from '../../utils/helper';

import { createApp, resetCreatedApp } from '../../actions';
import LanguageDropdown from '../../components/LanguageDropdown';
import languages from '../../constants/language';
import { getDefaultSettings, putSettings } from '../../batteries/modules/actions';
import { getLanguageFallback } from '../../utils/language';
import { features, isValidPlan } from '../../batteries/utils';
import { allowedTiers } from '../../utils/prop-types';
import { withErrorToaster } from '../../batteries/components/shared/ErrorToaster/ErrorToaster';
import Ace from '../../batteries/components/SearchSandbox/containers/AceEditor';

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
			indexSettings: '',
			language: 'universal',
		};
	}

	componentDidMount() {
		const { resetApp, defaultSettings, getDefaultSettingsAction } = this.props;
		resetApp();
		if (!defaultSettings) getDefaultSettingsAction();
	}

	componentDidUpdate = async () => {
		const {
			createdApp,
			history,
			updateSettingsAction,
			defaultSettings,
			getDefaultSettingsAction,
			tier,
			featureSearchRelevancy,
		} = this.props;
		const { hasJSON, appName } = this.state;
		let { language } = this.state;
		language = getLanguageFallback(language);

		const updateSettings = async (settings) => {
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
				getDefaultSettingsAction().then(async (res) => {
					if (res && res.payload) {
						await updateSettings(res.payload);
					}
				});
			}
		};

		if (createdApp.data && createdApp.data.acknowledged) {
			// restrict calling API if it's not a valid plan
			if (isValidPlan(tier, featureSearchRelevancy, features.SEARCH_RELEVANCY))
				await handleSettingsUpdate();
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
		const { appName, shards, replicas, indexSettings } = this.state;
		const { handleCreateApp } = this.props;
		let { language } = this.state;
		language = getLanguageFallback(language);
		// validate advanced settings
		if (indexSettings) {
			const isValidSettings = validateJSON(indexSettings);
			if (!isValidSettings) {
				notification.error({
					message: 'Invalid Index settings',
					description: 'Please use valid JSON value for index settings.',
				});
				return;
			}
		}
		const options = {
			appName,
			settings: {
				...(indexSettings ? JSON.parse(indexSettings) : null),
				number_of_shards: shards,
				number_of_replicas: replicas,
				analysis: get(languages, [language, 'analysis']),
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
			indexSettings,
		} = this.state;
		const { createdApp, showModal } = this.props;

		return (
			<Modal
				visible={showModal}
				onOk={this.handleOk}
				destroyOnClose
				okButtonProps={{
					loading: createdApp.isLoading,
					'data-cy': 'create-new-index',
				}}
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
						data-cy="new-index-name"
						autoFocus
						onChange={this.handleChange}
						value={appName}
					/>
					<h3 style={{ marginTop: 20 }} className={modalHeading}>
						Select Language
					</h3>
					<LanguageDropdown
						style={{ width: '100%' }}
						value={language}
						onSelect={(value) => this.setState({ language: value })}
						data-cy="new-index-language"
						renderOption={(lang) => (
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
						onChange={(value) => this.handleInputNumber('shards', value)}
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
						onChange={(value) => this.handleInputNumber('replicas', value)}
						value={replicas}
					/>
					<Row type="flex" justify="space-between" align="middle">
						<h3 style={{ marginTop: 20 }} className={modalHeading}>
							Index Settings
						</h3>
						<Popover
							placement="right"
							content={
								<span>
									It allows to define additional index settings in JSON format.{' '}
									<br />
									You can check the available options at{' '}
									<a href="https://www.elastic.co/guide/en/elasticsearch/reference/current/index-modules.html#index-modules-settings">
										here
									</a>
									.
								</span>
							}
							title="Index name validations"
						>
							<Icon type="info-circle" />
						</Popover>
					</Row>
					<Ace
						defaultValue=""
						mode="json"
						value={
							typeof indexSettings === 'string'
								? indexSettings
								: JSON.stringify(indexSettings, 0, 2)
						}
						onChange={(value) => this.handleInputNumber('indexSettings', value)}
						theme="monokai"
						name="editor-JSON"
						fontSize={16}
						showPrintMargin
						style={{
							width: '100%',
							maxWidth: 800,
							maxHeight: 250,
						}}
						showGutter
						highlightActiveLine
						setOptions={{
							showLineNumbers: true,
							tabSize: 2,
						}}
						editorProps={{
							$blockScrolling: true,
						}}
					/>
					{createdApp && createdApp.error ? (
						<div css={{ color: 'tomato', marginTop: 8 }}>
							{get(createdApp, 'error.actual.message')}
						</div>
					) : null}
				</div>

				<div>
					<h3 className={modalHeading}>
						Do you have a JSON or CSV dataset to import into this index?
					</h3>
					<RadioGroup value={hasJSON} name="hasJSON" onChange={this.handleChange}>
						<Radio className={radiobtn} value data-cy="new-index-data-radio">
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
	history: PropTypes.object.isRequired,
	updateSettingsAction: PropTypes.func.isRequired,
	defaultSettings: PropTypes.object,
	getDefaultSettingsAction: PropTypes.func.isRequired,
	handleCreateApp: PropTypes.func.isRequired,
	tier: allowedTiers,
	featureSearchRelevancy: PropTypes.bool,
};

CreateAppModal.defaultProps = {
	defaultSettings: null,
	tier: undefined,
	featureSearchRelevancy: false,
};

const mapStateToProps = (state) => ({
	apps: get(state, 'apps'),
	appsMetrics: get(state, 'appsMetrics'),
	createdApp: get(state, 'createdApp'),
	defaultSettings: get(state, '$getAppSettings.defaultSettings'),
	tier: get(state, '$getAppPlan.results.tier'),
	featureSearchRelevancy: get(state, '$getAppPlan.results.feature_search_relevancy', false),
});

const mapDispatchToProps = (dispatch) => ({
	handleCreateApp: (options) => dispatch(createApp(options)),
	resetApp: () => dispatch(resetCreatedApp()),
	updateSettingsAction: (name, payload) => dispatch(putSettings(name, payload)),
	getDefaultSettingsAction: () => dispatch(getDefaultSettings()),
});

export default withErrorToaster(connect(mapStateToProps, mapDispatchToProps)(CreateAppModal));
