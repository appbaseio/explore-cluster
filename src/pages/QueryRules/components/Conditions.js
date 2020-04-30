import React from 'react';
import { Select, Input, Row, Col } from 'antd';
import { getErrorClass, getErrorMessage } from '../utils/error';
import { hasValuesChanged } from '../utils';
import Info from '../../../components/Info';

const { Option } = Select;

class Conditions extends React.Component {
	shouldComponentUpdate(nextProps) {
		return hasValuesChanged(this.props, nextProps, [
			'dataFields',
			'dataField',
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
				{condition === 'filter' ? (
					<Row gutter={16}>
						<Col xs={24}>{getErrorMessage(error)}</Col>
						<Col md={12} sm={24}>
							<label>
								Query{' '}
								<Info
									content={
										<>
											Select a query condition based on which you want to
											invoke a rule.
											<a
												href="https://docs.appbase.io/docs/search/Rules/#configure-if-condition"
												target="_blank"
												rel="noopener noreferrer"
											>
												Learn more
											</a>
										</>
									}
								/>
							</label>
							<Select
								onChange={(value) => onDropdownChange('query', value)}
								value={query}
								style={{ width: '100%' }}
							>
								<Option value="matches">Query is</Option>
								<Option value="contains">Query contains</Option>
								<Option value="startsWith">Query starts with</Option>
								<Option value="endsWith">Query ends with </Option>
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
							<label>
								Filter
								<Info content="Select a filter field and value which needs to be set before triggering this rule." />
							</label>
							<Select
								onChange={(value) => onDropdownChange('dataField', value)}
								value={dataField}
								className={dataField ? '' : getErrorClass(error)}
								style={{ width: '100%' }}
								showSearch
							>
								{dataFields.map((field) => (
									<Option key={field}>{field.replace(/.keyword/g, '')}</Option>
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
