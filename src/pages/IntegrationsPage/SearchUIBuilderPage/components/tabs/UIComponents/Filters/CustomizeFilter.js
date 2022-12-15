import React from 'react';
import { Button, Modal, Switch, Select, Radio, Typography, Form } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { string, object, func, bool } from 'prop-types';
import get from 'lodash/get';
import { FieldGroup, FieldControl, FormBuilder } from 'react-reactive-form';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import { componentTypes } from '@appbaseio/reactivesearch';
import { connect } from 'react-redux';
import Dragger from './Dragger';
import LivePreview from '../LivePreview';
import CopyCode from './CopyCode';
import DataFieldSelector from '../../../../../../../components/Form/DataFieldSelector';
import TextInput from '../../../../../../../components/Form/Input';
import { RANGE_FIELDS, CALENDAR_INTERVAL_FIELDS } from '../../../../../../../constants';
import { DatePickerStyles, filterModalStyles } from './styles';
import 'react-day-picker/lib/style.css';
import Data from './Data';
import { dataPropFromArray } from '../../../../../utils/utils';
import { BACKENDS } from '../../../../../../../batteries/utils';
import { CardButton, CodeEditorCard } from '../styles';
import CodeEditorModal from '../CodeEditorModal';
import { getTemplate } from '../../../../../utils/index';

class CustomizeFilter extends React.Component {
	state = {
		visible: false,
		showDefaultQueryEditor: false,
		showCustomQueryEditor: false,
		aggregationsWithCount: {
			isLoading: false,
			data: [],
		},
	};

	message = '';

	componentDidMount() {
		const { control } = this.props;
		control.get('componentType').valueChanges.subscribe((value) => {
			if (value === componentTypes.tabDataList) {
				if (control.get('data')) {
					control.setControl('data', FormBuilder.array(dataPropFromArray([])));
				} else {
					control.addControl('data', FormBuilder.array(dataPropFromArray([])));
				}
			}
		});
	}

	showModal = () => {
		this.setState({
			visible: true,
			dataFieldType: undefined,
			message: '',
		});
	};

	handleOk = () => {
		this.setState({
			visible: false,
		});

		const { onSave, control, onModalClose } = this.props;

		if (onSave) {
			onSave(control);
		}
		if (onModalClose) {
			onModalClose();
		}
	};

	handleCancel = () => {
		const { onCancel } = this.props;
		if (onCancel) {
			onCancel();
		}
		this.setState({
			visible: false,
		});
	};

	setFieldType = (val, formControl) => {
		const { type, control } = this.props;
		if (control && control.value.componentType === componentTypes.tabDataList) {
			this.setState({ aggregationsWithCount: { isLoading: true, data: [] } });
		}

		if (type !== 'price') {
			if (RANGE_FIELDS.includes(val)) {
				this.setState({
					dataFieldType: 'range',
				});
				// eslint-disable-next-line
				formControl.parent?.get('filterType')?.setValue('range');
			} else if (val === 'date') {
				this.setState({
					dataFieldType: 'date',
				});
				// eslint-disable-next-line
				formControl.parent?.get('filterType')?.setValue('date');
			} else {
				this.setState({
					dataFieldType: 'list',
				});
				// eslint-disable-next-line
				formControl.parent?.get('filterType')?.setValue('list');
			}
		} else if (!RANGE_FIELDS.includes(val)) {
			this.setState({
				message:
					'Field is expected to be of Numeric type. Facet may not render correctly otherwise.',
			});
		} else {
			this.setState({
				message: '',
			});
		}
	};

	render() {
		const {
			visible,
			dataFieldType,
			message,
			showCustomQueryEditor,
			showDefaultQueryEditor,
			aggregationsWithCount,
		} = this.state;
		const {
			buttonLabel,
			control,
			buttonProps,
			disableListOptions,
			disableFilterType,
			type,
			getPreferencesPayload,
			backend,
			form,
		} = this.props;
		const { pipeline } = this.props;
		const themeType = form && form.get('themeType') ? form.get('themeType').value : 'classic';
		const templateObj = getTemplate(themeType || 'classic');

		const handleComponentTypeChange = (componentType) => {
			const showSearchControl = control.get('showSearch');
			if (showSearchControl) {
				if (componentType === componentTypes.tabDataList) {
					showSearchControl.setValue(false);
				} else {
					showSearchControl.setValue(true);
				}
			}
		};

		return (
			<React.Fragment>
				<Button {...buttonProps} onClick={this.showModal}>
					{buttonLabel}
				</Button>
				<FieldGroup
					strict={false}
					name={control ? undefined : 'customize'}
					control={control}
				>
					{({ pristine, invalid, value }) => {
						return (
							<Modal
								title="Set A Custom Facet"
								visible={visible}
								onOk={this.handleOk}
								onCancel={this.handleCancel}
								okButtonProps={{
									disabled: invalid || pristine,
								}}
								bodyStyle={{ height: '90%' }}
								style={{ top: 10, padding: 0 }}
								destroyOnClose
								okText="Save"
								width="90%"
							>
								<div className={filterModalStyles}>
									<div className="left-container">
										<h3 className="section-header">Configure Component</h3>
										<Form colon={false} layout="vertical">
											<FieldControl
												name="dataField"
												control={control.get('dataField')}
											>
												{(formControl) =>
													formControl.disabled ? null : (
														<Form.Item label="DataField">
															<DataFieldSelector
																isAggFields
																pipeline={pipeline}
																control={formControl}
																setFieldType={(val) => {
																	if (message) {
																		this.setState({
																			message: '',
																		});
																	}
																	this.setFieldType(
																		val,
																		formControl,
																	);
																}}
																form={form}
															/>
															{type === 'color' &&
																value.dataField && (
																	<div
																		style={{
																			lineHeight: 'normal',
																			color: 'tomato',
																		}}
																	>
																		Field is expected to be of
																		Color / List type. Facet may
																		not render correctly
																		otherwise.
																	</div>
																)}
														</Form.Item>
													)
												}
											</FieldControl>
											{!disableFilterType && (
												<div>
													<FieldControl
														name="filterType"
														strict={false}
														control={control.get('filterType')}
													>
														{(formControl) => {
															return (
																<Form.Item
																	label="Display Filter As"
																	layout="horizantal"
																>
																	<Radio.Group
																		{...formControl.handler()}
																		onChange={(e) => {
																			formControl.markAsTouched();
																			formControl
																				.handler()
																				.onChange(
																					e.target.value,
																				);
																			if (
																				dataFieldType !==
																					e.target
																						.value &&
																				value.dataField
																			) {
																				if (
																					dataFieldType ===
																					'date'
																				) {
																					this.setState({
																						message:
																							'Field is expected to be of Date type. Facet may not render correctly otherwise.',
																					});
																				} else {
																					this.setState({
																						message:
																							'Field is expected to be of Numeric type. Facet may not render correctly otherwise.',
																					});
																				}
																			} else {
																				this.setState({
																					message: '',
																				});
																			}
																		}}
																	>
																		<Radio value="list">
																			List
																		</Radio>
																		{dataFieldType !==
																			'list' && (
																			<>
																				<Radio value="range">
																					Range
																				</Radio>
																				<Radio value="date">
																					Date
																				</Radio>
																			</>
																		)}
																	</Radio.Group>
																</Form.Item>
															);
														}}
													</FieldControl>
													{message && (
														<div
															style={{
																lineHeight: 'normal',
																color: 'orange',
															}}
														>
															<span
																style={{
																	marginRight: 5,
																}}
																role="img"
																aria-label="warning"
															>
																⚠️
															</span>

															{message}
														</div>
													)}
												</div>
											)}

											{!disableListOptions &&
											control.get('filterType') &&
											control.get('filterType').value === 'list' ? (
												<FieldControl
													name="componentType"
													strict={false}
													control={control.get('componentType')}
												>
													{({ handler }) => (
														<Form.Item label="Pick List type">
															<Select
																{...handler()}
																onChange={(val) => {
																	handleComponentTypeChange(val);
																	handler().onChange(val);
																}}
															>
																<Select.Option
																	key={componentTypes.multiList}
																>
																	MultiList
																</Select.Option>
																<Select.Option
																	key={componentTypes.singleList}
																>
																	SingleList
																</Select.Option>
																{templateObj.template !== 'vue' && (
																	<Select.Option
																		key={
																			componentTypes.tagCloud
																		}
																	>
																		TagCloud
																	</Select.Option>
																)}
																{templateObj.template !== 'vue' && (
																	<Select.Option
																		key={
																			componentTypes.tabDataList
																		}
																	>
																		TabDataList
																	</Select.Option>
																)}
															</Select>
														</Form.Item>
													)}
												</FieldControl>
											) : null}

											<TextInput
												name="title"
												label="Title"
												inputProps={{
													placeholder: 'Enter title',
												}}
												control={control.get('title')}
											/>

											{!disableListOptions &&
												control.get('filterType') &&
												control.get('filterType').value === 'list' && (
													<>
														{![componentTypes.tabDataList].includes(
															value.componentType,
														) ? (
															<TextInput
																name="size"
																label="Size"
																inputProps={{
																	placeholder: 'Enter size',
																	type: 'number',
																}}
																control={control.get('size')}
															/>
														) : null}
														{![componentTypes.tabDataList].includes(
															value.componentType,
														) ? (
															<FieldControl
																strict={false}
																name="queryFormat"
																control={control.get('queryFormat')}
															>
																{({ handler }) => (
																	<Form.Item label="Query Format">
																		<Select {...handler()}>
																			<Select.Option key="or">
																				Or
																			</Select.Option>
																			<Select.Option key="and">
																				And
																			</Select.Option>
																		</Select>
																	</Form.Item>
																)}
															</FieldControl>
														) : null}
														{![componentTypes.tabDataList].includes(
															value.componentType,
														) ? (
															<FieldControl
																name="sortBy"
																control={control.get('sortBy')}
															>
																{({ handler }) => (
																	<Form.Item label="Sort By">
																		<Select {...handler()}>
																			<Select.Option key="count">
																				Count
																			</Select.Option>
																			<Select.Option key="asc">
																				Asc
																			</Select.Option>
																			<Select.Option key="desc">
																				Desc
																			</Select.Option>
																		</Select>
																	</Form.Item>
																)}
															</FieldControl>
														) : null}
														<FieldControl
															name="showCount"
															control={control.get('showCount')}
														>
															{({ handler }) => (
																<Form.Item label="Show Count">
																	<Switch
																		{...handler('checkbox')}
																	/>
																</Form.Item>
															)}
														</FieldControl>
														{![
															componentTypes.tagCloud,
															componentTypes.tabDataList,
														].includes(value.componentType) ? (
															<FieldControl
																name="showCheckbox"
																control={control.get(
																	'showCheckbox',
																)}
															>
																{({ handler }) => (
																	<Form.Item label="Show Checkbox">
																		<Switch
																			{...handler('checkbox')}
																		/>
																	</Form.Item>
																)}
															</FieldControl>
														) : null}
														{![componentTypes.tagCloud].includes(
															value.componentType,
														) ? (
															<FieldControl
																name="showSearch"
																control={control.get('showSearch')}
															>
																{({ handler }) => (
																	<Form.Item label="Show Search">
																		<Switch
																			{...handler('checkbox')}
																		/>
																	</Form.Item>
																)}
															</FieldControl>
														) : null}
														{![componentTypes.tabDataList].includes(
															value.componentType,
														) ? (
															<FieldControl
																name="showMissing"
																control={control.get('showMissing')}
															>
																{({ handler }) => (
																	<Form.Item label="Show Missing">
																		<Switch
																			{...handler('checkbox')}
																		/>
																	</Form.Item>
																)}
															</FieldControl>
														) : null}

														{value.componentType ===
														componentTypes.tagCloud ? (
															<FieldControl
																name="multiSelect"
																control={control.get('multiSelect')}
															>
																{({ handler }) => (
																	<Form.Item label="Multi Select">
																		<Switch
																			{...handler('checkbox')}
																		/>
																	</Form.Item>
																)}
															</FieldControl>
														) : null}
														{![componentTypes.tabDataList].includes(
															value.componentType,
														) ? (
															<TextInput
																name="missingLabel"
																label="Missing Label"
																inputProps={{
																	placeholder:
																		'Enter missing label',
																}}
																control={control.get(
																	'missingLabel',
																)}
															/>
														) : null}
														{![componentTypes.tagCloud].includes(
															value.componentType,
														) ? (
															<TextInput
																name="selectAllLabel"
																label="Select All Label"
																inputProps={{
																	placeholder:
																		'Enter label for select all option',
																}}
																control={control.get(
																	'selectAllLabel',
																)}
															/>
														) : null}
														{[componentTypes.tabDataList].includes(
															value.componentType,
														) ? (
															<FieldControl
																name="displayAsVertical"
																control={control.get(
																	'displayAsVertical',
																)}
															>
																{({ handler }) => (
																	<Form.Item label="Layout Vertical">
																		<Switch
																			{...handler('checkbox')}
																		/>
																	</Form.Item>
																)}
															</FieldControl>
														) : null}
														{[componentTypes.tabDataList].includes(
															value.componentType,
														) ? (
															<FieldControl
																name="showRadio"
																control={control.get('showRadio')}
															>
																{({ handler }) => (
																	<Form.Item label="Show Radio">
																		<Switch
																			{...handler('checkbox')}
																		/>
																	</Form.Item>
																)}
															</FieldControl>
														) : null}
														{[componentTypes.tabDataList].includes(
															value.componentType,
														) ? (
															<div style={{ position: 'relative' }}>
																{aggregationsWithCount.isLoading ? (
																	<img
																		style={{
																			position: 'absolute',
																			display: 'block',
																			width: '100%',
																			height: '100%',
																			backgroundColor:
																				'whitesmoke',
																			zIndex: '2',
																		}}
																		src="/static/images/loader.svg"
																		alt="loading"
																	/>
																) : null}
																<Data
																	form={control.get('data')}
																	options={aggregationsWithCount.data.map(
																		({ key }) => ({
																			value: key,
																			text: key,
																		}),
																	)}
																/>
															</div>
														) : null}
													</>
												)}

											{((!disableListOptions &&
												control.get('filterType') &&
												control.get('filterType').value === 'range') ||
												disableListOptions) && (
												<>
													<TextInput
														name="startValue"
														label="Start Value"
														inputProps={{
															placeholder: 'Enter start value',
															type: 'number',
														}}
														control={control.get('startValue')}
													/>
													<TextInput
														name="endValue"
														label="End Value"
														inputProps={{
															placeholder: 'Enter end value',
															type: 'number',
														}}
														control={control.get('endValue')}
													/>
													<TextInput
														name="startLabel"
														label="Start Label"
														inputProps={{
															placeholder: 'Enter start label',
														}}
														control={control.get('startLabel')}
													/>
													<TextInput
														name="endLabel"
														label="End Label"
														inputProps={{
															placeholder: 'Enter end label',
														}}
														control={control.get('endLabel')}
													/>
													<FieldControl
														name="showHistogram"
														control={control.get('showHistogram')}
													>
														{({ handler }) => (
															<Form.Item label="Show Histogram">
																<Switch {...handler('checkbox')} />
															</Form.Item>
														)}
													</FieldControl>
												</>
											)}

											{!disableListOptions &&
												value?.filterType === 'date' && (
													<>
														<FieldControl
															name="startValue"
															control={control.get('startValue')}
														>
															{({ handler }) => (
																<div className={DatePickerStyles}>
																	<Form.Item label="Start Value">
																		<DayPickerInput
																			placeholder="Enter start value (YYYY-MM-DD)"
																			{...handler()}
																			onDayChange={(day) => {
																				handler().onChange(
																					day,
																				);
																			}}
																		/>
																	</Form.Item>
																</div>
															)}
														</FieldControl>
														<FieldControl
															name="endValue"
															control={control.get('endValue')}
														>
															{({ handler }) => (
																<div className={DatePickerStyles}>
																	<Form.Item label="End Value">
																		<DayPickerInput
																			placeholder="Enter end value (YYYY-MM-DD)"
																			{...handler()}
																			onDayChange={(day) => {
																				handler().onChange(
																					day,
																				);
																			}}
																		/>
																	</Form.Item>
																</div>
															)}
														</FieldControl>
														<TextInput
															name="startLabel"
															label="Start Label"
															inputProps={{
																placeholder: 'Enter start label',
															}}
															control={control.get('startLabel')}
														/>
														<TextInput
															name="endLabel"
															label="End Label"
															inputProps={{
																placeholder: 'Enter end label',
															}}
															control={control.get('endLabel')}
														/>
														<FieldControl
															name="calendarInterval"
															strict={false}
															control={control.get(
																'calendarInterval',
															)}
														>
															{({ handler }) => (
																<Form.Item label="Calendar Interval">
																	<Select
																		{...handler()}
																		value={
																			handler().value ||
																			undefined
																		}
																		allowClear
																		placeholder="Specify a calendar interval"
																	>
																		{CALENDAR_INTERVAL_FIELDS.map(
																			(item) => (
																				<Select.Option
																					key={item.value}
																				>
																					{item.label}
																				</Select.Option>
																			),
																		)}
																	</Select>
																</Form.Item>
															)}
														</FieldControl>
														<FieldControl
															name="showHistogram"
															control={control.get('showHistogram')}
														>
															{({ handler }) => (
																<Form.Item label="Show Histogram">
																	<Switch
																		{...handler('checkbox')}
																	/>
																</Form.Item>
															)}
														</FieldControl>
													</>
												)}
											{value.dataField ? (
												<>
													<CodeEditorCard>
														<CardButton
															icon={<EditOutlined />}
															onClick={() =>
																this.setState({
																	showDefaultQueryEditor: true,
																})
															}
														>
															Edit
														</CardButton>
														<Typography.Paragraph>
															Default Query:
														</Typography.Paragraph>
														<Typography.Paragraph>
															Edit defaultQuery code exported as
															function
														</Typography.Paragraph>
													</CodeEditorCard>
													<CodeEditorCard>
														<CardButton
															icon={<EditOutlined />}
															onClick={() =>
																this.setState({
																	showCustomQueryEditor: true,
																})
															}
														>
															Edit
														</CardButton>
														<Typography.Paragraph>
															Set Custom Query:
														</Typography.Paragraph>
														<Typography.Paragraph>
															Edit Custom Query code exported as
															function
														</Typography.Paragraph>
													</CodeEditorCard>
												</>
											) : null}

											<FieldControl
												name="defaultQuery"
												strict={false}
												control={control?.get('defaultQuery')}
											>
												{(defaultQueryControl) => (
													<CodeEditorModal
														visible={showDefaultQueryEditor}
														onCancel={() =>
															this.setState({
																showDefaultQueryEditor: false,
															})
														}
														onSave={(code) => {
															this.setState({
																showDefaultQueryEditor: false,
															});
															defaultQueryControl
																.handler()
																.onChange(code);
														}}
														componentConfig={{
															...control.value,
															defaultQuery:
																defaultQueryControl.value ||
																`(value, props)=>({})`,
														}}
														functionProperty="defaultQuery"
														pipeline={pipeline}
														showLivePreview={false}
													/>
												)}
											</FieldControl>
											<FieldControl
												name="customQuery"
												strict={false}
												control={control?.get('customQuery')}
											>
												{(customQueryControl) => (
													<CodeEditorModal
														visible={showCustomQueryEditor}
														onCancel={() =>
															this.setState({
																showCustomQueryEditor: false,
															})
														}
														onSave={(code) => {
															this.setState({
																showCustomQueryEditor: false,
															});
															customQueryControl
																.handler()
																.onChange(code);
														}}
														componentConfig={{
															...control.value,
															customQuery:
																customQueryControl.value ||
																`(value, props)=>(${JSON.stringify(
																	{ aggs: {} },
																	null,
																	2,
																)})`,
														}}
														functionProperty="customQuery"
														pipeline={pipeline}
													/>
												)}
											</FieldControl>
										</Form>
									</div>
									<Dragger />
									<div className="right-container">
										<LivePreview
											pipeline={pipeline}
											componentConfig={control.value}
											hookOwnRender={({ rawData }) => {
												if (
													value.componentType ===
														componentTypes.tabDataList &&
													rawData
												) {
													const aggDataField = Object.keys(
														rawData.aggregations,
													)[0];
													const formDataField = value.dataField;
													const data =
														rawData.aggregations[aggDataField].buckets;
													this.setState({
														aggregationsWithCount: {
															// Show loading until formDataField and query Data Field become equal
															isLoading:
																aggDataField !== formDataField,
															data,
														},
													});
												}
											}}
										/>
										<CopyCode
											control={value}
											getPreferencesPayload={getPreferencesPayload}
											backend={backend}
										/>
									</div>
								</div>
							</Modal>
						);
					}}
				</FieldGroup>
			</React.Fragment>
		);
	}
}

CustomizeFilter.defaultProps = {
	buttonLabel: 'Customize',
	disableListOptions: false,
	control: {},
	tempControl: null,
	onSave: null,
	onCancel: null,
	buttonProps: null,
	disableFilterType: false,
	type: '',
	pipeline: undefined,
	form: {},
	getPreferencesPayload: () => {},
	onModalClose: () => {},
	backend: BACKENDS.ELASTICSEARCH.name,
};
CustomizeFilter.propTypes = {
	buttonLabel: string,
	pipeline: string,
	disableListOptions: bool,
	buttonProps: object,
	control: object,
	tempControl: object,
	onSave: func,
	onCancel: func,
	disableFilterType: bool,
	type: string,
	form: object,
	getPreferencesPayload: func,
	onModalClose: func,
	backend: string,
};

const mapStateToProps = (state) => ({
	backend: get(state, '$getAppPlan.results.backend'),
});

export default connect(mapStateToProps, null)(CustomizeFilter);
