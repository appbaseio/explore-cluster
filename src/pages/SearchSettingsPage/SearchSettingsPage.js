import React from 'react';
import get from 'lodash/get';
import { connect } from 'react-redux';
import { notification, message, Alert, Card, Divider, Skeleton } from 'antd';
import PropTypes from 'prop-types';
import {
	getDefaultSettings,
	putSettings,
	deleteSettings,
	getSettings as getSearchRelevancy,
	setLocalRelevancyState,
} from '../../batteries/modules/actions';
import { getFieldWeight } from '../../utils';
import FieldsWeight from './components/FieldsWeight';
import settingsMap from '../../components/ReviewAndSave/helper';
import SettingsOptions from './components/SettingsOptions';
import { isEqual, isValidPlan } from '../../batteries/utils';
import ReviewAndSave from '../../components/ReviewAndSave';
import SettingsFooter from '../../components/SettingsFooter';
import ReIndexWrapper from '../../components/ReIndexWrapper';
import { getDiffForFields } from './utils';
import { container } from '../ResultsPage/styles';
import Banner from '../../batteries/components/shared/UpgradePlan/Banner';
import Overlay from '../../components/Overlay';
import { allowedTiers } from '../../utils/prop-types';

const bannerDetails = {
	title: 'Search Settings',
	buttonText: 'Read More',
	description: 'Search Settings allow you to control your search query settings.',
	icon: 'pencil',
	videoLink: 'https://youtu.be/moxJ2ZB4owI',
	href: 'https://docs.appbase.io/docs/search/relevancy/#search-settings',
};

class SearchSettings extends React.Component {
	state = {
		reviewAndSaveModal: false,
		isReset: false,
	};

	_mappingsRef = null;

	componentDidMount() {
		const {
			appName,
			getSettingsAction,
			settings,
			getDefaultSettingsAction,
			defaultSettings,
			localRelevancy,
		} = this.props;

		if (settings && !get(localRelevancy, appName)) {
			this.init(settings);
		} else {
			getSettingsAction(appName);
		}

		if (!defaultSettings) {
			getDefaultSettingsAction();
		}
	}

	componentDidUpdate(prevProps) {
		const { settings, isLoading } = this.props;

		if (!isLoading && JSON.stringify(settings) !== JSON.stringify(prevProps.settings)) {
			this.init(settings);
		}
	}

	handleChange = (name, value) => {
		const { localRelevancy, updateLocalRelevancy, appName } = this.props;
		updateLocalRelevancy(appName, {
			...get(localRelevancy, appName),
			search: {
				...get(localRelevancy, `${appName}.search`, {}),
				[name]: value,
			},
		});
	};

	handleFieldsUpdate = (fieldWeights) => {
		const { localRelevancy, updateLocalRelevancy, appName } = this.props;
		updateLocalRelevancy(appName, {
			...get(localRelevancy, appName),
			search: {
				...get(localRelevancy, `${appName}.search`, {}),
				fieldWeights,
			},
		});
	};

	handleSave = (refetchReIndexingData) => {
		const {
			localRelevancy,
			updateSettingsAction,
			appName,
			settings,
			getSettingsAction,
		} = this.props;

		const {
			fieldWeights,
			fuzziness,
			enableSynonyms,
			queryFormat,
			queryType,
			enableNgram,
		} = get(localRelevancy, `${appName}.search`);

		this.toggleReviewSaveVisible();
		updateSettingsAction(appName, {
			...settings,
			search: {
				...get(settings, 'search', {}),
				fuzziness,
				dataField: Object.keys(fieldWeights),
				fieldWeights: Object.values(fieldWeights),
				searchOperators: queryType === 'searchOperators',
				queryString: queryType === 'queryString',
				queryFormat,
			},
			indexSettings: {
				enableNgram,
			},
			synonyms: {
				enabled: enableSynonyms,
			},
		})
			.then(async (res) => {
				if (res && res.error) {
					notification.error({
						message: 'Failed to save Search Settings',
						description: get(res, 'error.message'),
					});
				} else {
					console.log('reshere', res);
					if (
						JSON.stringify(
							get(this, '_mappingsRef.current.wrappedInstance.state.rawMappings', {}),
						) !==
						JSON.stringify(
							get(this, '_mappingsRef.current.wrappedInstance.originalMappings', {}),
						)
					) {
						const reIndex = get(
							this,
							'_mappingsRef.current.wrappedInstance.handleReindex',
						);
						await reIndex(refetchReIndexingData);
					}
					getSettingsAction(appName);
					message.success(`Search settings for ${appName} saved successfully`);
				}
			})
			.catch((e) => {
				notification.error({
					message: 'Failed to save Search Settings',
					description: e.message,
				});
			});
	};

	getQueryType = ({ queryString, searchOperators }) => {
		if (queryString) {
			return 'queryString';
		}

		if (searchOperators) {
			return 'searchOperators';
		}

		return 'default';
	};

	init = (settings) => {
		const { appName, updateLocalRelevancy } = this.props;
		const searchSettings = get(settings, 'search', {});

		const fields = get(searchSettings, 'dataField', []);
		const weights = get(searchSettings, 'fieldWeights', []);

		const fieldWeights = fields.reduce((agg, item, index) => {
			return {
				...agg,
				[item]: get(weights, index, getFieldWeight(item.split('.').pop(), 1)),
			};
		}, {});

		const hasSearchOperators = get(settings, 'search.searchOperators', false);
		const hasQueryString = get(settings, 'search.queryString', false);

		const queryType = this.getQueryType({
			queryString: hasQueryString,
			searchOperators: hasSearchOperators,
		});

		updateLocalRelevancy(appName, {
			...settings,
			search: {
				...get(settings, 'search', {}),
				fuzziness: get(searchSettings, 'fuzziness'),
				queryFormat: get(searchSettings, 'queryFormat'),
				queryType,
				fieldWeights,
				enableNgram: get(settings, 'indexSettings.enableNgram', true),
				hasLanguage: !!get(settings, 'language.language'),
				enableSynonyms: get(settings, 'synonyms.enabled', true),
			},
		});
		this.setState({
			reviewAndSaveModal: false,
			isReset: false,
		});
	};

	toggleReviewSaveVisible = () => {
		this.setState((prevState) => ({
			reviewAndSaveModal: !prevState.reviewAndSaveModal,
		}));
	};

	toggleReset = () => {
		this.setState((prevState) => ({
			isReset: !prevState.isReset,
		}));
	};

	resetChanges = () => {
		const cancelChanges = get(this, '_mappingsRef.current.wrappedInstance.cancelChanges');
		const { settings } = this.props;
		cancelChanges();
		this.init(settings);
	};

	resetToDefault = () => {
		const { getDefaultSettingsAction, defaultSettings } = this.props;

		if (defaultSettings) {
			this.init(defaultSettings);
		} else {
			getDefaultSettingsAction().then((res) => {
				if (res && res.payload) {
					this.init(res.payload);
				}
			});
		}
		this.toggleReset();
		this.toggleReviewSaveVisible();
	};

	setMappingsRef = ({ ref }) => {
		this._mappingsRef = ref;
	};

	render() {
		const {
			isLoading,
			isUpdating,
			resetState,
			appName,
			settings,
			defaultSettings,
			tier,
			featureSearchRelevancy,
			localRelevancy,
		} = this.props;
		const { reviewAndSaveModal, isReset } = this.state;

		if (isLoading || !localRelevancy || !get(localRelevancy, `${appName}.search`, null)) {
			return (
				<React.Fragment>
					<Banner {...bannerDetails} />
					<div className={container}>
						<Skeleton />
					</div>
				</React.Fragment>
			);
		}

		if (!isValidPlan(tier, featureSearchRelevancy)) {
			return (
				<React.Fragment>
					<Banner {...bannerDetails} />
					<Overlay
						style={{
							maxWidth: '70%',
						}}
						src="https://i.imgur.com/8ENnHVv.png"
						alt="Search Settings"
					/>
				</React.Fragment>
			);
		}

		const hasMappingsChanged =
			JSON.stringify(
				get(this, '_mappingsRef.current.wrappedInstance.state.rawMappings', {}),
			) !==
			JSON.stringify(get(this, '_mappingsRef.current.wrappedInstance.originalMappings', {}));

		const originalMappings = get(
			this,
			'_mappingsRef.current.wrappedInstance.originalFlattenUsecase',
			{},
		);

		const currentMappings = get(
			this,
			'_mappingsRef.current.wrappedInstance.flattenUsecase',
			{},
		);

		const {
			fieldWeights,
			fuzziness,
			enableSynonyms,
			queryFormat,
			queryType,
			enableNgram,
			hasLanguage,
		} = get(localRelevancy, `${appName}.search`);

		const { diffUsecase, diffWeights } = getDiffForFields({
			currentFieldWithWeights: fieldWeights,
			savedDataField: get(settings, 'search.dataField', []),
			savedFieldWeight: get(settings, 'search.fieldWeights', []),
			savedUsecase: originalMappings,
			currentUsecase: currentMappings,
		});

		return (
			<div>
				<Banner {...bannerDetails} />
				<div className={container}>
					<Card>
						<FieldsWeight
							enableNgram={enableNgram}
							enableSynonyms={enableSynonyms}
							hasLanguage={hasLanguage}
							onInit={this.setMappingsRef}
							onFieldsUpdate={this.handleFieldsUpdate}
							fieldWeights={fieldWeights}
						/>
						<Divider />
						<SettingsOptions
							handleChange={this.handleChange}
							queryType={queryType}
							queryFormat={queryFormat}
							fuzziness={fuzziness}
							enableSynonyms={enableSynonyms}
							enableNgram={enableNgram}
						/>
					</Card>
					<ReIndexWrapper appName={appName}>
						{({ refetch }) => (
							<SettingsFooter
								loading={isUpdating}
								resetState={resetState}
								onReset={this.resetToDefault}
								showSearchPreview
								showCopySettings
								searchPreviewModalProps={{
									searchPreviewProps: {
										testSettings: {
											...(settings || {}),
											search: {
												fuzziness,
												searchOperators: queryType === 'searchOperators',
												dataField: Object.keys(fieldWeights),
												fieldWeights: Object.values(fieldWeights),
												queryString: queryType === 'queryString',
												queryFormat,
											},
										},
										hasTestSettings: Object.keys(fieldWeights).length > 0,
									},
									buttonProps: {
										showTooltip: hasMappingsChanged,
										tooltip: settingsMap.disable_search_settings.description,
									},
								}}
								app={appName}
								showReset={
									!isEqual(
										get(settings, 'search'),
										get(defaultSettings, 'search'),
									)
								}
								reviewAndSave={() => (
									<ReviewAndSave
										loading={isUpdating}
										isReset={isReset}
										oldValues={{
											fuzziness: get(settings, 'search.fuzziness'),
											dataField: get(diffUsecase, 'old', {}),
											fieldWeights: get(diffWeights, 'old', {}),
											synonyms: get(settings, 'synonyms.enabled'),
											queryFormat: get(settings, 'search.queryFormat'),
											queryType: this.getQueryType({
												queryString: get(settings, 'search.queryString'),
												searchOperators: get(
													settings,
													'search.searchOperators',
												),
											}),
											enableNgram: get(settings, 'indexSettings.enableNgram'),
										}}
										newValues={{
											fuzziness,
											dataField: get(diffUsecase, 'new', {}),
											fieldWeights: get(diffWeights, 'new', {}),
											synonyms: enableSynonyms,
											queryFormat,
											queryType,
											enableNgram,
										}}
										renderContent={() =>
											hasMappingsChanged ? (
												<Alert
													type="warning"
													showIcon
													style={{ marginBottom: 10 }}
													description="Re-indexing is required for applying below changes."
												/>
											) : null
										}
										onClick={this.toggleReviewSaveVisible}
										visible={reviewAndSaveModal}
										onRevert={this.resetChanges}
										onSave={() => {
											this.handleSave(refetch);
											this.toggleReviewSaveVisible();
										}}
									/>
								)}
							/>
						)}
					</ReIndexWrapper>
				</div>
			</div>
		);
	}
}

SearchSettings.propTypes = {
	appName: PropTypes.string.isRequired,
	defaultSettings: PropTypes.object,
	isLoading: PropTypes.bool,
	isUpdating: PropTypes.bool,
	resetState: PropTypes.object,
	settings: PropTypes.object,
	tier: allowedTiers,

	featureSearchRelevancy: PropTypes.bool,
	getDefaultSettingsAction: PropTypes.func.isRequired,
	getSettingsAction: PropTypes.func.isRequired,
	updateSettingsAction: PropTypes.func.isRequired,
	updateLocalRelevancy: PropTypes.func.isRequired,
	localRelevancy: PropTypes.object,
};

SearchSettings.defaultProps = {
	isUpdating: false,
	settings: null,
	resetState: {},
	defaultSettings: null,
	isLoading: false,
	tier: undefined,
	featureSearchRelevancy: false,
	localRelevancy: null,
};

const mapStateToProps = (state) => {
	const defaultSettings = get(state.$getAppSettings, `defaultSettings`);
	const errorCode = get(state, '$getAppSettings.error.actual.code');
	const defaultSearchSettings = errorCode === 404 ? defaultSettings : null;
	const appName = get(state, '$getCurrentApp.name');
	const localRelevancy = get(state, `$getLocalRelevancy`);
	return {
		isLoading: get(state, '$getAppSettings.isFetching'),
		settings: get(state, ['$getAppSettings', 'settings', appName], defaultSearchSettings),
		isUpdating: get(state, '$getAppSettings.isUpdating'),
		defaultSettings: get(state, '$getAppSettings.defaultSettings'),
		appName,
		resetState: get(state, '$getAppSettings.default', {}),
		tier: get(state, '$getAppPlan.results.tier'),
		featureSearchRelevancy: get(state, '$getAppPlan.results.feature_search_relevancy', false),
		localRelevancy,
	};
};

const mapDispatchToProps = (dispatch) => ({
	getDefaultSettingsAction: () => dispatch(getDefaultSettings()),
	getSettingsAction: (name) => dispatch(getSearchRelevancy(name)),
	updateSettingsAction: (name, payload) => dispatch(putSettings(name, payload)),
	deleteSettingsAction: (name) => dispatch(deleteSettings(name)),
	updateLocalRelevancy: (name, data) => dispatch(setLocalRelevancyState(name, data)),
});

export default connect(mapStateToProps, mapDispatchToProps)(SearchSettings);
