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
							resultTitle: get(preferences, 'resultSettings.fields.title'),
							resultDescription: get(
								preferences,
								'resultSettings.fields.description',
							),
							resultPrice: get(preferences, 'resultSettings.fields.price'),
							resultImage: get(preferences, 'resultSettings.fields.image'),
							resultHandle: get(preferences, 'resultSettings.fields.handle'),
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
