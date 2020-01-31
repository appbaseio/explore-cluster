import React from 'react';
import { css } from 'react-emotion';

const styles = css`
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
`;

const Loader = props => (
	<div className={styles} {...props}>
		<img src="/static/images/loader.svg" alt="loading" />
	</div>
);

export default Loader;
