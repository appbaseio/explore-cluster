import React from 'react';
import { connect } from 'react-redux';
import get from 'lodash/get';
import { Skeleton, Card, Divider, notification, message, Alert } from 'antd';
import PropTypes from 'prop-types';
import { withErrorToaster } from '../../batteries/components/shared/ErrorToaster/ErrorToaster';
import {
	getDefaultSettings,
	getSettings,
	putSettings,
	deleteSettings,
	setLocalRelevancyState,
} from '../../batteries/modules/actions';
import Banner from '../../batteries/components/shared/UpgradePlan/Banner';
import { isValidPlan, isEqual } from '../../batteries/utils';
import Overlay from '../../components/Overlay';
import { container } from '../ResultsPage/styles';
import FieldsType from './components/FieldsType';
import SettingsOptions from './components/SettingsOptions';
import settingsMap from '../../components/ReviewAndSave/helper';
import { getDiffKeys } from './utils';
import ReviewAndSave from '../../components/ReviewAndSave';
import SettingsFooter from '../../components/SettingsFooter';
import ReIndexWrapper from '../../components/ReIndexWrapper';
import { allowedTiers } from '../../utils/prop-types';

const bannerDetails = {
	title: 'Aggregation Settings',
	description:
		'Aggregation Settings allows you to set the fields that should be used for aggregations (aka search facets).',
	buttonText: 'Read More',
	videoLink: 'https://youtu.be/bNhju-9mDR0',
	icon: 'pencil',
	href: 'https://docs.appbase.io/docs/search/relevancy/#aggregation-settings',
};

class AggsPage extends React.Component {
	state = {
		fieldTypes: {},
		// count: 10,
		// sort: 'count',
		// includeNullValue: false,
		// queryFormat: 'or',
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

	get hasMappingsChanged() {
		const savedUsecase = get(
			this,
			'_mappingsRef.current.wrappedInstance.originalFlattenUsecase',
			{},
		);

		const currentUsecase = get(this, '_mappingsRef.current.wrappedInstance.flattenUsecase', {});

		return JSON.stringify(savedUsecase) !== JSON.stringify(currentUsecase);
	}

	handleChange = (name, value) => {
		this.setState({
			[name]: value,
		});
	};

	handleSave = (refetchReIndexingData) => {
		const { fieldTypes, sort, count, includeNullValue, queryFormat } = this.state;
		const { updateSettingsAction, appName, settings } = this.props;

		this.toggleReviewSaveVisible();
		updateSettingsAction(appName, {
			...settings,
			aggregations: {
				...get(settings, 'aggregations', {}),
				dataField: fieldTypes,
				size: count,
				sortBy: sort,
				includeNullValues: includeNullValue,
				queryFormat,
			},
		})
			.then(async (res) => {
				if (res && res.error) {
					notification.error({
						message: 'Failed to save Aggregation Settings',
						description: res.error.message,
					});
				} else {
					if (this.hasMappingsChanged) {
						const reIndex = get(
							this,
							'_mappingsRef.current.wrappedInstance.handleReindex',
						);
						await reIndex(refetchReIndexingData);
					}
					message.success(`Aggregation settings for ${appName} saved successfully`);
				}
			})
			.catch((e) => {
				notification.error({
					message: 'Failed to save Aggregation Settings',
					description: e.message,
				});
			});
	};

	handleTypesUpdate = (fieldTypes) => {
		this.setState({
			fieldTypes,
		});
	};

	init = (settings) => {
		const { appName, updateLocalRelevancy } = this.props;
		updateLocalRelevancy(appName, {
			...settings,
			aggregations: {
				...get(settings, 'aggregations', {}),
				count: get(settings, 'aggregations.size'),
				sort: get(settings, 'aggregations.sortBy'),
				includeNullValue: get(settings, 'aggregations.includeNullValues'),
				fieldTypes: get(settings, 'aggregations.dataField'),
				queryFormat: get(settings, 'aggregations.queryFormat', 'or'),
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

		if (defaultSettings) this.init(defaultSettings);
		else
			getDefaultSettingsAction().then((res) => {
				if (res && res.payload) {
					this.init(res.payload);
				}
			});
		this.toggleReset();
		this.toggleReviewSaveVisible();
	};

	setMappingsRef = ({ ref }) => {
		this._mappingsRef = ref;
	};

	render() {
		const {
			isLoading,
			tier,
			featureSearchRelevancy,
			settings,
			isUpdating,
			resetState,
			defaultSettings,
			appName,
			localRelevancy,
		} = this.props;
		const { reviewAndSaveModal, isReset, fieldTypes } = this.state;

		if (isLoading || !localRelevancy || !get(localRelevancy, `${appName}.aggregations`, null)) {
			return (
				<React.Fragment>
					<Banner {...bannerDetails} />
					<div className={container}>
						<Card>
							<Skeleton />
						</Card>
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

		const savedUsecase = get(
			this,
			'_mappingsRef.current.wrappedInstance.originalFlattenUsecase',
			{},
		);

		const currentUsecase = get(this, '_mappingsRef.current.wrappedInstance.flattenUsecase', {});
		const { sort, includeNullValue, count, queryFormat } = get(
			localRelevancy,
			`${appName}.aggregations`,
		);
		const mappingsDiff = getDiffKeys({
			saved: savedUsecase,
			current: currentUsecase,
			defaultValue: '-',
		});

		const typesDiff = getDiffKeys({
			saved: get(settings, 'aggregations.dataField'),
			current: fieldTypes,
			defaultValue: '-',
		});

		console.log(fieldTypes);

		return (
			<React.Fragment>
				<Banner {...bannerDetails} />
				<div className={container}>
					<Card>
						<FieldsType
							fieldTypes={fieldTypes}
							onFieldsUpdate={this.handleTypesUpdate}
							onInit={this.setMappingsRef}
						/>
						<Divider />
						<SettingsOptions
							handleChange={this.handleChange}
							sort={sort}
							includeNullValue={includeNullValue}
							count={count}
							queryFormat={queryFormat}
						/>
					</Card>
					<ReIndexWrapper appName={appName}>
						{({ refetch }) => (
							<SettingsFooter
								loading={isUpdating}
								resetState={resetState}
								showCopySettings
								onReset={this.resetToDefault}
								showSearchPreview
								searchPreviewModalProps={{
									searchPreviewProps: {
										testSettings: {
											...(settings || {}),
											search: {
												...get(settings, 'search', {}),
											},
											aggregations: {
												size: count,
												sortBy: sort,
												includeNullValues: includeNullValue,
												dataField: fieldTypes,
												queryFormat,
											},
										},
										hasTestSettings: true,
									},
									buttonProps: {
										showTooltip: this.hasMappingsChanged,
										tooltip: settingsMap.disable_search_settings.description,
									},
								}}
								app={appName}
								showReset={
									!isEqual(
										get(settings, 'aggregations'),
										get(defaultSettings, 'aggregations'),
									)
								}
								reviewAndSave={() => (
									<ReviewAndSave
										loading={isUpdating}
										isReset={isReset}
										oldValues={{
											agg_size: get(settings, 'aggregations.size'),
											sortBy: get(settings, 'aggregations.sortBy'),
											includeNullValues: get(
												settings,
												'aggregations.includeNullValues',
											),
											dataField: get(typesDiff, 'old'),
											queryFormat: get(
												settings,
												'aggregations.queryFormat',
												'or',
											),
											mappings: get(mappingsDiff, 'old', {}),
										}}
										newValues={{
											agg_size: count,
											sortBy: sort,
											includeNullValues: includeNullValue,
											dataField: get(typesDiff, 'new'),
											queryFormat,
											mappings: get(mappingsDiff, 'new', {}),
										}}
										renderContent={() =>
											this.hasMappingsChanged ? (
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
										onSave={() => this.handleSave(refetch)}
									/>
								)}
							/>
						)}
					</ReIndexWrapper>
				</div>
			</React.Fragment>
		);
	}
}

AggsPage.propTypes = {
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

AggsPage.defaultProps = {
	localRelevancy: null,
	isUpdating: false,
	settings: null,
	resetState: {},
	defaultSettings: null,
	isLoading: false,
	tier: undefined,
	featureSearchRelevancy: false,
};

const mapStateToProps = (state) => {
	const defaultSettings = get(state.$getAppSettings, `defaultSettings`);
	const errorCode = get(state, '$getAppSettings.error.actual.code');
	const defaultSearchSettings = errorCode === 404 ? defaultSettings : null;
	const appName = get(state, '$getCurrentApp.name');
	const localRelevancy = get(state, `$getLocalRelevancy`);
	return {
		appName,
		defaultSettings,
		featureSearchRelevancy: get(state, '$getAppPlan.results.feature_search_relevancy', false),
		isLoading: get(state, '$getAppSettings.isFetching'),
		isUpdating: get(state, '$getAppSettings.isUpdating'),
		resetState: get(state, '$getAppSettings.default', {}),
		settings: get(state, ['$getAppSettings', 'settings', appName], defaultSearchSettings),
		tier: get(state, '$getAppPlan.results.tier'),
		localRelevancy,
	};
};

const mapDispatchToProps = (dispatch) => ({
	deleteSettingsAction: (name) => dispatch(deleteSettings(name)),
	getDefaultSettingsAction: () => dispatch(getDefaultSettings()),
	getSettingsAction: (name) => dispatch(getSettings(name)),
	updateSettingsAction: (name, payload) => dispatch(putSettings(name, payload)),
	updateLocalRelevancy: (name, data) => dispatch(setLocalRelevancyState(name, data)),
});

export default withErrorToaster(connect(mapStateToProps, mapDispatchToProps)(AggsPage));
