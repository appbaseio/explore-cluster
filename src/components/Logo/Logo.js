import React from 'react';
import { number, string } from 'prop-types';

const Logo = ({ type, width }) => {
	switch (type) {
		case 'white':
			return (
				<img
					src="/static/images/reactivesearch_white.svg"
					width={width}
					alt="reactivesearch.io"
				/>
			);
		case 'small':
			return (
				<img
					src="/static/images/reactivesearch_small.png"
					width={width}
					alt="reactivesearch.io"
				/>
			);
		case 'black':
			return (
				<img
					src="/static/images/reactivesearch_black.svg"
					width={width}
					alt="reactivesearch.io"
				/>
			);
		default:
			return (
				<img
					src="/static/images/reactivesearch_grey.svg"
					width={width}
					alt="reactivesearch.io"
				/>
			);
	}
};

Logo.defaultProps = {
	width: 140,
	type: undefined,
};

Logo.propTypes = {
	width: number,
	type: string,
};

export default Logo;
