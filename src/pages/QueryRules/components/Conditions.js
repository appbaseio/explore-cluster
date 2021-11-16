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
			onBlur,
		} = this.props;

		return (
			<React.Fragment>
				{condition === 'filter' ? (
					<>
						<Row>
							<Col xs={24}>{getErrorMessage(error.condition)}</Col>
							<div
								style={{
									border: error?.queryValue?.hasError ? '1px solid red' : 'none',
									height: error?.queryValue?.hasError ? 150 : 0,
									marginBottom: '15px',
									padding: 10,
								}}
							>
								{error?.queryValue?.hasError && (
									<div style={{ color: 'red', fontSize: 13 }}>
										{error?.queryValue.description}
									</div>
								)}

								<Col md={12} sm={24}>
									<label>
										Query{' '}
										<Info
											content={
												<>
													Select a query condition based on which you want
													to invoke a rule.
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
										className={queryValue ? '' : getErrorClass(error.condition)}
										name="queryValue"
										value={queryValue}
										onChange={onChange}
										onBlur={onBlur}
									/>
								</Col>
							</div>
						</Row>
						<Row>
							<div
								style={{
									border: error?.dataFieldValue?.hasError
										? '1px solid red'
										: 'none',
									height: error?.dataFieldValue?.hasError ? 150 : 0,
									marginBottom: '15px',
									padding: 10,
								}}
							>
								{error?.dataFieldValue?.hasError && (
									<div style={{ color: 'red', fontSize: 13 }}>
										{error?.dataFieldValue?.description}
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
										className={dataField ? '' : getErrorClass(error.condition)}
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
										className={
											dataFieldValue ? '' : getErrorClass(error.condition)
										}
										name="dataFieldValue"
										value={dataFieldValue}
										onChange={onChange}
										onBlur={onBlur}
									/>
								</Col>
							</div>
						</Row>
					</>
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
	onBlur: PropTypes.func,
};

Conditions.defaultProps = {
	dataFields: [],
	dataFieldValue: undefined,
	dataField: undefined,
	query: undefined,
	queryValue: undefined,
	error: {},
	condition: undefined,
	onBlur: () => null,
};

export default Conditions;
