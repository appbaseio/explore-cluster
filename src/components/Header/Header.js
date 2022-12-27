import React from 'react';
import PropTypes from 'prop-types';
import { Layout } from 'antd';

import { mediaKey } from '../../utils/media';
import { children as childrenProp } from '../../utils/prop-types';

const { Header } = Layout;

const WhiteHeader = ({ children, compact, ...props }) => (
	<Header
		css={{
			backgroundColor: '#fff !important',
			height: 'auto !important',
			boxShadow: '0 1px 1px 0 rgba(0,0,0,0.05)',

			[mediaKey.medium]: {
				padding: '0 30px',
			},
		}}
		{...props}
	>
		<div
			css={{
				padding: compact ? '25px 0px' : '45px 25px',
				margin: '0 auto',
				maxWidth: compact ? 'none' : 1300,

				[mediaKey.medium]: {
					padding: '40px 0 25px',
				},
			}}
		>
			{children}
		</div>
	</Header>
);

WhiteHeader.propTypes = {
	children: childrenProp,
	compact: PropTypes.bool,
};

WhiteHeader.defaultProps = {
	children: null,
	compact: false,
};

export default WhiteHeader;
