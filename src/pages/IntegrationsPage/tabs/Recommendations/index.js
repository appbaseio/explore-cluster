import React from 'react';
import { func } from 'prop-types';
import { FieldGroup, FieldArray, FieldControl, Validators } from 'react-reactive-form';
import { Table, Button, Form, Select, Tooltip, Icon } from 'antd';
import { css } from 'emotion';

import get from 'lodash/get';
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
import SearchPreviewWrapper from '../../SearchPreviewWrapper';

const tableStyles = css`
	tr {
		.delete-icon {
			transition: all ease 0.4s;
			opacity: 0;
		}
		&:hover {
			.delete-icon {
				opacity: 1;
			}
		}
	}
`;

class Recommendations extends React.Component {
	state = {
		showForm: false,
		isEditing: false,
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
							label="Preview"
							displayProductPicker={
								item.type === RecommendationTypes.SIMILAR_PRODUCTS
							}
							similarToField={get(item, 'productsPageHandle.productsPageUrlField')}
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
			this.tempForm = getRecommendationForm(
				undefined,
				// eslint-disable-next-line
				this.context.get('exportSettings.type').value,
			);
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

	static contextType = FormContext;

	render() {
		const { showForm, isEditing } = this.state;

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
													Similar to Field&nbsp;
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
											const { value } = inputHandler;
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
													<SearchPreviewWrapper
														value={value}
														onChange={({ _id }) => {
															if (value.includes(_id)) {
																value.splice(value.indexOf(_id), 1);
																onChange([...value]);
															} else {
																value.push(_id);
																onChange([...value]);
															}
														}}
														showFeaturedProducts
													/>
												</Form.Item>
											);
										}}
									</FieldControl>

									<FieldGroup name="productsPageHandle">
										{({ disabled, value: formValue }) => {
											const urlField = get(
												formValue,
												'productsPageUrlField',
												'',
											).split('.keyword')[0];
											return disabled ? null : (
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
																		{urlField
																			? `\${${urlField}}`
																			: ''}
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
																	addOptions={
																		<Select.Option
																			key="_id"
																			title="_id"
																		>
																			_id
																		</Select.Option>
																	}
																	controlProps={{
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
											);
										}}
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
};

export default Recommendations;
