import React from 'react';
import { Button, Modal, Switch, Form, Select, List, Radio } from 'antd';
import { string, object, func, bool } from 'prop-types';
import { css } from 'emotion';
import { FieldGroup, FieldControl } from 'react-reactive-form';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import 'react-day-picker/lib/style.css';
import DataFieldSelector from '../../../../components/Form/DataFieldSelector';
import TextInput from '../../../../components/Form/Input';
import { RANGE_FIELDS, CALENDAR_INTERVAL_FIELDS } from '../../../../constants';

const { Item } = List;

const DatePickerStyles = css`
	.ant-form-item-control {
		line-height: 12px;
	}
	.DayPickerInput {
		width: 100%;
	}
	input {
		width: 100%;
		height: 32px;
		padding: 4px 11px;

		border: 1px solid #d9d9d9;
		border-radius: 4px;
	}
`;

class CustomizeFilter extends React.Component {
	state = {
		visible: false,
	};

	message = '';

	showModal = () => {
		this.setState({
			visible: true,
			dataFieldType: undefined,
			message: '',
		});
	};

	handleOk = () => {
		const { onSave, control, tempControl } = this.props;
		if (tempControl && tempControl.get('enabled')) tempControl.get('enabled').setValue(true);

		if (onSave) {
			onSave(control);
		}
		this.setState({
			visible: false,
		});
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
		const { type } = this.props;

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
		const { visible, dataFieldType, message } = this.state;
		const { buttonLabel, control, buttonProps, disableListOptions, disableFilterType, type } =
			this.props;
		const { pipeline } = this.props;

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
								title="Set A Custom Filter"
								visible={visible}
								onOk={this.handleOk}
								onCancel={this.handleCancel}
								destroyOnClose
								footer={[
									<Button key="back" onClick={this.handleCancel}>
										Cancel
									</Button>,
									<Button
										disabled={invalid || pristine}
										key="submit"
										type="primary"
										onClick={this.handleOk}
									>
										Save
									</Button>,
								]}
							>
								<Form colon={false}>
									<FieldControl name="dataField">
										{(formControl) =>
											formControl.disabled ? null : (
												<Form.Item label="DataField">
													<DataFieldSelector
														isAggFields
														pipeline={pipeline}
														control={formControl}
														setFieldType={(val) =>
															this.setFieldType(val, formControl)
														}
													/>
													{type === 'color' && value.dataField && (
														<div
															style={{
																lineHeight: 'normal',
																color: 'tomato',
															}}
														>
															Field is expected to be of Color / List
															type. Facet may not render correctly
															otherwise.
														</div>
													)}
												</Form.Item>
											)
										}
									</FieldControl>
									{!disableFilterType && (
										<div>
											<FieldControl name="filterType" strict={false}>
												{(formControl) => {
													return (
														<Item
															actions={[
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
																				e.target.value &&
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
																	<Radio value="list">List</Radio>
																	{dataFieldType !== 'list' && (
																		<>
																			<Radio value="range">
																				Range
																			</Radio>
																			<Radio value="date">
																				Date
																			</Radio>
																		</>
																	)}
																</Radio.Group>,
															]}
														>
															<Item.Meta title="Display Filter As" />
														</Item>
													);
												}}
											</FieldControl>
											{message && (
												<div
													style={{
														lineHeight: 'normal',
														color: 'tomato',
													}}
												>
													{message}
												</div>
											)}
										</div>
									)}
									<TextInput
										name="title"
										label="Title"
										inputProps={{
											placeholder: 'Enter title',
										}}
									/>

									{!disableListOptions && value?.filterType === 'list' && (
										<>
											<TextInput
												name="size"
												label="Size"
												inputProps={{
													placeholder: 'Enter size',
													type: 'number',
												}}
											/>
											<FieldControl strict={false} name="queryFormat">
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
											<FieldControl name="sortBy">
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
											<FieldControl name="showCount">
												{({ handler }) => (
													<Form.Item label="Show Count">
														<Switch {...handler('checkbox')} />
													</Form.Item>
												)}
											</FieldControl>
											<FieldControl name="showCheckbox">
												{({ handler }) => (
													<Form.Item label="Show Checkbox">
														<Switch {...handler('checkbox')} />
													</Form.Item>
												)}
											</FieldControl>
											<FieldControl name="showSearch">
												{({ handler }) => (
													<Form.Item label="Show Search">
														<Switch {...handler('checkbox')} />
													</Form.Item>
												)}
											</FieldControl>
											<FieldControl name="showMissing">
												{({ handler }) => (
													<Form.Item label="Show Missing">
														<Switch {...handler('checkbox')} />
													</Form.Item>
												)}
											</FieldControl>
											<TextInput
												name="missingLabel"
												label="Missing Label"
												inputProps={{
													placeholder: 'Enter missing label',
												}}
											/>
											<TextInput
												name="selectAllLabel"
												label="Select All Label"
												inputProps={{
													placeholder:
														'Enter label for select all option',
												}}
											/>
										</>
									)}

									{((!disableListOptions && value?.filterType === 'range') ||
										disableListOptions) && (
										<>
											<TextInput
												name="startValue"
												label="Start Value"
												inputProps={{
													placeholder: 'Enter start value',
													type: 'number',
												}}
											/>
											<TextInput
												name="endValue"
												label="End Value"
												inputProps={{
													placeholder: 'Enter end value',
													type: 'number',
												}}
											/>
											<TextInput
												name="startLabel"
												label="Start Label"
												inputProps={{
													placeholder: 'Enter start label',
												}}
											/>
											<TextInput
												name="endLabel"
												label="End Label"
												inputProps={{
													placeholder: 'Enter end label',
												}}
											/>
											<FieldControl name="showHistogram">
												{({ handler }) => (
													<Form.Item label="Show Histogram">
														<Switch {...handler('checkbox')} />
													</Form.Item>
												)}
											</FieldControl>
										</>
									)}

									{!disableListOptions && value?.filterType === 'date' && (
										<>
											<FieldControl name="startValue">
												{({ handler }) => (
													<div css={DatePickerStyles}>
														<Form.Item label="Start Value">
															<DayPickerInput
																placeholder="Enter start value (YYYY-MM-DD)"
																{...handler()}
																onDayChange={(day) => {
																	handler().onChange(day);
																}}
															/>
														</Form.Item>
													</div>
												)}
											</FieldControl>
											<FieldControl name="endValue">
												{({ handler }) => (
													<div css={DatePickerStyles}>
														<Form.Item label="End Value">
															<DayPickerInput
																placeholder="Enter end value (YYYY-MM-DD)"
																{...handler()}
																onDayChange={(day) => {
																	handler().onChange(day);
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
											/>
											<TextInput
												name="endLabel"
												label="End Label"
												inputProps={{
													placeholder: 'Enter end label',
												}}
											/>
											<FieldControl name="calendarInterval" strict={false}>
												{({ handler }) => (
													<Form.Item label="Calendar Interval">
														<Select
															{...handler()}
															value={handler().value || undefined}
															allowClear
															placeholder="Specify a calendar interval"
														>
															{CALENDAR_INTERVAL_FIELDS.map(
																(item) => (
																	<Select.Option key={item.value}>
																		{item.label}
																	</Select.Option>
																),
															)}
														</Select>
													</Form.Item>
												)}
											</FieldControl>
											<FieldControl name="showHistogram">
												{({ handler }) => (
													<Form.Item label="Show Histogram">
														<Switch {...handler('checkbox')} />
													</Form.Item>
												)}
											</FieldControl>
										</>
									)}
								</Form>
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
	control: null,
	tempControl: null,
	onSave: null,
	onCancel: null,
	buttonProps: null,
	disableFilterType: false,
	type: '',
	pipeline: undefined,
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
};

export default CustomizeFilter;
