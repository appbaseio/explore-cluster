import React from 'react';
import { Collapse, Alert, List, Icon, Button, Dropdown, Menu, Empty, Popconfirm } from 'antd';
import { Link, withRouter } from 'react-router-dom';
import { get } from 'lodash';
import moment from 'moment';
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

	renderRedirectLink = ({ title, link, showAsLink = false }) => {
		const { appName, history, apps } = this.props;

		if (!link) {
			return null;
		}

		const linkWithSwitcher = ['languages', 'search', 'synonyms', 'results', 'index-settings'];
		const hasIndexSwitcher = linkWithSwitcher.find((item) => link.endsWith(`/${item}`));
		let queryParam = '';

		if (showAsLink) {
			const startDate = moment().subtract(1, 'months').startOf('month').format('YYYY/MM/DD');
			const endDate = moment().subtract(1, 'months').endOf('month').format('YYYY/MM/DD');
			queryParam = `?from=${startDate}&to=${endDate}`;
		}

		if (hasIndexSwitcher) {
			return (
				<IndexSwitcher
					filteredApps={Object.keys(apps || {}).filter((app) => !app.startsWith('.'))}
					history={history}
					renderItem={(popConfirmProps) => {
						return (
							<div {...popConfirmProps}>
								{showAsLink ? (
									<div
										style={{
											cursor: 'pointer',
											color: '#1890ff',
											marginBottom: 8,
										}}
									>
										Go to Report
									</div>
								) : (
									<Button style={{ marginTop: 5 }} size="small">
										{title}
									</Button>
								)}
							</div>
						);
					}}
					onSelect={(index) => {
						history.push(`/${link.replace(':index', index)}${queryParam}`);
					}}
				/>
			);
		}

		if (window.location.pathname.startsWith('/cluster')) {
			const subPath = link.split('/').pop();
			return (
				<Link
					style={showAsLink ? { marginBottom: 8, display: 'block' } : {}}
					to={`/cluster/${subPath}${queryParam}`}
				>
					{showAsLink ? (
						'Go to Report'
					) : (
						<Button style={{ marginTop: 5 }} size="small">
							{title}
						</Button>
					)}
				</Link>
			);
		}

		if (window.location.pathname.startsWith('/app')) {
			return (
				<Link
					style={showAsLink ? { marginBottom: 8, display: 'block' } : {}}
					to={`/${link.replace(':index', appName)}${queryParam}`}
				>
					{showAsLink ? (
						'Go to Report'
					) : (
						<Button style={{ marginTop: 5 }} size="small">
							{title}
						</Button>
					)}
				</Link>
			);
		}

		return null;
	};

	render() {
		const {
			insights,
			type,
			defaultOpen,
			noDataText,
			noDataPresent,
			insightUpdates,
		} = this.props;

		if (insights.length === 0) {
			return <Empty description={noDataPresent ? noDataText : 'No Data'} />;
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
						id={get(insight, 'id')}
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
														title="Are you sure to delete this insight?"
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
						className={`panel ${
							get(insightUpdates, `${get(insight, 'id')}.inProgress`, false)
								? 'in-progress'
								: ''
						}`}
						key={get(insight, 'id')}
					>
						{this.renderRedirectLink({
							link: get(insight, 'insight.short_link'),
							showAsLink: true,
						})}
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
														{this.renderRedirectLink({
															link: get(recommendation, 'short_link'),
															title: `Set ${get(
																recommendation,
																'title',
																'',
															)}`,
														})}
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
	appName: '',
	noDataText: '',
	insights: [],
	noDataPresent: false,
	insightUpdates: null,
};

CollapsibleInsights.propTypes = {
	insights: PropTypes.array,
	appName: PropTypes.string,
	apps: PropTypes.object,
	isFetching: PropTypes.bool.isRequired,
	type: PropTypes.string.isRequired,
	history: PropTypes.object.isRequired,
	noDataText: PropTypes.string,
	defaultOpen: PropTypes.string,
	updateInsight: PropTypes.func.isRequired,
	noDataPresent: PropTypes.bool,
	insightUpdates: PropTypes.object,
};

const mapStateToProps = (state) => ({
	isOpen: get(state, '$getAppAnalyticsInsights.isOpen', false),
	appName: get(state, '$getCurrentApp.name', 'default'),
	apps: get(state, 'apps.data', {}),
	isFetching: get(state, '$getAppAnalyticsInsights.isFetching'),
	insightUpdates: get(state, `$getAppAnalyticsInsights.updates`),
});

const mapDispatchToProps = (dispatch) => ({
	updateInsight: (data) => dispatch(updateInsightStatus(data)),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(CollapsibleInsights));
