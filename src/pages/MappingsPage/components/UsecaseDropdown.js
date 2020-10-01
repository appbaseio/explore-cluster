import React from 'react';
import { Select } from 'antd';
import PropTypes from 'prop-types';
import usecases from './utils/usecases';

const { Option } = Select;

const UsecaseDropdown = ({ type, value, onUsecaseChange, path }) => {
	if (type === 'text') {
		return (
			<Select
				value={value}
				style={{ width: 150 }}
				onChange={(selected) =>
					onUsecaseChange({
						usecase: selected,
						path,
						type,
					})
				}
			>
				{Object.keys(usecases).map((usecase) => (
					<Option key={usecase} value={usecase}>
						{usecases[usecase]}
					</Option>
				))}
			</Select>
		);
	}

	return null;
};

UsecaseDropdown.propTypes = {
	type: PropTypes.string.isRequired,
	path: PropTypes.string.isRequired,
	value: PropTypes.string,
	onUsecaseChange: PropTypes.func.isRequired,
};

UsecaseDropdown.defaultProps = {
	value: null,
};

export default UsecaseDropdown;
