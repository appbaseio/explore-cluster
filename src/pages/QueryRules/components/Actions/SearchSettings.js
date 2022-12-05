import React from 'react';
import { CloseOutlined } from '@ant-design/icons';
import { Col, Select, Row, Button, InputNumber } from 'antd';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import { getSubFields, removeSubFields } from '../../../../utils';

const { Option } = Select;

/**
 * Removes all properties starting with `key`
 * @param {object} obj
 * @param {string} key
 */
const removeKeysFromObject = (obj = {}, key) => {
	if (!key) {
		return obj;
	}
	return Object.keys(obj)
		.filter((objKey) => !objKey.includes(key.replace('.keyword')))
		.reduce(
			(agg, objKey) => ({
				...agg,
				[objKey]: obj[objKey],
			}),
			{},
		);
};

class SearchSettings extends React.Component {
	state = {
		parsedValue: {},
	};

	static getDerivedStateFromProps(props) {
		const value = get(props, 'value.dataField', []).reduce(
			(agg, field, index) => ({
				...agg,
				[field]: get(props, `value.fieldWeights[${index}]`, 1),
			}),
			{},
		);
		return {
			parsedValue: value,
		};
	}

	addNewFilter = () => {
		const { searchFields, subFieldsMap } = this.props;
		const { parsedValue } = this.state;

		const searchFieldToBeAdded = get(searchFields, '[0]', '').replace('.keyword', '');
		const subFieldsPresent = get(subFieldsMap, searchFieldToBeAdded, []);

		const fields = getSubFields({
			fields: subFieldsPresent,
			address: searchFieldToBeAdded,
			weight: 1,
		});

		this.handleSaveFields({
			...parsedValue,
			...fields,
		});
	};

	handleSaveFields = (fields = {}) => {
		const { onChange } = this.props;

		onChange({
			dataField: Object.keys(fields),
			fieldWeights: Object.values(fields),
		});
	};

	handleDropdownValue = (dropdownValue, oldDropdownValue) => {
		const { subFieldsMap } = this.props;
		const { parsedValue } = this.state;
		const currentWeight = parsedValue[oldDropdownValue];
		const filteredFields = removeKeysFromObject(parsedValue, oldDropdownValue);

		const searchFieldToBeAdded = dropdownValue.replace('.keyword', '');
		const subFieldsPresent = subFieldsMap[searchFieldToBeAdded];

		const fields = getSubFields({
			fields: subFieldsPresent,
			address: searchFieldToBeAdded,
			weight: currentWeight || 1,
		});

		this.handleSaveFields({
			...filteredFields,
			...fields,
		});
	};

	deleteItem = (item) => {
		const { parsedValue } = this.state;
		const filteredFields = removeKeysFromObject(parsedValue, item);
		this.handleSaveFields(filteredFields);
	};

	handleFieldWeight = (name, weight) => {
		const { subFieldsMap } = this.props;
		const { parsedValue } = this.state;
		const searchFieldToBeAdded = name.replace('.keyword', '');
		const subFieldsPresent = subFieldsMap[searchFieldToBeAdded];

		const fields = getSubFields({
			fields: subFieldsPresent,
			address: searchFieldToBeAdded,
			weight: weight || 1,
		});

		this.handleSaveFields({ ...parsedValue, ...fields });
	};

	renderRow = (item) => {
		const { searchFields } = this.props;
		const { parsedValue } = this.state;

		const currentSelectedField = item.replace(/.keyword/g, '');
		return (
			<Row style={{ marginBottom: 8 }} gutter={[8, 0]}>
				<Col md={18}>
					<Select
						onChange={(dropdownValue) => this.handleDropdownValue(dropdownValue, item)}
						value={currentSelectedField}
						style={{ width: '100%' }}
						showSearch
						data-cy="set-search-settings-key"
					>
						<Option key={item}>{currentSelectedField}</Option>
						{searchFields.map((field) => (
							<Option key={field} data-cy={field.replace(/.keyword/g, '')}>
								{field.replace(/.keyword/g, '')}
							</Option>
						))}
					</Select>
				</Col>
				<Col md={4}>
					<InputNumber
						value={parsedValue[item]}
						style={{ width: '100%' }}
						min={1}
						onChange={(weight) => this.handleFieldWeight(item, weight)}
						data-cy="set-search-settings-value"
					/>
				</Col>
				<Col
					style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}
					md={2}
				>
					<Button
						style={{ marginTop: 3 }}
						size="small"
						shape="circle"
						ghost
						type="danger"
						onClick={() => this.deleteItem(item)}
						icon={<CloseOutlined />}
					/>
				</Col>
			</Row>
		);
	};

	render() {
		const { searchFields, value } = this.props;
		const topLevelFields = removeSubFields(value.dataField);

		return (
			<React.Fragment>
				{topLevelFields.map((item, index) => (
					<React.Fragment key={item}>{this.renderRow(item, index)}</React.Fragment>
				))}

				<Button
					disabled={searchFields.length === 0}
					onClick={this.addNewFilter}
					data-cy="set-search-settings-action-add-field"
				>
					Add Field
				</Button>
			</React.Fragment>
		);
	}
}

SearchSettings.defaultProps = {
	searchFields: [],
	value: {},
	subFieldsMap: {},
};

SearchSettings.propTypes = {
	searchFields: PropTypes.array,
	value: PropTypes.object,
	subFieldsMap: PropTypes.object,
	onChange: PropTypes.func.isRequired,
};

export default SearchSettings;
