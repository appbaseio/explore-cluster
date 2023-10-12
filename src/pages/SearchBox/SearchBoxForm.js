/* eslint-disable no-param-reassign,camelcase,jsx-a11y/label-has-associated-control,jsx-a11y/label-has-for,jsx-a11y/no-noninteractive-element-interactions */
import React, { Fragment, useEffect, useLayoutEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { css } from 'emotion';
import { Link, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import get from 'lodash/get';
import {
	ArrowLeftOutlined,
	ArrowRightOutlined,
	InfoCircleOutlined,
	PlusOutlined,
} from '@ant-design/icons';
import { Button, Card, Divider, Input, notification, Result, Row, Skeleton, Tabs } from 'antd';

import { FieldControl, FieldGroup, FormBuilder, Validators } from 'react-reactive-form';
import DOMPurify from 'dompurify';
import { FormContext } from '../IntegrationsPage/utils/utils';
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
import { formIndexPipeline } from './components/PipelineSwitcher';
import FeaturedSuggestions from './components/FeaturedSuggestions';
import {
	EndpointRow,
	FormLabel,
	StyledIndexSwitcher,
	StyledPipelineSwitcher,
	FormTooltip,
	FormRow,
	EndpointInnerLabel,
	EndpointCol,
} from './SearchBoxFormStyles';

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
		// can be used as hasError('required')
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

const SEARCHBOX_ID_PATTERN = /^[a-zA-Z0-9_]+$/;

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

	useLayoutEffect(() => {
		getSearchBoxes();
	}, []);

	/**
	 * All the values you need to remember for the particular searchbox
	 *
	 * Some values like index, credentials, pipeline, id etc. don't have a special meaning for the backend.
	 * They need to be explicitly passed to Reactivesearch components. We save it in the backend to just for persistence.
	 *
	 * Some values like featured.layout have a special meaning.
	 * eg.
	 * 	They don't need to be explicitly passed to Reactivesearch components, once saved with a searchboxId.
	 * 	Just the searchboxId needs to passed in such case. The values are fetched from the backend.
	 */
	const form = useRef(
		FormBuilder.group({
			id: [
				'',
				[
					Validators.required,
					Validators.pattern(SEARCHBOX_ID_PATTERN),
					Validators.minLength(3),
				],
			],
			description: '',
			credentials: ['', [Validators.required]],
			index: [''],
			pipeline: [{}],
			popular: FormBuilder.group({
				minCount: [0, [Validators.min(0), Validators.max(1000)]],
				minChars: [0, [Validators.min(0)]],
				size: [5, [Validators.min(0), Validators.max(10)]],
				indices: [['*'], [arrayValidator]],
			}),
			recent: FormBuilder.group({
				minHits: [0, [Validators.min(0)]],
				size: [5, [Validators.min(0), Validators.max(10)]],
				minChars: [0, [Validators.min(0), Validators.max(10)]],
				indices: [['*'], [arrayValidator]],
			}),
			endpoint: FormBuilder.group({
				applyStopwords: false,
				customStopwords: [],
				maxPredictedWords: [1, [requiredValidator, Validators.min(1)]],
				includeFields: [['*']],
				excludeFields: [[]],
				urlField: [''],
				showDistinctSuggestions: false,
				enablePredictiveSuggestions: false,
				enableSynonyms: false,
				transformResponse: ['', [Validators.required]],
				endpoint: FormBuilder.group({
					headers: '',
					body: '',
					method: ['', [requiredValidator]],
					url: [
						'',
						[requiredValidator, (control) => urlValidator(control, true)], //  to allow forward slash values eg: /fusion/abc.v3
					],
				}),
			}),
			designAndLayout: FormBuilder.group({
				enableFAQSuggestions: false,
				enableAI: false,
				enableFeaturedSuggestions: true,
				enablePopularSuggestions: false,
				enableEndpointSuggestions: false,
				enableRecentSuggestions: false,
				enableVoiceSearch: false,
				enableImageSearch: false,
				highlight: false,
				theme: 'light',
				primaryColor: DEFAULT_DESIGN_COLORS.light.primaryColor,
				textColor: DEFAULT_DESIGN_COLORS.light.textColor,
				searchbox: {},
				customizeSearchBox: FormBuilder.group({
					iconURL: ['', (control) => urlValidator(control, false)],
					iconPosition: 'left',
					placeholder: '',
					focusShortcuts: [['/']],
					addonBefore: '',
					addonAfter: '',
				}),
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
			index,
			pipeline,
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
						enableFAQSuggestions: designAndLayout.enableFAQSuggestions,
						enableAI: designAndLayout.enableAI,
						enableFeaturedSuggestions: designAndLayout.enableFeaturedSuggestions,
						enablePopularSuggestions: designAndLayout.enablePopularSuggestions,
						enableEndpointSuggestions: designAndLayout.enableEndpointSuggestions,
						enableRecentSuggestions: designAndLayout.enableRecentSuggestions,
						enableVoiceSearch: designAndLayout.enableVoiceSearch,
						enableImageSearch: designAndLayout.enableImageSearch,
						highlight: designAndLayout.highlight,
						iconURL: designAndLayout?.customizeSearchBox?.iconURL,
						iconPosition: designAndLayout?.customizeSearchBox?.iconPosition,
						placeholder: designAndLayout?.customizeSearchBox?.placeholder,
						focusShortcuts: designAndLayout?.customizeSearchBox?.focusShortcuts,
						addonBefore: DOMPurify.sanitize(
							designAndLayout?.customizeSearchBox?.addonBefore,
						),
						addonAfter: DOMPurify.sanitize(
							designAndLayout?.customizeSearchBox?.addonAfter,
						),
						/**
						 * The below values are not top level because they don't get saved in the backend otherwise.
						 * */
						credentials,
						index,
						pipeline,
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
					...(designAndLayout.enableEndpointSuggestions
						? {
								endpoint: {
									url: endpoint?.endpoint?.url,
									headers: parseJSON(endpoint?.endpoint?.headers),
									body: parseJSON(endpoint?.endpoint?.body),
									method: endpoint?.endpoint?.method,
								},
						  }
						: {}),
					applyStopwords: endpoint.applyStopwords,
					customStopwords: endpoint.customStopwords || [],
					enableSynonyms: endpoint.enableSynonyms,
					excludeFields: endpoint.excludeFields,
					includeFields: endpoint.includeFields,
					maxPredictedWords: endpoint.maxPredictedWords,
					showDistinctSuggestions: endpoint.showDistinctSuggestions,
					...(endpoint?.transformResponse
						? {
								transformResponse: endpoint?.transformResponse,
						  }
						: {}),
					...(endpoint?.urlField ? { urlField: endpoint?.urlField } : {}),
				},
			},
		};

		if (form.current.invalid) {
			// Below runs the validations so we can use the status on each control below
			form.current.handleSubmit();
			const { controls } = form.current || {};

			if (controls) {
				if (controls.credentials.status === 'INVALID' || controls.id.status === 'INVALID') {
					return;
				}
				if (controls.designAndLayout.status === 'INVALID') {
					setActiveTab('1');
					return;
				}
				if (
					controls.popular.status === 'INVALID' &&
					designAndLayout.enablePopularSuggestions
				) {
					setActiveTab('2');
					return;
				}
				if (
					controls.recent.status === 'INVALID' &&
					designAndLayout.enableRecentSuggestions
				) {
					setActiveTab('3');
					return;
				}
				if (
					controls.endpoint.status === 'INVALID' &&
					designAndLayout.enableEndpointSuggestions
				) {
					setActiveTab('4');
					return;
				}
			}
		}

		saveSearchBox(id, payload)
			.then((res) => {
				if (res.error) {
					notification.error({
						message: (
							<p>
								{res.error.message
									? res.error.message
									: 'Something went wrong while creating the searchbox!'}
							</p>
						),
					});
				} else if (res.payload) {
					notification.success({
						message: `Searchbox ${isEditPage ? 'edited' : 'created'} successfully!`,
					});
					if (!isEditPage) {
						history.push(`/cluster/searchboxes`);
					}
				}
			})
			.catch((createError) => {
				notification.error({
					message: String(createError),
				});
			});
	};

	useEffect(() => {
		if (isEditPage && searchBoxData) {
			form.current.patchValue({
				id: searchBoxData.id,
				description: searchBoxData.description ?? '',
				credentials: searchBoxData.searchbox?.featured?.design?.credentials ?? '',
				index: searchBoxData.searchbox?.featured?.design?.index ?? '',
				pipeline: searchBoxData.searchbox?.featured?.design?.pipeline ?? {},
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
					enableFAQSuggestions:
						searchBoxData.searchbox?.featured?.design?.enableFAQSuggestions,
					enableAI: searchBoxData.searchbox?.featured?.design?.enableAI,
					enableFeaturedSuggestions:
						searchBoxData.searchbox?.featured?.design?.enableFeaturedSuggestions,
					enablePopularSuggestions:
						searchBoxData.searchbox?.featured?.design?.enablePopularSuggestions,
					enableEndpointSuggestions:
						searchBoxData.searchbox?.featured?.design?.enableEndpointSuggestions,
					enableRecentSuggestions:
						searchBoxData.searchbox?.featured?.design?.enableRecentSuggestions,
					enableVoiceSearch: searchBoxData.searchbox?.featured?.design?.enableVoiceSearch,
					enableImageSearch: searchBoxData.searchbox?.featured?.design?.enableImageSearch,
					highlight: searchBoxData.searchbox?.featured?.design?.highlight,
					customizeSearchBox: {
						iconURL: searchBoxData.searchbox?.featured?.design?.iconURL,
						iconPosition: searchBoxData.searchbox?.featured?.design?.iconPosition,
						placeholder: searchBoxData.searchbox?.featured?.design?.placeholder,
						focusShortcuts: searchBoxData.searchbox?.featured?.design?.focusShortcuts,
						addonBefore: searchBoxData.searchbox?.featured?.design?.addonBefore,
						addonAfter: searchBoxData.searchbox?.featured?.design?.addonAfter,
					},
					searchbox: {
						sections: searchBoxData.searchbox?.featured?.layout?.sections,
						sectionsOrder: searchBoxData.searchbox?.featured?.layout?.sectionsOrder,
					},
				},
				endpoint: {
					endpoint: {
						url: searchBoxData.searchbox?.endpoint?.endpoint?.url,
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
	}, [String(searchBoxData)]);

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
									<PlusOutlined style={{ margin: '0.25rem' }} />
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
								<ArrowLeftOutlined style={{ margin: '0.25rem' }} />
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
													background-color: white;
													color: black;
												}
											`,
											color: 'white',
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
																	minWidth: '200px',
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
																			`Searchbox id can only use numbers, characters and underscores.`) ||
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
													background-color: white;
													color: black;
												}
											`,
											color: 'white',
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
													background-color: white;
													color: black;
												}
											`,
											color: 'white',
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
									<Row>
										<Divider />
										<FormRow>
											<FormLabel>Configure endpoint</FormLabel>
											<FormTooltip
												color="white"
												title={
													<FormTooltip.Text>
														Configure pipeline and endpoint
													</FormTooltip.Text>
												}
											>
												<InfoCircleOutlined />
											</FormTooltip>
										</FormRow>
										<EndpointRow>
											<EndpointCol xs={6}>
												{/* Here we call indexes as pipelines. */}
												<EndpointInnerLabel>Pipeline</EndpointInnerLabel>
												<FieldControl
													name="index"
													strict={false}
													render={({ value }) => {
														return (
															<Flex alignItems="center" css="flex: 1">
																<StyledIndexSwitcher
																	value={value}
																	placeholder="Choose an index"
																	showSearch
																	onChange={(valueParam) => {
																		form.current.patchValue({
																			index: valueParam || '',
																		});
																		// If pipeline is not set, set it to index pipeline
																		if (
																			!form.current?.value
																				?.pipeline?.id
																		) {
																			const indexPipeline =
																				formIndexPipeline(
																					valueParam,
																				);
																			form.current.patchValue(
																				{
																					pipeline: {
																						id: indexPipeline.id,
																						method: indexPipeline
																							.route
																							.method,
																						url: indexPipeline
																							.route
																							.path,
																					},
																				},
																			);
																		}
																	}}
																/>
															</Flex>
														);
													}}
												/>
											</EndpointCol>
											<EndpointCol xs={18}>
												<EndpointInnerLabel>Endpoint</EndpointInnerLabel>
												<FieldControl
													name="pipeline"
													strict={false}
													render={({ value }) => {
														return (
															<Flex
																alignItems="center"
																css="width:100%"
															>
																<StyledPipelineSwitcher
																	value={
																		value.url
																			? `${value.method} ${value.url}`
																			: ''
																	}
																	placeholder="Choose a pipeline"
																	showSearch
																	onChange={(
																		_value,
																		{ pipeline },
																	) => {
																		form.current.patchValue({
																			pipeline: {
																				id:
																					pipeline.id ||
																					'',
																				method:
																					pipeline?.route
																						?.method ||
																					'',
																				url:
																					pipeline?.route
																						.path || '',
																			},
																		});
																	}}
																/>
															</Flex>
														);
													}}
												/>
											</EndpointCol>
										</EndpointRow>
										<Divider />
									</Row>
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
						<TabPane
							tab={
								<div>
									<span>FAQs Suggestions</span>{' '}
									<span>
										<ArrowRightOutlined
											style={{ transform: 'rotate(315deg)' }}
										/>
									</span>
								</div>
							}
							key="5"
							data-cy="faq-suggestions-tab"
						>
							<Redirect to="/cluster/ai-faqs" />
						</TabPane>
						<TabPane tab="Featured Suggestions" key="6">
							<FeaturedSuggestions searchBoxData={searchBoxData} />
						</TabPane>
					</Tabs>
				</FormContext.Provider>
			</div>
			<Footer
				collapsed={collapsed}
				onLivePreview={() => {
					if (form.current.value.credentials || form.current.value.index) {
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
				searchBoxItem={form.current.value}
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
	apps: PropTypes.array.isRequired,
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
		apps: Object.keys(get(state, 'apps.data') || {}).filter((app) => !app.startsWith('.')),
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
