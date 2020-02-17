import React from 'react';
import { Select, Input, Row, Col, Radio } from 'antd';
import { getErrorClass, getErrorMessage } from '../utils/error';
import { hasValuesChanged } from '../utils';

const { Option } = Select;

class Conditions extends React.Component {
	shouldComponentUpdate(nextProps) {
		return hasValuesChanged(this.props, nextProps, [
			'dataFields',
			'dataFieldValue',
			'query',
			'queryValue',
			'error',
			'condition',
		]);
	}

	render() {
		const {
			dataFields,
			onChange,
			dataFieldValue,
			dataField,
			query,
			queryValue,
			onDropdownChange,
			error,
			condition,
		} = this.props;
		return (
			<React.Fragment>
				<Radio.Group
					name="condition"
					onChange={onChange}
					value={condition}
					style={{ display: 'flex', margin: '15px 0' }}
				>
					<Radio value="filter">Conditions</Radio>
					<Radio value="always">Always</Radio>
				</Radio.Group>
				{condition === 'filter' ? (
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
				) : null}
			</React.Fragment>
		);
	}
}

export default Conditions;
