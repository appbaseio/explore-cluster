import React from 'react';
import get from 'lodash/get';
import { string } from 'prop-types';
import { FormBuilder, Validators } from 'react-reactive-form';
import { Tabs, Affix } from 'antd';
import { connect } from 'react-redux';
import LayoutTab from './tabs/Layout';
import SearchTab from './tabs/Search';
import ChoosePlatformTab from './tabs/ChoosePlatform';
import { container } from '../ResultsPage/styles';
import { FormContext, validateURL, shopifyDefaultFields } from './utils';
import { getURL } from '../../constants/config';
import PreviewModal from './PreviewModal';
import ExportModal from './ExportModal';
import SyncStatus from './SyncStatus';

const { TabPane } = Tabs;

const getFilterConfigurationForm = (customFields) => {
	return FormBuilder.group({
		title: undefined,
		dataField: undefined,
		...customFields,
	});
};

class Main extends React.Component {
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
			collections: FormBuilder.group({
				enabled: false,
				customize: getFilterConfigurationForm({
					dataField: { value: '', disabled: true },
				}),
			}),
			color: FormBuilder.group({
				enabled: false,
				customize: getFilterConfigurationForm(),
			}),
			size: FormBuilder.group({
				enabled: false,
				customize: getFilterConfigurationForm(),
			}),
			price: FormBuilder.group({
				enabled: false,
				customize: getFilterConfigurationForm(),
			}),
		}),
		exportSettings: FormBuilder.group({
			credentials: [undefined, Validators.required],
			type: 'other',
		}),
	});

	componentDidMount() {
		window.addEventListener('beforeunload', this.storePreferences);
		// sync form values
		const preferences = localStorage.getItem(this.storeKey, this.form.value);
		if (preferences) {
			try {
				this.form.patchValue(JSON.parse(preferences));
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
				const colorFilter = this.form.get('staticFilters.color.customize.dataField');
				colorFilter.patchValue(shopifyDefaultFields.color);
				const sizeFilter = this.form.get('staticFilters.size.customize.dataField');
				sizeFilter.patchValue(shopifyDefaultFields.size);
				const priceFilter = this.form.get('staticFilters.price.customize.dataField');
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
				rsConfig: {},
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
										...get(formValue, 'staticFilters.collections.customize'),
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
										...get(formValue, 'staticFilters.color.customize'),
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
										...get(formValue, 'staticFilters.size.customize'),
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
										...get(formValue, 'staticFilters.price.customize'),
									},
								},
						  ]
						: []),
				],
			},
			exportType: get(formValue, 'exportSettings.type'),
		};
	};

	render() {
		return (
			<FormContext.Provider value={this.form}>
				<SyncStatus form={this.form} />
				<div
					style={{ backgroundColor: '#fff', padding: '10px 20px' }}
					className={container}
				>
					<Tabs defaultActiveKey="1" style={{ minHeight: 500 }}>
						<TabPane tab="E-Commerce Platform" key="1">
							<ChoosePlatformTab />
						</TabPane>
						<TabPane tab="Layout and Design" key="2">
							<LayoutTab />
						</TabPane>
						<TabPane tab="Search Settings" key="3">
							<SearchTab />
						</TabPane>
					</Tabs>
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
								<ExportModal preferences={this.getPreferences} />
							</div>
							<div>
								<PreviewModal preferences={this.getPreferences} />
							</div>
						</div>
					</Affix>
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
