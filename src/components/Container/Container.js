import React from 'react';
import PropTypes from 'prop-types';
import { children as childrenProp } from '../../utils/prop-types';

const Container = ({ children, compact, ...props }) => (
	<div
		css={{
			width: '100%',
			maxWidth: 1300,
			margin: '0 auto',
			padding: compact ? '0px 20px 20px' : '45px 20px',
		}}
		{...props}
	>
		{children}
	</div>
);

Container.propTypes = {
	children: childrenProp,
	compact: PropTypes.bool,
};

Container.defaultProps = {
	children: null,
	compact: false,
};

export default Container;
