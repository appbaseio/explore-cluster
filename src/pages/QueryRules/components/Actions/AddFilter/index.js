import React from 'react';
import { CloseOutlined } from '@ant-design/icons';
import { Col, Select, Row, Button } from 'antd';
import { css } from 'emotion';
import PropTypes from 'prop-types';

const { Option } = Select;

const hideDropdown = css`
	&.ant-select-dropdown {
		display: none;
	}
`;

const AddFilter = (props) => {
	const { aggsFields, onChange, value } = props;

	const addNewFilter = () => {
		onChange({
			...value,
			[aggsFields[0]]: '',
		});
	};

	const handleDropdownValue = (dropdownValue, index) => {
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

	const deleteItem = (item) => {
		const {
			value: { [item]: deletedItem, ...rest },
		} = props;

		onChange(rest);
	};

	const handleDropdown = (name, dropdownValue) => {
		const parsedValues = dropdownValue
			.map((item) => {
				let parsedValue = item;

				try {
					parsedValue = JSON.parse(item);
				} catch {
					parsedValue = item;
				}

				return typeof parsedValue === 'string' ? parsedValue.trim() : parsedValue;
			})
			.filter(Boolean);
		onChange({ ...value, [name]: parsedValues });
	};

	const renderRow = (item, index) => {
		const currentSelectedField = item.replace(/.keyword/g, '');
		return (
			<Row style={{ marginBottom: 8 }} gutter={[8, 0]}>
				<Col md={11}>
					<Select
						onChange={(dropdownValue) => handleDropdownValue(dropdownValue, index)}
						value={currentSelectedField}
						style={{ width: '100%' }}
						showSearch
						data-cy="filter-key"
					>
						<Option key={item}>{currentSelectedField}</Option>
						{aggsFields.map((field) => (
							<Option key={field} data-cy={field.replace(/.keyword/g, '')}>
								{field.replace(/.keyword/g, '')}
							</Option>
						))}
					</Select>
				</Col>
				<Col md={11}>
					<Select
						mode="tags"
						tokenSeparators={[',']}
						style={{ width: '100%' }}
						value={value[item] || []}
						dropdownClassName={hideDropdown}
						placeholder="Press enter to add more values"
						onChange={(dropdownValue) => handleDropdown(item, dropdownValue)}
						data-cy="filter-values"
					/>
				</Col>
				<Col style={{ display: 'flex', justifyContent: 'flex-end' }} md={2}>
					<Button
						style={{ marginTop: 3 }}
						size="small"
						shape="circle"
						ghost
						type="danger"
						onClick={() => deleteItem(item)}
						icon={<CloseOutlined />}
					/>
				</Col>
			</Row>
		);
	};

	return (
		<React.Fragment>
			{Object.keys(value).map((item, index) => (
				<React.Fragment key={item}>{renderRow(item, index)}</React.Fragment>
			))}

			<Button
				disabled={aggsFields.length === 0}
				onClick={addNewFilter}
				data-cy="add-filter-action"
			>
				Add Filter
			</Button>
		</React.Fragment>
	);
};

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
