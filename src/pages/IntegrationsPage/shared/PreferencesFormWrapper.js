import React from 'react';
import get from 'lodash/get';
import { string, func, bool, object, array } from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { css } from 'react-emotion';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { FormBuilder, Validators } from 'react-reactive-form';
import { componentTypes } from '@appbaseio/reactivesearch';
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
	getChartConfigurationForm,
	getChartKey,
	filterConfigurationFormDefaultFields,
	perPageDependentKeys,
} from '../utils/utils';
import {
	getSearchPreferenceById,
	getRecommendationPreferenceById,
} from '../../../batteries/modules/selectors';
import {
	getSearchPreferences as getSearchPreferencesAction,
	getRecommendationsPreferences as getRecommendationsPreferencesAction,
	getSearchPreferenceLatestVersion as getSearchPreferenceLatestVersionAction,
	getSearchPreferenceVersions as getSearchPreferenceVersionsAction,
} from '../../../batteries/modules/actions';
import AppConstants from '../../../batteries/modules/constants';
import { removeEmpty, reOrderPreferences } from '../utils/index';
import { BACKENDS } from '../../../batteries/utils';
import { replaceWithPreferences } from '../utils/sandpack-generator';
import { transformContent } from './ExportInline/Components/ModalHeader';

const modalStyles = css`
	.header-container {
		padding: 16px 24px;
		position: absolute;
		top: 0;
		right: 0;
		left: 0;
		z-index: 999;
		height: 85px;
	}
	.header-title-container {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.close-icon {
		cursor: pointer;
	}
	.header-font {
		font-size: 20px;
	}
	.right-partition {
		display: flex;
		align-items: center;
		gap: 20px;
	}
	.status-container {
		float: right;
		margin: 5px 50px 0px 0px;
		cursor: pointer;
	}
	.commit-font {
		font-size: 14px;
	}
	.versionid-font {
		font-size: 12px;
	}
	.overflow-container {
		max-width: 150px;
		margin: 0;
		text-overflow: ellipsis;
		overflow: hidden;
		white-space: nowrap;
	}
	.overflow {
		text-overflow: ellipsis;
		white-space: nowrap;
		overflow: hidden;
	}
	.header-icons {
		display: flex;
		gap: 20px;
		font-size: 18px;
		align-items: center;

	.ant-switch-inner {
		display: flex;
	}
`;
class PreferencesFormWrapper extends React.Component {
	constructor(props) {
		super(props);
		this.isFusion = props.backend === BACKENDS.FUSION.name;
		this.isMongoDB = props.backend === BACKENDS.MONGODB.name;
		this.form = FormBuilder.group({
			name: '',
			description: '',
			pipeline: [undefined, Validators.required],
			url: ['/_fusion/_reactivesearch', Validators.required],
			method: 'POST',
			headers: '',
			backend: props.backend || BACKENDS.ELASTICSEARCH.name,
			...(this.isFusion && {
				pipeline: '_fusion',
				app: '',
				profile: '',
				searchProfile: '',
			}),
			...(this.isMongoDB && {
				db: '',
				collection: '',
			}),
			id: '',
			currentPage: '',
			// Custom Logo Settings
			logoUrl: '',
			logoWidth: 200,
			logoAlignment: 'left',
			// Common controls =>>>>> Starts
			themeType: 'classic',
			primaryColor: '#0B6AFF',
			primaryTextColor: '#fff',
			textColor: '#424242',
			titleColor: '#424242',
			fontFamily: 'Open Sans',
			fontWeight: 400,
			bodyBackgroundColor: '#fff',
			navbarBackgroundColor: '#001628',
			linkColor: '#3eb0ef',
			customCss: '',
			// result fields
			resultTitle: '',
			resultDescription: '',
			resultPrice: '',
			priceUnit: undefined,
			resultImage: '',
			resultHandle: '',
			metaDataFields: [],
			cssSelector: '',
			storeInfo: FormBuilder.group({
				currency: 'USD',
			}),
			exportSettings: FormBuilder.group({
				exportAs: 'embed',
				credentials: '',
				openAsPage: false,
				type: 'other',
			}),
			authenticationSettings: FormBuilder.group({
				enableAuth0: false,
				enableProfilePage: true,
				profileSettingsForm: FormBuilder.group({
					viewData: true,
					editData: true,
					closeAccount: true,
					editThemeSettings: true,
					editSearchPreferences: true,
				}),
				clientId: '',
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
						resultHandleViewer: 'link',
						versionId: '',
						templateVersionId: '',
						autoSuggestionSettings: FormBuilder.group({
							enablePopularSuggestions: false,
							enableRecentSearches: false,
							highlight: false,
						}),
						showSearchAs: 'sticky',
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
							redirectUrlText: 'Open URL',
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
						charts: FormBuilder.array([]),
						syncSettings: FormBuilder.group({
							product_sync: [{ value: true, disabled: true }],
							smartcollection_sync: [{ value: true, disabled: true }],
							customcollection_sync: [{ value: true, disabled: true }],
							collect_sync: [{ value: false, disabled: false }],
							metafield_sync: [{ value: false, disabled: false }],
							namedtags_sync: [{ value: false, disabled: false }],
						}),
						pageSettings: {
							pages: {},
							fields: {},
						},
						displayFields: FormBuilder.group({}),
						categoryField: '',
						categoryFieldValue: [],
						indexSettings: FormBuilder.group({
							index: '',
							fusionSettings: FormBuilder.group({
								app: '',
								profile: '',
								searchProfile: '',
								meta: FormBuilder.group({ sponsoredProfile: '' }),
							}),
							endpoint: FormBuilder.group({
								url: '',
								method: '',
								headers: '',
							}),
						}),
				  }),
		});
		this.state = {
			currentPage: '',
		};
		const {
			getSearchPreferenceVersions,
			preferenceId,
			getLatestVersionCode,
			searchPreferences,
			updateVersionStateForPreference,
			isWizard,
			isRecommendation,
		} = this.props;
		if (!isWizard && !isRecommendation) {
			getSearchPreferenceVersions(preferenceId);
			getLatestVersionCode(preferenceId)
				.then(async (response) => {
					if (response.payload) {
						const { res } = response.payload;
						if (res.content) {
							const newContent = transformContent(res.content);
							const updatedCodeResponse = await replaceWithPreferences(
								newContent,
								searchPreferences,
							);
							updateVersionStateForPreference({
								preferenceId,
								patchPayload: {
									updatedCode: updatedCodeResponse,
									sandpackCode: updatedCodeResponse,
									initialCode: newContent,
								},
							});
						}
					}
				})
				.catch((err) => {
					console.error('Error to fetch latest version', err);
				});
		}
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

		if (this.form.get('categoryField')) {
			this.form.get('categoryField').valueChanges.subscribe((value) => {
				const displayFieldsControl = this.form.get('displayFields');
				if (value)
					displayFieldsControl.addControl(
						'_default',
						FormBuilder.group(
							removeEmpty({
								resultTitle: this.form.get('resultTitle').value,
								resultDescription: this.form.get('resultDescription').value,
								resultPrice: this.form.get('resultPrice').value,
								priceUnit: this.form.get('priceUnit').value,
								resultImage: this.form.get('resultImage').value,
								resultHandle: this.form.get('resultHandle').value,
								resultHandleViewer: this.form.get('resultHandleViewer').value,
								metaDataFields: JSON.stringify(
									this.form.get('metaDataFields').value,
								),
								cssSelector: this.form.get('cssSelector').value,
							}),
						),
					);
				else {
					Object.keys(displayFieldsControl.value).forEach((field) =>
						displayFieldsControl.removeControl(field),
					);
				}
			});
		}
		if (this.form.get('categoryFieldValue')) {
			this.form.get('categoryFieldValue').valueChanges.subscribe((values) => {
				const displayFieldsControl = this.form.get('displayFields');
				const removedFields = Object.keys(displayFieldsControl.value).filter(
					(field) => !values.includes(field) && field !== '_default',
				);

				removedFields.forEach((field) => {
					displayFieldsControl.removeControl(field);
				});
			});
		}
		const getNewPageSettings = (formValue) => {
			const pages = get(formValue, 'pageSettings.pages', {});
			const currentPage = get(formValue, 'currentPage', {});
			const newPages = {};
			const payload = getSearchPreferencesPayload(formValue);
			Object.keys(pages).forEach((page) => {
				newPages[page] = {
					...pages[page],
				};
				if (page === currentPage) {
					newPages[page].indexSettings = get(formValue, 'indexSettings');
					const compSettings = { ...newPages[page].componentSettings };

					// always extract out facets from the form state
					// as facets could be removed or added, relying on the pageSettings object in the form
					// can leave out newly added/ removed facets
					const facetKeys = [
						{ facetId: 'result', facetType: 'result' },
						{ facetId: 'search', facetType: 'search' },
					];
					payload.chartSettings.charts.forEach((chartItem, index) => {
						if (chartItem.rsConfig && chartItem.rsConfig.componentId) {
							facetKeys.push({
								facetId: chartItem.rsConfig.componentId,
								facetType: chartItem.rsConfig.componentType,
								index,
							});
						}
					});
					payload.facetSettings.dynamicFacets.forEach((item, index) => {
						if (item.rsConfig && item.rsConfig.componentId) {
							facetKeys.push({
								facetId: item.rsConfig.componentId,
								facetType: item.rsConfig.componentType,
								index,
							});
						}
					});

					// remove deleted facets from pageSettings
					Object.keys(compSettings).forEach((componentFacetKey) => {
						if (!facetKeys.includes(componentFacetKey)) {
							delete compSettings[componentFacetKey];
						}
					});

					// further page's component settings
					facetKeys.forEach(({ facetId, facetType, index }) => {
						let facetSettingsObject = compSettings[facetId];
						if (!facetSettingsObject) {
							if (facetType !== 'search' && facetType !== 'result') {
								if (facetType === componentTypes.reactiveChart) {
									facetSettingsObject = payload.chartSettings.charts[index];
								} else {
									facetSettingsObject =
										payload.facetSettings.dynamicFacets[index];
								}
							}
						}
						if (facetId !== 'search' && facetId !== 'result') {
							// If component is a chart
							if (
								facetSettingsObject.rsConfig.componentType ===
								componentTypes.reactiveChart
							) {
								const arr = facetSettingsObject.rsConfig.componentId.split('_');
								const idx = arr.pop() || 0;

								compSettings[facetId] = payload.chartSettings.charts[idx];
							} else if (facetSettingsObject.rsConfig.title) {
								if (facetSettingsObject.facetType !== 'static') {
									const arr = facetSettingsObject.rsConfig.componentId.split('_');
									const idx = arr.pop() || 0;
									compSettings[facetId] =
										payload.facetSettings.dynamicFacets[idx];
								}
							}
						} else if (facetId === 'result') {
							compSettings[facetId] = payload.resultSettings;
						} else if (facetId === 'search') {
							compSettings[facetId] = payload.searchSettings;
						}
					});
					newPages[page].componentSettings = compSettings;
				}
			});

			const newPageSettings = {
				pages: newPages,
				currentPage: get(formValue, 'currentPage'),
				fields: get(formValue, 'pageSettings.fields'),
			};

			return newPageSettings;
		};

		if (!isRecommendation) {
			// we update the pageSettings on every update of a property which is per page level
			perPageDependentKeys.forEach((key) => {
				if (this.form.get(key)) {
					this.form.get(key).valueChanges.subscribe(() => {
						if (this.form.get('pageSettings')) {
							this.form.get('pageSettings').setValue({
								...getNewPageSettings(this.form.getRawValue()),
							});
						}
					});
				}
			});
		}
	}

	componentDidUpdate(prevProps) {
		const { currentPage } = this.state;
		const { searchPreferences, recommendationsPreferences } = this.props;
		if (
			prevProps.searchPreferences !== searchPreferences ||
			prevProps.recommendationsPreferences !== recommendationsPreferences
		) {
			this.getFormPreferences();
			const newPage = get(searchPreferences, 'pageSettings.currentPage', '');
			if (currentPage !== newPage) {
				// eslint-disable-next-line
				this.setState({
					currentPage: newPage,
				});
			}
		}
	}

	getMetaDataFields = (meta) => {
		if (meta && Array.isArray(meta)) return meta;
		const newMeta = Object.keys(meta || {}).map((key) => {
			return {
				label: key,
				dataField: meta[key].dataField || '',
				highlight: meta[key].highlight || false,
			};
		});

		return newMeta;
	};

	transformSearchPreferences = (preferences) => {
		const { backend } = this.props;
		const resetFormArrayControls = () => {
			const dynamicFilterControl = this.form.get('dynamicFilters');
			if (dynamicFilterControl) {
				dynamicFilterControl.controls = [];
			}
			const chartsControl = this.form.get('charts');
			if (chartsControl) {
				chartsControl.controls = [];
			}
			const recommendationsControl = this.form.get('recommendations');
			if (recommendationsControl) {
				recommendationsControl.controls = [];
			}
		};
		const resetFormGroupControls = () => {
			const displayFieldsControl = this.form.get('displayFields');
			if (displayFieldsControl) displayFieldsControl.reset({});
		};
		const getFilterMessages = () => {
			let noFilterItem;
			let fetchingFilterOptions;
			get(preferences, 'facetSettings.dynamicFacets', []).forEach((i) => {
				noFilterItem = get(i, 'customMessages.noResults');
				fetchingFilterOptions = get(i, 'customMessages.loading');
			});
			return {
				noFilterItem,
				fetchingFilterOptions,
			};
		};
		resetFormArrayControls();
		resetFormGroupControls();
		// Add controls for dynamic filters
		const dynamicFilterControl = this.form.get('dynamicFilters');
		get(preferences, 'facetSettings.dynamicFacets', []).forEach((data, index) => {
			const control = getFilterConfigurationForm(data.rsConfig, true);
			control.meta = {
				key: getDynamicFilterKey(index),
			};
			dynamicFilterControl.push(control);
		});
		const chartsControl = this.form.get('charts');
		get(preferences, 'chartSettings.charts', []).forEach((chart, index) => {
			const control = getChartConfigurationForm(chart.rsConfig);
			control.meta = {
				key: getChartKey(index),
			};
			chartsControl.push(control);
		});

		const displayFieldsObj = {};
		const displayFieldsControl = this.form.get('displayFields');
		const displayFieldsPrefs = get(preferences, 'resultSettings.displayFields', {});
		Object.keys(displayFieldsPrefs).forEach((field) => {
			const newControlObj = {
				resultTitle: get(displayFieldsPrefs[field], 'title'),
				resultDescription: get(displayFieldsPrefs[field], 'description'),
				resultPrice: get(displayFieldsPrefs[field], 'price'),
				priceUnit: get(displayFieldsPrefs[field], 'priceUnit'),
				resultImage: get(displayFieldsPrefs[field], 'image'),
				resultHandle: get(displayFieldsPrefs[field], 'handle'),
				resultHandleViewer: get(displayFieldsPrefs[field], 'handleViewer'),
				metaDataFields: JSON.stringify(
					// this.getMetaDataFields(
					get(displayFieldsPrefs[field], 'userDefinedFields'),
					// ),
				),
				cssSelector: get(displayFieldsPrefs[field], 'cssSelector'),
			};
			displayFieldsControl.addControl(field, FormBuilder.group(newControlObj));

			displayFieldsObj[field] = newControlObj;
		});

		try {
			const patchVar = JSON.parse(
				JSON.stringify({
					name: get(preferences, 'name', ''),
					description: get(preferences, 'description', ''),
					pipeline: get(preferences, 'pipeline', ''),
					url: get(preferences, 'globalSettings.endpoint.url', ''),
					method: get(preferences, 'globalSettings.endpoint.method', ''),
					headers: get(preferences, 'globalSettings.endpoint.headers', ''),
					backend: backend || BACKENDS.ELASTICSEARCH.name,
					...(this.isFusion && {
						pipeline: '_fusion',
						app: get(preferences, 'fusionSettings.app', ''),
						profile: get(preferences, 'fusionSettings.profile', ''),
						searchProfile: get(preferences, 'fusionSettings.searchProfile', ''),
					}),
					...(this.isMongoDB && {
						db: get(preferences, 'globalSettings.meta.mongoDBSettings.db', ''),
						collection: get(
							preferences,
							'globalSettings.meta.mongoDBSettings.collection',
							'',
						),
					}),
					id: get(preferences, 'id', ''),
					currentPage: get(preferences, 'pageSettings.currentPage', ''),
					logoUrl: get(preferences, 'globalSettings.meta.branding.logoUrl', ''),
					logoWidth: get(preferences, 'globalSettings.meta.branding.logoWidth', 200),
					logoAlignment: get(
						preferences,
						'globalSettings.meta.branding.logoAlignment',
						'left',
					),
					themeType: get(preferences, 'themeSettings.type'),
					primaryColor: get(preferences, 'themeSettings.rsConfig.colors.primaryColor'),
					primaryTextColor: get(
						preferences,
						'themeSettings.rsConfig.colors.primaryTextColor',
					),
					textColor: get(preferences, 'themeSettings.rsConfig.colors.textColor'),
					titleColor: get(preferences, 'themeSettings.rsConfig.colors.titleColor'),
					fontFamily: get(preferences, 'themeSettings.rsConfig.typography.fontFamily'),
					bodyBackgroundColor: get(preferences, 'themeSettings.meta.bodyBackgroundColor'),
					navbarBackgroundColor: get(
						preferences,
						'themeSettings.meta.navbarBackgroundColor',
					),
					linkColor: get(preferences, 'themeSettings.meta.linkColor'),
					fontWeight: get(preferences, 'themeSettings.meta.fontWeight'),
					customCss: get(preferences, 'themeSettings.customCss'),
					// result fields
					resultTitle: get(preferences, 'resultSettings.fields.title'),
					resultDescription: get(preferences, 'resultSettings.fields.description'),
					resultPrice: get(preferences, 'resultSettings.fields.price'),
					priceUnit: get(preferences, 'resultSettings.fields.priceUnit'),
					resultImage: get(preferences, 'resultSettings.fields.image'),
					resultHandle: get(preferences, 'resultSettings.fields.handle'),

					metaDataFields: this.getMetaDataFields(
						get(preferences, 'resultSettings.fields.userDefinedFields'),
					),
					cssSelector: get(preferences, 'resultSettings.fields.cssSelector'),
					exportSettings: get(preferences, 'exportSettings'),
					storeInfo: {
						currency: get(preferences, 'globalSettings.currency'),
					},
					versionId: get(preferences, 'globalSettings.meta.deploySettings.versionId', ''),
					deploymentURL: get(
						preferences,
						'globalSettings.meta.deploySettings.deploymentURL',
						'',
					),
					previewImage: get(
						preferences,
						'globalSettings.meta.deploySettings.previewImage',
						'',
					),
					templateVersionId: get(
						preferences,
						'globalSettings.meta.templateSettings.templateVersionId',
						'',
					),
					autosuggest: get(preferences, 'searchSettings.rsConfig.autosuggest'),
					showSearchAs: get(preferences, 'searchSettings.showSearchAs', 'sticky'),
					showVoiceSearch: get(preferences, 'searchSettings.rsConfig.showVoiceSearch'),
					enablePopularSuggestions: get(
						preferences,
						'searchSettings.rsConfig.enablePopularSuggestions',
					),
					enablePredictiveSuggestions: get(
						preferences,
						'searchSettings.rsConfig.enablePredictiveSuggestions',
					),
					showSelectedFilters: get(preferences, 'globalSettings.showSelectedFilters'),
					showPagination: !!get(preferences, 'resultSettings.rsConfig.pagination'),
					sortOptionSelector: get(preferences, 'resultSettings.sortOptionSelector'),
					resultHighlight: get(preferences, 'resultSettings.resultHighlight', false),
					layout: get(preferences, 'resultSettings.layout') || 'grid',
					viewSwitcher: get(preferences, 'resultSettings.viewSwitcher'),
					...(get(preferences, 'themeSettings.type') === 'geo' && {
						mapLayout: get(preferences, 'resultSettings.mapLayout', 'map'),
						mapComponent: get(preferences, 'resultSettings.mapComponent', 'googleMap'),
						locationDataField: get(preferences, 'resultSettings.locationDataField', ''),
						defaultZoom: get(preferences, 'resultSettings.defaultZoom', 13),
						showSearchAsMove: get(preferences, 'resultSettings.showSearchAsMove'),
						showMarkerClusters: get(preferences, 'resultSettings.showMarkerClusters'),
						mapsAPIkey: get(preferences, 'resultSettings.mapsAPIkey'),
					}),
					syncSettings: get(preferences, 'syncSettings') || {},
					customMessages: {
						resultStats: get(preferences, 'resultSettings.customMessages.resultStats'),
						noResultItem: get(preferences, 'resultSettings.customMessages.noResults'),
						noSuggestion: get(preferences, 'searchSettings.customMessages.noResults'),
						searchText: get(preferences, 'searchSettings.searchButton.text'),
						searchIcon: get(preferences, 'searchSettings.searchButton.icon'),
						redirectUrlText: get(preferences, 'searchSettings.redirectUrlText'),
						redirectUrlIcon: get(preferences, 'searchSettings.redirectUrlIcon'),
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
						highlight: get(preferences, 'searchSettings.rsConfig.highlight'),
					},
					dynamicFilters: get(preferences, 'facetSettings.dynamicFacets', []).map(
						(facet) => ({
							enabled: facet.enabled,
							customize: filterConfigurationFormDefaultFields(get(facet, 'rsConfig')),
						}),
					),
					charts: get(preferences, 'chartSettings.charts', []).map((chart) => ({
						enabled: chart.enabled,
						customize: get(chart, 'rsConfig'),
					})),
					pageSettings: get(preferences, 'pageSettings', {}),
					displayFields: displayFieldsObj,
					categoryField: get(preferences, 'resultSettings.categoryField', ''),
					categoryFieldValue: get(preferences, 'resultSettings.categoryFieldValue', []),
					indexSettings: get(preferences, 'indexSettings', {}),
				}),
			);
			this.form.patchValue(patchVar);
		} catch (e) {
			console.error(e);
		}
	};

	getFormPreferences = () => {
		const { isRecommendation, searchPreferences, recommendationsPreferences, backend } =
			this.props;
		const newSearchPreferences = reOrderPreferences(searchPreferences);

		let preferences;
		if (isRecommendation) {
			preferences = recommendationsPreferences;
		} else {
			preferences = newSearchPreferences;
		}
		const resetFormArrayControls = () => {
			const dynamicFilterControl = this.form.get('dynamicFilters');
			if (dynamicFilterControl) {
				dynamicFilterControl.controls = [];
			}
			const chartsControl = this.form.get('charts');
			if (chartsControl) {
				chartsControl.controls = [];
			}
			const recommendationsControl = this.form.get('recommendations');
			if (recommendationsControl) {
				recommendationsControl.controls = [];
			}
		};
		const resetFormGroupControls = () => {
			const displayFieldsControl = this.form.get('displayFields');
			if (displayFieldsControl) displayFieldsControl.reset({});
		};
		// Sync form values
		if (preferences) {
			try {
				// Reset dynamic controls
				resetFormArrayControls();
				resetFormGroupControls();
				// Add controls for dynamic filters
				const dynamicFilterControl = this.form.get('dynamicFilters');
				get(preferences, 'facetSettings.dynamicFacets', []).forEach((data, index) => {
					const control = getFilterConfigurationForm(data.rsConfig, true);
					control.meta = {
						key: getDynamicFilterKey(index),
					};
					dynamicFilterControl.push(control);
				});
				const chartsControl = this.form.get('charts');
				get(preferences, 'chartSettings.charts', []).forEach((chart, index) => {
					const control = getChartConfigurationForm(chart.rsConfig);
					control.meta = {
						key: getDynamicFilterKey(index),
					};
					chartsControl.push(control);
				});
				// Add controls for recommendations
				const recommendationsControl = this.form.get('recommendations');
				get(preferences, 'recommendationSettings.recommendations', []).forEach(
					(recommendation) => {
						const control = getRecommendationForm(recommendation.type);
						recommendationsControl.push(control);
					},
				);

				const displayFieldsObj = {};
				const displayFieldsControl = this.form.get('displayFields');
				const displayFieldsPrefs = get(preferences, 'resultSettings.displayFields', {});
				Object.keys(displayFieldsPrefs).forEach((field) => {
					const newControlObj = {
						resultTitle: get(displayFieldsPrefs[field], 'title'),
						resultDescription: get(displayFieldsPrefs[field], 'description'),
						resultPrice: get(displayFieldsPrefs[field], 'price'),
						priceUnit: get(displayFieldsPrefs[field], 'priceUnit'),
						resultImage: get(displayFieldsPrefs[field], 'image'),
						resultHandle: get(displayFieldsPrefs[field], 'handle'),
						resultHandleViewer: get(displayFieldsPrefs[field], 'handleViewer'),
						metaDataFields: JSON.stringify(
							// this.getMetaDataFields(
							get(displayFieldsPrefs[field], 'userDefinedFields'),
							// ),
						),
						cssSelector: get(displayFieldsPrefs[field], 'cssSelector'),
					};
					displayFieldsControl.addControl(field, FormBuilder.group(newControlObj));
					displayFieldsObj[field] = newControlObj;
				});

				const getFilterMessages = () => {
					let noFilterItem;
					let fetchingFilterOptions;
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
							url: get(preferences, 'globalSettings.endpoint.url', ''),
							method: get(preferences, 'globalSettings.endpoint.method', ''),
							headers: get(preferences, 'globalSettings.endpoint.headers', ''),
							backend: backend || BACKENDS.ELASTICSEARCH.name,
							...(this.isFusion && {
								pipeline: '_fusion',
								app: get(preferences, 'fusionSettings.app', ''),
								profile: get(preferences, 'fusionSettings.profile', ''),
								searchProfile: get(preferences, 'fusionSettings.searchProfile', ''),
							}),
							...(this.isMongoDB && {
								db: get(preferences, 'globalSettings.meta.mongoDBSettings.db', ''),
								collection: get(
									preferences,
									'globalSettings.meta.mongoDBSettings.collection',
									'',
								),
							}),
							id: get(preferences, 'id', ''),
							currentPage: get(preferences, 'pageSettings.currentPage', ''),
							logoUrl: get(preferences, 'globalSettings.meta.branding.logoUrl', ''),
							logoWidth: get(
								preferences,
								'globalSettings.meta.branding.logoWidth',
								200,
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
							bodyBackgroundColor: get(
								preferences,
								'themeSettings.meta.bodyBackgroundColor',
							),
							navbarBackgroundColor: get(
								preferences,
								'themeSettings.meta.navbarBackgroundColor',
							),
							linkColor: get(preferences, 'themeSettings.meta.linkColor'),
							fontWeight: get(preferences, 'themeSettings.meta.fontWeight'),
							customCss: get(preferences, 'themeSettings.customCss'),
							// result fields
							resultTitle: get(preferences, 'resultSettings.fields.title'),
							resultDescription: get(
								preferences,
								'resultSettings.fields.description',
							),
							resultPrice: get(preferences, 'resultSettings.fields.price'),
							priceUnit: get(preferences, 'resultSettings.fields.priceUnit'),
							resultImage: get(preferences, 'resultSettings.fields.image'),
							resultHandle: get(preferences, 'resultSettings.fields.handle'),
							metaDataFields: this.getMetaDataFields(
								get(preferences, 'resultSettings.fields.userDefinedFields'),
							),
							cssSelector: get(preferences, 'resultSettings.fields.cssSelector'),
							exportSettings: get(preferences, 'exportSettings'),
							storeInfo: {
								currency: get(preferences, 'globalSettings.currency'),
							},
							authenticationSettings: get(preferences, 'authenticationSettings'),
							profileSettingsForm: get(
								preferences,
								'authenticationSettings.profileSettingsForm',
							),
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
										resultHandleViewer: get(
											preferences,
											'resultSettings.fields.handleViewer',
											'link',
										),
										versionId: get(
											preferences,
											'globalSettings.meta.deploySettings.versionId',
											'',
										),
										deploymentURL: get(
											preferences,
											'globalSettings.meta.deploySettings.deploymentURL',
											'',
										),
										templateVersionId: get(
											preferences,
											'globalSettings.meta.templateSettings.templateVersionId',
											'',
										),
										autosuggest: get(
											preferences,
											'searchSettings.rsConfig.autosuggest',
										),
										showSearchAs: get(
											preferences,
											'searchSettings.showSearchAs',
											'sticky',
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
										dynamicFilters: get(
											preferences,
											'facetSettings.dynamicFacets',
											[],
										).map((facet) => ({
											enabled: facet.enabled,
											customize: filterConfigurationFormDefaultFields(
												get(facet, 'rsConfig'),
											),
										})),
										charts: get(preferences, 'chartSettings.charts', []).map(
											(chart) => ({
												enabled: chart.enabled,
												customize: get(chart, 'rsConfig'),
											}),
										),
										pageSettings: get(preferences, 'pageSettings', {}),
										displayFields: displayFieldsObj,
										categoryField: get(
											preferences,
											'resultSettings.categoryField',
											'',
										),
										categoryFieldValue: get(
											preferences,
											'resultSettings.categoryFieldValue',
											[],
										),
										indexSettings: get(preferences, 'indexSettings', {}),
								  }),
						}),
					);
					this.form.reset(patchVar);
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
						priceUnit: undefined,
						resultImage: '',
						resultHandle: '',
						cssSelector: '',
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

		if (!this.form.get('currentPage').valueChanges.observers.length) {
			this.form.get('currentPage').valueChanges.subscribe(async (value) => {
				if (value) {
					const { currentPage } = this.state;
					if (value !== currentPage) {
						this.setState(
							{
								currentPage: value,
							},
							() =>
								this.transformSearchPreferences(
									reOrderPreferences(this.getPreferencesPayload(), value),
								),
						);
					}
				}
			});
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
			if (get(preferencesPayload, 'facetSettings.dynamicFacets')) {
				preferencesPayload.facetSettings.dynamicFacets =
					preferencesPayload.facetSettings.dynamicFacets.filter((o) => o.enabled);
			}
			if (get(preferencesPayload, 'chartSettings.charts')) {
				preferencesPayload.chartSettings.charts =
					preferencesPayload.chartSettings.charts.filter((o) => o.enabled);
			}
		}
		preferencesPayload.appbaseSettings = {
			index: preferencesPayload.pipeline,
			credentials: get(preferencesPayload, 'exportSettings.credentials', ''),
			url: localStorage.getItem('url') || sessionStorage.getItem('url'),
			endpoint: {
				url: preferencesPayload.url,
				method: preferencesPayload.method,
				headers: preferencesPayload.headers,
			},
		};
		return preferencesPayload;
	};

	render() {
		const { children, closeForm, history, isRecommendation, showBack } = this.props;

		return (
			<div className={modalStyles}>
				{showBack ? (
					<>
						{isRecommendation ? (
							<Button
								style={{
									margin: '5px 0px',
								}}
								type="link"
								icon={<ArrowLeftOutlined />}
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
								icon={<ArrowLeftOutlined />}
								onClick={closeForm}
							>
								Go back to Search UIs
							</Button>
						)}
					</>
				) : null}

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

PreferencesFormWrapper.defaultProps = {
	isRecommendation: false,
	preferenceId: null,
	searchPreferences: getSearchPreferencesPayload(defaultSearchPreferences),
	recommendationsPreferences: getRecommendationPreferencesPayload(
		defaultRecommendationsPreferences,
	),
	backend: BACKENDS.ELASTICSEARCH.name,
	isWizard: false,
	showBack: true,
};

PreferencesFormWrapper.propTypes = {
	// eslint-disable-next-line
	preferenceId: string, // this props is being used in mapStateToProps
	children: func.isRequired,
	isRecommendation: bool,
	searchPreferences: object,
	closeForm: func.isRequired,
	recommendationsPreferences: object,
	history: object.isRequired,
	allSearchPreferences: array.isRequired,
	getSearchPreferences: func.isRequired,
	getRecommendationsPreferences: func.isRequired,
	allRecommendationsPreferences: array.isRequired,
	backend: string,
	getSearchPreferenceVersions: func.isRequired,
	getLatestVersionCode: func.isRequired,
	updateVersionStateForPreference: func.isRequired,
	isWizard: bool,
	showBack: bool,
};

const mapStateToProps = (state, props) => {
	return {
		searchPreferences: getSearchPreferenceById(state, props.preferenceId),
		recommendationsPreferences: getRecommendationPreferenceById(state, props.preferenceId),
		allSearchPreferences: get(state, '$getSearchPreferences.results', []),
		allRecommendationsPreferences: get(state, '$getRecommendationsPreferences.results', []),
		backend: get(state, '$getAppPlan.results.backend'),
	};
};

const mapDispatchToProps = (dispatch) => ({
	getSearchPreferences: () => dispatch(getSearchPreferencesAction()),
	getLatestVersionCode: (preferenceId) =>
		dispatch(getSearchPreferenceLatestVersionAction(preferenceId)),
	getSearchPreferenceVersions: (preferenceId) =>
		dispatch(getSearchPreferenceVersionsAction(preferenceId)),
	getRecommendationsPreferences: () => dispatch(getRecommendationsPreferencesAction()),
	updateVersionStateForPreference: (payload) =>
		dispatch({
			type: AppConstants.APP.UI_BUILDER.SEARCH_PREFERENCE_VERSIONS
				.UPDATE_PREFERENCE_STATE_SUCCESS,
			payload,
		}),
});

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(PreferencesFormWrapper));
