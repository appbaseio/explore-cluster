import React from 'react';
import { Switch, Tooltip, Icon, Radio, Select, InputNumber } from 'antd';
import { css } from 'emotion';
import PropTypes from 'prop-types';
import settingsMap from '../../../components/ReviewAndSave/helper';

const { Option } = Select;

const SORT_OPTIONS = [
	{ name: 'Count', value: 'count' },
	{ name: 'Ascending', value: 'asc' },
	{ name: 'Descending', value: 'desc' },
];

const optionContainer = css`
	margin: 16px 0;

	h6 {
		font-weight: 500;
		font-size: 14px;
		margin-bottom: 5px;
		margin-top: 15px;
		color: rgba(0, 0, 0, 0.85);
	}
`;

const SettingsOptions = ({ handleChange, sortBy, size, includeNullValues, queryFormat }) => (
	<div className={optionContainer}>
		<h6>
			Query Format
			<Tooltip title={settingsMap.queryFormat.description}>
				<Icon style={{ marginLeft: 5 }} type="info-circle" />
			</Tooltip>
		</h6>
		<Radio.Group
			style={{ display: 'flex', marginBottom: 8 }}
			onChange={(e) => handleChange('queryFormat', e.target.value)}
			value={queryFormat}
		>
			<Radio value="or">Or</Radio>
			<Radio value="and">And</Radio>
		</Radio.Group>
		<h6>
			Default Size For Aggregations{' '}
			<Tooltip title={settingsMap.agg_size.description}>
				<Icon type="info-circle" />
			</Tooltip>
		</h6>
		<InputNumber
			onChange={(value) => handleChange('size', value)}
			value={size}
			min={1}
			placeholder="Enter default aggs size"
			className="input"
		/>
		<h6>
			Default Sort{' '}
			<Tooltip title={settingsMap.sortBy.description}>
				<Icon type="info-circle" />
			</Tooltip>
		</h6>
		<Select
			placeholder="Select default Sort"
			value={sortBy}
			optionFilterProp="children"
			style={{ minWidth: 200 }}
			onChange={(value) => handleChange('sortBy', value)}
			filterOption={(input, option) =>
				option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
			}
		>
			{SORT_OPTIONS.map((sortOption) => (
				<Option key={sortOption.value} value={sortOption.value}>
					{sortOption.name}
				</Option>
			))}
		</Select>
		<h6>
			Include Null Values{' '}
			<Tooltip title={settingsMap.includeNullValues.description}>
				<Icon type="info-circle" />
			</Tooltip>
		</h6>
		<Switch
			checked={includeNullValues}
			onChange={(value) => handleChange('includeNullValues', value)}
		/>
	</div>
);

SettingsOptions.propTypes = {
	handleChange: PropTypes.func.isRequired,
	size: PropTypes.number.isRequired,
	sortBy: PropTypes.string.isRequired,
	queryFormat: PropTypes.string.isRequired,
	includeNullValues: PropTypes.bool.isRequired,
};

export default SettingsOptions;
