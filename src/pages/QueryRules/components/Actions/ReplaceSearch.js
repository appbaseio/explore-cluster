import React from 'react';
import PropTypes from 'prop-types';
import { Input } from 'antd';

const ReplaceSearch = ({ value, onChange }) => {
	return (
		<Input
			placeholder="Enter the new search term"
			value={value}
			onChange={(e) => onChange(e.target.value)}
		/>
	);
};

ReplaceSearch.propTypes = {
	value: PropTypes.string,
	onChange: PropTypes.func.isRequired,
};

ReplaceSearch.defaultProps = {
	value: undefined,
};

export default ReplaceSearch;
