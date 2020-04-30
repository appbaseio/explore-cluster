import React from 'react';
import { Collapse, Alert, List, Icon, Button, Dropdown, Menu } from 'antd';
import { Link } from 'react-router-dom';
import { get } from 'lodash';
import { css } from 'emotion';

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

const CollapsibleInsights = ({ insights }) => (
	<Collapse className={collapseStyles} bordered accordion>
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
										}}
									>
										<Menu.Item key="1">
											<Icon type="save" />
											Save Insight
										</Menu.Item>
										<Menu.Item key="2">
											<Icon type="check" />
											Mark as Read
										</Menu.Item>
										<Menu.Item key="2">
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
				key={get(insight, 'insight.title')}
			>
				<h6 className="recommendation-title">Recommendations</h6>
				<List
					itemLayout="horizontal"
					locale={{
						emptyText: (
							<Alert message="No Recommendations Found" type="warning" showIcon />
						),
					}}
					dataSource={get(insight, 'insight.recommendations', [])}
					renderItem={(recommendation) => (
						<List.Item>
							<Link
								className="recommendation-link"
								to={get(recommendation, 'short_link')}
							>
								<List.Item.Meta
									title={
										<div className="list-title">
											<span>{get(recommendation, 'title', '')}</span>
											<Icon className="icon" type="arrow-right" />
										</div>
									}
									description={get(recommendation, 'description')}
								/>
							</Link>
						</List.Item>
					)}
				/>
			</Panel>
		))}
	</Collapse>
);

export default CollapsibleInsights;
