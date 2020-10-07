/* eslint-disable no-param-reassign,jsx-a11y/label-has-associated-control,jsx-a11y/label-has-for */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Card, Form, Input, message, notification, Select, Switch, Alert } from 'antd';

import cloneDeep from 'lodash/cloneDeep';
import compact from 'lodash/compact';
import get from 'lodash/get';
import omit from 'lodash/omit';
import omitBy from 'lodash/omitBy';
import pick from 'lodash/pick';
import {
	deleteSettings,
	getAppMappings,
	getDefaultSettings,
	getSettings,
	putSettings,
	setCurrentApp,
} from '../../batteries/modules/actions';
import Banner from '../../batteries/components/shared/UpgradePlan/Banner';
import SettingsFooter from '../../components/SettingsFooter';
import { container, label } from '../ResultsPage/styles';
import LanguageDropdown from '../../components/LanguageDropdown';
import { getRawMappingsByAppName } from '../../batteries/modules/selectors';
import { getURL, getVersion } from '../../constants/config';
import ReviewAndSave from '../../components/ReviewAndSave';
import SettingTooltip from '../../components/SettingTooltip';
import {
	applyLanguageAnalyzers,
	getESVersion,
	getSettings as getAppSettings,
	reIndex,
} from '../../batteries/utils/mappings';
import { removeWhiteSpaces } from '../../utils';
import { buildLanguageAnalysis, getLanguageFallback } from '../../utils/language';
import { isEqual, isValidPlan } from '../../batteries/utils';
import Overlay from '../../components/Overlay';
import { appendApp, removeAppData } from '../../actions';
import settingsMap from '../../components/ReviewAndSave/helper';
import Loader from '../../components/Loader';
import { allowedTiers } from '../../utils/prop-types';
import ErrorToaster from '../../batteries/components/shared/ErrorToaster';
import { withErrorToaster } from '../../batteries/components/shared/ErrorToaster/ErrorToaster';
import ReIndexWrapper from '../../components/ReIndexWrapper';

const bannerDetails = {
	title: 'Language Settings',
	buttonText: 'Read More',
	videoLink: 'https://youtu.be/wx8ac4IkTas',
	icon: 'pencil',
	href: 'https://docs.appbase.io/docs/search/relevancy/#language-settings',
};

const bannerMessage = {
	title: 'Language Settings',
	description: 'Language Settings let you apply a specific language for your search index.',
	buttonText: 'Read Docs',
	videoLink: 'https://youtu.be/wx8ac4IkTas',
	href: 'https://docs.appbase.io/docs/search/relevancy/#language-settings',
};

class LanguageSettings extends React.Component {
	state = { visible: false, loading: false, initiating: false };

	async componentDidMount() {
		const {
			appName,
			getSettingsAction,
			form: { setFieldsValue },
			credentials,
			getDefaultSettingsAction,
		} = this.props;
		this.setState({ initiating: true });
		const esVersion = getVersion() || (await getESVersion(appName, credentials));
		this.setState({ esVersion });
		getSettingsAction(appName).then((res) => {
			this.setState({ initiating: false });
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
		this.setState((prevState) => ({ visible: !prevState.visible, isReset }));
	};

	getAnalyzerMappings = (res, getFieldValue) => {
		// avoid mutation
		const es6Mappings = get(res, 'payload._doc.properties');
		const analyzerMappings = cloneDeep(get(res, 'payload.properties') || es6Mappings);
		return applyLanguageAnalyzers(analyzerMappings, this.getFallBackLanguage(getFieldValue));
	};

	handleSubmit = (e, refetchReIndexingInfo) => {
		e.preventDefault();
		const {
			form: { getFieldValue, validateFields },
			appName,
			settings,
			credentials,
			fetchMappings,
			updateSettingsAction,
		} = this.props;
		const ACC_API = getURL();
		validateFields((err, values) => {
			const handleReIndexError = (reIndexErr) => {
				console.error(reIndexErr);
				this.setState({ loading: false });
				notification.error({
					message: 'Reindexing Failed',
					description:
						'Reindexing is in progress, please wait till the current process is completed!',
				});
			};
			const handleReIndexSuccess = (languagePayload, mappings) => {
				const dataFields = cloneDeep(get(settings, 'search.dataField', []));
				const fieldWeights = cloneDeep(get(settings, 'search.fieldWeights', []));
				this.traverseDataFields(dataFields, fieldWeights, mappings, settings);
				updateSettingsAction(appName, {
					...settings,
					language: languagePayload,
					search: {
						...settings.search,
						dataField: dataFields,
						fieldWeights,
					},
				})
					.then((response) => {
						this.setState({ loading: false });
						if (response && response.payload) {
							message.success(`Language settings for ${appName} saved successfully`);
						} else {
							handleReIndexError(get(response, 'error'));
						}
					})
					.catch((err2) => {
						handleReIndexError(err2);
					});
			};

			const reIndexAndUpdateSettings = async (languagePayload) => {
				const { esVersion } = this.state;

				const appSettings = await getAppSettings(appName, credentials).then(
					(data) => data[appName].settings,
				);

				this.setState({ loading: true });

				fetchMappings(appName, credentials, ACC_API).then((res) => {
					if (res && res.payload) {
						const analyzerMappings = this.getAnalyzerMappings(res, getFieldValue);
						const language = this.getFallBackLanguage(getFieldValue);
						const analysis = buildLanguageAnalysis(language, languagePayload);
						const { analyzer, filter } = get(appSettings, 'index.analysis', {});
						const { analyzer: analyzerNew, filter: filterNew } = analysis || {};
						const reIndexPromise = reIndex({
							mappings: { properties: analyzerMappings },
							appId: appName,
							version: esVersion,
							credentials,
							settings: {
								analysis: {
									analyzer: {
										...omit(analyzer, [
											get(settings, 'language.language'),
											'standard_asciifolding',
										]),
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
						});

						if (refetchReIndexingInfo) {
							setTimeout(() => {
								refetchReIndexingInfo();
							}, 500);
						}

						reIndexPromise
							.then(() => {
								handleReIndexSuccess(languagePayload, analyzerMappings);
							})
							.catch((reIndexErr) => {
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

	traverseDataFields = (dataFields, fieldWeights = [], mappings, settings) => {
		let keyPath = '';
		const applyDataFields = (properties = {}, level = 0) => {
			Object.keys(properties).reduce((agg, key) => {
				if (level === 0) keyPath += `${key}`;
				else keyPath += `.${key}`;
				if (get(properties, `${key}.properties`)) {
					return {
						...agg,
						[key]: {
							...properties[key],
							properties: applyDataFields(
								get(properties, `${key}.properties`),
								level + 1,
							),
						},
					};
				}
				const data = properties[key];
				const fields = get(properties[key], 'fields', {});
				if (fields.search || fields.autosuggest) {
					const fieldIndex = get(settings, 'search.dataField', []).findIndex(
						(field) => field === keyPath,
					);
					if (!dataFields.includes(`${keyPath}.lang`) && fieldIndex !== -1) {
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
		applyDataFields(mappings);
	};

	getFallBackLanguage = (getFieldValue) => {
		let language = getFieldValue('language');
		language = getLanguageFallback(language);
		return language;
	};

	getLanguagePayload = (values) => {
		const languagePayload = pick(values, ['language', 'applyStopwords', 'normalizeDiacritics']);
		const { customStopwords, stemmingExceptions } = values;
		languagePayload.customStopwords = customStopwords
			? compact(
					customStopwords
						.trim()
						.split(',')
						.map((str) => removeWhiteSpaces(str)),
			  )
			: [];
		languagePayload.stemmingExceptions = stemmingExceptions
			? compact(
					stemmingExceptions
						.trim()
						.split(',')
						.map((str) => removeWhiteSpaces(str)),
			  )
			: [];
		return languagePayload;
	};

	resetLanguageSettings = (e) => {
		e.preventDefault();
		const {
			getDefaultSettingsAction,
			form: { setFieldsValue },
			defaultSettings,
		} = this.props;
		if (defaultSettings) this.setFormValues({ payload: defaultSettings }, setFieldsValue);
		else
			getDefaultSettingsAction().then((res) => {
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
			defaultSettings,
			tier,
			appName,
			featureSearchRelevancy,
		} = this.props;
		const { visible, loading, isReset, initiating } = this.state;

		if (initiating) return <Loader />;

		if (!isValidPlan(tier, featureSearchRelevancy)) {
			return (
				<React.Fragment>
					<Banner {...bannerDetails} />
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
							<ErrorToaster>
								<Form.Item
									style={{ paddingBottom: 0 }}
									label={
										<>
											{settingsMap.language.title}
											<SettingTooltip
												title={settingsMap.language.description}
											/>
										</>
									}
								>
									{getFieldDecorator('language')(
										<LanguageDropdown
											formStyle={{ paddingBottom: 0 }}
											style={{ width: '20%', minWidth: '35%' }}
											renderOption={(lang) => (
												<Select.Option key={lang.value} value={lang.value}>
													{lang.label}
												</Select.Option>
											)}
										/>,
									)}
								</Form.Item>
								<div style={{ paddingBottom: 32 }}>
									<label>{settingsMap.applyStopwords.title}</label>
									<SettingTooltip
										title={settingsMap.applyStopwords.description}
									/>
									<div style={{ marginTop: 5 }}>
										{getFieldDecorator('applyStopwords', {
											valuePropName: 'checked',
										})(<Switch />)}
									</div>
								</div>

								<Form.Item
									label={
										<>
											{settingsMap.customStopwords.title}
											<SettingTooltip
												title={settingsMap.customStopwords.description}
											/>
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
											{settingsMap.stemmingExceptions.title}
											<SettingTooltip
												title={settingsMap.stemmingExceptions.description}
											/>
										</>
									}
								>
									{getFieldDecorator('stemmingExceptions')(
										<Input.TextArea placeholder="Add comma separated words to avoid stemming on" />,
									)}
								</Form.Item>
								<div style={{ paddingBottom: 32 }}>
									<label>{settingsMap.normalizeDiacritics.title}</label>
									<SettingTooltip
										title={settingsMap.normalizeDiacritics.description}
									/>
									<div style={{ marginTop: 5 }}>
										{getFieldDecorator('normalizeDiacritics', {
											valuePropName: 'checked',
										})(<Switch />)}
									</div>
								</div>
							</ErrorToaster>
						</Card>
					</Form>
					<ReIndexWrapper appName={appName}>
						{({ refetch }) => (
							<SettingsFooter
								loading={isUpdating || loading}
								resetState={resetState}
								showCopySettings
								showSearchPreview
								app={appName}
								searchPreviewModalProps={{
									buttonProps: {
										showTooltip: !isEqual(
											this.getLanguagePayload(getFieldsValue()),
											get(settings, 'language'),
										),
										tooltip: settingsMap.disable_search_settings.description,
									},
								}}
								onReset={this.resetLanguageSettings}
								saveText="Apply Settings And Re-index"
								showReset={
									!isEqual(
										get(settings, 'language'),
										get(defaultSettings, 'language'),
									)
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
										renderContent={() => (
											<Alert
												type="warning"
												showIcon
												style={{ marginBottom: 10 }}
												description="Re-indexing is required for applying below changes."
											/>
										)}
										onSave={(e) => {
											this.handleSubmit(e, refetch);
											this.toggleVisible();
										}}
									/>
								)}
							/>
						)}
					</ReIndexWrapper>
				</div>
			</>
		);
	}
}

const mapStateToProps = (state) => {
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
		featureSearchRelevancy: get(state, '$getAppPlan.results.feature_search_relevancy', false),
	};
};

LanguageSettings.propTypes = {
	appName: PropTypes.string.isRequired,
	getSettingsAction: PropTypes.func.isRequired,
	form: PropTypes.object.isRequired,
	credentials: PropTypes.string.isRequired,
	getDefaultSettingsAction: PropTypes.func.isRequired,
	settings: PropTypes.object,
	defaultSettings: PropTypes.object,
	fetchMappings: PropTypes.func.isRequired,
	updateSettingsAction: PropTypes.func.isRequired,
	isUpdating: PropTypes.bool,
	resetState: PropTypes.object,
	tier: allowedTiers,
	featureSearchRelevancy: PropTypes.bool,
};

LanguageSettings.defaultProps = {
	settings: null,
	defaultSettings: null,
	isUpdating: false,
	resetState: {},
	tier: undefined,
	featureSearchRelevancy: false,
};

const mapDispatchToProps = (dispatch) => ({
	getDefaultSettingsAction: () => dispatch(getDefaultSettings()),
	getSettingsAction: (name) => dispatch(getSettings(name)),
	updateSettingsAction: (name, payload) => dispatch(putSettings(name, payload)),
	fetchMappings: (appName, credentials, url) =>
		dispatch(getAppMappings(appName, credentials, url)),
	deleteSettingsAction: (name) => dispatch(deleteSettings(name)),
	updateCurrentApp: (appName) => dispatch(setCurrentApp(appName, appName)),
	addApp: (appName) => dispatch(appendApp(appName)),
	deleteApp: (appName) => dispatch(removeAppData(appName)),
});

const LanguageForm = Form.create({ name: 'language' })(LanguageSettings);

export default withErrorToaster(connect(mapStateToProps, mapDispatchToProps)(LanguageForm));
