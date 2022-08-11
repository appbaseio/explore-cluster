import React from 'react';
import { Select } from 'antd';
import { connect } from 'react-redux';
import get from 'lodash/get';
import { arrayOf, func, object, string } from 'prop-types';

const calculateValue = (value) => {
	const index = value.indexOf('*');
	if (index > -1) {
		if (index === 0 && value.length !== 1) {
			value.splice(index, 1);
			return value;
		}
		return ['*'];
	}
	return value;
};

function IndexMultiSelect({ value, onChange, apps, className }) {
	const indices = apps
		? Object.keys(apps)
				.sort()
				.filter((i) => !i.startsWith('.') && !i.startsWith('metricbeat'))
		: [];

	return (
		<div style={{ width: '100%' }}>
			<Select
				placeholder="Enter indices"
				mode="tags"
				tokenSeparators={[',']}
				style={{ minWidth: 150 }}
				value={value}
				onChange={(val) => {
					onChange(calculateValue(val));
				}}
				className={className}
			>
				<Select.Option value="*">All (*)</Select.Option>
				{indices.map((index) => (
					<Select.Option key={index}>{index}</Select.Option>
				))}
			</Select>
		</div>
	);
}

IndexMultiSelect.defaultProps = {
	apps: {},
	className: '',
};

IndexMultiSelect.propTypes = {
	value: arrayOf(string).isRequired,
	onChange: func.isRequired,
	apps: object,
	className: string,
};

const mapStateToProps = (state) => {
	return {
		apps: get(state, 'apps.data', {}),
	};
};

export default connect(mapStateToProps)(IndexMultiSelect);
