import React from 'react';
import PropTypes from 'prop-types';
import { Icon, Tooltip } from 'antd';

function SettingTooltip({ title }) {
	return (
		<Tooltip title={title} style={{ width: 400 }}>
			<span style={{ marginLeft: 5, minWidth: 400 }}>
				<Icon type="info-circle" />
			</span>
		</Tooltip>
	);
}

SettingTooltip.propTypes = {
	title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
};

export default SettingTooltip;
