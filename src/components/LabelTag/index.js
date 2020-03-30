import { Tag } from 'antd';
import React from 'react';

// eslint-disable-next-line import/prefer-default-export
export function LabelTag({ item, ...rest }) {
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
