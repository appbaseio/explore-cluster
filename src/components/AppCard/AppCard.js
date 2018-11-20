import React from 'react';
import PropTypes from 'prop-types';

import StatsBox from './StatsBox';

const AppCard = ({ title, data }) => <StatsBox data={data} title={title} />;

AppCard.propTypes = {
	title: PropTypes.node.isRequired,
	data: PropTypes.object, // eslint-disable-line
};

export default AppCard;
