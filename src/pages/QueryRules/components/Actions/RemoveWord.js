import React from 'react';
import PropTypes from 'prop-types';
import { Select } from 'antd';
import { css } from 'emotion';

const hideDropdown = css`
	&.ant-select-dropdown {
		display: none;
	}
`;

const RemoveWord = ({ value = [], onChange }) => {
	return (
		<Select
			mode="tags"
			style={{ width: '100%' }}
			value={value}
			placeholder="Press enter to add multiple words"
			dropdownClassName={hideDropdown}
			onChange={onChange}
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
