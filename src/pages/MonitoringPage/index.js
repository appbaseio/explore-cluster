import React, { useEffect } from 'react';
import get from 'lodash/get';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import MonitoringContainer from '../../batteries/components/Monitoring/MonitoringContainer';
import { getURL } from '../../constants/config';
import { event, timingEvent } from '../../utils/gtag';
import moment from '../../utils/moment';

const MonitoringPage = ({ username, password, plan }) => {
	useEffect(() => {
		const startTime = moment();
		// triggering custom event for google analytics
		event({
			action: 'Cluster Monitoring',
			category: 'Analytics',
			label: 'visit',
			value: null,
		});

		return () => {
			// Sends the timing event to Google Analytics.
			timingEvent({
				action: 'timing_complete',
				category: 'Analytics',
				label: 'cluster-monitoring-time',
				name: 'time',
				value: startTime.fromNow(),
			});
		};
	}, []);
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
