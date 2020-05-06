import React from 'react';
import PropTypes from 'prop-types';
import { css } from 'react-emotion';

const styles = css`
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
`;

const Loader = ({ style }) => (
	<div className={styles} style={style}>
		<img src="/static/images/loader.svg" alt="loading" />
	</div>
);

Loader.propTypes = {
	style: PropTypes.object,
};

Loader.defaultProps = {
	style: {},
};

export default Loader;
