import React from 'react';
import { Collapse, Alert, List, Icon, Button, Dropdown, Menu, Empty } from 'antd';
import { Link } from 'react-router-dom';
import { get } from 'lodash';
import { connect } from 'react-redux';
import { css } from 'emotion';
import { updateInsightStatus } from '../../batteries/modules/actions';

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
													this.handleClickContextMenu(
														e,
														get(insight, 'id'),
													);
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
													<Icon type="delete" />
													Delete
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
												<div>
													<Link to={get(recommendation, 'short_link')}>
														<Button className="report-btn" size="small">
															Go Report
														</Button>
													</Link>
												</div>
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
	isFetching: get(state, '$getAppAnalyticsInsights.isFetching'),
});

const mapDispatchToProps = (dispatch) => ({
	updateInsight: (data) => dispatch(updateInsightStatus(data)),
});

export default connect(mapStateToProps, mapDispatchToProps)(CollapsibleInsights);
