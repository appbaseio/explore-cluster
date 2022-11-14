import React from 'react';
import PropTypes from 'prop-types';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';

function SettingTooltip({ title }) {
	return (
		<Tooltip title={title} style={{ width: 400 }}>
			<span style={{ marginLeft: 5, minWidth: 400 }}>
				<InfoCircleOutlined />
			</span>
		</Tooltip>
	);
}

SettingTooltip.propTypes = {
	title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
};

export default SettingTooltip;
