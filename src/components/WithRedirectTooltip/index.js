import { Tooltip } from 'antd';
import React from 'react';

const WithRedirectTooltip = ({ showTooltip, children }) => {
	if (showTooltip) {
		return (
			<Tooltip placement="rightBottom" title="This will redirect you to the cluster view">
				{children}
			</Tooltip>
		);
	}
	return children;
};

export default WithRedirectTooltip;
