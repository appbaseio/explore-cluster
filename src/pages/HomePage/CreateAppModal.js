import React, { Component } from 'react';
import { connect } from 'react-redux';
import { CloseCircleFilled, InfoCircleOutlined } from '@ant-design/icons';
import {
	Input,
	InputNumber,
	List,
	Modal,
	notification,
	Popover,
	Radio,
	Row,
	Select,
	Typography,
} from 'antd';
import PropTypes from 'prop-types';

import get from 'lodash/get';
import Icon from '@ant-design/icons/lib/components/Icon';
import { input, modalHeading, radiobtn } from './styles';
import { validateAppName, validationsList, validateJSON } from '../../utils/helper';

import { createApp, resetCreatedApp } from '../../actions';
import LanguageDropdown from '../../components/LanguageDropdown';
import languages from '../../constants/language';
import { getDefaultSettings, putSettings } from '../../batteries/modules/actions';
import { getLanguageFallback } from '../../utils/language';
import {
	features,
	isEqual,
	isValidPlan,
	stripIndexShardsAndReplicas,
	supportsIndexShardsAndReplicas,
} from '../../batteries/utils';
import { allowedTiers } from '../../utils/prop-types';
import { withErrorToaster } from '../../batteries/components/shared/ErrorToaster/ErrorToaster';
import Ace from '../../batteries/components/SearchSandbox/containers/AceEditor';
import Flex from '../../batteries/components/shared/Flex';

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
			indexMappings: '',
			language: 'universal',
		};
	}

	componentDidMount() {
		const { resetApp, defaultSettings, getDefaultSettingsAction } = this.props;
		resetApp();
		if (!defaultSettings) getDefaultSettingsAction();
	}

	componentDidUpdate = async (prevProps) => {
		const {
			createdApp,
			history,
			updateSettingsAction,
			defaultSettings,
			getDefaultSettingsAction,
			tier,
			featureSearchRelevancy,
			handleModal,
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
		} else if (!isEqual(prevProps.createdApp, createdApp) && createdApp && createdApp.error) {
			const { actual } = createdApp.error;
			const { error } = actual ?? {};
			if (error) {
				const modalRef = Modal.error({
					...(error.code === 402 ? { icon: null } : { title: error.code }),
					okButtonProps: { style: { display: 'none' } },
					closable: true,
					content:
						error.code === 402 ? (
							<Flex flexDirection="column">
								<Typography.Text strong type="danger">
									<Icon component={CloseCircleFilled} twoToneColor="#1890ff" />{' '}
									You&lsquo;ve hit the plan limits
								</Typography.Text>
								<br />
								<Typography.Paragraph>
									<span
										style={{
											cursor: 'pointer',
											color: 'dodgerblue',
										}}
										onClick={() => {
											if (window.Tawk_API) {
												window.Tawk_API.toggle();
											} else if (window.Intercom) {
												window.Intercom('show');
											}
											modalRef.destroy();
											handleModal();
										}}
									>
										Contact Support
									</span>{' '}
									to upgrade your plan
								</Typography.Paragraph>
							</Flex>
						) : (
							<Typography.Paragraph>{error.message}</Typography.Paragraph>
						),
				});
			}
		}
	};

	handleOk = async () => {
		const { appName, shards, replicas, indexSettings, indexMappings, hasJSON } = this.state;
		const { handleCreateApp, backend } = this.props;
		const includeShardsAndReplicas = supportsIndexShardsAndReplicas(backend);
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
		// validate index mappings
		if (indexMappings) {
			const isValidSettings = validateJSON(indexMappings);
			if (!isValidSettings) {
				notification.error({
					message: 'Invalid Index mappings',
					description: 'Please use valid JSON value for index mappings.',
				});
				return;
			}
		}
		let settings = {
			...(indexSettings ? JSON.parse(indexSettings) : null),
			...(includeShardsAndReplicas
				? {
						'index.number_of_shards': shards,
						'index.number_of_replicas': replicas,
				  }
				: {}),
			analysis: get(languages, [language, 'analysis']),
		};

		if (!includeShardsAndReplicas) {
			settings = stripIndexShardsAndReplicas(settings);
		}

		const options = {
			appName,
			hasJSON,
			settings,
			mappings: {
				...(indexMappings ? JSON.parse(indexMappings) : null),
			},
		};

		const isValid = validateAppName(appName);
		if (isValid) {
			await handleCreateApp(options);
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
			indexMappings,
		} = this.state;
		const { createdApp, showModal, backend } = this.props;
		const showShardsAndReplicas = supportsIndexShardsAndReplicas(backend);

		return (
			<Modal
				open={showModal}
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
							open={validationPopOver}
						>
							<InfoCircleOutlined onClick={this.handleValidationPopOver} />
						</Popover>
					</Row>
					<p style={{ fontSize: 14, margin: '-4px 0 8px 0', lineHeight: '20px' }}>
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
					{showShardsAndReplicas ? (
						<React.Fragment>
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
						</React.Fragment>
					) : null}
					<Row type="flex" justify="space-between" align="middle">
						<h3 style={{ marginTop: 20 }} className={modalHeading}>
							Additional Index Settings
						</h3>
						<Popover
							placement="right"
							content={
								<span>
									Define additional index settings in JSON format. <br />
									You can check the available options over{' '}
									<a
										target="_blank"
										href="https://www.elastic.co/guide/en/elasticsearch/reference/current/index-modules.html#index-modules-settings"
										rel="noreferrer"
									>
										here
									</a>
									.
								</span>
							}
							title="Index settings"
						>
							<InfoCircleOutlined />
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
						placeholder={`{
    "index.codec": "best_compression"
}`}
						onChange={(value) => this.handleInputNumber('indexSettings', value)}
						theme="monokai"
						name="editor-JSON"
						fontSize={16}
						showPrintMargin
						style={{
							width: '100%',
							maxWidth: 800,
							maxHeight: 250,
							whiteSpace: 'pre',
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
					<Row type="flex" justify="space-between" align="middle">
						<h3 style={{ marginTop: 20 }} className={modalHeading}>
							Explicit Mappings
						</h3>
						<Popover
							placement="right"
							content={
								<span>
									Define explicit index mappings in JSON format. <br />
									You can check the available options over{' '}
									<a
										target="_blank"
										href="https://www.elastic.co/guide/en/elasticsearch/reference/current/explicit-mapping.html"
										rel="noreferrer"
									>
										here
									</a>
									.
								</span>
							}
							title="Index mappings"
						>
							<InfoCircleOutlined />
						</Popover>
					</Row>
					<Ace
						defaultValue=""
						mode="json"
						value={
							typeof indexMappings === 'string'
								? indexMappings
								: JSON.stringify(indexMappings, 0, 2)
						}
						placeholder={`{
    "properties": {
        "age":    { "type": "integer" },
        "email":  { "type": "keyword"  },
        "name":   { "type": "text"  }
    }
}`}
						onChange={(value) => this.handleInputNumber('indexMappings', value)}
						theme="monokai"
						name="editor-JSON"
						fontSize={16}
						showPrintMargin
						style={{
							width: '100%',
							maxWidth: 800,
							maxHeight: 250,
							whiteSpace: 'pre',
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
						<div style={{ color: 'tomato', marginTop: 8 }}>
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
	backend: PropTypes.string,
	tier: allowedTiers,
	featureSearchRelevancy: PropTypes.bool,
};

CreateAppModal.defaultProps = {
	defaultSettings: null,
	backend: '',
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
	backend: get(state, '$getAppPlan.results.backend', ''),
});

const mapDispatchToProps = (dispatch) => ({
	handleCreateApp: (options) => dispatch(createApp(options)),
	resetApp: () => dispatch(resetCreatedApp()),
	updateSettingsAction: (name, payload) => dispatch(putSettings(name, payload)),
	getDefaultSettingsAction: () => dispatch(getDefaultSettings()),
});

export default withErrorToaster(connect(mapStateToProps, mapDispatchToProps)(CreateAppModal));
