import { Icon } from 'antd';
import { object } from 'prop-types';
import React, { Component } from 'react';
import styled from 'react-emotion';
import { FieldArray, FieldGroup, FormBuilder } from 'react-reactive-form';
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
`;

const RemoveButton = styled(IconButton)`
	&:hover {
		color: crimson;
	}
`;

const AddButton = styled(IconButton)`
	&:hover {
		color: blue;
	}
`;
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
		const { form } = this.props;
		return (
			<FieldArray control={form} strict={false}>
				{({ controls }) => (
					<>
						<div>Data</div>
						{controls.map((control, idx) => (
							// eslint-disable-next-line react/no-array-index-key
							<FieldGroup control={control} key={`${control.meta.key}-${idx}`}>
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
											<TextInput
												name="value"
												label="Value"
												inputProps={{
													placeholder: 'Enter value for data',
												}}
												control={control.get('value')}
											/>
										</MarginHorizontal>
										{idx !== 0 ? (
											<RemoveButton
												type="button"
												onClick={() => {
													this.removeItem(idx);
												}}
											>
												<Icon type="minus-square" />
											</RemoveButton>
										) : (
											<AddButton
												type="button"
												onClick={() => {
													this.addItem();
												}}
											>
												<Icon type="plus-square" />
											</AddButton>
										)}
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
	form: object,
};

export default Data;
