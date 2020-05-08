import React from 'react';
import { get } from 'lodash';
import { connect } from 'react-redux';
import { Tabs, Button, message, notification } from 'antd';
import PropTypes from 'prop-types';
import CollapsibleInsights from './CollapsibleInsights';
import { toggleInsightsSidebar, getAppAnalyticsInsights } from '../../batteries/modules/actions';
import Loader from '../Loader';
import { isValidPlan } from '../../batteries/utils';
import Overlay from '../Overlay';
import sampleData from './sample-data';
import { getUrlParams } from '../../utils/helper';
import { drawerClass } from './styles';
import { getAppAnalyticsInsightsByName } from '../../batteries/modules/selectors';

const { TabPane } = Tabs;

class AnalyticsInsights extends React.Component {
	defaultTabKey = 'insights';

	openInsight = null;

	componentDidMount() {
		const urlParams = getUrlParams(window.location.search);
		const { toggleSidebar, isOpen, appName } = this.props;
		if (isOpen) {
			this.fetchInsights(appName);
		}

		/*
			Below logic is for fetching the insights when the user access through a
			direct link to the insight id.

			Direct Link Usage:
			?insights-sidebar=true&insights-tab=read&insights-id=low_clicks
		*/
		if (!isOpen && get(urlParams, 'insights-sidebar') === 'true') {
			toggleSidebar();
			this.fetchInsights(appName);
		}

		if (get(urlParams, 'insights-tab')) {
			this.defaultTabKey = get(urlParams, 'insights-tab');
		}

		if (get(urlParams, 'insights-id')) {
			this.openInsight = get(urlParams, 'insights-id');
		}
	}

	componentDidUpdate(prevProps) {
		const { isOpen, appName, insightUpdates: updates, error } = this.props;

		/*
			Refetch insights when -
			1. there is a change in app.
			2. When sidebar is toggled and insights doesnt exists.
		*/

		if (prevProps.appName !== appName || (isOpen && prevProps.isOpen !== isOpen)) {
			this.fetchInsights(appName);
		}

		if (error && JSON.stringify(prevProps.error) !== JSON.stringify(error)) {
			notification.error({
				message: 'Failed to fetch Insights',
				description: error.message || 'Something went wrong while fetching the data!',
			});
		}

		/*
			Updates is an array which contains all the information of inProgress
			requests and the completed requests which are not yet notified.

			Only show updates when there is change in the array and when
			the API has resolved ( track using inProgress )
		*/
		if (
			prevProps.isOpen === isOpen &&
			JSON.stringify(prevProps.insightUpdates) !== JSON.stringify(updates)
		) {
			Object.keys(updates).forEach((id) => {
				const { success, error: updateError, nextStatus, inProgress } = updates[id];
				if (inProgress) {
					return;
				}
				if (success) {
					switch (nextStatus) {
						case 'saved':
							message.success('Saved Insight successfully!');
							break;
						case 'deleted':
							message.success('Deleted Insight successfully!');
							break;
						case 'read':
							message.success('Marked Insight as Read');
							break;
						default:
					}
				} else {
					switch (nextStatus) {
						case 'saved':
							notification.error({
								message: 'Failed to save insight',
								description:
									updateError.message ||
									'Something went wrong while updating the status!',
							});
							break;
						case 'deleted':
							notification.error({
								message: 'Failed to delete insight',
								description:
									updateError.message ||
									'Something went wrong while updating the status!',
							});
							break;
						case 'read':
							notification.error({
								message: 'Failed to mark insight as Read',
								description:
									updateError.message ||
									'Something went wrong while updating the status!',
							});
							break;
						default:
					}
				}
			});
		}
	}

	componentWillUnmount() {
		const { toggleSidebar } = this.props;
		toggleSidebar();
	}

	fetchInsights = (appName) => {
		const { getInsights, tier, featureInsights, insights } = this.props;
		console.log(insights);
		// Call GET API only when the plan is valid and insights dont exist in redux store.
		if (isValidPlan(tier, featureInsights) && !insights) {
			getInsights(appName);
		}
	};

	render() {
		const { isOpen, toggleSidebar, insights, isFetching, tier, featureInsights } = this.props;
		if (!insights && !isFetching) {
			return null;
		}

		if (isFetching) {
			return (
				<div className={`${drawerClass} ${isOpen ? 'open' : ''}`}>
					<div className="insights-header">
						<h6>Actionable Insights</h6>
						<Button onClick={toggleSidebar} shape="circle" icon="close" />
					</div>
					<Loader />
				</div>
			);
		}

		if (!isValidPlan(tier, featureInsights)) {
			return (
				<div className={`${drawerClass} ${isOpen ? 'open' : ''}`}>
					<div className="insights-header">
						<h6>Actionable Insights</h6>
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
					<h6>Actionable Insights</h6>
					<Button onClick={toggleSidebar} shape="circle" icon="close" />
				</div>
				<div className="insight-sidebar-content">
					<Tabs style={{ padding: 10 }} defaultActiveKey={this.defaultTabKey}>
						{Object.keys(insights)
							.filter((insight) => insight !== 'deleted')
							.map((insightType) => (
								<TabPane tab={insightType.toLocaleUpperCase()} key={insightType}>
									<CollapsibleInsights
										type={insightType}
										defaultOpen={this.openInsight}
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

AnalyticsInsights.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	appName: PropTypes.string.isRequired,
	isFetching: PropTypes.bool.isRequired,
	insights: PropTypes.object.isRequired,
	insightUpdates: PropTypes.array.isRequired,
	tier: PropTypes.string.isRequired,
	featureInsights: PropTypes.bool.isRequired,
	error: PropTypes.object.isRequired,
	// Actions
	getInsights: PropTypes.func.isRequired,
	toggleSidebar: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
	const appName = get(state, '$getCurrentApp.name', 'default');
	return {
		isOpen: get(state, '$getAppAnalyticsInsights.isOpen', false),
		appName,
		isFetching: get(state, '$getAppAnalyticsInsights.isFetching'),
		error: get(state, '$getAppAnalyticsInsights.error'),
		insights: getAppAnalyticsInsightsByName(state),
		insightUpdates: get(state, `$getAppAnalyticsInsights.updates`),
		tier: get(state, '$getAppPlan.results.tier'),
		featureInsights: get(state, '$getAppPlan.results.feature_custom_events', false),
	};
};

const mapDispatchToProps = (dispatch) => ({
	toggleSidebar: () => dispatch(toggleInsightsSidebar()),
	getInsights: (name) => dispatch(getAppAnalyticsInsights(name)),
});

export default connect(mapStateToProps, mapDispatchToProps)(AnalyticsInsights);
