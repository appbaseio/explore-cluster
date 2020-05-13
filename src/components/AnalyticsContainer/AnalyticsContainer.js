import React from 'react';
import { get } from 'lodash';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { css } from 'emotion';
import AnalyticsInsights from './AnalyticsInsights';

const toggleClass = css`
	width: 100%;
	transition: all 0.2s ease;
	&.open {
		width: calc(100% - 350px);
	}
`;

const AnalyticsContainer = (props) => {
	const { children, isInsightsSidebarOpen, isFetchingPlan } = props;
	return (
		<div className={`${toggleClass} ${isInsightsSidebarOpen ? 'open' : ''}`}>
			{children}
			{isFetchingPlan ? null : <AnalyticsInsights />}
		</div>
	);
};

AnalyticsContainer.propTypes = {
	isInsightsSidebarOpen: PropTypes.bool.isRequired,
	isFetchingPlan: PropTypes.bool.isRequired,
	children: PropTypes.node.isRequired,
};

const mapStateToProps = (state) => ({
	isInsightsSidebarOpen: get(state, '$getAppAnalyticsInsights.isOpen', false),
	isFetchingPlan: get(state, '$getAppPlan.isFetching', false),
});

export default connect(mapStateToProps)(AnalyticsContainer);
