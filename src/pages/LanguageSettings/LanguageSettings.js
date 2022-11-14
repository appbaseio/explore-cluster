/* eslint-disable no-param-reassign,jsx-a11y/label-has-associated-control,jsx-a11y/label-has-for */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Card, Form, Input, Select, Switch, Skeleton } from 'antd';

import get from 'lodash/get';
import {
	deleteSettings,
	getAppMappings,
	getDefaultSettings,
	getSettings,
	putSettings,
	setCurrentApp,
	setLocalRelevancyState,
} from '../../batteries/modules/actions';
import Banner from '../../batteries/components/shared/UpgradePlan/Banner';
import { container, label } from '../ResultsPage/styles';
import { getRawMappingsByAppName } from '../../batteries/modules/selectors';
import SettingTooltip from '../../components/SettingTooltip';
import { features, isValidPlan } from '../../batteries/utils';
import Overlay from '../../components/Overlay';
import { appendApp, removeAppData } from '../../actions';
import settingsMap from '../../components/ReviewAndSave/helper';
import { allowedTiers } from '../../utils/prop-types';
import { removeWhiteSpaces } from '../../utils';
import ErrorToaster from '../../batteries/components/shared/ErrorToaster';
import { withErrorToaster } from '../../batteries/components/shared/ErrorToaster/ErrorToaster';
import { languages } from '../../constants/es-languages';
import SettingsFooter from '../../components/SettingsFooter';
import { event, timingEvent } from '../../utils/gtag';
import moment from '../../utils/moment';

const fallback = {
	chinese: 'Needs smartcn analyzer installed.',
	japanese: 'Needs kuromoji analyzer installed.',
	korean: 'Needs nori analyzer installed.',
	polish: 'Needs stempel analyzer installed.',
	ukranian: 'Needs ukranian analyzer installed.',
};

const bannerDetails = {
	title: 'Language Settings',
	description: 'Configure language settings to understand search intent.',
	buttonText: 'Read Docs',
	videoLink: 'https://youtu.be/wx8ac4IkTas',
	icon: 'info-circle',
	href: 'https://docs.reactivesearch.io/docs/search/relevancy/#language-settings',
};

const bannerMessage = {
	title: 'Language Settings',
	description: 'Configure language settings to understand search intent.',
	buttonText: 'Read Docs',
	videoLink: 'https://youtu.be/wx8ac4IkTas',
	href: 'https://docs.reactivesearch.io/docs/search/relevancy/#language-settings',
};

class LanguageSettings extends React.Component {
	constructor(props) {
		super(props);
		this.startTime = moment();
	}

	componentDidMount() {
		// triggering custom event for google analytics
		event({
			action: 'Language Settings',
			category: 'Search Relevancy',
			label: 'visit',
			value: null,
		});

		const {
			appName,
			getSettingsAction,
			getDefaultSettingsAction,
			defaultSettings,
			settings,
			localRelevancy,
		} = this.props;
		if (settings && !localRelevancy) {
			this.init({ ...settings });
		} else {
			getSettingsAction(appName);
		}

		if (!defaultSettings) getDefaultSettingsAction();
	}

	componentDidUpdate(prevProps) {
		const { settings, isLoading, defaultSettings, localRelevancy } = this.props;

		if (!isLoading && JSON.stringify(settings) !== JSON.stringify(prevProps.settings)) {
			this.init({ ...settings });
		}

		if (
			!settings &&
			!isLoading &&
			!localRelevancy &&
			JSON.stringify(defaultSettings) !== JSON.stringify(prevProps.defaultSettings)
		) {
			this.init({ ...defaultSettings });
		}
	}

	componentWillUnmount() {
		// Sends the timing event to Google Analytics.
		timingEvent({
			action: 'timing_complete',
			category: 'Search Relevancy',
			label: 'language-settings-time',
			name: 'time',
			value: this.startTime.fromNow(),
		});
	}

	init = (settings) => {
		const { appName, updateLocalRelevancy, localRelevancy } = this.props;
		if (!localRelevancy) {
			updateLocalRelevancy(appName, { ...settings });
		}
	};

	handleChange = (key, val) => {
		const { appName, localRelevancy, updateLocalRelevancy } = this.props;
		let value = val;

		if (key === 'customStopwords' || key === 'stemmingExceptions') {
			value = val.split(',').map((i) => removeWhiteSpaces(i));
		}
		updateLocalRelevancy(appName, {
			...localRelevancy,
			language: {
				...get(localRelevancy, `language`),
				[key]: value,
			},
		});
	};

	render() {
		const { isLoading, localRelevancy, tier, featureSearchRelevancy } = this.props;

		if (!isValidPlan(tier, featureSearchRelevancy, features.SEARCH_RELEVANCY)) {
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
		if (isLoading || !localRelevancy || !get(localRelevancy, `language`, null)) {
			return (
				<Card>
					<Banner {...bannerDetails} />
					<div className={container}>
						<Skeleton />
					</div>
				</Card>
			);
		}

		const {
			applyStopwords,
			customStopwords,
			language,
			normalizeDiacritics,
			stemmingExceptions,
		} = get(localRelevancy, `language`);

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
									validateStatus={fallback[language] ? 'warning' : null}
									help={get(fallback, language)}
								>
									<Select
										value={language}
										showSearch
										formStyle={{ paddingBottom: 0 }}
										style={{ width: '20%', minWidth: '35%' }}
										onChange={(val) => this.handleChange('language', val)}
										data-cy="language-value"
									>
										{languages.map((lang) => (
											<Select.Option key={lang.value} value={lang.value}>
												{lang.label}
											</Select.Option>
										))}
									</Select>
								</Form.Item>
								<Form.Item
									label={
										<>
											{settingsMap.applyStopwords.title}
											<SettingTooltip
												title={settingsMap.applyStopwords.description}
											/>
										</>
									}
								>
									<Switch
										data-cy="apply-stopwords-switch"
										checked={applyStopwords}
										onChange={(value) =>
											this.handleChange('applyStopwords', value)
										}
									/>
								</Form.Item>

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
									<Input.TextArea
										placeholder="Add comma separated stopwords"
										value={customStopwords.join(', ')}
										onChange={(e) =>
											this.handleChange('customStopwords', e.target.value)
										}
									/>
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
									<Input.TextArea
										placeholder="Add comma separated words to avoid stemming on"
										value={stemmingExceptions.join(', ')}
										onChange={(e) =>
											this.handleChange('stemmingExceptions', e.target.value)
										}
									/>
								</Form.Item>
								<Form.Item
									label={
										<>
											{settingsMap.normalizeDiacritics.title}
											<SettingTooltip
												title={settingsMap.normalizeDiacritics.description}
											/>
										</>
									}
								>
									<Switch
										data-cy="normalize-diacritics-switch"
										checked={normalizeDiacritics}
										onChange={(value) =>
											this.handleChange('normalizeDiacritics', value)
										}
									/>
								</Form.Item>
							</ErrorToaster>
						</Card>
					</Form>
					<SettingsFooter />
				</div>
			</>
		);
	}
}
const mapStateToProps = (state) => {
	const appName = get(state, '$getCurrentApp.name');
	const mappings = getRawMappingsByAppName(state) || null;

	const { username, password } = get(state, 'user.data', {});
	const localRelevancy = get(state, ['$getLocalRelevancy', appName], null);
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
		localRelevancy,
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
	localRelevancy: PropTypes.object,
	updateLocalRelevancy: PropTypes.func.isRequired,
	isLoading: PropTypes.bool.isRequired,
};

LanguageSettings.defaultProps = {
	settings: null,
	defaultSettings: null,
	isUpdating: false,
	resetState: {},
	tier: undefined,
	featureSearchRelevancy: false,
	localRelevancy: null,
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
	updateLocalRelevancy: (name, data) => dispatch(setLocalRelevancyState(name, data)),
});

const LanguageForm = Form.create({ name: 'language' })(LanguageSettings);

export default withErrorToaster(connect(mapStateToProps, mapDispatchToProps)(LanguageForm));
