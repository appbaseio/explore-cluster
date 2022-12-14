import React from 'react';
import { Tag } from 'antd';
import { any } from 'prop-types';

export const PipelineTags = (props) => {
	const { value, label } = props;

	return (
		<Tag style={{ maxWidth: 150, overflow: 'clip', textOverflow: 'ellipsis' }} {...props}>
			{value === '*' ? label : value}
		</Tag>
	);
};

PipelineTags.propTypes = {
	label: any.isRequired,
	value: any.isRequired,
	closable: any.isRequired,
	onClose: any.isRequired,
};
