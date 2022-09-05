import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { css } from 'react-emotion';

const styles = css`
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	max-width: 75px;
`;

const Loader = ({ style }) =>
	ReactDOM.createPortal(
		<div className={styles} style={style}>
			<object data="/static/images/reactivesearch_loader.svg" type="image/svg+xml">
				<img
					src="/static/images/reactivesearch_loader.svg"
					alt="loading"
					style={{
						width: '-webkit-fill-available',
					}}
				/>
			</object>
		</div>,
		document.getElementById('root'),
	);

Loader.propTypes = {
	style: PropTypes.object,
};

Loader.defaultProps = {
	style: {},
};

export default Loader;
