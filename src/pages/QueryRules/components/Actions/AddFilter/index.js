import React from 'react';
import { Col, Select, Input, Row, Button } from 'antd';
import { css } from 'emotion';
import PropTypes from 'prop-types';

const { Option } = Select;

const hideDropdown = css`
	&.ant-select-dropdown {
		display: none;
	}
`;

class AddFilter extends React.Component {
	addNewFilter = () => {
		const { aggsFields, onChange, value } = this.props;

		onChange({
			...value,
			[aggsFields[0]]: '',
		});
	};

	handleDropdownValue = (dropdownValue, index) => {
		const { value, onChange } = this.props;

		const finalValue = Object.keys(value)
			.map((item, valueIndex) => {
				if (valueIndex === index) {
					return dropdownValue;
				}
				return item;
			})
			.reduce(
				(agg, item) => ({
					...agg,
					[item]: value[item] || '',
				}),
				{},
			);

		onChange(finalValue);
	};

	handleInput = (name, inputValue) => {
		const { value, onChange } = this.props;

		let parsedValue = inputValue;

		try {
			parsedValue = JSON.parse(inputValue);
		} catch {
			parsedValue = inputValue;
		}
		onChange({
			...value,
			[name]:
				typeof parsedValue === 'string' && parsedValue.includes(',')
					? parsedValue
							.split(',')
							.map((item) => item.trim())
							.filter(Boolean)
					: parsedValue,
		});
	};

	deleteItem = (item) => {
		const {
			value: { [item]: deletedItem, ...rest },
			onChange,
		} = this.props;

		onChange(rest);
	};

	handleDropdown = (name, dropdownValue) => {
		const { onChange, value } = this.props;
		onChange({ ...value, [name]: dropdownValue.map((item) => item.trim()) });
	};

	renderRow = (item, index) => {
		const { aggsFields, value } = this.props;
		const currentSelectedField = item.replace(/.keyword/g, '');
		return (
			<Row style={{ marginBottom: 8 }} gutter={[8, 0]}>
				<Col md={11}>
					<Select
						onChange={(dropdownValue) => this.handleDropdownValue(dropdownValue, index)}
						value={currentSelectedField}
						style={{ width: '100%' }}
						showSearch
					>
						<Option key={item}>{currentSelectedField}</Option>
						{aggsFields.map((field) => (
							<Option key={field}>{field.replace(/.keyword/g, '')}</Option>
						))}
					</Select>
				</Col>
				<Col md={11}>
					{Array.isArray(value[item]) ? (
						<Select
							mode="tags"
							style={{ width: '100%' }}
							value={value[item]}
							dropdownClassName={hideDropdown}
							placeholder="Add comma separated synonyms"
							onChange={(dropdownValue) => this.handleDropdown(item, dropdownValue)}
							tokenSeparators={[',']}
						/>
					) : (
						<Input
							name={item}
							style={{ margin: 0 }}
							onChange={(e) => this.handleInput(item, e.target.value)}
							value={value[item].toString()}
						/>
					)}
				</Col>
				<Col md={2}>
					<Button
						style={{ marginTop: 3 }}
						size="small"
						shape="circle"
						ghost
						type="danger"
						onClick={() => this.deleteItem(item)}
						icon="close"
					/>
				</Col>
			</Row>
		);
	};

	render() {
		const { value, aggsFields } = this.props;
		return (
			<React.Fragment>
				{Object.keys(value).map((item, index) => (
					<React.Fragment key={item}>{this.renderRow(item, index)}</React.Fragment>
				))}

				<Button disabled={aggsFields.length === 0} onClick={this.addNewFilter}>
					Add Filter
				</Button>
			</React.Fragment>
		);
	}
}

AddFilter.defaultProps = {
	aggsFields: [],
	value: {},
};

AddFilter.propTypes = {
	aggsFields: PropTypes.array,
	value: PropTypes.object,
	onChange: PropTypes.func.isRequired,
};

export default AddFilter;
