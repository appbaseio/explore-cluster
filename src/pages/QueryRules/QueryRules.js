import React, { Component, Fragment } from 'react';
import { Col, Row, Layout, Button, Icon, message, Result, Affix } from 'antd';
import { css } from 'emotion';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { get } from 'lodash';

import QueryCard from './components/QueryCard';
import { getRules, reorderRules } from '../../batteries/modules/actions';
import Loader from '../../components/Loader';
import DNDWrapper from '../../components/DNDWrapper';
import { isValidPlan } from '../../batteries/utils';
import Overlay from '../../components/Overlay';
import SearchPreviewModal from '../../components/SearchPreviewModal';
import Banner from '../../batteries/components/shared/UpgradePlan/Banner';
import { bannerDetails } from './utils';

const { Header } = Layout;

const container = css`
	padding: 50px;
`;

class QueryRules extends Component {
	componentDidMount() {
		const { fetchRules, rules, tier, featureRules } = this.props;
		if (isValidPlan(tier, featureRules)) {
			if (!rules) {
				fetchRules();
			}
		}
	}

	componentDidUpdate(prevProps) {
		const { reordering, hasError, deleted } = this.props;
		if (!reordering && prevProps.reordering !== reordering) {
			if (hasError) {
				message.error('Error while sorting items');
			} else {
				message.success('Sorted items successfully');
			}
		}

		if (prevProps.deleted !== deleted) {
			message.success('Deleted Item successfully');
		}
	}

	onDragEnd = result => {
		const { rules, updateOrder } = this.props;
		if (result.source.index !== result.destination.index) {
			const ruleToPromote = rules.find(rule => rule.order === result.source.index);
			const ruleToDemote = rules.find(rule => rule.order === result.destination.index);

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
		}
	};

	render() {
		const { rules, isLoading, tier, appName, featureRules } = this.props;

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
									Read More
								</Button>
							</Col>
						</Row>
					</div>
				</Header>
				<div className={container}>
					{rules && rules.length ? (
						<DNDWrapper
							onDragEnd={this.onDragEnd}
							items={rules.sort((a, b) => a.order - b.order)}
							dropId="RULES"
							indexKey="order"
							idKey="id"
						>
							{({ item, dragProvided, dragSnapshot, index }) => (
								<QueryCard
									dragProvided={dragProvided}
									dragSnapshot={dragSnapshot}
									rule={item}
									index={index}
								/>
							)}
						</DNDWrapper>
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
						<Affix offsetBottom={0}>
							<div
								style={{
									display: 'flex',
									justifyContent: 'space-between',
									padding: 20,
									background: 'white',
									border: '1px solid #e8e8e8',
									boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.15)',
								}}
							>
								<SearchPreviewModal app={appName} />
							</div>
						</Affix>
					) : null}
				</div>
			</Fragment>
		);
	}
}

const mapStateToProps = state => ({
	rules: get(state, '$getAppRules.results'),
	isLoading: get(state, '$getAppRules.isFetching'),
	hasError: get(state, '$getAppRules.error'),
	reordering: get(state, '$getAppRules.reordering'),
	deleted: get(state, '$getAppRules.deleted'),
	tier: get(state, '$getAppPlan.results.tier'),
	appName: get(state, '$getCurrentApp.name'),
	featureRules: get(state, '$getAppPlan.results.feature_rules', false),
});

const mapDispatchToProps = dispatch => ({
	fetchRules: () => dispatch(getRules()),
	updateOrder: ({ toBePromoted, toBeDemoted }) =>
		dispatch(reorderRules({ toBePromoted, toBeDemoted })),
});

export default connect(mapStateToProps, mapDispatchToProps)(QueryRules);
