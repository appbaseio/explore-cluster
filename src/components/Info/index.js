import { InfoCircleOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';

function Info({ content, toolTipProps }) {
	return (
		<Tooltip css="margin-left: 5px;color:#898989" overlay={content} {...toolTipProps}>
			<InfoCircleOutlined />
		</Tooltip>
	);
}

Info.propTypes = {
	content: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
	toolTipProps: PropTypes.object,
};

Info.defaultProps = {
	toolTipProps: {},
};

export default Info;
