import React from 'react';
import { Select, Tooltip } from 'antd';
import get from 'lodash/get';
import PropTypes from 'prop-types';
import types, { conversionMapLabels } from '../../../utils/conversionMap';

const { Option } = Select;

const TypeDropdown = ({ value, onTypeChange, path, usecase }) => {
	return (
		<Select
			value={conversionMapLabels[value]}
			style={{ width: 150, textTransform: 'capitalize' }}
			onChange={(selected) => {
				onTypeChange({
					type: selected,
					path,
					usecase: selected === 'text' ? usecase : 'none',
				});
			}}
		>
			{get(types, value, ['text']).map((type) => (
				<Option key={type} value={type}>
					<Tooltip title={conversionMapLabels[type]}>{conversionMapLabels[type]}</Tooltip>
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
