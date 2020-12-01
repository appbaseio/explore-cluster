import React from 'react';
import get from 'lodash/get';
import { string } from 'prop-types';
import { FormBuilder, Validators } from 'react-reactive-form';
import { Tabs, Affix } from 'antd';
import { connect } from 'react-redux';
import SettingsTab from '../tabs/Settings';
import RecommendationsTab from '../tabs/Recommendations';
import HelpTab from '../tabs/Help';
// import LayoutTab from '../tabs/Layout';
// import SearchTab from '../tabs/Search';
import ChoosePlatformTab from '../tabs/ChoosePlatform';
import { container } from '../../ResultsPage/styles';
import {
	FormContext,
	// validateURL,
	shopifyDefaultFields,
	getRecommendationForm,
	// getDynamicFilterKey,
	getMultiListProps,
	// getPriceFilterConfigurationForm,
	// RecommendationTypes,
} from '../utils';
import { getURL } from '../../../constants/config';
import PreviewModal from '../PreviewModal';
import ExportModal from '../ExportModal';
import SyncStatus from '../SyncStatus';

const { TabPane } = Tabs;

class Main extends React.Component {
	state = {
		activeTab: '1',
	};

	form = FormBuilder.group({
		themeType: 'classic',
		primaryColor: '#0B6AFF',
		primaryTextColor: '#fff',
		textColor: '#424242',
		titleColor: '#424242',
		fontFamily: 'default',
		customCss: '',
		storeInfo: FormBuilder.group({
			currency: 'USD',
		}),
		ctaTitle: '',
		ctaAction: '',
		resultTitle: undefined,
		resultDescription: undefined,
		resultPrice: undefined,
		resultImage: undefined,
		resultHandle: undefined,
		recommendations: FormBuilder.array([]),
		exportSettings: FormBuilder.group({
			exportAs: 'embed',
			credentials: [undefined, Validators.required],
			openAsPage: false,
			type: 'other',
		}),
	});

	componentDidMount() {
		window.addEventListener('beforeunload', this.storePreferences);
		// sync form values
		const preferences = localStorage.getItem(this.storeKey, this.form.value);
		if (preferences) {
			try {
				const parsedPreferences = JSON.parse(preferences);
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
			if (value === 'shopify') {
				// Populate the default fields
				this.form.patchValue({
					resultTitle: shopifyDefaultFields.title,
					resultDescription: shopifyDefaultFields.description,
					resultPrice: shopifyDefaultFields.price,
					resultImage: shopifyDefaultFields.image,
					resultHandle: shopifyDefaultFields.handle,
				});
			} else {
				// Clear the default fields
				this.form.patchValue({
					resultTitle: undefined,
					resultDescription: undefined,
					resultPrice: undefined,
					resultImage: undefined,
					resultHandle: undefined,
				});
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
			exportType: get(formValue, 'exportSettings.type'),
			openAsPage: get(formValue, 'exportSettings.openAsPage'),
		};
	};

	handleTabChange = (tab) => {
		// console.log('THIS IS TAB', tab);
		this.setState({
			activeTab: tab,
		});
	};

	render() {
		const { activeTab } = this.state;
		const isSettingsTabActive = activeTab === '3';
		return (
			<FormContext.Provider value={this.form}>
				<SyncStatus form={this.form} />
				<div
					style={{ backgroundColor: '#fff', padding: '10px 20px' }}
					className={container}
				>
					<Tabs
						onChange={this.handleTabChange}
						defaultActiveKey="1"
						style={{ minHeight: 500 }}
					>
						<TabPane tab="E-Commerce Platform" key="1">
							<ChoosePlatformTab />
						</TabPane>
						<TabPane tab="Recommendations UI" key="2">
							<RecommendationsTab />
						</TabPane>
						<TabPane tab="Settings" key="3">
							<SettingsTab />
						</TabPane>
						<TabPane tab="Help" key="4">
							<HelpTab />
						</TabPane>
					</Tabs>
					{/** TODO: SHOW MODAL BASED ON CONDITION */}
					{isSettingsTabActive ? (
						<Affix
							offsetBottom={0}
							style={{
								backgroundColor: '#fff',
								padding: '15px 10px',
								width: 'calc(100% - 50px)',
							}}
						>
							<div className="flex space-between card-footer">
								<div>
									{!isSettingsTabActive && (
										<ExportModal preferences={this.getPreferences} />
									)}
								</div>

								<div>
									<PreviewModal
										preferences={this.getPreferences}
										label={isSettingsTabActive ? 'Settings Preview' : undefined}
									/>
								</div>
							</div>
						</Affix>
					) : null}
				</div>
			</FormContext.Provider>
		);
	}
}

Main.propTypes = {
	index: string.isRequired,
};

const mapStateToProps = (state) => ({
	index: get(state, '$getCurrentApp.name'),
});
export default connect(mapStateToProps)(Main);
