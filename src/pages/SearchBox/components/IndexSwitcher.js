import React from 'react';
import get from 'lodash/get';
import { connect } from 'react-redux';
import { Select } from 'antd';
import { arrayOf, func, string } from 'prop-types';

/**
 * A component which is always controlled by the parent
 */
const IndexSwitcherComponent = ({ apps, value, onChange, ...props }) => {
	return (
		<Select
			value={value || undefined}
			onChange={onChange}
			options={apps
				/*
				 * metricbeat-* is a special index that is used to store metrics data
				 * indexes prefixed with a dot are system indexes
				 */
				.filter((k) => !k.includes('metricbeat') && !k.startsWith('.'))
				.map((k) => ({ value: k, label: k }))}
			{...props}
		/>
	);
};

IndexSwitcherComponent.propTypes = {
	apps: arrayOf(string).isRequired,
	value: string.isRequired,
	onChange: func.isRequired,
};

const mapStateToProps = (state) => ({
	apps: Object.keys(get(state, 'apps.data') || {})
		.filter((app) => !app.startsWith('.'))
		.filter((k) => !k.includes('metricbeat')),
});

export const IndexSwitcher = connect(mapStateToProps)(IndexSwitcherComponent);

export default IndexSwitcher;
