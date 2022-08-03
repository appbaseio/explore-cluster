import React from 'react';
import PropTypes from 'prop-types';
import { css } from 'react-emotion';

const styles = css`
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	z-index: 99999;
`;

const ReactivesearchLoader = ({ size }) => (
	<div css={styles} style={{ position: 'absolute' }}>
		<img
			width={size || 50}
			src="https://cdn.jsdelivr.net/gh/appbaseio/reactivesearch-shopify-plugin@9bf06b81f832f7c7613ef008748999f9b7bf0e0b/build/images/loader.svg"
			alt="loading"
		/>
	</div>
);

ReactivesearchLoader.propTypes = {
	size: PropTypes.number,
};

ReactivesearchLoader.defaultProps = {
	size: 50,
};

export default ReactivesearchLoader;
