import React from 'react';
import { get } from 'lodash';
import { connect } from 'react-redux';
import { css } from 'emotion';
import { Tabs, Button, message } from 'antd';
import CollapsibleInsights from './CollapsibleInsights';
import { toggleInsightsSidebar, getAppAnalyticsInsights } from '../../batteries/modules/actions';
import { getAppAnalyticsInsightsByName } from '../../batteries/modules/selectors';
import Loader from '../Loader';
import { isValidPlan } from '../../batteries/utils';
import Overlay from '../Overlay';
import sampleData from './sample-data';

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
		const {
			insights,
			isOpen,
			appName,
			getInsights,
			insightUpdates: updates,
			tier,
			featureRules,
			error,
		} = this.props;
		if (isValidPlan(tier, featureRules)) {
			if (
				prevProps.appName !== appName ||
				(!insights && isOpen && prevProps.isOpen !== isOpen)
			) {
				getInsights(appName);
			}

			if (error && JSON.stringify(prevProps.error) !== JSON.stringify(error)) {
				// TODO: Need to update with proper response
				message.error('Something went wrong while fetching the data!');
			}

			if (
				prevProps.isOpen === isOpen &&
				JSON.stringify(prevProps.insightUpdates) !== JSON.stringify(updates)
			) {
				Object.keys(updates).forEach((id) => {
					const { success, from, to, inProgress } = updates[id];
					if (inProgress) {
						return;
					}
					if (success) {
						message.success(`${id} successfully transferred from ${from} to ${to}`);
					} else {
						message.error(`${id} transferred failed from ${from} to ${to}`);
					}
				});
			}
		}
	}

	componentWillUnmount() {
		const { toggleSidebar } = this.props;
		toggleSidebar();
	}

	render() {
		const { isOpen, toggleSidebar, insights, isFetching, tier, featureRules } = this.props;
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
					<Loader />
				</div>
			);
		}

		if (!isValidPlan(tier, featureRules)) {
			return (
				<div className={`${drawerClass} ${isOpen ? 'open' : ''}`}>
					<div className="insights-header">
						<h6>Actionable Analytics</h6>
						<Button onClick={toggleSidebar} shape="circle" icon="close" />
					</div>
					<Overlay
						lockSectionStyle={{
							transform: 'translateY(70%)',
							marginTop: '50%',
						}}
						renderContent={() => (
							<div className="insight-sidebar-content">
								<Tabs defaultActiveKey="INSIGHTS" style={{ padding: 10 }}>
									<TabPane key="INSIGHTS" tab="INSIGHTS">
										<CollapsibleInsights
											type="insights"
											defaultOpen="no_results"
											insights={sampleData}
										/>
									</TabPane>
									<TabPane tab="SAVED" />
									<TabPane tab="READ" />
								</Tabs>
							</div>
						)}
						src="https://i.imgur.com/WmzxSHs.png"
						alt="Query Rules"
					/>
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
						{Object.keys(insights)
							.filter((insight) => insight !== 'deleted')
							.map((insightType) => (
								<TabPane tab={insightType.toLocaleUpperCase()} key={insightType}>
									<CollapsibleInsights
										type={insightType}
										insights={insights[insightType]}
									/>
								</TabPane>
							))}
					</Tabs>
				</div>
			</div>
		);
	}
}

const mapStateToProps = (state) => {
	const appName = get(state, '$getCurrentApp.name');
	return {
		isOpen: get(state, '$getInsightSidebar.isOpen', false),
		appName,
		isFetching: get(state, '$getAppAnalyticsInsights.isFetching'),
		error: get(state, '$getAppAnalyticsInsights.error'),
		insights: get(state, `$getAppAnalyticsInsights.results.${appName}`),
		insightUpdates: get(state, `$getAppAnalyticsInsights.updates`),
		tier: get(state, '$getAppPlan.results.tier'),
		featureRules: get(state, '$getAppPlan.results.feature_rules', false),
	};
};

const mapDispatchToProps = (dispatch) => ({
	toggleSidebar: () => dispatch(toggleInsightsSidebar()),
	getInsights: (name) => dispatch(getAppAnalyticsInsights(name)),
});

export default connect(mapStateToProps, mapDispatchToProps)(AnalyticsInsights);
