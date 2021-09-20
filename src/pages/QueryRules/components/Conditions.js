/* eslint-disable jsx-a11y/label-has-associated-control,jsx-a11y/label-has-for */
import React from 'react';
import PropTypes from 'prop-types';
import { Select, Input, Row, Col, Button } from 'antd';
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
			isFormInvalid,
		} = this.props;
		console.log(isFormInvalid);
		return (
			<React.Fragment>
				{condition === 'filter' ? (
					<Row gutter={16}>
						<Col xs={24}>{getErrorMessage(error)}</Col>
						<div
							style={{
								border: isFormInvalid ? '1px solid red' : 'none',
								height: isFormInvalid ? 100 : 0,
							}}
						>
							{isFormInvalid && (
								<div style={{ color: 'red' }}>
									Search type should be at least Search or Suggestion for a
									trigger condition based on a query clause
								</div>
							)}

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
									<Option value="==">Query is</Option>
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
						</div>
						<div
							style={{
								border: isFormInvalid ? '1px solid red' : 'none',
								height: isFormInvalid ? 100 : 0,
							}}
						>
							{isFormInvalid && (
								<div style={{ color: 'red' }}>
									Search type should be at least Term for a trigger condition
									based on a filter clause.
								</div>
							)}
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
										<Option key={field}>
											{field.replace(/.keyword/g, '')}
										</Option>
									))}
								</Select>
								{dataField || dataFieldValue ? (
									<Button
										style={{
											margin: '4px 0',
											padding: 0,
											border: 0,
											color: '#1890ff',
										}}
										ghost
										size="small"
										onClick={() => {
											onDropdownChange('dataField', '');
											onDropdownChange('dataFieldValue', '');
										}}
									>
										Clear Filter
									</Button>
								) : null}
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
						</div>
					</Row>
				) : null}
			</React.Fragment>
		);
	}
}

Conditions.propTypes = {
	dataFields: PropTypes.array,
	onChange: PropTypes.func.isRequired,
	dataFieldValue: PropTypes.string,
	dataField: PropTypes.string,
	query: PropTypes.string,
	queryValue: PropTypes.string,
	onDropdownChange: PropTypes.func.isRequired,
	error: PropTypes.object,
	condition: PropTypes.string,
	isFormInvalid: PropTypes.bool,
};

Conditions.defaultProps = {
	dataFields: [],
	dataFieldValue: undefined,
	dataField: undefined,
	query: undefined,
	queryValue: undefined,
	error: {},
	condition: undefined,
	isFormInvalid: false,
};

export default Conditions;
