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
	getMultiListProps,
	getPriceFilterConfigurationForm,
	getRecommendationForm,
	CtaActions,
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
						showSelectedFilters: true,
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
		});
	}

	componentDidUpdate(prevProps) {
		const {
			isRecommendation,
			searchPreferences,
			recommendationsPreferences,
			recommendationSuccess,
			searchSuccess,
		} = this.props;
		let preferences;
		if (isRecommendation) {
			if (
				recommendationSuccess !== prevProps.recommendationSuccess &&
				prevProps.recommendationsPreferences !== recommendationsPreferences
			) {
				preferences = recommendationsPreferences;
			}
		} else if (
			searchSuccess !== prevProps.searchSuccess &&
			prevProps.searchPreferences !== searchPreferences
		) {
			preferences = searchPreferences;
		}
		// Sync form values
		if (preferences) {
			try {
				// Add controls for dynamic filters
				const dynamicFilterControl = this.form.get('dynamicFilters');
				get(preferences, 'facetSettings.dynamicFacets', []).forEach(() => {
					const control = getFilterConfigurationForm(null, true);
					control.meta = {
						key: getDynamicFilterKey(control),
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
							resultTitle: get(preferences, 'resultSettings.resultTitle'),
							resultDescription: get(preferences, 'resultSettings.resultDescription'),
							resultPrice: get(preferences, 'resultSettings.resultPrice'),
							resultImage: get(preferences, 'resultSettings.resultImage'),
							resultHandle: get(preferences, 'resultSettings.resultHandle'),
							exportSettings: get(preferences, 'exportSettings'),
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
										),
								  }
								: {
										showPopularSearches: get(
											preferences,
											'searchSettings.rsConfig.enablePopularSearches',
										),
										showSelectedFilters: get(
											preferences,
											'globalSettings.showSelectedFilters',
										),
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
		return JSON.parse(
			JSON.stringify({
				themeSettings: {
					type: get(formValue, 'themeType'),
					customCss: get(formValue, 'customCss'),
					rsConfig: {
						colors: {
							primaryColor: get(formValue, 'primaryColor'),
							primaryTextColor: get(formValue, 'primaryTextColor'),
							textColor: get(formValue, 'textColor'),
							titleColor: get(formValue, 'titleColor'),
						},
						typography: {
							fontFamily: get(formValue, 'fontFamily'),
						},
					},
				},
				globalSettings: {
					currency: get(formValue, 'storeInfo.currency'),
					showSelectedFilters: !!get(formValue, 'showSelectedFilters'),
				},
				exportSettings: get(formValue, 'exportSettings'),
				resultSettings: {
					fields: {
						title: get(formValue, 'resultTitle'),
						description: get(formValue, 'resultDescription'),
						price: get(formValue, 'resultPrice'),
						image: get(formValue, 'resultImage'),
						handle: get(formValue, 'resultHandle'),
					},
					...(isRecommendation
						? {
								customMessages: {
									resultStats: '',
									noResults: '',
								},
								rsConfig: {},
						  }
						: {
								customMessages: {
									resultStats: get(formValue, 'customMessages.resultStats'),
									noResults: get(formValue, 'customMessages.noResultItem'),
								},
								rsConfig: {
									pagination: !!get(formValue, 'showPagination'),
									infiniteScroll: !get(formValue, 'showPagination'),
								},
						  }),
				},
				...(isRecommendation
					? {
							recommendationSettings: {
								ctaTitle: get(formValue, 'ctaTitle'),
								ctaAction: get(formValue, 'ctaAction'),
								recommendations: get(formValue, 'recommendations', []).map(
									(item) => {
										let dataField;
										let productsPageUrl;
										if (item.type === RecommendationTypes.MOST_RECENT) {
											dataField = item.dataFieldMostRecent;
										} else if (
											item.type === RecommendationTypes.SIMILAR_PRODUCTS
										) {
											dataField = item.dataFieldSimilarTo;
											productsPageUrl = `${get(
												item,
												'productsPageHandle.productsPageUrlPrefix',
											)}{${get(
												item,
												'productsPageHandle.productsPageUrlField',
											)}}`;
										}
										return {
											id: String(item.id),
											title: item.title,
											type: item.type,
											productsPageUrl,
											dataField,
											maxProducts: item.maxProducts,
										};
									},
								),
							},
					  }
					: {
							searchSettings: {
								customMessages: {
									noResults: get(formValue, 'customMessages.noSuggestion'),
								},
								searchButton: {
									icon: get(formValue, 'customMessages.searchIcon'),
									text: get(formValue, 'customMessages.searchText'),
								},
								fields: {
									title: get(formValue, 'resultTitle'),
									description: get(formValue, 'resultDescription'),
									price: get(formValue, 'resultPrice'),
									image: get(formValue, 'resultImage'),
									handle: get(formValue, 'resultHandle'),
								},
								rsConfig: {
									enablePopularSearches: get(formValue, 'showPopularSearches'),
								},
							},
							facetSettings: {
								staticFacets: [
									{
										name: 'productType',
										enabled: get(
											formValue,
											'staticFilters.productType.enabled',
										),
										isCollapsible: true,
										customMessages: {
											loading: get(
												formValue,
												'customMessages.fetchingFilterOptions',
											),
											noResults: get(
												formValue,
												'customMessages.noFilterItem',
											),
										},
										rsConfig: {
											...getMultiListProps(
												get(
													formValue,
													'staticFilters.productType.customize',
												),
											),
										},
									},
									{
										name: 'collection',
										enabled: get(
											formValue,
											'staticFilters.collections.enabled',
										),
										isCollapsible: true,
										customMessages: {
											loading: get(
												formValue,
												'customMessages.fetchingFilterOptions',
											),
											noResults: get(
												formValue,
												'customMessages.noFilterItem',
											),
										},
										rsConfig: {
											...getMultiListProps(
												get(
													formValue,
													'staticFilters.collections.customize',
												),
											),
										},
									},
									{
										name: 'color',
										enabled: get(formValue, 'staticFilters.color.enabled'),
										isCollapsible: true,
										customMessages: {
											loading: get(
												formValue,
												'customMessages.fetchingFilterOptions',
											),
											noResults: get(
												formValue,
												'customMessages.noFilterItem',
											),
										},
										rsConfig: {
											...getMultiListProps(
												get(formValue, 'staticFilters.color.customize'),
											),
										},
									},
									{
										name: 'size',
										enabled: get(formValue, 'staticFilters.size.enabled'),
										isCollapsible: true,
										customMessages: {
											loading: get(
												formValue,
												'customMessages.fetchingFilterOptions',
											),
											noResults: get(
												formValue,
												'customMessages.noFilterItem',
											),
										},
										rsConfig: {
											...getMultiListProps(
												get(formValue, 'staticFilters.size.customize'),
											),
										},
									},
									{
										name: 'price',
										enabled: get(formValue, 'staticFilters.price.enabled'),
										isCollapsible: true,
										customMessages: {
											loading: get(
												formValue,
												'customMessages.fetchingFilterOptions',
											),
											noResults: get(
												formValue,
												'customMessages.noFilterItem',
											),
										},
										rsConfig: {
											...getMultiListProps(
												get(formValue, 'staticFilters.price.customize'),
											),
										},
									},
								],
								dynamicFacets: get(formValue, 'dynamicFilters', []).map(
									(filter, filterIndex) => ({
										enabled: filter.enabled,
										customMessages: {
											loading: get(
												formValue,
												'customMessages.fetchingFilterOptions',
											),
											noResults: get(
												formValue,
												'customMessages.noFilterItem',
											),
										},
										rsConfig: {
											componentId: `${get(
												filter,
												'customize.title',
												'',
											).replace(' ', '_')}_${filterIndex}`,
											filterLabel: get(filter, 'customize.title'),
											...getMultiListProps(filter.customize),
										},
									}),
								),
							},
					  }),
			}),
		);
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
	searchSuccess: false,
	recommendationSuccess: false,
	searchPreferences: {},
	recommendationsPreferences: {},
};

PreferencesFormWrapper.propTypes = {
	index: string.isRequired,
	children: func.isRequired,
	fetchSearchPreferences: func.isRequired,
	fetchRecommendationsPreferences: func.isRequired,
	isRecommendation: bool,
	isFetchingPreferences: bool,
	searchSuccess: bool,
	recommendationSuccess: bool,
	searchPreferences: object,
	recommendationsPreferences: object,
};

const mapStateToProps = (state) => ({
	index: get(state, '$getCurrentApp.name'),
	isFetchingPreferences:
		get(state, '$getSearchPreferences.isFetching') ||
		get(state, '$getRecommendationsPreferences.isFetching'),
	searchSuccess: get(state, '$getSearchPreferences.success'),
	recommendationSuccess: get(state, '$getRecommendationsPreferences.success'),
	searchPreferences: getSearchPreferencesByName(state),
	recommendationsPreferences: getRecommendationsPreferencesByName(state),
});

const mapDispatchToProps = (dispatch) => ({
	fetchSearchPreferences: () => dispatch(getSearchPreferences()),
	fetchRecommendationsPreferences: () => dispatch(getRecommendationsPreferences()),
});

export default connect(mapStateToProps, mapDispatchToProps)(PreferencesFormWrapper);
