import React from 'react';
import { get } from 'lodash';
import { connect } from 'react-redux';
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
	const { children, isInsightsSidebarOpen } = props;
	return (
		<div className={`${toggleClass} ${isInsightsSidebarOpen ? 'open' : ''}`}>
			{children}
			<AnalyticsInsights />
		</div>
	);
};

const mapStateToProps = (state) => ({
	isInsightsSidebarOpen: get(state, '$getInsightSidebar.isOpen', false),
});

export default connect(mapStateToProps)(AnalyticsContainer);
