import React from 'react';
import { Button, Modal, Switch, Select, Input, Typography, Form } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { string, object, func, bool } from 'prop-types';
import styled from 'react-emotion';
import get from 'lodash/get';
import { FieldGroup, FieldControl, Validators } from 'react-reactive-form';
import { ReactiveChart } from '@appbaseio/reactivesearch';
import { connect } from 'react-redux';
import { BACKENDS } from '../../../../../batteries/utils';
import LivePreview from '../LivePreview';
import CopyCode from './CopyCode';
import DataFieldSelector from '../../../../../components/Form/DataFieldSelector';
import { RANGE_FIELDS } from '../../../../../constants';
import CodeEditorModal from '../CodeEditorModal';
import { chartTypes, customChartType, queryTypes } from './constants';
import { CardButton, CodeEditorCard } from '../styles';

function setValidator(control, validators) {
	control.setValidators(validators);
	control.setValue(control.value || undefined);
}

const ModalContainer = styled('div')`
	display: flex;

	.resizer {
		width: 2px;
		cursor: ew-resize;
		background-color: #cbd5e0;
	}
	.left-container {
		width: 50%;
		padding-right: 20px;
		height: calc(80vh - 20px);
		overflow: scroll;
	}
	.right-container {
		padding: 0px 20px;
		width: 100%;
		max-width: 65%;
		min-width: 50%;
		height: calc(80vh - 20px);
		overflow: scroll;
	}
	.preview-container {
		padding: 20px;
		background: #e3e4e5;
		display: flex;
		justify-content: center;
	}
	.section-header {
		font-weight: bold;
		margin-top: 20px;
	}
	.icon-active {
		float: right;
		font-size: 18px;
		&:hover {
			color: #40a9ff;
		}
	}
`;

class CustomizeChart extends React.Component {
	state = {
		visible: false,
		supportsRangeQuery: false,
		currentEditorModal: '',
	};

	message = '';

	componentWillUnmount() {
		// eslint-disable-next-line
		this.props.control?.get('filterType')?.valueChanges.unsubscribe();
	}

	showModal = () => {
		this.setState({
			visible: true,
		});
	};

	getSetOptionPrefill = () => {
		const { control } = this.props;
		const chartType = control.get('chartType').value;

		const prefillTemplate = ReactiveChart.getOptionAsString(
			chartType || chartTypes.term.bar.id,
		);

		return prefillTemplate;
	};

	handleSaveDefaultQueryCode = (value) => {
		const { control } = this.props;
		// eslint-disable-next-line no-unused-expressions
		control.get('defaultQuery').setValue(value);
	};

	handleSaveSetOption = (value) => {
		const { control } = this.props;
		// eslint-disable-next-line no-unused-expressions
		control.get('setOption').setValue(value);
	};

	handleOk = () => {
		this.setState({
			visible: false,
		});

		const { onSave, control, tempControl, onModalClose } = this.props;
		if (tempControl && tempControl.get('enabled')) tempControl.get('enabled').setValue(true);

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

	handleDataFieldChange = (value) => {
		const supports = RANGE_FIELDS.includes(value);
		// Temporarily enable range for all fields
		this.setState({ supportsRangeQuery: true });
		// const supports = RANGE_FIELDS.includes(value) || value === 'date';
		// this.setState({ supportsRangeQuery: supports });
		return supports;
	};

	render() {
		const { visible, currentEditorModal, supportsRangeQuery } = this.state;
		const {
			buttonLabel,
			control,
			buttonProps,
			getPreferencesPayload,
			pipeline,
			form,
			backend,
		} = this.props;
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
						const showFunctionEditors = value.dataField && value.chartType;
						return (
							<Modal
								title="Set Chart"
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
								<ModalContainer>
									<div className="left-container">
										<Form>
											<Form.Item label="Data Field">
												<DataFieldSelector
													isAggFields
													pipeline={pipeline}
													control={control?.get('dataField')}
													setFieldType={this.handleDataFieldChange}
													form={form}
												/>
											</Form.Item>
											{value.chartType === chartTypes.range.scatter.id ? (
												<>
													<Form.Item label="X-Axis Field">
														<FieldControl
															name="xAxisField"
															options={{
																validators: Validators.required,
															}}
														>
															{(fieldControl) => (
																<DataFieldSelector
																	isAggFields
																	pipeline={pipeline}
																	control={fieldControl}
																	setFieldType={() => {
																		return null;
																	}}
																	showRangeFieldsOnly
																	withoutSuffix
																/>
															)}
														</FieldControl>
													</Form.Item>
													<Form.Item label="Y-Axis Field">
														<FieldControl
															name="yAxisField"
															options={{
																validators: Validators.required,
															}}
														>
															{(fieldControl) => (
																<DataFieldSelector
																	isAggFields
																	pipeline={pipeline}
																	control={fieldControl}
																	setFieldType={() => {
																		return null;
																	}}
																	showRangeFieldsOnly
																	withoutSuffix
																/>
															)}
														</FieldControl>
													</Form.Item>
												</>
											) : null}
											<Form.Item label="Type of Query">
												<FieldControl
													name="type"
													control={control.get('type')}
												>
													{({ handler }) => (
														<Select {...handler()}>
															<Select.Option value={queryTypes.term}>
																Term
															</Select.Option>
															{supportsRangeQuery ? (
																<Select.Option
																	value={queryTypes.range}
																>
																	Range
																</Select.Option>
															) : null}
														</Select>
													)}
												</FieldControl>
											</Form.Item>
											<Form.Item label="Type of Chart">
												<FieldControl
													name="chartType"
													control={control.get('chartType')}
												>
													{({ handler }) => (
														<Select
															{...handler()}
															onChange={(val) => {
																const defaultQueryControl =
																	control.get('defaultQuery');
																const setQueryControl =
																	control.get('setOption');

																if (val === customChartType) {
																	setValidator(
																		defaultQueryControl,
																		Validators.required,
																	);
																	setValidator(
																		setQueryControl,
																		Validators.required,
																	);
																} else {
																	setValidator(
																		defaultQueryControl,
																		null,
																	);
																	setValidator(
																		setQueryControl,
																		null,
																	);
																}
																handler().onChange(val);
															}}
														>
															{Object.keys(
																chartTypes[value.type] || {},
															).map((key) => {
																const chart =
																	chartTypes[value.type]?.[key];
																return (
																	<Select.Option
																		key={chart.id}
																		value={key}
																	>
																		{chart.label}
																	</Select.Option>
																);
															})}
															<Select.Option
																key={customChartType}
																value={customChartType}
															>
																Custom Chart
															</Select.Option>
														</Select>
													)}
												</FieldControl>
											</Form.Item>
											<Form.Item label="Title">
												<FieldControl
													name="title"
													control={control.get('title')}
												>
													{({ handler }) => (
														<Input type="text" {...handler()} />
													)}
												</FieldControl>
											</Form.Item>
											<Form.Item label="X-Axis Name">
												<FieldControl
													name="xAxisName"
													control={control.get('xAxisName')}
												>
													{({ handler }) => (
														<Input type="text" {...handler()} />
													)}
												</FieldControl>
											</Form.Item>
											<Form.Item label="Y-Axis Name">
												<FieldControl
													name="yAxisName"
													control={control.get('yAxisName')}
												>
													{({ handler }) => (
														<Input type="text" {...handler()} />
													)}
												</FieldControl>
											</Form.Item>
											{value.type === queryTypes.term ? (
												<>
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
												</>
											) : null}
											{value.type === queryTypes.range ? (
												<>
													<Form.Item label="Start value">
														<FieldControl
															name="startValue"
															control={control?.get('startValue')}
														>
															{({ handler }) => (
																<Input type="text" {...handler()} />
															)}
														</FieldControl>
													</Form.Item>
													<Form.Item label="End value">
														<FieldControl
															name="endValue"
															control={control?.get('endValue')}
														>
															{({ handler }) => (
																<Input type="text" {...handler()} />
															)}
														</FieldControl>
													</Form.Item>
													<Form.Item label="Label formatter">
														<FieldControl
															name="labelFormatter"
															control={control?.get('labelFormatter')}
														>
															{({ handler }) => (
																<Input
																	type="text"
																	{...handler()}
																	placeholder="[value] USD"
																/>
															)}
														</FieldControl>
													</Form.Item>
												</>
											) : null}
											{value.chartType ===
											chartTypes.range.scatter.id ? null : (
												<Form.Item label="Use as Filter for search UI">
													<FieldControl
														name="useAsFilter"
														control={control?.get('useAsFilter')}
													>
														{({ handler }) => (
															<Switch
																{...handler('checkbox')}
																onChange={(val) => {
																	const customQueryControl =
																		control.get('customQuery');
																	if (
																		val &&
																		control.value.chartType ===
																			customChartType
																	) {
																		setValidator(
																			customQueryControl,
																			Validators.required,
																		);
																	} else {
																		setValidator(
																			customQueryControl,
																			null,
																		);
																	}
																	handler('checkbox').onChange(
																		val,
																	);
																}}
															/>
														)}
													</FieldControl>
												</Form.Item>
											)}
											{showFunctionEditors ? (
												<>
													<CodeEditorCard>
														<CardButton
															icon={<EditOutlined />}
															onClick={() =>
																this.setState({
																	currentEditorModal:
																		'defaultQuery',
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
																	currentEditorModal: 'setOption',
																})
															}
														>
															Edit
														</CardButton>
														<Typography.Paragraph>
															Set Option:
														</Typography.Paragraph>
														<Typography.Paragraph>
															Edit Set Option code exported as
															function
														</Typography.Paragraph>
													</CodeEditorCard>
													{control.value.useAsFilter ? (
														<CodeEditorCard>
															<CardButton
																icon={<EditOutlined />}
																onClick={() =>
																	this.setState({
																		currentEditorModal:
																			'customQuery',
																	})
																}
															>
																Edit
															</CardButton>
															<Typography.Paragraph>
																Custom Query:
															</Typography.Paragraph>
															<Typography.Paragraph>
																Edit Custom Query code exported as
																function
															</Typography.Paragraph>
														</CodeEditorCard>
													) : null}
												</>
											) : null}
											<FieldControl
												name="defaultQuery"
												strict={false}
												control={control?.get('defaultQuery')}
											>
												{(defaultQueryControl) => (
													<CodeEditorModal
														visible={
															currentEditorModal === 'defaultQuery'
														}
														onCancel={() =>
															this.setState({
																currentEditorModal: '',
															})
														}
														onSave={(code) => {
															this.setState({
																currentEditorModal: '',
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
														showLivePreview={false}
														pipeline={pipeline}
													/>
												)}
											</FieldControl>
											<FieldControl
												name="setOption"
												strict={false}
												control={control?.get('setOption')}
											>
												{(setOptionControl) => (
													<CodeEditorModal
														visible={currentEditorModal === 'setOption'}
														onCancel={() =>
															this.setState({
																currentEditorModal: '',
															})
														}
														onSave={(code) => {
															this.setState({
																currentEditorModal: '',
															});
															setOptionControl
																.handler()
																.onChange(code);
														}}
														componentConfig={{
															...control.value,
															setOption:
																setOptionControl.value ||
																this.getSetOptionPrefill(),
														}}
														showResponseOutput={false}
														showLivePreview={false}
														functionProperty="setOption"
														pipeline={pipeline}
														header={
															<div>
																<p>
																	<b>Customize Chart Display:</b>
																</p>
																<p>
																	<span>
																		Charts are built with Apache
																		Echarts library.
																	</span>
																	&nbsp;
																	<a
																		target="_blank"
																		href="https://echarts.apache.org/examples/en/index.html"
																		rel="noreferrer"
																	>
																		See their examples
																	</a>
																	&nbsp;
																	<span>
																		for options structure, they
																		can also be pasted in the
																		function body
																	</span>
																</p>
															</div>
														}
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
														visible={
															currentEditorModal === 'customQuery'
														}
														onCancel={() =>
															this.setState({
																currentEditorModal: '',
															})
														}
														onSave={(code) => {
															this.setState({
																currentEditorModal: '',
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
									<div className="right-container">
										<LivePreview
											pipeline={pipeline}
											componentConfig={control.value}
										/>
										<CopyCode
											control={value}
											getPreferencesPayload={getPreferencesPayload}
											backend={backend}
										/>
									</div>
								</ModalContainer>
							</Modal>
						);
					}}
				</FieldGroup>
			</React.Fragment>
		);
	}
}

CustomizeChart.defaultProps = {
	buttonLabel: 'Customize',
	buttonProps: null,
	disableListOptions: false,
	control: {},
	tempControl: null,
	onSave: null,
	onCancel: null,
	disableFilterType: false,
	type: '',
	pipeline: undefined,
	form: {},
	getPreferencesPayload: () => {},
	onModalClose: () => {},
	backend: BACKENDS.ELASTICSEARCH.name,
};
CustomizeChart.propTypes = {
	buttonLabel: string,
	buttonProps: object,
	pipeline: string,
	disableListOptions: bool,
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

export default connect(mapStateToProps, null)(CustomizeChart);
