import React, { Fragment } from 'react';
import PropTypes, { func } from 'prop-types';
import { FieldGroup, FieldArray, FieldControl, Validators } from 'react-reactive-form';
import { Table, Button, Form, Select, Tooltip, Icon, Modal, Typography } from 'antd';
import { css } from 'emotion';

import get from 'lodash/get';
import Loadable from 'react-loadable';
import { connect } from 'react-redux';
import TextInput from '../../../../components/Form/Input';
import DataFieldSelector from '../../../../components/Form/DataFieldSelector';
import Flex from '../../../../batteries/components/shared/Flex';
import PreviewModal from '../../PreviewModal';
import ExportModal from '../../ExportModal';
import {
	FormContext,
	getRecommendationForm,
	RecommendationTypes,
	RecommendationTypeLabels,
	messages,
} from '../../utils';
import Loader from '../../../../components/Loader';
import { modalStyles } from '../../../../components/SearchPreviewModal/SearchPreviewModal';
import { getRawMappingsByAppName } from '../../../../batteries/modules/selectors';
import {
	getDefaultSettings,
	putSettings,
	deleteSettings,
	getSettings as getSearchRelevancy,
	setLocalRelevancyState,
} from '../../../../batteries/modules/actions';
import { getMappingsByPath, getMappingsInfo } from '../../../../utils/mappings';
import { getSubFields } from '../../../../utils';
import { allowedTiers } from '../../../../utils/prop-types';

const { Text } = Typography;

const SearchPreview = Loadable({
	loader: () =>
		import(
			/* webpackChunkName: "SearchPreviewComponent" */ '../../../SandboxPage/components/SearchPreview'
		),
	loading: Loader,
});

const tableStyles = css`
	tr {
		.delete-icon {
			transition: all ease 0.4s;
			transform: rotateX(90deg);
			opacity: 0;
		}
		&:hover {
			.delete-icon {
				transform: rotateX(0);
				opacity: 1;
			}
		}
	}
`;

class Recommendations extends React.Component {
	state = {
		showForm: false,
		isEditing: false,
		showSearchPreview: false,
	};

	columns = [
		{
			title: 'Title',
			dataIndex: 'title',
		},
		{
			title: 'Type',
			dataIndex: 'type',
			render: (item) => RecommendationTypeLabels[item],
		},
		{
			title: 'Actions',
			render: (item) => {
				const { getPreferences } = this.props;
				const btnStyle = {
					marginLeft: 10,
				};
				return (
					<Flex>
						<Button onClick={() => this.handleEdit(item.id)}>Edit</Button>
						<PreviewModal
							buttonProps={{
								size: 'default',
								type: 'default',
								style: btnStyle,
							}}
							isRecommendation
							widgetId={item.id}
							preferences={getPreferences}
						/>
						<ExportModal
							buttonProps={{
								size: 'default',
								style: btnStyle,
							}}
							widgetId={item.id}
							preferences={getPreferences}
							isRecommendation
						/>
						<Button
							style={btnStyle}
							type="danger"
							className="delete-icon"
							onClick={() => this.handleDelete(item.id)}
						>
							Delete
						</Button>
					</Flex>
				);
			},
		},
	];

	componentDidMount() {
		const {
			appName,
			getSettingsAction,
			settings,
			getDefaultSettingsAction,
			defaultSettings,
			localRelevancy,
		} = this.props;

		if (settings && !localRelevancy) {
			this.init({ ...settings });
		} else {
			getSettingsAction(appName);
		}

		if (!defaultSettings) {
			getDefaultSettingsAction();
		}
	}

	componentDidUpdate(prevProps) {
		const { settings, mappings, localRelevancy, isLoading, defaultSettings } = this.props;

		if (
			JSON.stringify(settings) !== JSON.stringify(prevProps.settings) ||
			JSON.stringify(mappings) !== JSON.stringify(prevProps.mappings)
		) {
			this.init({ ...(localRelevancy || settings) });
		}

		if (
			!settings &&
			!localRelevancy &&
			!isLoading &&
			JSON.stringify(defaultSettings) !== JSON.stringify(prevProps.defaultSettings)
		) {
			this.init({ ...defaultSettings });
		}
	}

	get recommendationControl() {
		// eslint-disable-next-line
		return this.context.get('recommendations');
	}

	showForm = (id) => {
		if (this.tempForm) {
			this.tempForm.valueChanges.unsubscribe();
		}
		if (id) {
			// get the control
			this.tempForm = this.getControlById(id);
		} else {
			this.tempForm = getRecommendationForm();
		}
		const typeControl = this.tempForm.get('type');
		typeControl.valueChanges.subscribe((value) => {
			const dataFieldSimilarToControl = this.tempForm.get('dataFieldSimilarTo');
			const dataFieldMostRecentControl = this.tempForm.get('dataFieldMostRecent');
			const productsPageHandleControl = this.tempForm.get('productsPageHandle');
			const featuredProductsControl = this.tempForm.get('docIds');
			switch (value) {
				case RecommendationTypes.SIMILAR_PRODUCTS:
					dataFieldSimilarToControl.enable();
					productsPageHandleControl.enable();
					if (dataFieldMostRecentControl.enabled) {
						dataFieldMostRecentControl.disable();
					}
					if (featuredProductsControl.enabled) {
						featuredProductsControl.disable();
					}
					break;
				case RecommendationTypes.MOST_RECENT:
					if (dataFieldSimilarToControl.enabled) {
						dataFieldSimilarToControl.disable();
					}
					if (productsPageHandleControl.enabled) {
						productsPageHandleControl.disable();
					}
					if (featuredProductsControl.enabled) {
						featuredProductsControl.disable();
					}
					if (!dataFieldMostRecentControl.value) {
						dataFieldMostRecentControl.enable({ emitEvent: false });
						// TODO: Only set value for shopify
						dataFieldMostRecentControl.setValue('created_at');
					} else {
						dataFieldMostRecentControl.enable();
						dataFieldMostRecentControl.stateChanges.next();
					}
					break;
				case RecommendationTypes.FEATURED_PRODUCTS:
					if (dataFieldSimilarToControl.enabled) {
						dataFieldSimilarToControl.disable();
					}
					if (productsPageHandleControl.enabled) {
						productsPageHandleControl.disable();
					}
					if (dataFieldMostRecentControl.enabled) {
						dataFieldMostRecentControl.disable();
					}
					featuredProductsControl.enable();
					break;
				default:
					if (dataFieldMostRecentControl.enabled) {
						dataFieldMostRecentControl.disable();
					}
					if (dataFieldSimilarToControl.enabled) {
						dataFieldSimilarToControl.disable();
					}
					if (productsPageHandleControl.enabled) {
						productsPageHandleControl.disable();
					}
					if (featuredProductsControl.enabled) {
						featuredProductsControl.disable();
					}
			}
		});
		this.setState({
			showForm: true,
			isEditing: !!id,
		});
	};

	closeForm = () => {
		this.setState({
			showForm: false,
			isEditing: false,
		});
	};

	getControlById = (id) => {
		return (this.recommendationControl.controls || []).find(
			(control) => get(control, 'value.id') === id,
		);
	};

	addControl = () => {
		this.recommendationControl.push(this.tempForm);
		this.closeForm();
	};

	handleEdit = (id) => {
		this.showForm(id);
	};

	handleDelete = (id) => {
		let controlIndex;
		(this.recommendationControl.controls || []).every((control, index) => {
			if (get(control, 'value.id') === id) {
				controlIndex = index;
				return false;
			}
			return true;
		});
		if (controlIndex !== undefined) {
			this.recommendationControl.removeAt(controlIndex);
		}
	};

	toggleSearchPreview = () => {
		this.setState((prevState) => {
			return {
				...prevState,
				showSearchPreview: !prevState.showSearchPreview,
			};
		});
	};

	init = (settings) => {
		const { appName, updateLocalRelevancy, localRelevancy } = this.props;

		if (!localRelevancy) {
			updateLocalRelevancy(appName, {
				...settings,
			});
		}

		// initialFieldWeights for searchable fields initially if the no search fields are set!
		this.initialFieldWeights();
	};

	initialFieldWeights = () => {
		const {
			settings,
			isLoading,
			isFetchingMapping,
			appName,
			localRelevancy,
			updateLocalRelevancy,
			mappings,
		} = this.props;

		const synonymsSettings = get(settings, 'synonyms');
		const indexSettings = get(settings, 'indexSettings');
		const languageSettings = get(settings, 'language');
		const { flattenUsecase } = getMappingsInfo({
			mappings,
			enableNgram: indexSettings.enableNgram,
			enableSynonyms: synonymsSettings.enabled,
			language: languageSettings.language,
		});

		const { dataField, fieldWeights } = get(settings, `search`);
		const hasSearchFields = flattenUsecase
			? Object.values(flattenUsecase).some((i) => i === 'search' || 'searchaggs')
			: false;
		if (
			!fieldWeights.length &&
			!dataField.length &&
			!isFetchingMapping &&
			!isLoading &&
			hasSearchFields
		) {
			const { enableNgram } = get(localRelevancy || settings, `indexSettings`);
			const { language } = get(localRelevancy || settings, `language`);
			const { enabled: enableSynonyms } = get(localRelevancy || settings, `synonyms`);

			const fieldDataTuple = Object.keys(flattenUsecase).reduce(
				(agg, item) => {
					if (
						flattenUsecase[item] === 'search' ||
						flattenUsecase[item] === 'searchaggs'
					) {
						const fields = getSubFields({
							fields: get(
								getMappingsByPath({
									mappings,
									path: item,
								}),
								'fields',
							),
							weight: 1,
							address: item,
							skipSearch: enableNgram === false,
							skipLang: !language,
							skipSynonyms: enableSynonyms === false,
						});

						return [
							[...agg[0], ...Object.keys(fields)],
							[...agg[1], ...Object.values(fields)],
						];
					}

					return agg;
				},
				[[], []],
			);

			updateLocalRelevancy(appName, {
				...(localRelevancy || settings),
				search: {
					...get(localRelevancy || settings, `search`, {}),
					dataField: fieldDataTuple[0],
					fieldWeights: fieldDataTuple[1],
				},
			});
		}
	};

	static contextType = FormContext;

	render() {
		const { showForm, isEditing, showSearchPreview } = this.state;
		const { appName, localRelevancy } = this.props;

		return (
			<div>
				{showForm ? (
					<div
						style={{
							paddingLeft: 15,
						}}
					>
						<Flex
							justifyContent="space-between"
							style={{
								maxWidth: 300,
								justifyContent: 'space-between',
								paddingBottom: 20,
								paddingTop: 10,
							}}
						>
							<Button
								style={{
									padding: 0,
									paddingRight: 20,
								}}
								onClick={this.closeForm}
								type="link"
								icon="arrow-left"
							>
								Go back
							</Button>
						</Flex>

						<FieldGroup control={this.tempForm} strict={false}>
							{({ invalid }) => (
								<Form
									{...{
										labelCol: {
											xs: { span: 24 },
											sm: { span: 8 },
										},
										wrapperCol: {
											xs: { span: 24 },
											sm: { span: 16 },
										},
									}}
									// colon={false}
								>
									<TextInput
										name="title"
										label="Title"
										inputProps={{
											placeholder: 'Enter CTA title',
											style: {
												maxWidth: 300,
											},
										}}
									/>
									<Form.Item label="Show Recommendations By">
										<FieldControl name="type">
											{({ handler }) => (
												<Select
													{...handler()}
													style={{
														maxWidth: 300,
													}}
												>
													{Object.values(RecommendationTypes).map(
														(key) => (
															<Select.Option key={key}>
																{RecommendationTypeLabels[key]}
															</Select.Option>
														),
													)}
												</Select>
											)}
										</FieldControl>
									</Form.Item>

									<DataFieldSelector
										name="dataFieldSimilarTo"
										isAggFields
										hideOnDisabled
										wrapInsideForm
										formItemProps={{
											label: (
												<span>
													DataField&nbsp;
													<Tooltip
														title={messages.dataFieldSimilarProduct}
													>
														<Icon type="question-circle-o" />
													</Tooltip>
												</span>
											),
										}}
									/>
									<DataFieldSelector
										name="dataFieldMostRecent"
										hideOnDisabled
										wrapInsideForm
										formItemProps={{
											label: (
												<span>
													DataField&nbsp;
													<Tooltip title={messages.dataFieldMostRecent}>
														<Icon type="question-circle-o" />
													</Tooltip>
												</span>
											),
										}}
									/>
									<FieldControl strict={false} name="docIds">
										{({ handler, disabled }) => {
											const inputHandler = handler();
											let { value } = inputHandler;
											const { onChange } = inputHandler;
											if (disabled) {
												return null;
											}
											return (
												<Form.Item
													label={
														<span>
															Featured Products&nbsp;
															<Tooltip
																title={messages.featuredProducts}
															>
																<Icon type="question-circle-o" />
															</Tooltip>
														</span>
													}
												>
													{value.length > 0 ? (
														<Fragment>
															<Button
																onClick={this.toggleSearchPreview}
																style={{ width: 300 }}
															>
																Add / Remove Products
															</Button>
															<br />
															<Text type="secondary">{`Featured Documents :  ${value.length}`}</Text>
														</Fragment>
													) : (
														<Button
															onClick={this.toggleSearchPreview}
															style={{ width: 300 }}
														>
															Add Products
														</Button>
													)}
													{showSearchPreview && (
														<Modal
															className={modalStyles}
															visible={showSearchPreview}
															onCancel={this.toggleSearchPreview}
															footer={null}
															destroyOnClose
															width={1200}
														>
															<SearchPreview
																app={appName}
																testSettings={{
																	...localRelevancy,
																	search: {
																		...localRelevancy.search,
																		fieldWeights: get(
																			localRelevancy,
																			'search.fieldWeights',
																			[],
																		).map((i) => Number(i)),
																	},
																}}
																{...inputHandler}
																hasTestSettings
																handleModal={
																	this.toggleSearchPreview
																}
																showFeaturedProducts
																value={value}
																onChange={(id) => {
																	if (value.includes(id)) {
																		const result = value.filter(
																			(itemId) =>
																				itemId !== id,
																		);
																		value = [...result];
																		onChange(value);
																	} else {
																		value.push(id);
																		onChange(value);
																	}
																}}
															/>
														</Modal>
													)}
												</Form.Item>
											);
										}}
									</FieldControl>

									<FieldGroup name="productsPageHandle">
										{({ disabled, value: formValue }) =>
											disabled ? null : (
												<>
													<TextInput
														name="productsPageUrlPrefix"
														label={
															<span>
																Products Page URL&nbsp;
																<Tooltip
																	title={messages.productsPageURL}
																>
																	<Icon type="question-circle-o" />
																</Tooltip>
															</span>
														}
														formItemProps={{
															help: (
																<>
																	Your products page handle is{' '}
																	<strong>
																		https://my-site.com
																		{get(
																			formValue,
																			'productsPageUrlPrefix',
																		)}
																		{
																			get(
																				formValue,
																				'productsPageUrlField',
																				'',
																			).split('.keyword')[0]
																		}
																	</strong>
																</>
															),
														}}
														inputProps={{
															placeholder: 'Enter products page URL',
															style: {
																maxWidth: 500,
															},
															addonAfter: (
																<DataFieldSelector
																	name="productsPageUrlField"
																	isAggFields
																	controlProps={{
																		// TODO: Set only for shopify apps
																		formState: 'handle.keyword',
																		options: {
																			validators:
																				Validators.required,
																		},
																	}}
																/>
															),
														}}
														controlProps={{
															formState: 'products/',
															strict: false,
															options: {
																validators: Validators.required,
															},
														}}
													/>
												</>
											)
										}
									</FieldGroup>
									<TextInput
										name="maxProducts"
										label="Max Products count"
										inputProps={{
											placeholder: 'Enter CTA title',
											type: 'number',
											style: {
												maxWidth: 300,
											},
										}}
									/>
									{!isEditing && (
										<Flex justifyContent="center">
											<Button
												disabled={invalid}
												onClick={this.addControl}
												type="primary"
											>
												Save
											</Button>
										</Flex>
									)}
								</Form>
							)}
						</FieldGroup>
					</div>
				) : (
					<div>
						<div
							style={{
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'flex-end',
							}}
						>
							<Button
								style={{
									marginBottom: 10,
								}}
								type="primary"
								icon="plus"
								onClick={() => this.showForm()}
							>
								Add
							</Button>
						</div>
						<FieldArray strict={false} control={this.recommendationControl}>
							{({ controls }) => (
								<Table
									rowKey={(item) => item.id}
									dataSource={controls.map((control) => ({
										id: get(control, 'meta.id'),
										...control.value,
									}))}
									columns={this.columns}
									className={tableStyles}
									locale={{
										emptyText: 'No recommendation found',
									}}
								/>
							)}
						</FieldArray>
					</div>
				)}
			</div>
		);
	}
}

Recommendations.propTypes = {
	getPreferences: func.isRequired,
	appName: PropTypes.string.isRequired,
	defaultSettings: PropTypes.object,
	isLoading: PropTypes.bool,
	isUpdating: PropTypes.bool,
	resetState: PropTypes.object,
	settings: PropTypes.object,
	tier: allowedTiers,
	featureSearchRelevancy: PropTypes.bool,
	getDefaultSettingsAction: PropTypes.func.isRequired,
	getSettingsAction: PropTypes.func.isRequired,
	updateSettingsAction: PropTypes.func.isRequired,
	updateLocalRelevancy: PropTypes.func.isRequired,
	localRelevancy: PropTypes.object,
	isFetchingMapping: PropTypes.bool.isRequired,
	mappings: PropTypes.object,
};

Recommendations.defaultProps = {
	isUpdating: false,
	settings: null,
	resetState: {},
	defaultSettings: null,
	isLoading: false,
	tier: undefined,
	featureSearchRelevancy: false,
	localRelevancy: null,
	mappings: null,
};

const mapStateToProps = (state) => {
	const defaultSettings = get(state.$getAppSettings, `defaultSettings`);
	const errorCode = get(state, '$getAppSettings.error.actual.code');
	const defaultSearchSettings = errorCode === 404 ? defaultSettings : null;
	const appName = get(state, '$getCurrentApp.name');
	const localRelevancy = get(state, `$getLocalRelevancy.${appName}`, null);

	return {
		isLoading: get(state, '$getAppSettings.isFetching'),
		settings: get(state, ['$getAppSettings', 'settings', appName], defaultSearchSettings),
		isUpdating: get(state, '$getAppSettings.isUpdating'),
		defaultSettings: get(state, '$getAppSettings.defaultSettings'),
		appName,
		resetState: get(state, '$getAppSettings.default', {}),
		tier: get(state, '$getAppPlan.results.tier'),
		featureSearchRelevancy: get(state, '$getAppPlan.results.feature_search_relevancy', false),
		isFetchingMapping: get(state, '$getAppMappings.isFetching', false),
		localRelevancy,
		mappings: getRawMappingsByAppName(state) || null,
	};
};

const mapDispatchToProps = (dispatch) => ({
	getDefaultSettingsAction: () => dispatch(getDefaultSettings()),
	getSettingsAction: (name) => dispatch(getSearchRelevancy(name)),
	updateSettingsAction: (name, payload) => dispatch(putSettings(name, payload)),
	deleteSettingsAction: (name) => dispatch(deleteSettings(name)),
	updateLocalRelevancy: (name, data) => dispatch(setLocalRelevancyState(name, data)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Recommendations);
