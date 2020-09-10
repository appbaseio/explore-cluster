import React from 'react';
import PropTypes from 'prop-types';

const Loader = ({ show, label }) => {
	if (!show) return null;

	return (
		<div className="loader" data-cy="loader">
			<p>{label}</p>
		</div>
	);
};

Loader.propTypes = {
	show: PropTypes.bool,
	label: PropTypes.string,
};

Loader.defaultProps = {
	show: false,
	label: null,
};

export default Loader;
