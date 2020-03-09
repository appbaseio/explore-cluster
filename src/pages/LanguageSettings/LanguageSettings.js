import React from 'react';
import { connect } from 'react-redux';
import { Card, Form, Input, message, notification, Select, Switch } from 'antd';

import { cloneDeep, get, pick } from 'lodash';
import {
	deleteSettings,
	getAppMappings,
	getDefaultSettings,
	getSettings,
	putSettings,
} from '../../batteries/modules/actions';
import Banner from '../../batteries/components/shared/UpgradePlan/Banner';
import Loader from '../../components/Loader';
import { SettingsFooter } from '../../components/SettingsFooter';
import { container, label } from '../ResultsPage/styles';
import { LanguageDropdown } from '../../components/LanguageDropdown';
import { getRawMappingsByAppName } from '../../batteries/modules/selectors';
import { getURL } from '../../constants/config';
import { isEqual } from '../../batteries/utils';
import { ReviewAndSave } from '../../components/ReviewAndSave';
import { SettingTooltip } from '../../components/SettingTooltip';
import { applyLanguageAnalyzers } from '../../batteries/utils/mappings';
import { doPost } from '../../batteries/utils/requestService';
import { getReIndexedName } from '../../utils';
import { buildLanguageAnalysis, getLanguageFallback } from '../../utils/language';

const bannerMessage = {
	title: 'Language Settings',
	description: 'Language Settings let you apply a specific language for your search index.',
	buttonText: 'Read Docs',
};

class LanguageSettings extends React.Component {
	state = { visible: false, loading: false };

	componentDidMount() {
		const {
			appName,
			getSettingsAction,
			form: { setFieldsValue },
		} = this.props;
		getSettingsAction(appName).then(res => {
			if (res && res.payload) {
				this.setFormValues(res, setFieldsValue);
			}
		});
	}

	setFormValues = (res, setFieldsValue) => {
		const { language } = res.payload;
		const formValues = Object.keys(language).reduce((formObj, key) => {
			if (key === 'customStopwords' || key === 'stemmingExceptions') {
				formObj[key] = language[key] ? language[key].join(',') : '';
			} else formObj[key] = language[key];
			return formObj;
		}, {});
		setFieldsValue(formValues);
	};

	toggleVisible = () => {
		this.setState(prevState => ({ visible: !prevState.visible }));
	};

	getAnalyzerMappings = (res, getFieldValue) => {
		// avoid mutation
		const analyzerMappings = cloneDeep(res.payload.properties);
		return applyLanguageAnalyzers(analyzerMappings, getFieldValue('language'));
	};

	handleSubmit = e => {
		e.preventDefault();
		const {
			form: { getFieldValue, validateFields },
			updateSettingsAction,
			appName,
			settings,
			credentials,
			fetchMappings,
			deleteSettingsAction,
		} = this.props;
		const ACC_API = getURL();
		const authToken = sessionStorage.getItem('authToken');
		validateFields((err, values) => {
			const updateSettings = languagePayload => {
				updateSettingsAction(appName, {
					...settings,
					language: languagePayload,
				}).then(res => {
					if (res && res.error) {
						notification.error({
							message: 'Error',
							description: res.error.message,
						});
					} else {
						message.success(`Language settings for ${appName} saved successfully`);
					}
				});
			};

			const reIndexAndUpdateSettings = languagePayload => {
				fetchMappings(appName, credentials, ACC_API).then(res => {
					if (res && res.payload) {
						const analyzerMappings = this.getAnalyzerMappings(res, getFieldValue);
						let language = getFieldValue('language');
						language = getLanguageFallback(language);
						this.setState({ loading: true });
						deleteSettingsAction(appName);
						const analysis = buildLanguageAnalysis(language, languagePayload);
						doPost(
							`${ACC_API}/_reindex/${appName}`,
							{
								mappings: { properties: analyzerMappings },
								settings: {
									analysis,
								},
							},
							{
								Authorization: `Basic ${authToken}`,
							},
						).then(() => {
							const newName = getReIndexedName(appName);
							updateSettingsAction(newName, {
								...settings,
								language: languagePayload,
							}).then(response => {
								if (response && response.payload) {
									const { history } = this.props;
									history.push(`/`);
								} else {
									this.setState({ loading: false });
									notification.error({
										message: 'Failed to save Language Settings',
										description: get(response, 'error.message'),
									});
								}
							});
						});
					}
				});
			};

			if (!err) {
				const languagePayload = this.getLanguagePayload(values);
				reIndexAndUpdateSettings(languagePayload);
			}
		});
	};

	getLanguagePayload = values => {
		const languagePayload = pick(values, ['language', 'applyStopwords', 'normalizeDiacritics']);
		const { customStopwords, stemmingExceptions } = values;
		languagePayload.customStopwords = customStopwords ? customStopwords.split(',') : [];
		languagePayload.stemmingExceptions = stemmingExceptions
			? stemmingExceptions.split(',')
			: [];
		return languagePayload;
	};

	resetLanguageSettings = e => {
		e.preventDefault();
		const {
			getDefaultSettingsAction,
			form: { setFieldsValue },
			defaultSettings,
		} = this.props;
		if (defaultSettings) this.setFormValues({ payload: defaultSettings }, setFieldsValue);
		else
			getDefaultSettingsAction().then(res => {
				if (res && res.payload) {
					this.setFormValues(res, setFieldsValue);
				}
			});
	};

	revertChanges = (settings, setFieldsValue) => {
		this.setFormValues(
			{
				payload: settings,
			},
			setFieldsValue,
		);
		this.toggleVisible();
	};

	render() {
		const {
			form: { getFieldDecorator, getFieldValue, getFieldsValue, setFieldsValue },
			isLoading,
			isUpdating,
			resetState,
			settings,
		} = this.props;
		const { visible, loading } = this.state;

		if (isLoading) return <Loader />;

		return (
			<>
				<Banner {...bannerMessage} />
				<div className={container}>
					<Form layout="vertical" className={label}>
						<Card>
							<Form.Item
								style={{ paddingBottom: 0 }}
								label={
									<>
										Choose Your Language
										<SettingTooltip title="Sets the languages at the index level for language-specific processing such as tokenization and normalization." />
									</>
								}
							>
								{getFieldDecorator('language')(
									<LanguageDropdown
										formStyle={{ paddingBottom: 0 }}
										renderOption={lang => (
											<Select.Option key={lang.value} value={lang.value}>
												{lang.label}
											</Select.Option>
										)}
									/>,
								)}
							</Form.Item>
							<div style={{ paddingBottom: 32 }}>
								<label style={{ marginRight: 10 }}>Apply Default Stopwords</label>
								{getFieldDecorator('applyStopwords', { valuePropName: 'checked' })(
									<Switch />,
								)}
							</div>

							<Form.Item
								label={
									<>
										Provide Custom Stopwords
										<SettingTooltip title="Removes these words from query before searching." />
									</>
								}
							>
								{getFieldDecorator('customStopwords')(
									<Input.TextArea placeholder="Add comma separated stopwords" />,
								)}
							</Form.Item>

							<Form.Item
								label={
									<>
										Stemming Exceptions
										<SettingTooltip title="Words which should be excluded from stemming." />
									</>
								}
							>
								{getFieldDecorator('stemmingExceptions')(
									<Input.TextArea placeholder="Add comma separated words to avoid stemming on" />,
								)}
							</Form.Item>
							<div style={{ paddingBottom: 32 }}>
								<label style={{ marginRight: 10 }}>Normalize Diacritics</label>
								{getFieldDecorator('normalizeDiacritics', {
									valuePropName: 'checked',
								})(<Switch />)}
							</div>
						</Card>
					</Form>

					<SettingsFooter
						loading={isUpdating || loading}
						onSubmit={this.handleSubmit}
						resetState={resetState}
						onReset={this.resetLanguageSettings}
						saveText="Apply Settings And Re-index"
						disabled={isEqual(
							get(settings, 'language'),
							this.getLanguagePayload(getFieldsValue()),
						)}
						reviewAndSave={() => (
							<ReviewAndSave
								oldValues={get(settings, 'language')}
								newValues={this.getLanguagePayload(getFieldsValue())}
								onClick={this.toggleVisible}
								visible={visible}
								onRevert={() => {
									this.revertChanges(settings, setFieldsValue);
								}}
								onSave={e => {
									this.handleSubmit(e);
									this.toggleVisible();
								}}
							/>
						)}
					/>
				</div>
			</>
		);
	}
}

const mapStateToProps = state => {
	const appName = get(state, '$getCurrentApp.name');
	const mappings = getRawMappingsByAppName(state) || null;

	const { username, password } = get(state, 'user.data', {});
	return {
		appName,
		isLoading: get(state, '$getAppSettings.isFetching'),
		settings: get(state, ['$getAppSettings', 'settings', appName]),
		isUpdating: get(state, '$getAppSettings.isUpdating'),
		resetState: get(state, '$getAppSettings.default', {}),
		defaultSettings: get(state, '$getAppSettings.defaultSettings'),
		credentials: username ? `${username}:${password}` : null,
		mappings,
	};
};

const mapDispatchToProps = dispatch => ({
	getDefaultSettingsAction: () => dispatch(getDefaultSettings()),
	getSettingsAction: name => dispatch(getSettings(name)),
	updateSettingsAction: (name, payload) => dispatch(putSettings(name, payload)),
	fetchMappings: (appName, credentials, url) =>
		dispatch(getAppMappings(appName, credentials, url)),
	deleteSettingsAction: name => dispatch(deleteSettings(name)),
});

const LanguageForm = Form.create({ name: 'language' })(LanguageSettings);

export default connect(mapStateToProps, mapDispatchToProps)(LanguageForm);
