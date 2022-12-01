import React from 'react';

import {
	CalendarOutlined,
	CheckOutlined,
	EnvironmentOutlined,
	FileJpgOutlined,
	FileTextOutlined,
	FileUnknownOutlined,
	RiseOutlined,
} from '@ant-design/icons';

import PropTypes from 'prop-types';
import { DenseVector } from '../../../utils/conversionMap';

const iconStyle = { margin: 0, fontSize: 13 };

const MappingsTypeIcon = ({ type }) => {
	switch (type) {
		case 'text':
		case 'string':
		case 'keyword':
			return <FileTextOutlined style={iconStyle} />;
		case 'long':
		case 'integer':
			return <div style={iconStyle}>#</div>;
		case 'geo_point':
		case 'geo_shape':
			return <EnvironmentOutlined style={iconStyle} />;
		case 'date':
			return <CalendarOutlined style={iconStyle} />;
		case 'double':
		case 'float':
			return <div style={iconStyle}>π</div>;
		case 'boolean':
			return <CheckOutlined style={iconStyle} />;
		case 'object':
			return <div style={iconStyle}>{'{...}'}</div>;
		case 'image':
			return <FileJpgOutlined style={iconStyle} />;

		case 'rank_feature':
		case 'rank_features':
			return <RiseOutlined style={iconStyle} />;
		case DenseVector:
			return <RiseOutlined style={iconStyle} />;

		default:
			return <FileUnknownOutlined style={iconStyle} />;
	}
};

MappingsTypeIcon.defaultProps = {
	type: '',
};

MappingsTypeIcon.propTypes = {
	type: PropTypes.string,
};

export default MappingsTypeIcon;
