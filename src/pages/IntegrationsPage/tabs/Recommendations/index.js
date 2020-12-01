import React from 'react';
import { FieldGroup, FieldArray, FieldControl } from 'react-reactive-form';
import { Table, Button, Form, Select } from 'antd';
import get from 'lodash/get';
import TextInput from '../../../../components/Form/Input';
import DataFieldSelector from '../../../../components/Form/DataFieldSelector';
import Flex from '../../../../batteries/components/shared/Flex';
import {
	FormContext,
	getRecommendationForm,
	RecommendationTypes,
	RecommendationTypeLabels,
} from '../../utils';

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
			render: (item) => (
				<Flex>
					<Button onClick={() => this.handleEdit(item.id)}>Edit</Button>
					<Button
						style={{
							marginLeft: 10,
						}}
						type="danger"
						onClick={() => this.handleDelete(item.id)}
					>
						Delete
					</Button>
				</Flex>
			),
		},
	];

	get recommendationControl() {
		// eslint-disable-next-line
		return this.context.get('recommendations');
	}

	showForm = (id) => {
		if (id) {
			// get the control
			this.tempForm = this.getControlById(id);
		} else {
			this.tempForm = getRecommendationForm();
		}
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
							{!isEditing && (
								<Button onClick={this.addControl} type="primary">
									Save
								</Button>
							)}
						</Flex>

						<FieldGroup control={this.tempForm} strict={false}>
							{() => (
								<Form colon={false}>
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
									<FieldControl name="type">
										{({ value }) => {
											if (value === RecommendationTypes.SIMILAR_PRODUCTS) {
												return (
													<FieldControl name="dataField">
														{(formControl) =>
															formControl.disabled ? null : (
																<Form.Item label="DataField">
																	<DataFieldSelector
																		control={formControl}
																	/>
																</Form.Item>
															)
														}
													</FieldControl>
												);
											}
											return null;
										}}
									</FieldControl>
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
								/>
							)}
						</FieldArray>
					</div>
				)}
			</div>
		);
	}
}

export default Recommendations;
