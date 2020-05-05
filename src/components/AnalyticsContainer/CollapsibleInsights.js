import React from 'react';
import { Collapse, Alert, List, Icon, Button, Dropdown, Menu, Empty, Popconfirm } from 'antd';
import { Link, withRouter } from 'react-router-dom';
import { get } from 'lodash';
import { connect } from 'react-redux';
import { css } from 'emotion';
import { updateInsightStatus } from '../../batteries/modules/actions';
import { IndexSwitcher } from '../IndexSwitcher';

const { Panel } = Collapse;

const collapseStyles = css`
	.ant-collapse {
		border-radius: 0;
	}

	.panel-header h6 {
		color: rgba(0, 0, 0, 0.85);
		font-weight: 600;
		margin: 0;
		font-size: 15px;
	}

	.panel-header p {
		color: rgba(0, 0, 0, 0.45);
		font-size: 14px;
		line-height: 18px;
		margin: 0;
		margin-top: 5px;
	}

	.recommendation-title {
		color: rgba(0, 0, 0, 0.65);
		font-weight: 600;
		margin: 0;
		font-size: 14px;
	}

	.recommendation-link {
		width: 100%;
		transition: all ease-in 0.2s;
	}

	.title,
	.list-title {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.title .icon,
	.list-title .icon {
		transform: translateX(-10px);
		opacity: 0;
		transition: all 0.2s ease-out;
	}

	.report-btn {
		font-size: 13px;
		margin-top: 5px;
	}

	.panel:hover {
		.title .icon {
			transform: translateX(0px);
			opacity: 1;
		}
	}

	.recommendation-link:hover {
		.ant-list-item-meta-title {
			color: #1890ff;
		}

		.list-title .icon {
			transform: translateX(0px);
			opacity: 1;
		}
	}
`;

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
			// we need to put request to update the status
			updateInsight({
				id: openKey,
				from: type,
				to: 'read',
			});
		}

		this.setState({
			openKey: key === openKey ? null : key,
		});
	};

	handleClickContextMenu = (e, id) => {
		const { openKey } = this.state;
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
			from: type,
			to: updateStatusTo,
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
					filteredApps={apps}
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
									<h6>{get(insight, 'insight.title')}</h6>
									<Dropdown
										trigger={['click']}
										overlay={
											<Menu
												onClick={(e) => {
													e.domEvent.stopPropagation();
													if (e.key !== 'delete') {
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
									<p>{get(insight, 'insight.description')}</p>
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
												<span>{get(recommendation, 'title', '')}</span>
											</div>
										}
										description={
											<React.Fragment>
												{get(recommendation, 'description')}
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

const mapStateToProps = (state) => ({
	isOpen: get(state, '$getInsightSidebar.isOpen', false),
	appName: get(state, '$getCurrentApp.name'),
	apps: Object.keys(get(state, 'apps.data'), {}).filter((app) => !app.startsWith('.')),
	isFetching: get(state, '$getAppAnalyticsInsights.isFetching'),
});

const mapDispatchToProps = (dispatch) => ({
	updateInsight: (data) => dispatch(updateInsightStatus(data)),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(CollapsibleInsights));
