import React from 'react';
import get from 'lodash/get';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import MonitoringContainer from '../../batteries/components/Monitoring/MonitoringContainer';
import { getURL } from '../../constants/config';

const MonitoringPage = ({ username, password }) => {
	return (
		<MonitoringContainer
			esURL={getURL()}
			esUsername={username}
			esPassword={password}
			isAppbase
		/>
	);
};

const mapStateToProps = (state) => {
	const { username, password } = get(state, 'user.data', {});
	return {
		username,
		password,
	};
};

MonitoringPage.propTypes = {
	username: PropTypes.string.isRequired,
	password: PropTypes.string.isRequired,
};
export default connect(mapStateToProps)(MonitoringPage);
