import { Icon, Tooltip } from 'antd';
import React from 'react';

// eslint-disable-next-line import/prefer-default-export
export function SettingTooltip({ title }) {
	return (
		<Tooltip title={title}>
			<span style={{ marginLeft: 5 }}>
				<Icon type="info-circle" />
			</span>
		</Tooltip>
	);
}
