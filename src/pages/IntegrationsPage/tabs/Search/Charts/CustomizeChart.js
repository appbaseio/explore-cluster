import React from 'react';
import { Button, Modal, Switch, Form, Select, Input, Typography, Card } from 'antd';
import { string, object, func, bool } from 'prop-types';
import styled from 'react-emotion';
import { FieldGroup, FieldControl, Validators } from 'react-reactive-form';
import { ReactiveChart } from '@appbaseio/reactivesearch';
import LivePreview from './LivePreview';
import CopyCode from './CopyCode';
import DataFieldSelector from '../../../../../components/Form/DataFieldSelector';
import { RANGE_FIELDS } from '../../../../../constants';
import CodeEditorModal from './CodeEditorModal';
import { chartTypes, queryTypes } from './constants';

const CodeEditorCard = styled(Card)`
	position: relative;
`;

const CardButton = styled(Button)`
	position: absolute;
	box-sizing: border-box;
	top: 10px;
	right: 10px;
`;

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
		showDefaultQueryEditor: false,
		supportsRangeQuery: false,
		showSetOptionEditor: false,
		customizeControlObj: {},
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
		const title = control.get('title').value;
		const xAxisName = control.get('xAxisName').value;
		const yAxisName = control.get('xAxisName').value;

		const options = ReactiveChart.getOption({
			chartType: chartType || chartTypes.term.bar.id,
			xAxisName,
			yAxisName,
			title,
			aggregationData: [],
			data: [],
		});
		const prefillTemplate = `({
				data,
				aggregationData,
				rawData,
				value
			})=>(\n${JSON.stringify(options, null, 2)}\n)`;

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

		const { onSave, control, tempControl } = this.props;
		if (tempControl && tempControl.get('enabled')) tempControl.get('enabled').setValue(true);

		if (onSave) {
			onSave(control);
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
		this.setCustomizeControlObj({});
	};

	handleDataFieldChange = (value) => {
		const supports = RANGE_FIELDS.includes(value);
		this.setState({ supportsRangeQuery: supports });
		return supports;
	};

	setCustomizeControlObj = (obj) => {
		if (Object.keys(obj).length) {
			this.setState({
				customizeControlObj: obj,
			});
		}
	};

	render() {
		const {
			visible,
			customizeControlObj,
			showDefaultQueryEditor,
			showSetOptionEditor,
			supportsRangeQuery,
		} = this.state;
		const { buttonLabel, control, buttonProps, form, getPreferencesPayload, pipeline } =
			this.props;
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
								afterClose={() => this.setCustomizeControlObj({})}
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
												/>
											</Form.Item>
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
															<Select.Option
																value={queryTypes.search}
															>
																Search
															</Select.Option>
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
														<Select {...handler()}>
															{Object.keys(
																chartTypes[value.type],
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
											{value.chartType === chartTypes.search.scatter.id ? (
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
																	withoutSuffix
																/>
															)}
														</FieldControl>
													</Form.Item>
												</>
											) : null}
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
											<Form.Item label="Use as Filter for search UI">
												<FieldControl
													name="useAsFilter"
													control={control?.get('useAsFilter')}
												>
													{({ handler }) => (
														<Switch {...handler('checkbox')} />
													)}
												</FieldControl>
											</Form.Item>
											<CodeEditorCard>
												<CardButton
													icon="edit"
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
													Edit defaultQuery code exported as function
												</Typography.Paragraph>
											</CodeEditorCard>
											<CodeEditorCard>
												<CardButton
													icon="edit"
													onClick={() =>
														this.setState({ showSetOptionEditor: true })
													}
												>
													Edit
												</CardButton>
												<Typography.Paragraph>
													Set Option:
												</Typography.Paragraph>
												<Typography.Paragraph>
													Edit Set Option code exported as function
												</Typography.Paragraph>
											</CodeEditorCard>
											<FieldControl
												name="defaultQuery"
												strict={false}
												control={control?.get('defaultQuery')}
											>
												{(defaultQueryControl) => (
													<CodeEditorModal
														defaultValue={
															defaultQueryControl.value ||
															`(value, props)=>(${JSON.stringify(
																{ aggs: {} },
																null,
																2,
															)})`
														}
														language="javascript"
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
														defaultValue={
															setOptionControl.value ||
															this.getSetOptionPrefill()
														}
														visible={showSetOptionEditor}
														language="javascript"
														onCancel={() =>
															this.setState({
																showSetOptionEditor: false,
															})
														}
														onSave={(code) => {
															this.setState({
																showSetOptionEditor: false,
															});
															setOptionControl
																.handler()
																.onChange(code);
														}}
													/>
												)}
											</FieldControl>
										</Form>
									</div>
									<div className="right-container">
										<LivePreview
											form={form}
											control={control.value}
											setCustomizeControlObj={this.setCustomizeControlObj}
											customizeControlObj={customizeControlObj}
										/>
										<CopyCode
											control={value}
											getPreferencesPayload={getPreferencesPayload}
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
};

export default CustomizeChart;
