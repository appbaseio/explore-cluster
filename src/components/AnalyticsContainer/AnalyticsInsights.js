import React from 'react';
import { get } from 'lodash';
import { connect } from 'react-redux';
import { css } from 'emotion';
import { Tabs, Button, Skeleton } from 'antd';
import CollapsibleInsights from './CollapsibleInsights';
import { sampleData } from './sampledata';
import { toggleInsightsSidebar, getAppAnalyticsInsights } from '../../batteries/modules/actions';
import { getAppAnalyticsInsightsByName } from '../../batteries/modules/selectors';

const { TabPane } = Tabs;

const drawerClass = css`
	width: 0;
	transition: all 0.2s ease;
	right: 0;
	top: 60px;
	position: fixed;
	height: calc(100vh - 60px);
	border-left: 1px solid transparent;
	box-sizing: border-box;
	overflow-y: scroll;
	background: #f5f5f5;
	&.open {
		box-shadow: -2px 0px 10px 0 rgba(0, 0, 0, 0.15);
		width: 350px;
	}

	.insights-header {
		display: flex;
		padding: 16px;
		background: #1890ff;
		align-items: center;
		justify-content: space-between;
	}

	.insights-header > h6 {
		font-size: 16px;
		color: white;
		margin: 0;
	}

	.insight-sidebar-content {
		opacity: 0;
		transition: all ease 0.4s;
		transition-delay: 0.2s;
	}

	&.open .insight-sidebar-content {
		opacity: 1;
	}
`;

class AnalyticsInsights extends React.Component {
	componentDidUpdate(prevProps) {
		// Fetch insights only when we open the drawer & dont over fetch if insights already exists
		const { insights, isOpen, appName, getInsights } = this.props;
		if ((prevProps.appName !== appName || !insights) && isOpen && prevProps.isOpen !== isOpen) {
			getInsights(appName);
		}
	}

	render() {
		const { isOpen, toggleSidebar, insights, isFetching } = this.props;

		if (!insights && !isFetching) {
			return null;
		}

		if (isFetching) {
			return (
				<div className={`${drawerClass} ${isOpen ? 'open' : ''}`}>
					<div className="insights-header">
						<h6>Actionable Analytics</h6>
						<Button onClick={toggleSidebar} shape="circle" icon="close" />
					</div>
					<Tabs style={{ padding: 10 }} defaultActiveKey="1">
						<TabPane tab="INSIGHTS" key="1">
							<Skeleton />
						</TabPane>
						<TabPane tab="SAVED" key="2">
							<Skeleton />
						</TabPane>
						<TabPane tab="READ" key="3">
							<Skeleton />
						</TabPane>
					</Tabs>
				</div>
			);
		}

		return (
			<div className={`${drawerClass} ${isOpen ? 'open' : ''}`}>
				<div className="insights-header">
					<h6>Actionable Analytics</h6>
					<Button onClick={toggleSidebar} shape="circle" icon="close" />
				</div>
				<div className="insight-sidebar-content">
					<Tabs style={{ padding: 10 }} defaultActiveKey="1">
						{Object.keys(insights).map((insightType) => (
							<TabPane tab={insightType.toLocaleUpperCase()} key={insightType}>
								<CollapsibleInsights insights={sampleData[insightType]} />
							</TabPane>
						))}
					</Tabs>
				</div>
			</div>
		);
	}
}

const mapStateToProps = (state) => ({
	isOpen: get(state, '$getInsightSidebar.isOpen', false),
	appName: get(state, '$getCurrentApp.name'),
	isFetching: get(state, '$getAppAnalyticsInsights.isFetching'),
	insights: getAppAnalyticsInsightsByName(state),
});

const mapDispatchToProps = (dispatch) => ({
	toggleSidebar: () => dispatch(toggleInsightsSidebar()),
	getInsights: (name) => dispatch(getAppAnalyticsInsights(name)),
});

export default connect(mapStateToProps, mapDispatchToProps)(AnalyticsInsights);
