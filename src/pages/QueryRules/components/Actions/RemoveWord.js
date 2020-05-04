import React from 'react';
import PropTypes from 'prop-types';
import { Input } from 'antd';

const RemoveWord = ({ value = [], onChange }) => {
	return (
		<Input
			placeholder="Enter word(s) to remove"
			value={value.join(' ')}
			onChange={(e) => onChange(e.target.value.split(' '))}
		/>
	);
};

RemoveWord.propTypes = {
	value: PropTypes.array,
	onChange: PropTypes.func.isRequired,
};

RemoveWord.defaultProps = {
	value: [],
};

export default RemoveWord;
