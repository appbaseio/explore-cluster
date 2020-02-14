import React from 'react';
import { Select, Input, Row, Col } from 'antd';
import { getErrorClass, getErrorMessage } from '../utils/error';

const { Option } = Select;

const Conditions = ({
	dataFields,
	onChange,
	dataFieldValue,
	dataField,
	query,
	queryValue,
	onDropdownChange,
	error,
}) => (
	<Row gutter={16}>
		<Col xs={24}>{getErrorMessage(error)}</Col>
		<Col md={12} sm={24}>
			<label>Select Condition</label>
			<Select
				onChange={value => onDropdownChange('query', value)}
				value={query}
				style={{ width: '100%' }}
			>
				<Option value="is">Query is</Option>
				<Option value="contains">Query contains</Option>
				<Option value="starts_with">Query starts with</Option>
				<Option value="ends_with">Query ends with </Option>
			</Select>
		</Col>
		<Col md={12} sm={24}>
			<label>Value</label>
			<Input
				className={queryValue ? '' : getErrorClass(error)}
				name="queryValue"
				value={queryValue}
				onChange={onChange}
			/>
		</Col>
		<Col md={12} sm={24}>
			<label>DataField</label>
			<Select
				onChange={value => onDropdownChange('dataField', value)}
				value={dataField}
				className={dataField ? '' : getErrorClass(error)}
				style={{ width: '100%' }}
			>
				{dataFields.map(field => (
					<Option key={field}>{field}</Option>
				))}
			</Select>
		</Col>
		<Col md={12} sm={24}>
			<label>Value</label>
			<Input
				className={dataFieldValue ? '' : getErrorClass(error)}
				name="dataFieldValue"
				value={dataFieldValue}
				onChange={onChange}
			/>
		</Col>
	</Row>
);

export default Conditions;
