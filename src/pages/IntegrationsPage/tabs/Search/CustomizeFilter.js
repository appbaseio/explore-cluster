import React from 'react';
import { Button, Modal, Switch, Form, Select, List, Radio } from 'antd';
import { string, object, func, bool } from 'prop-types';
import { FieldGroup, FieldControl } from 'react-reactive-form';
import DataFieldSelector from '../../../../components/Form/DataFieldSelector';
import TextInput from '../../../../components/Form/Input';

const { Item } = List;

class CustomizeFilter extends React.Component {
	state = {
		visible: false,
		filterType: 'list',
	};

	showModal = () => {
		this.setState({
			visible: true,
		});
	};

	handleOk = () => {
		const { onSave, control } = this.props;
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

	render() {
		const { visible, filterType } = this.state;
		const { buttonLabel, control, buttonProps, disableListOptions } = this.props;
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
					{({ pristine, invalid }) => (
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
													control={formControl}
												/>
											</Form.Item>
										)
									}
								</FieldControl>
								<FieldControl name="filterType">
									{(formControl) => (
										<Item
											actions={[
												<Radio.Group
													{...formControl.handler()}
													onChange={(e) => {
														this.setState({
															filterType: e.target.value,
														});
														formControl.markAsTouched();
														formControl
															.handler()
															.onChange(e.target.value);
													}}
													value={filterType}
												>
													<Radio value="list">MultiList</Radio>
													<Radio value="range">RangeSlider</Radio>
												</Radio.Group>,
											]}
										>
											<Item.Meta title="Choose Type" />
										</Item>
									)}
								</FieldControl>
								<TextInput
									name="title"
									label="Title"
									inputProps={{
										placeholder: 'Enter title',
									}}
								/>

								{!disableListOptions && filterType === 'list' && (
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
														<Select.Option key="or">Or</Select.Option>
														<Select.Option key="and">And</Select.Option>
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
														<Select.Option key="asc">Asc</Select.Option>
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
											name="filterLabel"
											label="Filter Label"
											inputProps={{
												placeholder: 'Enter filter label',
											}}
										/>
										<TextInput
											name="selectAllLabel"
											label="Select All Label"
											inputProps={{
												placeholder: 'Enter label for select all option',
											}}
										/>
									</>
								)}

								{!disableListOptions && filterType === 'range' && (
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
										<TextInput
											name="interval"
											label="Interval"
											inputProps={{
												placeholder: 'Enter interval',
												type: 'number',
											}}
										/>
										<TextInput
											name="filterLabel"
											label="Filter Label"
											inputProps={{
												placeholder: 'Enter filter label',
											}}
										/>
									</>
								)}
							</Form>
						</Modal>
					)}
				</FieldGroup>
			</React.Fragment>
		);
	}
}

CustomizeFilter.defaultProps = {
	buttonLabel: 'Customize',
	disableListOptions: false,
	control: null,
	onSave: null,
	onCancel: null,
	buttonProps: null,
};
CustomizeFilter.propTypes = {
	buttonLabel: string,
	disableListOptions: bool,
	buttonProps: object,
	control: object,
	onSave: func,
	onCancel: func,
};

export default CustomizeFilter;
