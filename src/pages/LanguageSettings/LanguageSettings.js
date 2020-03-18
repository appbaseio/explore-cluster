import React from 'react';
import { connect } from 'react-redux';
import { Card, Form, Input, message, notification, Select, Switch } from 'antd';

import { cloneDeep, get, omit, omitBy, pick } from 'lodash';
import {
	deleteSettings,
	getAppMappings,
	getDefaultSettings,
	getSettings,
	putSettings,
	setCurrentApp,
} from '../../batteries/modules/actions';
import Banner from '../../batteries/components/shared/UpgradePlan/Banner';
import { SettingsFooter } from '../../components/SettingsFooter';
import { container, label } from '../ResultsPage/styles';
import { LanguageDropdown } from '../../components/LanguageDropdown';
import { getRawMappingsByAppName } from '../../batteries/modules/selectors';
import { getURL } from '../../constants/config';
import { ReviewAndSave } from '../../components/ReviewAndSave';
import { SettingTooltip } from '../../components/SettingTooltip';
import {
	applyLanguageAnalyzers,
	getESVersion,
	reIndex,
	getSettings as getAppSettings,
} from '../../batteries/utils/mappings';
import { getReIndexedName, validSettingsPlans } from '../../utils';
import { buildLanguageAnalysis, getLanguageFallback } from '../../utils/language';
import { isEqual } from '../../batteries/utils';
import Overlay from '../../components/Overlay';
import { appendApp, removeAppData } from '../../actions';

const bannerDetails = {
	title: 'Language Settings',
	buttonText: 'Read More',
	icon: 'pencil',
	href: 'https://docs.appbase.io/docs/search/Preview/',
};

const bannerMessage = {
	title: 'Language Settings',
	description: 'Language Settings let you apply a specific language for your search index.',
	buttonText: 'Read Docs',
};

class LanguageSettings extends React.Component {
	state = { visible: false, loading: false };

	async componentDidMount() {
		const {
			appName,
			getSettingsAction,
			form: { setFieldsValue },
			credentials,
			getDefaultSettingsAction,
		} = this.props;
		const esVersion = await getESVersion(appName, credentials);
		this.setState({ esVersion });
		getSettingsAction(appName).then(res => {
			if (res && res.payload) {
				this.setFormValues(res, setFieldsValue);
			}
		});
		getDefaultSettingsAction();
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

	toggleVisible = (isReset = false) => {
		this.setState(prevState => ({ visible: !prevState.visible, isReset }));
	};

	getAnalyzerMappings = (res, getFieldValue) => {
		// avoid mutation
		const analyzerMappings = cloneDeep(res.payload.properties);
		return applyLanguageAnalyzers(analyzerMappings, this.getFallBackLanguage(getFieldValue));
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
			updateCurrentApp,
			addApp,
			deleteApp,
		} = this.props;
		const ACC_API = getURL();
		validateFields((err, values) => {
			const handleReIndexSuccess = (languagePayload, mappings) => {
				const newName = getReIndexedName(appName);
				const dataFields = cloneDeep(get(settings, 'search.dataField', []));
				const fieldWeights = cloneDeep(get(settings, 'search.fieldWeights', []));
				this.traverseDataFields(
					dataFields,
					fieldWeights,
					mappings,
					settings,
					languagePayload,
				);
				updateSettingsAction(newName, {
					...settings,
					language: languagePayload,
					search: {
						...settings.search,
						dataField: dataFields,
						fieldWeights,
					},
				}).then(response => {
					if (response && response.payload) {
						const { history } = this.props;
						message.success(`Language settings for ${appName} saved successfully`);
						const updatedAppName = getReIndexedName(appName);
						addApp({ [updatedAppName]: {} });
						deleteApp(appName);
						updateCurrentApp(updatedAppName);
						history.replace(`/app/${updatedAppName}/languages/`);
					} else {
						this.setState({ loading: false });
						notification.error({
							message: 'Failed to save Language Settings',
							description: get(response, 'error.message'),
						});
					}
				});
			};

			const handleReIndexError = reIndexErr => {
				this.setState({ loading: false });
				notification.error({
					message: 'error',
					description: reIndexErr.message,
				});
			};

			const reIndexAndUpdateSettings = async languagePayload => {
				const { esVersion } = this.state;

				const appSettings = await getAppSettings(appName, credentials).then(
					data => data[appName].settings,
				);

				fetchMappings(appName, credentials, ACC_API).then(res => {
					if (res && res.payload) {
						const analyzerMappings = this.getAnalyzerMappings(res, getFieldValue);
						const language = this.getFallBackLanguage(getFieldValue);
						this.setState({ loading: true });
						deleteSettingsAction(appName);
						const analysis = buildLanguageAnalysis(language, languagePayload);
						const { analyzer, filter } = get(appSettings, 'index.analysis', {});
						const { analyzer: analyzerNew, filter: filterNew } = analysis || {};
						reIndex({
							mappings: { properties: analyzerMappings },
							appId: appName,
							version: esVersion,
							credentials,
							settings: {
								analysis: {
									analyzer: {
										...omit(analyzer, get(settings, 'language.language')),
										...analyzerNew,
									},
									filter: {
										...omitBy(filter, (key, value) =>
											(value || '').startsWith(
												get(settings, 'language.language'),
											),
										),
										...filterNew,
									},
								},
							},
						})
							.then(() => {
								handleReIndexSuccess(languagePayload, analyzerMappings);
							})
							.catch(reIndexErr => {
								handleReIndexError(reIndexErr);
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

	traverseDataFields = (dataFields, fieldWeights = [], mappings, settings, languagePayload) => {
		let keyPath = '';
		const applyDataFields = (properties = {}, level = 0) => {
			Object.keys(properties).reduce((agg, key) => {
				if (level === 0) keyPath += `${key}`;
				else keyPath += `.${key}`;
				if (properties[key].properties) {
					return {
						...agg,
						[key]: {
							...properties[key],
							properties: applyDataFields(properties[key].properties, level + 1),
						},
					};
				}
				const data = properties[key];
				const fields = get(properties[key], 'fields', {});
				if (fields.search || fields.autosuggest) {
					const fieldIndex = get(settings, 'search.dataField', []).findIndex(
						field => field === keyPath,
					);
					if (!dataFields.includes(`${keyPath}.lang`)) {
						dataFields.push(`${keyPath}.lang`);
						fieldWeights.push(get(settings, `search.fieldWeights.${fieldIndex}`, 1));
					}
				}
				data.fields = fields;
				keyPath = '';
				return {
					...agg,
					[key]: data,
				};
			}, {});
		};
		if (languagePayload.language !== 'universal') applyDataFields(mappings);
	};

	getFallBackLanguage = getFieldValue => {
		let language = getFieldValue('language');
		language = getLanguageFallback(language);
		return language;
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
		this.toggleVisible(true);
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
			form: { getFieldDecorator, getFieldsValue, setFieldsValue },
			isUpdating,
			resetState,
			settings,
			appName,
			defaultSettings,
			tier,
		} = this.props;
		const { visible, loading, isReset } = this.state;

		if (tier && validSettingsPlans.indexOf(tier) === -1) {
			return (
				<React.Fragment>
					<Banner {...bannerDetails} onClick={() => window.open(bannerDetails.href)} />
					<Overlay
						style={{
							maxWidth: '70%',
						}}
						src="https://i.imgur.com/HyFaPF6.png"
						alt="Language Settings"
					/>
				</React.Fragment>
			);
		}

		return (
			<>
				<Banner {...bannerMessage} />
				<div className={container}>
					<Form layout="vertical" className={`${label} ant-card-body-padding-bottom-0`}>
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
						resetState={resetState}
						showSearchPreview
						app={appName}
						onReset={this.resetLanguageSettings}
						saveText="Apply Settings And Re-index"
						showReset={
							!isEqual(get(settings, 'language'), get(defaultSettings, 'language'))
						}
						reviewAndSave={() => (
							<ReviewAndSave
								loading={isUpdating || loading}
								isReset={isReset}
								oldValues={get(settings, 'language')}
								newValues={this.getLanguagePayload(getFieldsValue())}
								onClick={() => this.toggleVisible(false)}
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
		tier: get(state, '$getAppPlan.results.tier'),
	};
};

const mapDispatchToProps = dispatch => ({
	getDefaultSettingsAction: () => dispatch(getDefaultSettings()),
	getSettingsAction: name => dispatch(getSettings(name)),
	updateSettingsAction: (name, payload) => dispatch(putSettings(name, payload)),
	fetchMappings: (appName, credentials, url) =>
		dispatch(getAppMappings(appName, credentials, url)),
	deleteSettingsAction: name => dispatch(deleteSettings(name)),
	updateCurrentApp: appName => dispatch(setCurrentApp(appName, appName)),
	addApp: appName => dispatch(appendApp(appName)),
	deleteApp: appName => dispatch(removeAppData(appName)),
});

const LanguageForm = Form.create({ name: 'language' })(LanguageSettings);

export default connect(mapStateToProps, mapDispatchToProps)(LanguageForm);
