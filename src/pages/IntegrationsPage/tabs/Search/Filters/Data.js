import { MinusSquareOutlined, PlusSquareOutlined } from '@ant-design/icons';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { AutoComplete, Tooltip } from 'antd';
import { array, object } from 'prop-types';
import React, { Component } from 'react';
import styled from 'react-emotion';
import { FieldArray, FieldControl, FieldGroup, FormBuilder } from 'react-reactive-form';
import TextInput from '../../../../../components/Form/Input';

const Container = styled.div`
	display: flex;
	align-items: center;
`;
const MarginHorizontal = styled.div`
	margin: 0 1rem;
`;

const IconButton = styled.button`
	display: flex;
	justify-content: center;
	align-items: center;
	background: none;
	border: none;
	color: black;
	transition: color 500ms ease;
	cursor: pointer;
	font-size: 1rem;
	&:disabled:hover {
		color: lightgray;
		cursor: not-allowed;
	}
	&:disabled {
		color: lightgray;
		cursor: not-allowed;
	}
`;

const RemoveButton = styled(IconButton)`
	&:hover {
		color: crimson;
	}
`;
const AddButton = styled(IconButton)`
	&:hover {
		color: green;
	}
`;

const Dropdown = ({ options, control }) => {
	return (
		<FieldControl name="value" control={control} strict={false}>
			{({ handler }) => {
				return (
					<Form.Item label="Value">
						<AutoComplete
							dataSource={options.filter((option) => option.value)}
							filterOption={(query, option) => option.key.includes(query)}
							{...handler()}
						/>
					</Form.Item>
				);
			}}
		</FieldControl>
	);
};

Dropdown.propTypes = {
	options: array.isRequired,
	control: object.isRequired,
};

class Data extends Component {
	state = {
		keyCount: 1,
	};

	componentDidMount() {
		const { form } = this.props;
		if (form) {
			const { controls, value } = form;
			if ((controls && !controls.length) || (value && !value.length)) {
				this.addItem();
			}
		}
	}

	// Adds an item in Form Array
	addItem() {
		const { form } = this.props;
		const itemsControl = form;
		itemsControl.push(this.createItem());
	}

	// Removes an item
	removeItem(index) {
		const { form } = this.props;
		const itemsControl = form;

		itemsControl.removeAt(index);
	}

	createItem() {
		const control = FormBuilder.group({
			label: '',
			value: '',
		});
		const { keyCount } = this.state;
		// Adding key
		control.meta = {
			key: keyCount,
		};
		this.setState({ keyCount: keyCount + 1 });
		return control;
	}

	render() {
		const { form, options } = this.props;
		return (
			<FieldArray control={form} strict={false}>
				{({ controls }) => (
					<>
						<div>
							<div>Data</div>
							<Tooltip title="Add label-value fields at the end">
								<AddButton
									onClick={() => {
										this.addItem();
									}}
									style={{ marginLeft: 'auto' }}
									disabled={
										controls &&
										controls.filter((c) => !c.value.label).length > 0
									}
								>
									<PlusSquareOutlined />
								</AddButton>
							</Tooltip>
						</div>
						{controls.map((control, idx) => (
							<FieldGroup
								// eslint-disable-next-line react/no-array-index-key
								key={`${control.meta.key}-${idx}`}
								control={control}
								strict={false}
							>
								{() => (
									<Container>
										<MarginHorizontal>
											<TextInput
												name="label"
												label="Label"
												inputProps={{
													placeholder: 'Enter label for data',
												}}
												control={control.get('label')}
											/>
										</MarginHorizontal>
										<MarginHorizontal>
											<Dropdown
												options={options}
												control={control.get('value')}
											/>
										</MarginHorizontal>
										<MarginHorizontal>
											<Form.Item label=" ">
												<RemoveButton
													type="button"
													onClick={() => {
														this.removeItem(idx);
													}}
													disabled={controls.length === 1 && idx === 0}
												>
													<MinusSquareOutlined />
												</RemoveButton>
											</Form.Item>
										</MarginHorizontal>
									</Container>
								)}
							</FieldGroup>
						))}
					</>
				)}
			</FieldArray>
		);
	}
}
Data.defaultProps = {
	form: {},
};
Data.propTypes = {
	options: array.isRequired,
	form: object,
};

export default Data;
