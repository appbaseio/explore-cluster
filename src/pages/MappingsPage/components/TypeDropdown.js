import React from 'react';
import { Select } from 'antd';
import get from 'lodash/get';
import PropTypes from 'prop-types';
import types from '../../../utils/conversionMap';
import { capitalizeFirstLetter } from '../../../utils/helper';

const { Option } = Select;

const TypeDropdown = ({ value, onTypeChange, path, usecase }) => {
	return (
		<Select
			value={value}
			style={{ width: 150, textTransform: 'capitalize' }}
			onChange={(selected) =>
				onTypeChange({
					type: selected,
					path,
					usecase: selected === 'text' ? usecase : 'none',
				})
			}
		>
			{get(types, value, []).map((type) => (
				<Option key={type} value={type}>
					{capitalizeFirstLetter(type)}
				</Option>
			))}
		</Select>
	);
};

TypeDropdown.propTypes = {
	value: PropTypes.string.isRequired,
	usecase: PropTypes.string.isRequired,
	path: PropTypes.string.isRequired,
	onTypeChange: PropTypes.func.isRequired,
};

export default TypeDropdown;
