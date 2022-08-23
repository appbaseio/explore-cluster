/* eslint-disable no-param-reassign,camelcase,jsx-a11y/label-has-associated-control,jsx-a11y/label-has-for,jsx-a11y/no-noninteractive-element-interactions */
import React, { Fragment, useEffect, useLayoutEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { css } from 'emotion';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import get from 'lodash/get';
import { Button, Card, Icon, Input, notification, Result, Skeleton, Tabs } from 'antd';

import { FieldControl, FieldGroup, FormBuilder, Validators } from 'react-reactive-form';
import { FormContext } from '../IntegrationsPage/utils';
import DesignAndLayout from './components/DesignAndLayout';
import PopularSuggestions from './components/PopularSuggestions';
import RecentSuggestions from './components/RecentSuggestions';
import {
	fetchSearchBoxes,
	getPermission,
	saveSearchBox as saveSearchBoxAction,
} from '../../batteries/modules/actions';
import Footer from './components/AffixFooter';
import Grid from '../../components/CreateCredentials/Grid';
import Flex from '../../batteries/components/shared/Flex';
import EndpointSuggestions from './components/EndpointSuggestions';
import { urlValidator } from '../SearchAuth0Settings/utils';
import { isEmpty } from '../../utils';
import CredentialsSelector from './components/CredentialsSelector';
import { DEFAULT_DESIGN_COLORS, parseJSON } from './utils';

const { TabPane } = Tabs;

function stringifyJSON(input) {
	if (typeof input === 'object') {
		try {
			return JSON.stringify(input);
		} catch (error) {
			return '';
		}
	}
	if (typeof input === 'string') {
		return input;
	}
	return '';
}
export const arrayValidator = (control) => {
	// when not touched
	if (!control.value) {
		return { required: true };
	}
	if (!control.value.length) {
		return { required: true };
	}
	return null;
};
export const requiredValidator = (control) => {
	// when not touched
	if (control.value === '' || control.value === null || control.value === undefined) {
		return { required: true };
	}
	return null;
};

const container = css`
	padding: 10px 50px;
	position: relative;
	.space-between {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.flex-end {
		justify-content: flex-end;
	}
	.flex {
		display: flex;
	}
	.ant-affix {
		z-index: 100;
	}

	.ant-tabs.ant-tabs-card .ant-tabs-card-bar .ant-tabs-tab > div:first-child {
		display: flex;
		align-items: center;

		span.tab-title {
			height: 39px;
			min-width: 1rem;
		}
	}

	.ant-tabs-content {
		min-height: 400px;
	}

	.error {
		color: red;
	}
	.required-marker {
		color: red;
		font-size: 1rem;
	}
`;

const SearchBoxForm = (props) => {
	const {
		match,
		searchBoxes,
		searchBoxesLoading,
		searchBoxData,
		getSearchBoxes,
		collapsed,
		saveSearchBox,
		history,
		isCreating,
	} = props;
	const isEditPage = get(match, 'params.id');
	const [triggerLivePreview, setTriggerLivePreview] = useState(false);
	const [activeTab, setActiveTab] = useState(1);

	// const bannerDetails = SearchBoxBannerDetails;
	useLayoutEffect(() => {
		getSearchBoxes();
	}, []);

	const form = useRef(
		FormBuilder.group({
			id: [
				'',
				[
					Validators.required,
					Validators.pattern(/^[a-zA-Z0-9-_]+$/),
					Validators.minLength(3),
				],
			],
			description: '',
			credentials: ['', [Validators.required]],
			popular: FormBuilder.group({
				minCount: [0, [requiredValidator, Validators.min(0), Validators.max(1000)]],
				minChars: [0, [requiredValidator, Validators.min(0)]],
				size: [0, [requiredValidator, Validators.min(0), Validators.max(10)]],
				indices: [['*'], [arrayValidator]],
			}),
			recent: FormBuilder.group({
				minHits: [0, [requiredValidator, Validators.min(0)]],
				size: [0, [requiredValidator, Validators.min(0), Validators.max(10)]],
				minChars: [0, [requiredValidator, Validators.min(0), Validators.max(10)]],
				indices: [['*'], [arrayValidator]],
			}),
			endpoint: FormBuilder.group({
				applyStopwords: false,
				customStopwords: [],
				maxPredictedWords: [1, [requiredValidator, Validators.min(1)]],
				includeFields: [['*']],
				excludeFields: [[]],
				urlField: ['', [requiredValidator]],
				showDistinctSuggestions: false,
				enablePredictiveSuggestions: false,
				enableSynonyms: false,
				transformResponse: '',
				endpoint: FormBuilder.group({
					headers: '',
					body: '',
					method: ['', [requiredValidator]],
					url: ['', [requiredValidator, urlValidator]],
				}),
			}),
			designAndLayout: FormBuilder.group({
				enableFeaturedSuggestions: false,
				enablePopularSuggestions: false,
				enableIndexSuggestions: false,
				enableRecentSuggestions: false,
				enableVoiceSearch: false,
				highlight: false,
				theme: 'light',
				primaryColor: DEFAULT_DESIGN_COLORS.light.primaryColor,
				textColor: DEFAULT_DESIGN_COLORS.light.textColor,
				searchbox: {},
			}),
		}),
	);
	const handleSaveSearchBox = () => {
		const { value: formValue } = form.current;
		const {
			id,
			description,
			popular = {},
			recent = {},
			designAndLayout = {},
			endpoint = {},
			credentials,
		} = formValue;

		const payload = {
			enabled: true,
			hidden: false,
			description,
			searchbox: {
				popular: {
					size: popular.size,
					index: popular.indices?.join(','),
					minCount: popular.minCount,
					minChars: popular.minChars,
				},
				recent: {
					size: recent.size,
					index: recent.indices?.join(','),
					minHits: recent.minHits,
					minChars: recent.minChars,
				},
				featured: {
					design: {
						primaryColor: designAndLayout.primaryColor,
						textColor: designAndLayout.textColor,
						theme: designAndLayout.theme,
						enableFeaturedSuggestions: designAndLayout.enableFeaturedSuggestions,
						enablePopularSuggestions: designAndLayout.enablePopularSuggestions,
						enableIndexSuggestions: designAndLayout.enableIndexSuggestions,
						enableRecentSuggestions: designAndLayout.enableRecentSuggestions,
						enableVoiceSearch: designAndLayout.enableVoiceSearch,
						highlight: designAndLayout.highlight,
						credentials,
					},
					...(!isEmpty(designAndLayout.searchbox)
						? {
								layout: {
									// maxSuggestionsPerSection: 3,
									sectionsOrder: designAndLayout.searchbox.sectionsOrder,
									sections: designAndLayout.searchbox.sections,
								},
						  }
						: {}),
				},
				endpoint: {
					endpoint: {
						url: endpoint?.endpoint?.url,
						headers: parseJSON(endpoint?.endpoint?.headers),
						body: parseJSON(endpoint?.endpoint?.body),
						method: endpoint?.endpoint?.method,
					},
					applyStopwords: endpoint.applyStopwords,
					customStopwords: endpoint.customStopwords || [],
					enableSynonyms: endpoint.enableSynonyms,
					excludeFields: endpoint.excludeFields,
					includeFields: endpoint.includeFields,
					maxPredictedWords: endpoint.maxPredictedWords,
					showDistinctSuggestions: endpoint.showDistinctSuggestions,
					transformResponse: endpoint.transformResponse,
					urlField: endpoint.urlField,
				},
			},
		};

		if (form.current.invalid) {
			form.current.handleSubmit();
			const { controls } = form.current;
			if (controls.designAndLayout.status === 'INVALID') {
				setActiveTab('1');
				return;
			}
			if (controls.popular.status === 'INVALID') {
				setActiveTab('2');
				return;
			}
			if (controls.recent.status === 'INVALID') {
				setActiveTab('3');
				return;
			}
			// if (controls.endpoint.status === 'INVALID') {
			// 	setActiveTab('4');
			// 	return;
			// }
		}

		saveSearchBox(id, payload)
			.then((res) => {
				if (res.payload) {
					notification.success({
						message: `Searchbox ${isEditPage ? 'edited' : 'created'} successfully!`,
					});
					if (!isEditPage) {
						history.push(`/cluster/searchboxes`);
					}
				} else if (res.error) {
					notification.error({
						message: <p>Something went wrong while creating the searchbox!</p>,
					});
				}
			})
			.catch((createError) => {
				notification.error({
					message: createError,
				});
			});
	};

	useEffect(() => {
		if (isEditPage && searchBoxData) {
			form.current.patchValue({
				id: searchBoxData.id,
				description: searchBoxData.description ?? '',
				credentials: searchBoxData.searchbox?.featured?.design?.credentials ?? '',
				popular: {
					minCount: searchBoxData.searchbox?.popular?.minCount,
					minChars: searchBoxData.searchbox?.popular?.minChars,
					indices: searchBoxData.searchbox?.popular?.index.trim().split(','),
					size: searchBoxData.searchbox?.popular?.size,
				},
				recent: {
					minHits: searchBoxData.searchbox?.recent?.minHits,
					minChars: searchBoxData.searchbox?.recent?.minChars,
					indices: searchBoxData.searchbox?.recent?.index.trim().split(','),
					size: searchBoxData.searchbox?.recent?.size,
				},
				designAndLayout: {
					textColor: searchBoxData.searchbox?.featured.design.textColor,
					theme: searchBoxData.searchbox?.featured?.design?.theme,
					primaryColor: searchBoxData.searchbox?.featured?.design?.primaryColor,
					enableFeaturedSuggestions:
						searchBoxData.searchbox?.featured?.design?.enableFeaturedSuggestions,
					enablePopularSuggestions:
						searchBoxData.searchbox?.featured?.design?.enablePopularSuggestions,
					enableIndexSuggestions:
						searchBoxData.searchbox?.featured?.design?.enableIndexSuggestions,
					enableRecentSuggestions:
						searchBoxData.searchbox?.featured?.design?.enableRecentSuggestions,
					enableVoiceSearch: searchBoxData.searchbox?.featured?.design?.enableVoiceSearch,
					highlight: searchBoxData.searchbox?.featured?.design?.highlight,
					searchbox: {
						sections: searchBoxData.searchbox?.featured?.layout?.sections,
						sectionsOrder: searchBoxData.searchbox?.featured?.layout?.sectionsOrder,
					},
				},
				endpoint: {
					endpoint: {
						url: searchBoxData.searchbox?.endpoint?.endpoint.url,
						headers: stringifyJSON(
							searchBoxData.searchbox?.endpoint?.endpoint?.headers,
						),
						body: stringifyJSON(searchBoxData.searchbox?.endpoint?.endpoint?.body),
						method: searchBoxData.searchbox?.endpoint?.endpoint?.method,
					},
					applyStopwords: searchBoxData.searchbox?.endpoint?.applyStopwords,
					customStopwords: searchBoxData.searchbox?.endpoint?.customStopwords,
					enableSynonyms: searchBoxData.searchbox?.endpoint?.enableSynonyms,
					excludeFields: searchBoxData.searchbox?.endpoint?.excludeFields,
					includeFields: searchBoxData.searchbox?.endpoint?.includeFields,
					maxPredictedWords: searchBoxData.searchbox?.endpoint?.maxPredictedWords,
					showDistinctSuggestions:
						searchBoxData.searchbox?.endpoint?.showDistinctSuggestions,
					transformResponse: searchBoxData.searchbox?.endpoint?.transformResponse,
					urlField: searchBoxData.searchbox?.endpoint?.urlField,
				},
			});
		}
	}, [searchBoxData]);

	if (isEditPage && (!searchBoxes.length || searchBoxesLoading)) {
		return (
			<div className={container}>
				<Card>
					<Skeleton />
				</Card>
			</div>
		);
	}

	if (isEditPage && !searchBoxData) {
		return (
			<div className={container}>
				<Card>
					<Result
						status="404"
						title="No Searchbox found!"
						subTitle="The Searchbox you are looking for does not exist. Try creating a new Searchbox."
						extra={
							<Link to="/cluster/searchboxes/new">
								<Button type="primary">
									<Icon type="plus" />
									Create Searchbox
								</Button>
							</Link>
						}
					/>
				</Card>
			</div>
		);
	}
	return (
		<>
			<div
				className={container}
				style={{ backgroundColor: '#fff', padding: '10px 20px', marginBottom: 100 }}
			>
				<FormContext.Provider value={form.current}>
					<div
						style={{
							margin: '10px ',
						}}
					>
						<Link to="/cluster/searchboxes">
							<Button>
								<Icon type="arrow-left" />
								Back to Searchboxes
							</Button>
						</Link>
					</div>
					<FieldGroup
						control={form.current}
						render={({ submitted }) => {
							return (
								<React.Fragment>
									<Grid
										toolTipMessage="Unique identifier for your Searchbox."
										toolTipProps={{
											overlayClassName: css`
												.ant-tooltip-inner {
													background-color: #000;
												}
											`,
										}}
										className="top-row"
										gridRatio={0.35}
										label={
											<span>
												<span className="required-marker">*</span>
												Searchbox Id
											</span>
										}
										style={{ marginTop: '1rem', alignItems: 'center' }}
										component={
											<FieldControl
												name="id"
												render={({
													handler,
													touched,
													hasError,
													invalid: invalidName,
												}) => {
													const isError =
														(submitted || touched) && invalidName;
													return (
														<Flex
															flexDirection="column"
															alignItems="flex-start"
														>
															<Input
																style={{
																	...(isError && {
																		borderColor: 'tomato',
																	}),
																}}
																{...handler()}
																data-cy="searchbox-id"
																placeholder="your_unique_searchbox_id"
																disabled={isEditPage}
															/>
															{isError && (
																<span className="error">
																	{(hasError('required') &&
																		'Enter an id for the searchbox') ||
																		(hasError('pattern') &&
																			`Searchbox id cannot use spaces and special characters.`) ||
																		(hasError('minLength') &&
																			`Searchbox id should have atleast 3 characters.`)}
																</span>
															)}
														</Flex>
													);
												}}
											/>
										}
									/>
									<Grid
										toolTipMessage="Provide an optional description for your Searchbox."
										toolTipProps={{
											overlayClassName: css`
												.ant-tooltip-inner {
													background-color: #000;
												}
											`,
										}}
										gridRatio={0.35}
										style={{ marginTop: '1rem', alignItems: 'center' }}
										label="Searchbox Description"
										component={
											<FieldControl
												name="description"
												render={({
													handler,
													touched,
													invalid: invalidDescription,
												}) => {
													const isError = touched && invalidDescription;
													return (
														<Flex alignItems="center" css="flex: 1">
															<Input
																style={{
																	maxWidth: 400,
																	...(isError && {
																		borderColor: 'tomato',
																	}),
																}}
																{...handler()}
																data-cy="searchbox-description"
																placeholder="A human friendly 👦 👧 description for this searchbox"
															/>
														</Flex>
													);
												}}
											/>
										}
									/>
									<Grid
										toolTipMessage="Provide credentials for the searchbox."
										toolTipProps={{
											overlayClassName: css`
												.ant-tooltip-inner {
													background-color: #000;
												}
											`,
										}}
										gridRatio={0.35}
										key={JSON.stringify(searchBoxData)}
										style={{ marginTop: '1rem', alignItems: 'center' }}
										label={
											<span>
												<span className="required-marker">*</span>
												Searchbox Credentials
											</span>
										}
										component={
											<FieldControl
												name="credentials"
												render={({ touched, hasError, value }) => {
													const isError =
														(submitted || touched) &&
														hasError('required');

													return (
														<Flex alignItems="center" css="flex: 1">
															<div>
																<CredentialsSelector
																	selectStyle={
																		isError
																			? {
																					border: '1px solid red',
																					borderRadius:
																						'6px',
																					marginBottom:
																						'2px',
																			  }
																			: {}
																	}
																	value={value}
																	onChange={(valueParam) => {
																		form.current.patchValue({
																			credentials: valueParam,
																		});
																	}}
																/>{' '}
																{isError && (
																	<span className="error">
																		{hasError('required') &&
																			'Credentials are required!'}
																	</span>
																)}
															</div>
														</Flex>
													);
												}}
											/>
										}
									/>
								</React.Fragment>
							);
						}}
					/>
					<Tabs
						activeKey={String(activeTab)}
						onChange={(activeKey) => setActiveTab(Number(activeKey))}
						style={{ minHeight: 500 }}
					>
						<TabPane tab="Design and Layout" key="1" data-cy="design-layout-tab">
							<DesignAndLayout
								editPageId={isEditPage}
								triggerLivePreview={triggerLivePreview}
								searchBoxData={searchBoxData}
							/>
						</TabPane>
						<TabPane
							tab="Popular Suggestions"
							key="2"
							data-cy="popular-suggestions-tab"
						>
							<PopularSuggestions />
						</TabPane>
						<TabPane tab="Recent Suggestions" key="3" data-cy="recent-suggestions-tab">
							<RecentSuggestions />
						</TabPane>
						<TabPane tab="Endpoint Suggestions" key="4" data-cy="index-suggestions-tab">
							<EndpointSuggestions />
						</TabPane>
					</Tabs>
				</FormContext.Provider>
			</div>
			<Footer
				collapsed={collapsed}
				onLivePreview={() => {
					if (form.current.value.credentials) {
						setTriggerLivePreview(true);

						setTimeout(() => {
							setTriggerLivePreview(false);
						}, 1000);
					} else {
						form.current.handleSubmit();
					}
				}}
				isEditPage={isEditPage}
				onSave={handleSaveSearchBox}
				isSaving={isCreating || searchBoxData?.update?.isLoading}
			/>
		</>
	);
};
SearchBoxForm.propTypes = {
	match: PropTypes.object.isRequired,
	searchBoxData: PropTypes.object,
	searchBoxes: PropTypes.array,
	searchBoxesLoading: PropTypes.bool,
	getSearchBoxes: PropTypes.func.isRequired,
	collapsed: PropTypes.bool,
	saveSearchBox: PropTypes.func.isRequired,
	history: PropTypes.object.isRequired,
	isCreating: PropTypes.bool,
};

SearchBoxForm.defaultProps = {
	searchBoxData: null,
	searchBoxes: null,
	searchBoxesLoading: false,
	collapsed: false,
	isCreating: false,
};

const mapStateToProps = (state, props) => {
	const id = get(props.match, 'params.id');
	const collapsed = state.sideBarCollapsed;
	const appPermissions = get(state, '$getAppPermissions.results.default');
	const defaultState = {
		searchBoxes: get(state, '$getSearchBoxes.results', []),
		searchBoxesLoading: get(state, '$getSearchBoxes.isFetching'),
		collapsed,
		isCreating: get(state, '$getSearchBoxes')?.create?.isLoading ?? false,
		permissions: get(appPermissions, 'results', []),
	};

	if (id) {
		const searchBoxData = defaultState.searchBoxes.find((item) => item.id === id);
		return {
			...defaultState,
			searchBoxData,
		};
	}
	return defaultState;
};

const mapDispatchToProps = (dispatch) => ({
	getSearchBoxes: () => dispatch(fetchSearchBoxes()),
	saveSearchBox: (id, payload) => dispatch(saveSearchBoxAction(id, payload)),
	fetchPermissions: (appName) => dispatch(getPermission(appName)),
});

export default connect(mapStateToProps, mapDispatchToProps)(SearchBoxForm);
