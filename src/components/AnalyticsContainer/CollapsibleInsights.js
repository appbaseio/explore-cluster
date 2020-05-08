import React from 'react';
import { Collapse, Alert, List, Icon, Button, Dropdown, Menu, Empty, Popconfirm } from 'antd';
import { Link, withRouter } from 'react-router-dom';
import { get } from 'lodash';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { updateInsightStatus } from '../../batteries/modules/actions';

import { collapseStyles } from './styles';
import IndexSwitcher from '../IndexSwitcher';

const { Panel } = Collapse;

class CollapsibleInsights extends React.Component {
	state = {
		openKey: '',
	};

	handleCollapseKey = (key) => {
		const { openKey } = this.state;
		const { updateInsight, type } = this.props;

		if (type !== 'insights') {
			return;
		}

		if (openKey) {
			updateInsight({
				id: openKey,
				currentStatus: type,
				nextStatus: 'read',
			});
		}

		this.setState({
			openKey: key === openKey ? null : key,
		});
	};

	handleClickContextMenu = (e, id) => {
		const { updateInsight, type } = this.props;
		let updateStatusTo = '';
		switch (e.key) {
			case 'delete':
				updateStatusTo = 'deleted';
				break;
			case 'undo':
				updateStatusTo = 'read';
				break;
			case 'saved':
				updateStatusTo = 'saved';
				break;
			default: {
				updateStatusTo = 'read';
				break;
			}
		}

		updateInsight({
			currentStatus: type,
			nextStatus: updateStatusTo,
			id,
		});
	};

	renderRecommendationLink = (link) => {
		const { appName, history, apps } = this.props;
		if (window.location.pathname.startsWith('/app')) {
			return (
				<Link to={`/${link.replace(':index', appName)}`}>
					<Button style={{ marginTop: 5 }} size="small">
						Go to Report
					</Button>
				</Link>
			);
		}

		if (window.location.pathname.startsWith('/cluster')) {
			return (
				<IndexSwitcher
					filteredApps={Object.keys(apps).filter((app) => !app.startsWith('.'))}
					history={history}
					renderItem={(popConfirmProps) => {
						return (
							<div {...popConfirmProps}>
								<Button style={{ marginTop: 5 }} size="small">
									Go to Report
								</Button>
							</div>
						);
					}}
					onSelect={(index) => {
						history.push(`/${link.replace(':index', index)}`);
					}}
				/>
			);
		}
		return null;
	};

	render() {
		const { insights, type, defaultOpen } = this.props;

		if (insights.length === 0) {
			return <Empty />;
		}

		return (
			<Collapse
				onChange={this.handleCollapseKey}
				className={collapseStyles}
				bordered
				defaultActiveKey={defaultOpen}
				accordion
			>
				{insights.map((insight) => (
					<Panel
						showArrow={false}
						header={
							<div className="panel-header">
								<div className="title">
									<div
										className="insight-title"
										dangerouslySetInnerHTML={{
											__html: get(insight, 'insight.title'),
										}}
									/>
									<Dropdown
										trigger={['click']}
										overlay={
											<Menu
												onClick={(e) => {
													/*
														To prevent bubbling of click event for Context Menu to work.
													*/
													e.domEvent.stopPropagation();
													if (e.key !== 'delete') {
														/*
															Delete requires a PopConfirm component for
															confirming the action so we dont want to send
															API as soon as user click delete item.
														*/
														this.handleClickContextMenu(
															e,
															get(insight, 'id'),
														);
													}
												}}
											>
												{type === 'saved' ? null : (
													<Menu.Item key="saved">
														<Icon type="save" />
														Save Insight
													</Menu.Item>
												)}
												{type === 'saved' ? (
													<Menu.Item key="undo">
														<Icon type="save" />
														Remove from Saved
													</Menu.Item>
												) : null}
												{type === 'insights' ? (
													<Menu.Item key="read">
														<Icon type="read" />
														Mark as Read
													</Menu.Item>
												) : null}

												<Menu.Item key="delete">
													<Popconfirm
														title="Are you sure delete this insight?"
														okText="Yes"
														cancelText="No"
														onConfirm={() =>
															this.handleClickContextMenu(
																{ key: 'delete' },
																get(insight, 'id'),
															)
														}
													>
														<Icon type="delete" />
														Delete
													</Popconfirm>
												</Menu.Item>
											</Menu>
										}
									>
										<Button
											onClick={(e) => {
												e.stopPropagation();
											}}
											shape="circle"
											size="small"
											icon="more"
											className="icon"
										/>
									</Dropdown>
								</div>
								{get(insight, 'insight.description') ? (
									<div
										className="insight-description"
										dangerouslySetInnerHTML={{
											__html: get(insight, 'insight.description'),
										}}
									/>
								) : null}
							</div>
						}
						className="panel"
						key={get(insight, 'id')}
					>
						<h6 className="recommendation-title">Recommendations</h6>
						<List
							itemLayout="horizontal"
							locale={{
								emptyText: (
									<Alert
										message="No Recommendations Found"
										type="warning"
										showIcon
									/>
								),
							}}
							dataSource={get(insight, 'insight.recommendations', [])}
							renderItem={(recommendation) => (
								<List.Item className="recommendation-link">
									<List.Item.Meta
										title={
											<div className="list-title">
												<span
													dangerouslySetInnerHTML={{
														__html: get(recommendation, 'title', ''),
													}}
												/>
											</div>
										}
										description={
											<React.Fragment>
												<span
													dangerouslySetInnerHTML={{
														__html: get(
															recommendation,
															'description',
															'',
														),
													}}
												/>
												{get(recommendation, 'short_link') ? (
													<div>
														{this.renderRecommendationLink(
															get(recommendation, 'short_link'),
														)}
													</div>
												) : null}
											</React.Fragment>
										}
									/>
								</List.Item>
							)}
						/>
					</Panel>
				))}
			</Collapse>
		);
	}
}

CollapsibleInsights.defaultProps = {
	apps: {},
	defaultOpen: '',
};

CollapsibleInsights.propTypes = {
	insights: PropTypes.array.isRequired,
	appName: PropTypes.string.isRequired,
	apps: PropTypes.object,
	isFetching: PropTypes.bool.isRequired,
	type: PropTypes.string.isRequired,
	history: PropTypes.object.isRequired,
	defaultOpen: PropTypes.string,
	updateInsight: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
	isOpen: get(state, '$getAppAnalyticsInsights.isOpen', false),
	appName: get(state, '$getCurrentApp.name'),
	apps: get(state, 'apps.data', {}),
	isFetching: get(state, '$getAppAnalyticsInsights.isFetching'),
});

const mapDispatchToProps = (dispatch) => ({
	updateInsight: (data) => dispatch(updateInsightStatus(data)),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(CollapsibleInsights));
