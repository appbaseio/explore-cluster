import React from 'react';
import get from 'lodash/get';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import MonitoringContainer from '../../batteries/components/Monitoring/MonitoringContainer';
import { getURL } from '../../constants/config';

const MonitoringPage = ({ username, password, plan }) => {
	if (!plan) {
		return null;
	}
	return (
		<MonitoringContainer
			plan={plan}
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
		plan: get(state, '$getAppPlan.results.tier'),
	};
};

MonitoringPage.propTypes = {
	username: PropTypes.string.isRequired,
	password: PropTypes.string.isRequired,
	plan: PropTypes.string,
};

MonitoringPage.defaultProps = {
	plan: '',
};
export default connect(mapStateToProps)(MonitoringPage);
