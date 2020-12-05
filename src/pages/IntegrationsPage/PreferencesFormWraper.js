import React from 'react';
import get from 'lodash/get';
import { string, func } from 'prop-types';
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
import { getURL } from '../../constants/config';

class PreferencesFormWrapper extends React.Component {
	form = FormBuilder.group({
		themeType: 'classic',
		primaryColor: '#0B6AFF',
		primaryTextColor: '#fff',
		textColor: '#424242',
		titleColor: '#424242',
		fontFamily: 'default',
		customCss: '',
		showPopularSearches: false,
		showSelectedFilters: true,
		resultTitle: undefined,
		resultDescription: undefined,
		resultPrice: undefined,
		resultImage: undefined,
		resultHandle: undefined,
		storeInfo: FormBuilder.group({
			currency: 'USD',
		}),
		customMessages: FormBuilder.group({
			resultStats: '[count] products found in [time] ms',
			noFilterItem: 'No items Found',
			noResultItem: 'No Results Found!',
			noSuggestion: 'No suggestions found for <mark>[term]</mark>',
			fetchingSuggestion: 'Loading Suggestions',
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
		exportSettings: FormBuilder.group({
			exportAs: 'embed',
			credentials: [undefined, Validators.required],
			openAsPage: false,
			type: 'other',
		}),
		// Recommendation Specific controls
		ctaTitle: 'View Product',
		ctaAction: CtaActions.REDIRECT_TO_PRODUCT,
		customCssRecommendation: '',
		recommendations: FormBuilder.array([]),
	});

	componentDidMount() {
		window.addEventListener('beforeunload', this.storePreferences);
		// sync form values
		const preferences = localStorage.getItem(this.storeKey, this.form.value);
		if (preferences) {
			try {
				const parsedPreferences = JSON.parse(preferences);
				// Add controls for dynamic filters
				if (get(parsedPreferences, 'dynamicFilters')) {
					const dynamicFilterControl = this.form.get('dynamicFilters');
					get(parsedPreferences, 'dynamicFilters').forEach(() => {
						const control = getFilterConfigurationForm(null, true);
						control.meta = {
							key: getDynamicFilterKey(control),
						};
						dynamicFilterControl.push(control);
					});
				}
				// Add controls for recommendations
				if (get(parsedPreferences, 'recommendations')) {
					const recommendationsControl = this.form.get('recommendations');
					get(parsedPreferences, 'recommendations').forEach((recommendation) => {
						const control = getRecommendationForm(recommendation.type);
						recommendationsControl.push(control);
					});
				}
				// Patch form value
				this.form.patchValue(parsedPreferences);
			} catch (e) {
				console.warn('Error while syncing the preferences', e);
			}
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

				colorFilter.patchValue(shopifyDefaultFields.color);
				sizeFilter.patchValue(shopifyDefaultFields.size);
				priceFilter.patchValue(shopifyDefaultFields.price);
			} else {
				// Clear the default fields
				this.form.patchValue({
					resultTitle: undefined,
					resultDescription: undefined,
					resultPrice: undefined,
					resultImage: undefined,
					resultHandle: undefined,
				});
				colorFilter.patchValue(undefined);
				sizeFilter.patchValue(undefined);
				priceFilter.patchValue(undefined);
			}
		});
	}

	componentWillUnmount() {
		this.storePreferences();
		window.removeEventListener('beforeunload', this.storePreferences);
	}

	get storeKey() {
		const { index } = this.props;
		return `${index}__${getURL()}`;
	}

	storePreferences = () => {
		localStorage.setItem(this.storeKey, JSON.stringify(this.form.value));
	};

	getPreferences = () => {
		const { index } = this.props;
		const formValue = this.form.value;
		return {
			themeSettings: {
				type: get(formValue, 'themeType'),
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
				showSelectedFilters: get(formValue, 'showSelectedFilters'),
				customCss: get(formValue, 'customCss'),
			},
			appbaseSettings: {
				index,
				credentials: `${sessionStorage.getItem('username')}:${sessionStorage.getItem(
					'password',
				)}`,
				url: sessionStorage.getItem('url'),
			},
			resultSettings: {
				fields: {
					title: get(formValue, 'resultTitle'),
					description: get(formValue, 'resultDescription'),
					price: get(formValue, 'resultPrice'),
					image: get(formValue, 'resultImage'),
					handle: get(formValue, 'resultHandle'),
				},
				customMessages: {
					resultStats: get(formValue, 'customMessages.resultStats'),
					noResults: get(formValue, 'customMessages.noResultItem'),
				},
				showDescription: true,
				rsConfig: {
					pagination: get(formValue, 'showPagination'),
					infiniteScroll: !get(formValue, 'showPagination'),
				},
			},
			searchSettings: {
				showPopularSearches: get(formValue, 'showPopularSearches'),
				customMessages: {
					loading: get(formValue, 'customMessages.fetchingSuggestion'),
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
				rsConfig: {},
			},
			facetSettings: {
				staticFacets: [
					...(get(formValue, 'staticFilters.productType.enabled')
						? [
								{
									name: 'productType',
									isCollapsible: true,
									customMessages: {
										loading: get(
											formValue,
											'customMessages.fetchingFilterOptions',
										),
										noResults: get(formValue, 'customMessages.noFilterItem'),
									},
									rsConfig: {
										...getMultiListProps(
											get(formValue, 'staticFilters.productType.customize'),
										),
									},
								},
						  ]
						: []),
					...(get(formValue, 'staticFilters.collections.enabled')
						? [
								{
									name: 'collection',
									isCollapsible: true,
									customMessages: {
										loading: get(
											formValue,
											'customMessages.fetchingFilterOptions',
										),
										noResults: get(formValue, 'customMessages.noFilterItem'),
									},
									rsConfig: {
										...getMultiListProps(
											get(formValue, 'staticFilters.collections.customize'),
										),
									},
								},
						  ]
						: []),
					...(get(formValue, 'staticFilters.color.enabled')
						? [
								{
									name: 'color',
									isCollapsible: true,
									customMessages: {
										loading: get(
											formValue,
											'customMessages.fetchingFilterOptions',
										),
										noResults: get(formValue, 'customMessages.noFilterItem'),
									},
									rsConfig: {
										...getMultiListProps(
											get(formValue, 'staticFilters.color.customize'),
										),
									},
								},
						  ]
						: []),
					...(get(formValue, 'staticFilters.size.enabled')
						? [
								{
									name: 'size',
									isCollapsible: true,
									customMessages: {
										loading: get(
											formValue,
											'customMessages.fetchingFilterOptions',
										),
										noResults: get(formValue, 'customMessages.noFilterItem'),
									},
									rsConfig: {
										...getMultiListProps(
											get(formValue, 'staticFilters.size.customize'),
										),
									},
								},
						  ]
						: []),
					...(get(formValue, 'staticFilters.price.enabled')
						? [
								{
									name: 'price',
									isCollapsible: true,
									customMessages: {
										loading: get(
											formValue,
											'customMessages.fetchingFilterOptions',
										),
										noResults: get(formValue, 'customMessages.noFilterItem'),
									},
									rsConfig: {
										...getMultiListProps(
											get(formValue, 'staticFilters.price.customize'),
										),
									},
								},
						  ]
						: []),
				],
				dynamicFacets: get(formValue, 'dynamicFilters', [])
					.filter((facet) => facet.enabled)
					.map((filter, filterIndex) => ({
						customMessages: {
							loading: get(formValue, 'customMessages.fetchingFilterOptions'),
							noResults: get(formValue, 'customMessages.noFilterItem'),
						},
						rsConfig: {
							componentId: `${get(filter, 'customize.title', '').replace(
								' ',
								'_',
							)}_${filterIndex}`,
							filterLabel: get(filter, 'customize.title'),
							...getMultiListProps(filter.customize),
						},
					})),
			},
			recommendationSettings: {
				ctaTitle: get(formValue, 'ctaTitle'),
				ctaAction: get(formValue, 'ctaAction'),
				customCssRecommendation: get(formValue, 'customCssRecommendation'),
				recommendations: get(formValue, 'recommendations', []).map((item) => {
					let dataField;
					let productsPageUrl;
					if (item.type === RecommendationTypes.MOST_RECENT) {
						dataField = item.dataFieldMostRecent;
					} else if (item.type === RecommendationTypes.SIMILAR_PRODUCTS) {
						dataField = item.dataFieldSimilarTo;
						productsPageUrl = `${get(
							item,
							'productsPageHandle.productsPageUrlPrefix',
						)}{${get(item, 'productsPageHandle.productsPageUrlField')}}`;
					}
					return {
						id: item.id,
						title: item.title,
						type: item.type,
						productsPageUrl,
						dataField,
						maxProducts: item.maxProducts,
					};
				}),
			},
			exportType: get(formValue, 'exportSettings.type'),
			openAsPage: get(formValue, 'exportSettings.openAsPage'),
		};
	};

	render() {
		const { children } = this.props;
		return (
			<FormContext.Provider value={this.form}>
				{children({
					form: this.form,
					getPreferences: this.getPreferences,
				})}
			</FormContext.Provider>
		);
	}
}

PreferencesFormWrapper.propTypes = {
	index: string.isRequired,
	children: func.isRequired,
};

const mapStateToProps = (state) => ({
	index: get(state, '$getCurrentApp.name'),
});

export default connect(mapStateToProps)(PreferencesFormWrapper);
