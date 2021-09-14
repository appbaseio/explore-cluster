import React, { useEffect } from 'react';
import get from 'lodash/get';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import MonitoringContainer from '../../batteries/components/Monitoring/MonitoringContainer';
import { getURL } from '../../constants/config';
import { event, timingEvent } from '../../utils/gtag';
import moment from '../../utils/moment';
import Overlay from '../../components/Overlay';
import Banner from '../../batteries/components/shared/UpgradePlan/Banner';

const bannerMessagesMonitoring = {
	free: {
		title: 'Unlock Cluster Monitoring',
		description: 'Get a paid plan to monitor your cluster.',
		buttonText: 'Upgrade Now',
		href: 'billing',
	},
};

const MonitoringPage = ({ username, password, plan, isPaidUser }) => {
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
		<React.Fragment>
			{isPaidUser ? (
				<MonitoringContainer
					plan={plan}
					esURL={getURL()}
					esUsername={username}
					esPassword={password}
					isAppbase
				/>
			) : (
				<React.Fragment>
					<Banner {...bannerMessagesMonitoring.free} />
					<Overlay
						style={{
							maxWidth: '70%',
						}}
						src="https://i.imgur.com/ZNOr9t3.png"
						alt="monitor cluster"
					/>
				</React.Fragment>
			)}
		</React.Fragment>
	);
};

const mapStateToProps = (state) => {
	const { username, password } = get(state, 'user.data', {});
	return {
		username,
		password,
		plan: get(state, '$getAppPlan.results.tier'),
		isPaidUser: get(state, '$getAppPlan.results.isPaid'),
	};
};

MonitoringPage.propTypes = {
	username: PropTypes.string.isRequired,
	password: PropTypes.string.isRequired,
	plan: PropTypes.string,
	isPaidUser: PropTypes.bool.isRequired,
};

MonitoringPage.defaultProps = {
	plan: '',
};
export default connect(mapStateToProps)(MonitoringPage);
