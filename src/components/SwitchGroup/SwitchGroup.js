import React from 'react';
import { Switch, List } from 'antd';
import PropTypes from 'prop-types';

const SwitchGroup = ({ options, value, onChange, disabled }) => {
	const handleOnChange = (val) => {
		const indexOfVal = value.indexOf(val);
		if (indexOfVal > -1) {
			onChange([...value.slice(0, indexOfVal), ...value.slice(indexOfVal + 1)]);
		} else {
			onChange([...value, val]);
		}
	};

	return (
		<List
			header={null}
			footer={null}
			bordered
			dataSource={options}
			style={{ width: '100%' }}
			renderItem={(item) => (
				<List.Item key={item.value}>
					<div
						style={{
							display: 'flex',
							justifyContent: 'space-between',
							width: '100%',
						}}
					>
						<span
							style={{
								textTransform: 'capitalize',
							}}
						>
							{item.label}
						</span>
						<Switch
							checked={value.includes(item.value)}
							onChange={() => handleOnChange(item.value)}
							disabled={disabled}
						/>
					</div>
				</List.Item>
			)}
		/>
	);
};

SwitchGroup.defaultProps = {
	disabled: false,
	value: [],
};

SwitchGroup.propTypes = {
	options: PropTypes.arrayOf(
		PropTypes.shape({
			label: PropTypes.string,
			value: PropTypes.string,
		}),
	).isRequired,
	value: PropTypes.arrayOf(PropTypes.string),
	onChange: PropTypes.func.isRequired,
	disabled: PropTypes.bool,
};

export default SwitchGroup;
