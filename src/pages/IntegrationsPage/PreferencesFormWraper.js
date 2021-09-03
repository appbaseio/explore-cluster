import React from 'react';
import get from 'lodash/get';
import { string, func, bool, object } from 'prop-types';
import { connect } from 'react-redux';
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
	getSearchPreferences,
	getRecommendationsPreferences,
} from '../../batteries/modules/actions';
import {
	getSearchPreferencesByName,
	getRecommendationsPreferencesByName,
} from '../../batteries/modules/selectors';
import Loader from '../../batteries/components/shared/Loader/Spinner';

class PreferencesFormWrapper extends React.Component {
	constructor(props) {
		super(props);
		this.form = FormBuilder.group({
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
				credentials: ['', Validators.required],
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
						showPopularSearches: false,
						showRecentSuggestions: false,
						enableAutoSuggestions: true,
						enableVoiceSearch: true,
						enablePredictiveSuggestions: false,
						enableSuggestionsHighlights: false,
						showSelectedFilters: true,
						showPagination: false,
						showResultView: 'grid',
						showResultViewSwitcher: true,
						customMessages: FormBuilder.group({
							resultStats: '[count] products found in [time] ms',
							noFilterItem: 'No items Found',
							noResultItem: 'No Results Found!',
							noSuggestion: 'No suggestions found for <mark>[term]</mark>',
							fetchingFilterOptions: 'Fetching Options',
							searchText: 'Click here to search',
							searchIcon: ['', validateURL],
						}),
						staticFilters: FormBuilder.group({
							productType: getFilterConfigurationForm({
								dataField: { value: '', disabled: true },
							}),
							collections: getFilterConfigurationForm({
								dataField: { value: '', disabled: true },
							}),
							color: getFilterConfigurationForm(),
							size: getFilterConfigurationForm(),
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
		// Fetch preferences and update redux store
		const {
			isRecommendation,
			fetchSearchPreferences,
			fetchRecommendationsPreferences,
		} = this.props;
		if (isRecommendation) {
			fetchRecommendationsPreferences();
		} else {
			fetchSearchPreferences();
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

		this.form.get('enableAutoSuggestions').valueChanges.subscribe((value) => {
			const autoSuggestionSettingsControl = this.form.get('autoSuggestionSettings');

			if (value) {
				autoSuggestionSettingsControl.enable();
			} else {
				autoSuggestionSettingsControl.disable();
			}
		});
	}

	componentDidUpdate(prevProps) {
		const { isRecommendation, searchPreferences, recommendationsPreferences } = this.props;
		let preferences;
		if (isRecommendation) {
			if (prevProps.recommendationsPreferences !== recommendationsPreferences) {
				preferences = recommendationsPreferences;
			}
		} else if (prevProps.searchPreferences !== searchPreferences) {
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
				this.form.patchValue(
					JSON.parse(
						JSON.stringify({
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
							showResultView: get(preferences, 'resultSettings.layout'),
							showResultViewSwitcher: get(preferences, 'resultSettings.viewSwitcher'),
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
										showPopularSearches: get(
											preferences,
											'searchSettings.rsConfig.enablePopularSuggestions',
										),
										// add search settings here - 'searchSettings.rsConfig.<KEY_NAME)>'
										showRecentSuggestions: get(
											preferences,
											'searchSettings.rsConfig.showRecentSuggestions',
										),
										enablePredictiveSuggestions: get(
											preferences,
											'searchSettings.rsConfig.enablePredictiveSuggestions',
										),
										enableSuggestionsHighlights: get(
											preferences,
											'searchSettings.rsConfig.enableSuggestionsHighlights',
										),
										enableAutoSuggestions: get(
											preferences,
											'searchSettings.rsConfig.enableAutoSuggestions',
										),
										enableVoiceSearch: get(
											preferences,
											'searchSettings.rsConfig.enableVoiceSearch',
										),
										showSelectedFilters: get(
											preferences,
											'globalSettings.showSelectedFilters',
										),
										showPagination: !!get(
											preferences,
											'resultSettings.rsConfig.pagination',
										),
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
											...getFilterMessages(),
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
					),
				);
			} catch (e) {
				console.warn('Error while syncing the preferences', e);
			}
		}
	}

	getPreferencesPayload = () => {
		const { isRecommendation } = this.props;
		const formValue = this.form.value;
		return isRecommendation
			? getRecommendationPreferencesPayload(formValue)
			: getSearchPreferencesPayload(formValue);
	};

	getPreferences = () => {
		const { isRecommendation, index } = this.props;
		const preferencesPayload = this.getPreferencesPayload();
		if (!isRecommendation) {
			if (get(preferencesPayload, 'facetSettings.staticFacets')) {
				preferencesPayload.facetSettings.staticFacets = preferencesPayload.facetSettings.staticFacets.filter(
					(o) => o.enabled,
				);
			}
			if (get(preferencesPayload, 'facetSettings.dynamicFacets')) {
				preferencesPayload.facetSettings.dynamicFacets = preferencesPayload.facetSettings.dynamicFacets.filter(
					(o) => o.enabled,
				);
			}
		}
		preferencesPayload.appbaseSettings = {
			index,
			credentials: `${sessionStorage.getItem('username')}:${sessionStorage.getItem(
				'password',
			)}`,
			url: sessionStorage.getItem('url'),
		};
		return preferencesPayload;
	};

	render() {
		const { children, isFetchingPreferences } = this.props;
		if (isFetchingPreferences) {
			return <Loader />;
		}
		return (
			<FormContext.Provider value={this.form}>
				{children({
					form: this.form,
					getPreferences: this.getPreferences,
					getPreferencesPayload: this.getPreferencesPayload,
				})}
			</FormContext.Provider>
		);
	}
}
PreferencesFormWrapper.defaultProps = {
	isRecommendation: false,
	isFetchingPreferences: false,
	searchPreferences: getSearchPreferencesPayload(defaultSearchPreferences),
	recommendationsPreferences: getRecommendationPreferencesPayload(
		defaultRecommendationsPreferences,
	),
};

PreferencesFormWrapper.propTypes = {
	index: string.isRequired,
	children: func.isRequired,
	fetchSearchPreferences: func.isRequired,
	fetchRecommendationsPreferences: func.isRequired,
	isRecommendation: bool,
	isFetchingPreferences: bool,
	searchPreferences: object,
	recommendationsPreferences: object,
};

const mapStateToProps = (state) => ({
	index: get(state, '$getCurrentApp.name'),
	isFetchingPreferences:
		get(state, '$getSearchPreferences.isFetching') ||
		get(state, '$getRecommendationsPreferences.isFetching'),
	searchPreferences: getSearchPreferencesByName(state),
	recommendationsPreferences: getRecommendationsPreferencesByName(state),
});

const mapDispatchToProps = (dispatch) => ({
	fetchSearchPreferences: () => dispatch(getSearchPreferences()),
	fetchRecommendationsPreferences: () => dispatch(getRecommendationsPreferences()),
});

export default connect(mapStateToProps, mapDispatchToProps)(PreferencesFormWrapper);
