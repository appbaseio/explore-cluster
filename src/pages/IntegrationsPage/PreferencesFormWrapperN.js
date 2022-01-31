import React from 'react';
import get from 'lodash/get';
import { string, func, bool, object, array } from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { css } from 'react-emotion';
import { Button, Icon, Popconfirm, Tooltip } from 'antd';
import { FormBuilder, Validators } from 'react-reactive-form';
import {
	FormContext,
	validateURL,
	shopifyDefaultFields,
	getFilterConfigurationForm,
	getDynamicFilterKey,
	getPriceFilterConfigurationForm,
	getRecommendationForm,
	CtaActions,
	defaultRecommendationsPreferences,
	defaultSearchPreferences,
	getSearchPreferencesPayload,
	getRecommendationPreferencesPayload,
	RecommendationTypes,
} from './utils';
import {
	getSearchPreferenceById,
	getRecommendationPreferenceById,
} from '../../batteries/modules/selectors';
import {
	getSearchPreferencesN,
	getRecommendationsPreferencesN,
} from '../../batteries/modules/actions';

const modalStyles = css`
	.header-container {
		padding: 16px 24px;
		color: rgba(0, 0, 0, 0.65);
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-size: 20px;
		position: absolute;
		top: 0;
		right: 0;
		left: 0;
		z-index: 999;
		background: white;
		height: 60px;
	}
	.close-icon {
		cursor: pointer;
	}
`;
class PreferencesFormWrapperN extends React.Component {
	constructor(props) {
		super(props);
		this.form = FormBuilder.group({
			name: '',
			description: '',
			pipeline: [undefined, Validators.required],
			id: '',
			// Custom Logo Settings
			logoUrl: '',
			logoWidth: 20,
			logoAlignment: 'left',
			// Common controls =>>>>> Starts
			themeType: 'classic',
			primaryColor: '#0B6AFF',
			primaryTextColor: '#fff',
			textColor: '#424242',
			titleColor: '#424242',
			fontFamily: 'default',
			customCss: '',
			// result fields
			resultTitle: '',
			resultDescription: '',
			resultPrice: '',
			resultImage: '',
			resultHandle: '',
			storeInfo: FormBuilder.group({
				currency: 'USD',
			}),
			exportSettings: FormBuilder.group({
				exportAs: 'embed',
				credentials: '',
				openAsPage: false,
				type: 'other',
			}),
			// Common controls =>>>>> Ends
			...(props.isRecommendation
				? {
						// Recommendation Specific controls
						ctaTitle: 'View Product',
						ctaAction: CtaActions.REDIRECT_TO_PRODUCT,
						recommendations: FormBuilder.array([]),
				  }
				: {
						// Search specific controls
						csbID: '',
						hasEdited: false,
						autoSuggestionSettings: FormBuilder.group({
							enablePopularSuggestions: false,
							enableRecentSearches: false,
							highlight: false,
						}),
						autosuggest: true,
						showVoiceSearch: true,
						enablePredictiveSuggestions: false,
						enablePopularSuggestions: false,
						showSelectedFilters: true,
						showPagination: false,
						layout: 'grid',
						viewSwitcher: true,
						sortOptionSelector: [],
						resultHighlight: false,
						mapLayout: 'map',
						mapComponent: 'googleMap',
						locationDataField: 'location',
						defaultZoom: 13,
						showSearchAsMove: true,
						showMarkerClusters: true,
						mapsAPIkey: '',
						customMessages: FormBuilder.group({
							resultStats: '[count] products found in [time] ms',
							noFilterItem: 'No items Found',
							noResultItem: 'No Results Found!',
							noSuggestion: 'No suggestions found for <mark>[term]</mark>',
							fetchingFilterOptions: 'Fetching Options',
							searchText: 'Click here to search',
							searchIcon: ['', validateURL],
							redirectUrlText: 'View Product',
							redirectUrlIcon: ['', validateURL],
						}),
						staticFilters: FormBuilder.group({
							productType: getFilterConfigurationForm({
								dataField: { value: '', disabled: true },
							}),
							collections: getFilterConfigurationForm({
								dataField: { value: '', disabled: true },
							}),
							color: getFilterConfigurationForm(),
							size: getFilterConfigurationForm({
								showHistogram: false,
								startValue: undefined,
								endValue: undefined,
								startLabel: undefined,
								endLabel: undefined,
								calendarInterval: undefined,
							}),
							price: getPriceFilterConfigurationForm(),
						}),
						dynamicFilters: FormBuilder.array([]),
						syncSettings: FormBuilder.group({
							product_sync: [{ value: true, disabled: true }],
							smartcollection_sync: [{ value: true, disabled: true }],
							customcollection_sync: [{ value: true, disabled: true }],
							collect_sync: [{ value: false, disabled: false }],
							metafield_sync: [{ value: false, disabled: false }],
							namedtags_sync: [{ value: false, disabled: false }],
						}),
				  }),
		});
	}

	componentDidMount() {
		const {
			isRecommendation,
			allSearchPreferences,
			getSearchPreferences,
			getRecommendationsPreferences,
			allRecommendationsPreferences,
		} = this.props;

		if (!isRecommendation && !allSearchPreferences.length) {
			getSearchPreferences();
		}
		if (isRecommendation && !allRecommendationsPreferences.length) {
			getRecommendationsPreferences();
		}

		this.getFormPreferences();
	}

	componentDidUpdate(prevProps) {
		const { searchPreferences, recommendationsPreferences } = this.props;
		if (
			prevProps.searchPreferences !== searchPreferences ||
			prevProps.recommendationsPreferences !== recommendationsPreferences
		) {
			this.getFormPreferences();
		}
	}

	getFormPreferences = () => {
		const { isRecommendation, searchPreferences, recommendationsPreferences } = this.props;

		let preferences;
		if (isRecommendation) {
			preferences = recommendationsPreferences;
		} else {
			preferences = searchPreferences;
		}
		const resetFormArrayControls = () => {
			const dynamicFilterControl = this.form.get('dynamicFilters');
			if (dynamicFilterControl) {
				dynamicFilterControl.controls = [];
			}
			const recommendationsControl = this.form.get('recommendations');
			if (recommendationsControl) {
				recommendationsControl.controls = [];
			}
		};
		// Sync form values
		if (preferences) {
			try {
				// Reset dynamic controls
				resetFormArrayControls();
				// Add controls for dynamic filters
				const dynamicFilterControl = this.form.get('dynamicFilters');
				get(preferences, 'facetSettings.dynamicFacets', []).forEach((data, index) => {
					const control = getFilterConfigurationForm(data.rsConfig, true);
					control.meta = {
						key: getDynamicFilterKey(index),
					};
					dynamicFilterControl.push(control);
				});
				// Add controls for recommendations
				const recommendationsControl = this.form.get('recommendations');
				get(preferences, 'recommendationSettings.recommendations', []).forEach(
					(recommendation) => {
						const control = getRecommendationForm(recommendation.type);
						recommendationsControl.push(control);
					},
				);
				const getStaticFilterFormValue = (filterName) => {
					const preference = get(preferences, 'facetSettings.staticFacets', []).find(
						(o) => o.name === filterName,
					);
					if (preference) {
						return {
							enabled: preference.enabled,
							customize: get(preference, 'rsConfig'),
						};
					}
					return undefined;
				};
				const getFilterMessages = () => {
					let noFilterItem;
					let fetchingFilterOptions;
					get(preferences, 'facetSettings.staticFacets', []).forEach((i) => {
						noFilterItem = get(i, 'customMessages.noResults');
						fetchingFilterOptions = get(i, 'customMessages.loading');
					});
					get(preferences, 'facetSettings.dynamicFacets', []).forEach((i) => {
						noFilterItem = get(i, 'customMessages.noResults');
						fetchingFilterOptions = get(i, 'customMessages.loading');
					});
					return {
						noFilterItem,
						fetchingFilterOptions,
					};
				};
				// Patch form value

				try {
					const patchVar = JSON.parse(
						JSON.stringify({
							name: get(preferences, 'name', ''),
							description: get(preferences, 'description', ''),
							pipeline: get(preferences, 'pipeline', ''),
							id: get(preferences, 'id', ''),
							logoUrl: get(preferences, 'globalSettings.meta.branding.logoUrl', ''),
							logoWidth: get(
								preferences,
								'globalSettings.meta.branding.logoWidth',
								20,
							),
							logoAlignment: get(
								preferences,
								'globalSettings.meta.branding.logoAlignment',
								'left',
							),
							themeType: get(preferences, 'themeSettings.type'),
							primaryColor: get(
								preferences,
								'themeSettings.rsConfig.colors.primaryColor',
							),
							primaryTextColor: get(
								preferences,
								'themeSettings.rsConfig.colors.primaryTextColor',
							),
							textColor: get(preferences, 'themeSettings.rsConfig.colors.textColor'),
							titleColor: get(
								preferences,
								'themeSettings.rsConfig.colors.titleColor',
							),
							fontFamily: get(
								preferences,
								'themeSettings.rsConfig.typography.fontFamily',
							),
							customCss: get(preferences, 'themeSettings.customCss'),
							// result fields
							resultTitle: get(preferences, 'resultSettings.fields.title'),
							resultDescription: get(
								preferences,
								'resultSettings.fields.description',
							),
							resultPrice: get(preferences, 'resultSettings.fields.price'),
							resultImage: get(preferences, 'resultSettings.fields.image'),
							resultHandle: get(preferences, 'resultSettings.fields.handle'),
							exportSettings: get(preferences, 'exportSettings'),
							storeInfo: {
								currency: get(preferences, 'globalSettings.currency'),
							},
							...(isRecommendation
								? {
										ctaTitle: get(
											preferences,
											'recommendationSettings.ctaTitle',
										),
										ctaAction: get(
											preferences,
											'recommendationSettings.ctaAction',
										),
										recommendations: get(
											preferences,
											'recommendationSettings.recommendations',
											[],
										).map((i) => {
											if (i.type === RecommendationTypes.SIMILAR_PRODUCTS) {
												const splited = (i.productsPageUrl || '').split(
													'{',
												);
												return {
													id: i.id,
													title: i.title,
													type: i.type,
													maxProducts: i.maxProducts,
													dataFieldSimilarTo: i.dataField,
													productsPageHandle: {
														productsPageUrlPrefix: splited[0],
														productsPageUrlField: (
															splited[1] || ''
														).replace('}', ''),
													},
												};
											}
											if (i.type === RecommendationTypes.MOST_RECENT) {
												return {
													id: i.id,
													title: i.title,
													type: i.type,
													maxProducts: i.maxProducts,
													dataFieldMostRecent: i.dataField,
												};
											}
											return i;
										}),
								  }
								: {
										csbID: get(
											preferences,
											'globalSettings.meta.deploySettings.csbID',
											'',
										),
										hasEdited: get(
											preferences,
											'globalSettings.meta.deploySettings.hasEdited',
											'',
										),
										autosuggest: get(
											preferences,
											'searchSettings.rsConfig.autosuggest',
										),

										showVoiceSearch: get(
											preferences,
											'searchSettings.rsConfig.showVoiceSearch',
										),
										enablePopularSuggestions: get(
											preferences,
											'searchSettings.rsConfig.enablePopularSuggestions',
										),
										enablePredictiveSuggestions: get(
											preferences,
											'searchSettings.rsConfig.enablePredictiveSuggestions',
										),
										showSelectedFilters: get(
											preferences,
											'globalSettings.showSelectedFilters',
										),
										showPagination: !!get(
											preferences,
											'resultSettings.rsConfig.pagination',
										),
										sortOptionSelector: get(
											preferences,
											'resultSettings.sortOptionSelector',
										),
										resultHighlight: get(
											preferences,
											'resultSettings.resultHighlight',
											false,
										),
										layout: get(preferences, 'resultSettings.layout') || 'grid',
										viewSwitcher: get(
											preferences,
											'resultSettings.viewSwitcher',
										),
										...(get(preferences, 'themeSettings.type') === 'geo' && {
											mapLayout: get(
												preferences,
												'resultSettings.mapLayout',
												'map',
											),
											mapComponent: get(
												preferences,
												'resultSettings.mapComponent',
												'googleMap',
											),
											locationDataField: get(
												preferences,
												'resultSettings.locationDataField',
												'',
											),
											defaultZoom: get(
												preferences,
												'resultSettings.defaultZoom',
												13,
											),
											showSearchAsMove: get(
												preferences,
												'resultSettings.showSearchAsMove',
											),
											showMarkerClusters: get(
												preferences,
												'resultSettings.showMarkerClusters',
											),
											mapsAPIkey: get(
												preferences,
												'resultSettings.mapsAPIkey',
											),
										}),
										syncSettings: get(preferences, 'syncSettings') || {},
										customMessages: {
											resultStats: get(
												preferences,
												'resultSettings.customMessages.resultStats',
											),
											noResultItem: get(
												preferences,
												'resultSettings.customMessages.noResults',
											),
											noSuggestion: get(
												preferences,
												'searchSettings.customMessages.noResults',
											),
											searchText: get(
												preferences,
												'searchSettings.searchButton.text',
											),
											searchIcon: get(
												preferences,
												'searchSettings.searchButton.icon',
											),
											redirectUrlText: get(
												preferences,
												'searchSettings.redirectUrlText',
											),
											redirectUrlIcon: get(
												preferences,
												'searchSettings.redirectUrlIcon',
											),
											...getFilterMessages(),
										},
										autoSuggestionSettings: {
											enablePopularSuggestions: get(
												preferences,
												'searchSettings.rsConfig.enablePopularSuggestions',
											),
											enableRecentSearches: get(
												preferences,
												'searchSettings.rsConfig.enableRecentSearches',
											),
											highlight: get(
												preferences,
												'searchSettings.rsConfig.highlight',
											),
										},
										staticFilters: {
											productType: getStaticFilterFormValue('productType'),
											collections: getStaticFilterFormValue('collection'),
											color: getStaticFilterFormValue('color'),
											size: getStaticFilterFormValue('size'),
											price: getStaticFilterFormValue('price'),
										},
										dynamicFilters: get(
											preferences,
											'facetSettings.dynamicFacets',
											[],
										).map((facet) => ({
											enabled: facet.enabled,
											customize: get(facet, 'rsConfig'),
										})),
								  }),
						}),
					);
					this.form.patchValue(patchVar);
				} catch (e) {
					console.error(e);
				}
			} catch (e) {
				console.warn('Error while syncing the preferences', e);
			}
		}
		// Registering the subscriber after patching the initial values to avoid resetting the set fields in preferences
		this.form.get('exportSettings.type').valueChanges.subscribe((value) => {
			const colorFilter = this.form.get('staticFilters.color.customize.dataField');
			const sizeFilter = this.form.get('staticFilters.size.customize.dataField');
			const priceFilter = this.form.get('staticFilters.price.customize.dataField');
			const syncSettingsControl = this.form.get('syncSettings');
			if (syncSettingsControl) {
				if (value === 'shopify') {
					syncSettingsControl.enable();
				} else {
					syncSettingsControl.disable();
				}
			}
			if (this.form.get('exportSettings.type').touched) {
				if (value === 'shopify') {
					// Populate the default fields
					this.form.patchValue({
						resultTitle: shopifyDefaultFields.title,
						resultDescription: shopifyDefaultFields.description,
						resultPrice: shopifyDefaultFields.price,
						resultImage: shopifyDefaultFields.image,
						resultHandle: shopifyDefaultFields.handle,
					});

					if (colorFilter) {
						colorFilter.patchValue(shopifyDefaultFields.color);
					}
					if (sizeFilter) {
						sizeFilter.patchValue(shopifyDefaultFields.size);
					}
					if (priceFilter) {
						priceFilter.patchValue(shopifyDefaultFields.price);
					}
				} else {
					// Clear the default fields
					this.form.patchValue({
						resultTitle: '',
						resultDescription: '',
						resultPrice: '',
						resultImage: '',
						resultHandle: '',
					});

					if (colorFilter) {
						colorFilter.patchValue(undefined);
					}
					if (sizeFilter) {
						sizeFilter.patchValue(undefined);
					}
					if (priceFilter) {
						priceFilter.patchValue(undefined);
					}
				}
			}
		});

		if (this.form.get('autosuggest')) {
			this.form.get('autosuggest').valueChanges.subscribe((value) => {
				const autoSuggestionSettingsControl = this.form.get('autoSuggestionSettings');
				if (autoSuggestionSettingsControl) {
					if (value) {
						autoSuggestionSettingsControl.enable();
					} else {
						autoSuggestionSettingsControl.disable();
					}
				}
			});
			this.form.get('autoSuggestionSettings').valueChanges.subscribe(() => {});
		}
	};

	getPreferencesPayload = () => {
		const { isRecommendation } = this.props;
		const formValue = this.form.value;
		return isRecommendation
			? getRecommendationPreferencesPayload(formValue)
			: getSearchPreferencesPayload(formValue);
	};

	getPreferences = () => {
		const { isRecommendation } = this.props;
		const preferencesPayload = this.getPreferencesPayload();
		if (!isRecommendation) {
			if (get(preferencesPayload, 'facetSettings.staticFacets')) {
				preferencesPayload.facetSettings.staticFacets =
					preferencesPayload.facetSettings.staticFacets.filter((o) => o.enabled);
			}
			if (get(preferencesPayload, 'facetSettings.dynamicFacets')) {
				preferencesPayload.facetSettings.dynamicFacets =
					preferencesPayload.facetSettings.dynamicFacets.filter((o) => o.enabled);
			}
		}
		preferencesPayload.appbaseSettings = {
			index: preferencesPayload.pipeline,
			credentials: get(preferencesPayload, 'exportSettings.credentials', ''),
			url: sessionStorage.getItem('url'),
		};
		return preferencesPayload;
	};

	render() {
		const { children, closeForm, history, location, match, isRecommendation } = this.props;
		const preferenceId = match.params.id;
		const isInlinePage = location.pathname.split('/').slice(-1)[0] === 'code';

		return (
			<div className={modalStyles}>
				{/* eslint-disable-next-line */}
				{isInlinePage ? (
					<div className="header-container">
						<div>Edit Code Inline</div>
						<Popconfirm
							title="Are you sure you want to exit without saving? Any changes you’ve made via code editor will be lost."
							onConfirm={() => {
								history.push(`/cluster/search-builder/${preferenceId}`);
							}}
							okText="Yes"
							cancelText="No"
						>
							<Tooltip title="Exit without saving">
								<Icon type="close" />
							</Tooltip>
						</Popconfirm>
					</div>
				) : isRecommendation ? (
					<Button
						style={{
							margin: '5px 0px',
						}}
						type="link"
						icon="arrow-left"
						onClick={() => {
							history.push(`/cluster/recommendations-builder`);
						}}
					>
						Go back to Recommendation UIs
					</Button>
				) : (
					<Button
						style={{
							margin: '5px 0px',
						}}
						type="link"
						icon="arrow-left"
						onClick={closeForm}
					>
						Go back to Search UIs
					</Button>
				)}
				<FormContext.Provider value={this.form}>
					{children({
						form: this.form,
						getPreferences: this.getPreferences,
						getPreferencesPayload: this.getPreferencesPayload,
					})}
				</FormContext.Provider>
			</div>
		);
	}
}
PreferencesFormWrapperN.defaultProps = {
	isRecommendation: false,
	preferenceId: null,
	searchPreferences: getSearchPreferencesPayload(defaultSearchPreferences),
	recommendationsPreferences: getRecommendationPreferencesPayload(
		defaultRecommendationsPreferences,
	),
};

PreferencesFormWrapperN.propTypes = {
	// eslint-disable-next-line
	preferenceId: string, // this props is being used in mapStateToProps
	children: func.isRequired,
	isRecommendation: bool,
	searchPreferences: object,
	closeForm: func.isRequired,
	recommendationsPreferences: object,
	history: object.isRequired,
	match: object.isRequired,
	location: object.isRequired,
	allSearchPreferences: array.isRequired,
	getSearchPreferences: func.isRequired,
	getRecommendationsPreferences: func.isRequired,
	allRecommendationsPreferences: array.isRequired,
};

const mapStateToProps = (state, props) => ({
	searchPreferences: getSearchPreferenceById(state, props.preferenceId),
	recommendationsPreferences: getRecommendationPreferenceById(state, props.preferenceId),
	allSearchPreferences: get(state, '$getSearchPreferencesN.results', []),
	allRecommendationsPreferences: get(state, '$getRecommendationsPreferencesN.results', []),
});

const mapDispatchToProps = (dispatch) => ({
	getSearchPreferences: () => dispatch(getSearchPreferencesN()),
	getRecommendationsPreferences: () => dispatch(getRecommendationsPreferencesN()),
});

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(PreferencesFormWrapperN));
