import React from 'react';
import PropTypes from 'prop-types';
import { Tag } from 'antd';

function LabelTag({ item, ...rest }) {
	const { label, tag } = item;
	return (
		<div {...rest}>
			{label}
			{tag ? (
				<Tag
					style={{
						fontSize: 10,
						marginLeft: 8,
					}}
					color="#001529"
				>
					{tag}
				</Tag>
			) : null}
		</div>
	);
}

LabelTag.propTypes = {
	item: PropTypes.object,
};

LabelTag.defaultProps = {
	item: {},
};

export default LabelTag;
