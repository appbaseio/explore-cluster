import React from 'react';
import { Button, Modal, Row, Col, Input, Select } from 'antd';
import PropTypes from 'prop-types';

import conversionMap, { DenseVector } from '../../../utils/conversionMap';
import usecases from '../../../utils/usecases';
import { getVersion, isUsingOpenSearch } from '../../../constants/config';
import { capitalizeFirstLetter } from '../../../utils/helper';

const { Option } = Select;
const version = parseInt(getVersion()[0], 10);
const types = Object.keys(conversionMap).filter(
	(key) =>
		key !== 'object' &&
		(isUsingOpenSearch() ||
			(version < 7 &&
				(key !== 'rank_features' || key !== 'rank_feature') &&
				key !== DenseVector)),
);

class NewField extends React.Component {
	defaultValues = {
		fieldUsecase: 'searchaggs',
		fieldName: '',
		fieldType: 'text',
		fieldNameError: false,
	};

	state = {
		isVisible: false,
		...this.defaultValues,
	};

	reset = () => {
		this.setState({
			...this.defaultValues,
		});
	};

	handleVisible = () => {
		this.setState(
			(state) => ({
				isVisible: !state.isVisible,
			}),
			() => this.reset(),
		);
	};

	handleInput = (e) => {
		const {
			target: { name, value },
		} = e;
		const { fields } = this.props;

		this.setState({
			[name]: value,
			fieldNameError: fields.includes(value) ? 'Field Already exists' : null,
		});
	};

	handleUsecase = (usecase) => {
		this.setState({
			fieldUsecase: usecase,
		});
	};

	handleType = (type) => {
		this.setState({
			fieldType: type,
		});
	};

	addField = () => {
		const { onAddField } = this.props;
		const { fieldName, fieldType, fieldUsecase } = this.state;
		this.handleVisible();

		onAddField({
			path: fieldName,
			type: fieldType,
			usecase: fieldType === 'text' ? fieldUsecase : 'none',
		});
	};

	render() {
		const { isVisible, fieldName, fieldType, fieldUsecase, fieldNameError } = this.state;
		return (
			<React.Fragment>
				<Button onClick={this.handleVisible} type="primary" data-cy="new-field-button">
					Add new field
				</Button>
				<Modal
					title="Add new Field"
					width="100%"
					okText="Add Field"
					style={{
						maxWidth: '800px',
					}}
					open={isVisible}
					onOk={this.addField}
					onCancel={this.handleVisible}
					okButtonProps={{
						disabled: fieldNameError || !fieldName.trim(),
					}}
				>
					<Row gutter={8}>
						<Col md={fieldType === 'text' ? 14 : 19}>
							<Input
								type="text"
								name="fieldName"
								onChange={this.handleInput}
								placeholder="Enter field name"
								value={fieldName}
								style={
									fieldNameError
										? {
												borderColor: '#f5222d',
										  }
										: {}
								}
							/>
							{fieldNameError ? (
								<span
									style={{
										color: '#f5222d',
										margin: '5px 0',
										display: 'inline-block',
									}}
								>
									{fieldNameError}
								</span>
							) : null}
						</Col>
						{fieldType === 'text' ? (
							<Col md={5}>
								<Select
									style={{ width: '100%' }}
									value={fieldUsecase}
									onChange={this.handleUsecase}
								>
									{Object.keys(usecases).map((usecase) => (
										<Option key={usecase} value={usecase}>
											{usecases[usecase]}
										</Option>
									))}
								</Select>
							</Col>
						) : null}
						<Col md={5}>
							<Select
								style={{ width: '100%', textTransform: 'capitalize' }}
								value={fieldType}
								onChange={this.handleType}
							>
								{types.map((type) => (
									<Option key={type} value={type}>
										{capitalizeFirstLetter(type)}
									</Option>
								))}
							</Select>
						</Col>
					</Row>
				</Modal>
			</React.Fragment>
		);
	}
}

NewField.propTypes = {
	fields: PropTypes.array.isRequired,
	onAddField: PropTypes.func.isRequired,
};

export default NewField;
