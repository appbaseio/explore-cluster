import { Icon, Tooltip } from 'antd';
import React from 'react';

// eslint-disable-next-line import/prefer-default-export
export function Info({ content, toolTipProps }) {
	return (
		<Tooltip css="margin-left: 5px;color:#898989" overlay={content} {...toolTipProps}>
			<Icon type="info-circle" theme="outlined" />
		</Tooltip>
	);
}
