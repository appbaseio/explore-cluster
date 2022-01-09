import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Button, Col, Icon, Layout, message, Result, Row, Tabs } from 'antd';
import { css } from 'emotion';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import get from 'lodash/get';
import keys from 'lodash/keys';
import QueryCard from './components/QueryCard';
import { getRules, reorderRules, getUsageStats } from '../../batteries/modules/actions';
import Loader from '../../components/Loader';
import DNDWrapper from '../../components/DNDWrapper';
import { isValidPlan } from '../../batteries/utils';
import Overlay from '../../components/Overlay';
import Banner from '../../batteries/components/shared/UpgradePlan/Banner';
import { bannerDetails } from './utils';
import SearchPreviewSwitcher from '../../components/SearchPreviewSwitcher';
import { allowedTiers } from '../../utils/prop-types';
import ErrorToaster from '../../batteries/components/shared/ErrorToaster';
import { withErrorToaster } from '../../batteries/components/shared/ErrorToaster/ErrorToaster';
import { event, timingEvent } from '../../utils/gtag';
import moment from '../../utils/moment';
import NoIndex from '../NoIndexPage/NoIndex';
import { saveRecentRoute } from '../../actions';

const { Header } = Layout;

const container = css`
	padding: 50px;
	margin-bottom: 70px;
`;

class QueryRules extends Component {
	constructor(props) {
		super(props);
		this.startTime = moment();
		this.state = { visible: false };
	}

	componentDidMount() {
		// triggering custom event for google analytics
		event({
			action: 'Query Rules',
			category: 'Search Relevancy',
			label: 'visit',
			value: null,
		});

		const { fetchRules, rules, tier, featureRules, fetchUsageStats } = this.props;
		fetchUsageStats();
		if (isValidPlan(tier, featureRules)) {
			if (!rules) {
				fetchRules();
			}
		}
	}

	componentDidUpdate(prevProps) {
		const {
			deleted,
			isAppCreating,
			createdAppName: appName,
			updateRecentRoute,
			history,
			hasJSON,
		} = this.props;

		if (prevProps.deleted !== deleted) {
			message.success('Deleted item successfully');
		}

		if (!isAppCreating && prevProps.isAppCreating) {
			updateRecentRoute(window.location.pathname);
			history.push('/');

			if (hasJSON === 'sample') {
				history.push(`app/${appName}/import?load-data=true`);
			} else if (hasJSON) {
				history.push(`app/${appName}/import`);
			} else {
				history.push(`app/${appName}`);
			}
		}
	}

	componentWillUnmount() {
		// Sends the timing event to Google Analytics.
		timingEvent({
			action: 'timing_complete',
			category: 'Search Relevancy',
			label: 'query-rules-time',
			name: 'time',
			value: this.startTime.fromNow(),
		});
	}

	onDragEnd = (result) => {
		const { rules, updateOrder, hasError } = this.props;
		const ruleToPromote = rules.find((rule) => rule.order === result.source.index);
		const ruleToDemote = rules.find((rule) => rule.order === result.destination.index);

		if (result.source.index < result.destination.index) {
			// dropping at nextELem + 1
			updateOrder({
				toBeDemoted: {
					id: ruleToDemote.id,
					order: result.source.index,
				},
				toBePromoted: {
					id: ruleToPromote.id,
					order: result.destination.index + 1,
				},
			});

			if (hasError) {
				message.error('Error while sorting items');
			} else {
				message.success(
					`Rule re-ordered successfully from ${result.source.index} to ${
						result.destination.index + 1
					}`,
				);
			}
		} else if (result.destination.index === 1) {
			// dropping at position 1
			updateOrder({
				toBeDemoted: {
					id: ruleToDemote.id,
					order: result.source.index,
				},
				toBePromoted: {
					id: ruleToPromote.id,
					order: result.destination.index,
				},
			});

			if (hasError) {
				message.error('Error while sorting items');
			} else {
				message.success(
					`Rule re-ordered successfully from ${result.source.index} to ${result.destination.index}`,
				);
			}
		} else {
			// dropping at bottomElem - 1
			updateOrder({
				toBeDemoted: {
					id: ruleToDemote.id,
					order: result.source.index,
				},
				toBePromoted: {
					id: ruleToPromote.id,
					order: result.destination.index - 1,
				},
			});

			if (hasError) {
				message.error('Error while re-ordering items');
			} else {
				message.success(
					`Rule re-ordered successfully from ${result.source.index} to ${
						result.destination.index - 1
					}`,
				);
			}
		}
	};

	toggleVisibility = () => {
		this.setState((prevState) => ({
			visible: !prevState.visible,
		}));
	};

	onAppSelect = (app) => {
		this.setState({ app, visible: true });
	};

	render() {
		const { collapsed, rules, isLoading, tier, featureRules, apps, usageStats, isFetching } =
			this.props;
		const { visible, app } = this.state;

		if (!isValidPlan(tier, featureRules)) {
			return (
				<React.Fragment>
					<Banner {...bannerDetails} onClick={() => window.open(bannerDetails.href)} />
					<Overlay
						style={{
							maxWidth: '70%',
						}}
						src="https://i.imgur.com/WmzxSHs.png"
						alt="Query Rules"
					/>
				</React.Fragment>
			);
		}

		if (isLoading) {
			return <Loader />;
		}

		const filteredApps = keys(apps).filter((appName) => !appName.startsWith('.'));
		if (
			!isLoading &&
			!isFetching &&
			apps &&
			!Object.keys(apps)?.filter((i) => !i.startsWith('.') && !i.startsWith('metricbeat'))
				?.length
		) {
			return <NoIndex view="Query Rules" />;
		}

		return (
			<Fragment>
				<Header style={{ background: 'white', height: 'auto' }}>
					<div
						css={{
							padding: '25px 0px',
							margin: '0 auto',
						}}
					>
						<Row type="flex" justify="space-between" align="middle" gutter={16}>
							<Col lg={18}>
								<h2>Query Rules</h2>
								<Row>
									<Col lg={18}>
										<p>
											Create &quot;If this, then that&quot; style query rules.
											Query Rules will be executed in the order in which they
											are listed. You can drag and drop a rule to change the
											ordering sequence.
										</p>
									</Col>
								</Row>
							</Col>
							<Col
								lg={6}
								css={{
									display: 'flex',
									flexDirection: 'column',
								}}
							>
								<Link to="/cluster/rules/new">
									<Button
										block
										type="primary"
										size="large"
										rel="noopener noreferrer"
									>
										<Icon type="plus" />
										Create Rule
									</Button>
								</Link>
								<Button
									style={{ marginTop: 10 }}
									type="primary"
									ghost
									size="large"
									rel="noopener noreferrer"
									onClick={() => window.open(bannerDetails.href)}
								>
									Read Docs
								</Button>
							</Col>
						</Row>
					</div>
				</Header>
				<div className={container}>
					{rules && rules.length ? (
						<ErrorToaster>
							<div>
								<Tabs defaultActiveKey="1">
									<Tabs.TabPane tab="All Query Rules" key="1">
										<DNDWrapper
											onDragEnd={this.onDragEnd}
											items={rules.sort((a, b) => a.order - b.order)}
											dropId="RULES"
											indexKey="order"
											idKey="id"
										>
											{/* eslint-disable-next-line */}
											{({ item, dragProvided, dragSnapshot, index }) => (
												<QueryCard
													dragProvided={dragProvided}
													dragSnapshot={dragSnapshot}
													rule={item}
													index={item.order}
													usageStatsCount={
														usageStats[item.id]?.count || 0
													} // res.key === item.id
												/>
											)}
										</DNDWrapper>
									</Tabs.TabPane>
									<Tabs.TabPane tab="Index Rules" key="2">
										<DNDWrapper
											onDragEnd={this.onDragEnd}
											items={rules
												.filter((rule) => rule.trigger.type === 'index')
												.sort((a, b) => a.order - b.order)}
											dropId="RULES"
											indexKey="order"
											idKey="id"
										>
											{/* eslint-disable-next-line */}
											{({ item, dragProvided, dragSnapshot, index }) => (
												<QueryCard
													dragProvided={dragProvided}
													dragSnapshot={dragSnapshot}
													rule={item}
													index={item.order}
													usageStatsCount={
														usageStats[item.id]?.count || 0
													} // res.key === item.id
												/>
											)}
										</DNDWrapper>
									</Tabs.TabPane>
									<Tabs.TabPane tab="Query Rules" key="3">
										<DNDWrapper
											onDragEnd={this.onDragEnd}
											items={rules
												.filter((rule) => rule.trigger.type === 'filter')
												.sort((a, b) => a.order - b.order)}
											dropId="RULES"
											indexKey="order"
											idKey="id"
										>
											{/* eslint-disable-next-line */}
											{({ item, dragProvided, dragSnapshot, index }) => (
												<QueryCard
													dragProvided={dragProvided}
													dragSnapshot={dragSnapshot}
													rule={item}
													index={item.order}
													usageStatsCount={
														usageStats[item.id]?.count || 0
													} // res.key === item.id
												/>
											)}
										</DNDWrapper>
									</Tabs.TabPane>
									<Tabs.TabPane tab="Always Rules" key="4">
										<DNDWrapper
											onDragEnd={this.onDragEnd}
											items={rules
												.filter((rule) => rule.trigger.type === 'always')
												.sort((a, b) => a.order - b.order)}
											dropId="RULES"
											indexKey="order"
											idKey="id"
										>
											{/* eslint-disable-next-line */}
											{({ item, dragProvided, dragSnapshot, index }) => (
												<QueryCard
													dragProvided={dragProvided}
													dragSnapshot={dragSnapshot}
													rule={item}
													index={item.order}
													usageStatsCount={
														usageStats[item.id]?.count || 0
													} // res.key === item.id
												/>
											)}
										</DNDWrapper>
									</Tabs.TabPane>
								</Tabs>
							</div>
						</ErrorToaster>
					) : (
						<Result
							title="No Rules Present"
							subTitle="Create a new Rule to get started."
							extra={
								<Link to="/cluster/rules/new">
									<Button type="primary">
										<Icon type="plus" />
										Create Rule
									</Button>
								</Link>
							}
						/>
					)}
					{rules && rules.length > 0 ? (
						<div
							style={{
								position: 'fixed',
								overflow: 'hidden',
								bottom: 0,
								left: collapsed ? 80 : 260,
								right: 0,
							}}
						>
							<div
								style={{
									display: 'flex',
									justifyContent: 'space-between',
									padding: '20px 50px',
									background: 'white',
									border: '1px solid #e8e8e8',
									boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.15)',
								}}
							>
								<SearchPreviewSwitcher
									filteredApps={filteredApps}
									onSelect={this.onAppSelect}
									onCancel={this.toggleVisibility}
									visible={visible}
									app={app}
								/>
							</div>
						</div>
					) : null}
				</div>
			</Fragment>
		);
	}
}

QueryRules.propTypes = {
	fetchRules: PropTypes.func.isRequired,
	updateOrder: PropTypes.func.isRequired,
	rules: PropTypes.array,
	apps: PropTypes.object,
	tier: allowedTiers,
	featureRules: PropTypes.bool,
	reordering: PropTypes.bool,
	hasError: PropTypes.bool,
	deleted: PropTypes.bool,
	isLoading: PropTypes.bool,
	collapsed: PropTypes.bool.isRequired,
	fetchUsageStats: PropTypes.func.isRequired,
	usageStats: PropTypes.object.isRequired,
	isFetching: PropTypes.bool,
	isAppCreating: PropTypes.bool.isRequired,
	updateRecentRoute: PropTypes.func.isRequired,
	history: PropTypes.object.isRequired,
	createdAppName: PropTypes.string,
	hasJSON: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
};

QueryRules.defaultProps = {
	rules: null,
	tier: undefined,
	featureRules: false,
	reordering: false,
	hasError: false,
	deleted: false,
	isLoading: false,
	isFetching: false,
	apps: {},
	createdAppName: '',
	hasJSON: '',
};

const mapStateToProps = (state) => ({
	rules: get(state, '$getAppRules.results'),
	isLoading: get(state, '$getAppRules.isFetching'),
	hasError: get(state, '$getAppRules.error'),
	reordering: get(state, '$getAppRules.reordering'),
	deleted: get(state, '$getAppRules.deleted'),
	tier: get(state, '$getAppPlan.results.tier'),
	appName: get(state, '$getCurrentApp.name'),
	featureRules: get(state, '$getAppPlan.results.feature_rules', false),
	apps: get(state, 'apps.data', {}),
	isFetching: get(state, 'apps.isFetching', false),
	collapsed: get(state, 'sideBarCollapsed'),
	usageStats: get(state, '$getUsageStats.results', {}),
	isAppCreating: get(state, 'createdApp.isLoading', false),
	createdAppName: get(state, 'createdApp.data.appName'),
	hasJSON: get(state, 'createdApp.data.hasJSON'),
});

const mapDispatchToProps = (dispatch) => ({
	fetchRules: () => dispatch(getRules()),
	updateOrder: ({ toBePromoted, toBeDemoted }) =>
		dispatch(reorderRules({ toBePromoted, toBeDemoted })),
	fetchUsageStats: () => dispatch(getUsageStats()),
	updateRecentRoute: (routeName) => dispatch(saveRecentRoute(routeName)),
});

export default withErrorToaster(connect(mapStateToProps, mapDispatchToProps)(QueryRules));
