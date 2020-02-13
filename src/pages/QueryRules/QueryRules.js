import React, { Component, Fragment } from 'react';
import { Col, Row, Layout, Button, Icon, message } from 'antd';
import { css } from 'emotion';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { get } from 'lodash';

import QueryCard from './components/QueryCard';
import { getRules, reorderRules } from '../../batteries/modules/actions';
import Loader from '../../components/Loader';
import DNDWrapper from '../../components/DNDWrapper';

const { Header } = Layout;

const container = css`
	padding: 50px;
`;

class QueryRules extends Component {
	componentDidMount() {
		const { fetchRules, rules } = this.props;

		if (!rules) {
			fetchRules();
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
		const { rules, isLoading } = this.props;

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
										<p>Create &quot;If this, then that&quot; rules</p>
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
								>
									Read More
								</Button>
							</Col>
						</Row>
					</div>
				</Header>
				<div className={container}>
					<DNDWrapper
						onDragEnd={this.onDragEnd}
						items={rules && rules.sort((a, b) => a.order - b.order)}
						dropId="RULES"
						indexKey="order"
						idKey="id"
					>
						{({ item, dragProvided, dragSnapshot }) => (
							<QueryCard
								dragProvided={dragProvided}
								dragSnapshot={dragSnapshot}
								rule={item}
							/>
						)}
					</DNDWrapper>
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
});

const mapDispatchToProps = dispatch => ({
	fetchRules: () => dispatch(getRules()),
	updateOrder: ({ toBePromoted, toBeDemoted }) =>
		dispatch(reorderRules({ toBePromoted, toBeDemoted })),
});

export default connect(mapStateToProps, mapDispatchToProps)(QueryRules);
