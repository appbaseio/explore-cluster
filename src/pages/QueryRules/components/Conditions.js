import React from 'react';
import { Select, Input, Row, Col } from 'antd';
import { getErrorClass, getErrorMessage } from '../error';

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
		<Col md={12} sm={24}>
			<label>Select Condition</label>
			<Select
				onChange={value => onDropdownChange('query', value)}
				value={query}
				className={getErrorClass(error.query)}
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
			{getErrorMessage(error.queryValue)}
			<Input
				className={getErrorClass(error.queryValue)}
				name="queryValue"
				value={queryValue}
				onChange={onChange}
			/>
		</Col>
		<Col md={12} sm={24}>
			<label>DataField</label>
			{getErrorMessage(error.dataField)}
			<Select
				className={getErrorClass(error.dataField)}
				onChange={value => onDropdownChange('dataField', value)}
				value={dataField}
				style={{ width: '100%' }}
			>
				{dataFields.map(field => (
					<Option key={field}>{field}</Option>
				))}
			</Select>
		</Col>
		<Col md={12} sm={24}>
			<label>Value</label>
			{getErrorMessage(error.dataFieldValue)}
			<Input
				className={getErrorClass(error.dataFieldValue)}
				name="dataFieldValue"
				value={dataFieldValue}
				onChange={onChange}
			/>
		</Col>
	</Row>
);

export default Conditions;
