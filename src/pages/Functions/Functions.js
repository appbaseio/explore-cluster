import React, { Fragment, useEffect, useState } from 'react';
import { Button, Col, Divider, Icon, List, Result, Row, Switch, Tooltip } from 'antd';
import { connect } from 'react-redux';
import { string } from 'prop-types';
import get from 'lodash/get';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';

import { css } from 'emotion';
import { ReactiveBase } from '@appbaseio/reactivesearch';
import Loader from '../../components/Loader';
import Header from '../../components/Header';
import {
	getFunctions,
	getSingleFunction,
	reorderFunction,
	updateFunctions,
} from '../../batteries/modules/actions';
import CreateFunction from './CreateFunction';
import TriggerFunction from './TriggerFunction';
import InvokeFunctionModal from '../../components/InvokeFunctionModal';
import DeployFunctionModal from '../../components/DeployFunctionModal';
import DeleteFunction from './DeleteFunction';
import { getPrivateRegistry } from '../../batteries/modules/actions/registry';
import Logs from './Logs';
import Banner from '../../batteries/components/shared/UpgradePlan/Banner';
import Overlay from '../../components/Overlay';
import { getFunctionHealthCheck } from '../../utils';
import { deploymentCheck } from '../../components/DeployFunctionModal/helper';
import GlobalSearch from '../../components/GlobalSearch';
import { getURL } from '../../constants/config';

const validPlans = [
	'2019-production-2',
	'2019-production-3',
	'2019-production-4',
	'arc-enterprise',
	'hosted-arc-enterprise',
];

const IconText = ({ type, text }) => (
	<span>
		<Icon type={type} />
		{text && <span style={{ marginLeft: 8 }}>{text}</span>}
	</span>
);

function InvokeButton({ item }) {
	const [visible, setVisible] = useState(false);
	return (
		<>
			<Button onClick={() => setVisible(true)} style={{ marginLeft: 8 }} type="primary">
				<Icon type="experiment" />
				Invoke
			</Button>
			{visible && (
				<InvokeFunctionModal
					handleCancel={() => setVisible(false)}
					invocationCount={item.invocationCount}
					functionName={item.function.service}
					initialRequestData={item.extraRequestPayload}
					executeBefore={get(item, 'trigger.executeBefore')}
				/>
			)}
		</>
	);
}

function BeautifulDnd({ onDragStart, onDragEnd, render }) {
	return (
		<DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
			<section style={{ padding: 50 }}>
				<Droppable droppableId="LIST">{render}</Droppable>
			</section>
		</DragDropContext>
	);
}

function DndDraggable({ index, render, item }) {
	return (
		<Draggable draggableId={item.function.service} index={index}>
			{render}
		</Draggable>
	);
}

function UpdateFunction({ item }) {
	const [visible, setVisible] = useState(false);
	return (
		<>
			<Tooltip title="Edit Function">
				<Icon
					onClick={() => setVisible(true)}
					style={{ cursor: 'pointer' }}
					theme="twoTone"
					type="edit"
				/>
			</Tooltip>
			{visible && <DeployFunctionModal handleCancel={() => setVisible(false)} node={item} />}
		</>
	);
}

function Actions({ item, refetchFunction }) {
	return (
		<React.Fragment>
			<TriggerFunction
				isLoading={item.triggerUpdation}
				refetchFunction={refetchFunction}
				node={item}
			/>

			<InvokeButton item={item} />
		</React.Fragment>
	);
}

function VerticalDivider() {
	return (
		<Divider
			type="vertical"
			style={{
				margin: '0 12px',
			}}
		/>
	);
}

const tagStyle = css`
	background-color: rgb(238, 238, 238);
	color: rgb(51, 51, 51);
	font-size: 13px;
	font-weight: 400;
	border-radius: 3px;
	padding: 2px 8px;
	margin: 0px 12px;
	border-width: 1px;
	border-style: solid;
	border-color: rgb(204, 204, 204);
	border-image: initial;
	text-transform: capitalize;
	display: inline-block;
`;

const bannerDetails = {
	title: 'Functions',
	description: `Create "If this, then that" style functions to add your own custom search and security logic. Functions will be executed in the order in which they are listed. You can drag and drop a function to change the ordering sequence.`,
	buttonText: 'Read more',
	icon: 'pencil',
	href: 'https://docs.appbase.io/docs/search/Functions/',
};

function FunctionItem({ item, onChange, getFunction }) {
	const [isLogsOpen, setIsLogsOpen] = useState(false);
	const {
		function: func,
		enabled,
		isToggling,
		order,
		invocationCount,
		isDeleting,
		deploymentStatus,
	} = item;
	useEffect(() => {
		let interval = null;
		function handleDeploymentCheck() {
			deploymentCheck(getFunction, func.service, interval);
		}

		if (deploymentStatus === 'in_progress') {
			interval = setInterval(handleDeploymentCheck, 7000);
		}

		return function cleanUp() {
			if (interval) {
				clearInterval(interval);
			}
		};
	}, [deploymentStatus]);
	function toggleLogsState() {
		setIsLogsOpen(!isLogsOpen);
	}
	return (
		<List.Item.Meta
			style={{
				height: isLogsOpen ? 200 : 'auto',
			}}
			title={
				<React.Fragment>
					<b>{func.service}</b>
					{deploymentStatus === 'active' || deploymentStatus === 'disabled' ? (
						<>
							<span className={tagStyle}>{deploymentStatus}</span>
							<Tooltip title={`${enabled ? 'Disable' : 'Enable'} Function`}>
								<Switch
									style={{
										marginLeft: 8,
									}}
									loading={isToggling}
									onChange={onChange}
									checked={enabled}
								/>
							</Tooltip>
						</>
					) : (
						<span className={tagStyle}>
							{deploymentStatus === 'failed' ? (
								<Tooltip title="Please verify if you are using correct docker image with appropriate permissions">
									<span style={{ color: 'red' }}>Deployment Failed</span>
								</Tooltip>
							) : (
								'Deployment in progress'
							)}
						</span>
					)}
				</React.Fragment>
			}
			description={
				<>
					<IconText type="container" key="container" text={func.image} />
					{item.enabled && (
						<>
							<VerticalDivider />
							<Logs
								name={func.service}
								isOpen={isLogsOpen}
								toggleIsOpen={toggleLogsState}
							/>
						</>
					)}
					{item.enabled && (
						<>
							<VerticalDivider />
							<UpdateFunction item={item} getFunction={getFunction} />
						</>
					)}
					<VerticalDivider />
					<DeleteFunction name={func.service} loading={isDeleting} />
				</>
			}
		/>
	);
}

const listItemClass = css`
	border-radius: 3px;
	box-shadow: rgba(0, 0, 0, 0.05) 0px 3px 5px 0px;
	background-color: rgb(255, 255, 255);
	margin-bottom: 20px;
	padding: 20px 40px;
	position: relative;
	display: flex;
	justify-content: space-between;

	.showOnHover {
		display: none;
	}
	&:hover,
	&:focus {
		.showOnHover {
			display: initial;
		}
	}
`;

class FunctionsPage extends React.Component {
	state = {
		deployModal: false,
		checking: false,
		healthError: null,
		notFoundError: null,
	};

	async componentDidMount() {
		const { fetchFunctions, appName, fetchRegistries, tier } = this.props;
		try {
			if (validPlans.indexOf(tier) > -1) {
				this.setState({ checking: true });
				await getFunctionHealthCheck();
				this.setState({ checking: false });
				fetchFunctions(appName);
				fetchRegistries();
			}
		} catch (e) {
			console.log(e);
			if (e.status === 404) {
				this.setState({
					checking: false,
					notFoundError: e.message,
				});
			} else {
				this.setState({ checking: false, healthError: e.message });
			}
		}
	}

	refetchFunction = () => {
		const { fetchFunctions, appName } = this.props;
		fetchFunctions(appName);
	};

	handleEnable = (isChecked, node) => {
		if (!node) return;
		const { putFunctions } = this.props;
		putFunctions(node.function.service, {
			...node,
			enabled: isChecked,
			deploymentStatus: isChecked ? 'in_progress' : 'disabled',
		});
	};

	handleCancel = modalKey => {
		this.setState({ [modalKey]: false });
	};

	onDragStart = () => {
		// Add a little vibration if the browser supports it.
		// Add's a nice little physical feedback
		if (window.navigator.vibrate) {
			window.navigator.vibrate(100);
		}
	};

	onDragEnd = result => {
		if (!result.destination) return;
		if (result.destination.index === result.source.index) {
			return;
		}
		const functions = this.sortedDataSource;
		const { reorderFunctions } = this.props;
		const { source, destination } = result;
		const sourceOrder = functions[source.index].order;
		const updatedSource = {
			...functions[source.index],
			order: functions[destination.index].order,
		};
		const updatedDestination = { ...functions[destination.index], order: sourceOrder };
		reorderFunctions(updatedSource, updatedDestination);
	};

	render() {
		// TODO: remove this example demonstrating use of GlobalSearch
		return (
			<ReactiveBase
				url={getURL()}
				app="phones,movie-app"
				credentials={atob(sessionStorage.getItem('authToken'))}
			>
				<GlobalSearch indexes={['phones', 'movie-app']} />
			</ReactiveBase>
		);
		const { isLoading, functions, tier, getFunction } = this.props;
		const { deployModal, checking, healthError, notFoundError } = this.state;
		this.sortedDataSource = (functions || []).sort((a, b) => a.order - b.order);

		if (tier && validPlans.indexOf(tier) === -1) {
			return (
				<React.Fragment>
					<Banner {...bannerDetails} />
					<Overlay
						style={{
							maxWidth: '70%',
						}}
						src="https://www.dropbox.com/s/pdtq9rhf4jkg8kp/Screenshot%202020-01-17%2014.03.54.png?raw=1"
						alt="functions"
					/>
				</React.Fragment>
			);
		}

		if (isLoading || checking) {
			return <Loader />;
		}

		if (healthError) {
			return (
				<Result
					status="warning"
					title="500"
					subTitle={
						<div>
							Sorry, the Open Faas service is down.
							<br />
							Please check{' '}
							<a
								href="https://docs.appbase.io/docs/search/Functions"
								target="_blank"
								rel="noopener noreferrer"
							>
								docs
							</a>{' '}
							for further information, or you can reach out to us at{' '}
							<a href="mailto:support@appbase.io">support@appbase.io</a>
						</div>
					}
				/>
			);
		}

		if (notFoundError) {
			return (
				<React.Fragment>
					<Banner {...bannerDetails} />
					<Result
						status="404"
						title="Enable Functions"
						subTitle={
							<p>
								Functions are not enabled on this instance. Please check the link
								below to get started with functions.
								<br />
								For more support, you can reach out to us on info@appbase.io
							</p>
						}
						extra={
							<a
								target="_blank"
								rel="noopener noreferrer"
								href="https://docs.appbase.io/docs/search/Functions/#quick-start"
								className="ant-btn ant-btn-primary ant-btn-lg"
							>
								Enable Functions
							</a>
						}
					/>
				</React.Fragment>
			);
		}
		return (
			<Fragment>
				<Header compact>
					<Row type="flex" justify="space-between" align="middle" gutter={16}>
						<Col lg={18}>
							<h2>Functions</h2>
							<Row>
								<Col lg={18}>
									<p>
										Create &quot;If this, then tha&quot; style functions to add
										your own custom search and security logic. Functions will be
										executed in the order in which they are listed. You can drag
										and drop a function to change the ordering sequence.
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
							<CreateFunction />

							<Button
								onClick={() => {
									this.setState({ deployModal: true });
								}}
								type="primary"
								size="large"
								rel="noopener noreferrer"
							>
								<Icon type="deployment-unit" />
								Deploy Function
							</Button>
						</Col>
					</Row>
				</Header>
				<BeautifulDnd
					onDragStart={this.onDragStart}
					onDragEnd={this.onDragEnd}
					render={dropProvided => (
						<div ref={dropProvided.innerRef}>
							<List
								locale={{
									emptyText: (
										<div
											css={{
												display: 'flex',
												flexDirection: 'column',
												justifyContent: 'center',
												alignItems: 'center',
											}}
										>
											<h3>No functions Deployed Yet!</h3>
											<br />
											<Button
												onClick={() => {
													this.setState({ deployModal: true });
												}}
												type="primary"
												rel="noopener noreferrer"
												style={{
													width: 250,
												}}
											>
												<Icon type="deployment-unit" />
												Start Deploying Function
											</Button>
										</div>
									),
								}}
								rowKey={item => item.function.service}
								itemLayout="vertical"
								dataSource={this.sortedDataSource}
								renderItem={(item, index) => (
									<DndDraggable
										key={item.function.service}
										item={item}
										index={index}
										render={dragProvided => (
											<div
												className={listItemClass}
												ref={dragProvided.innerRef}
												{...dragProvided.draggableProps}
											>
												<Tooltip title="Drag to re-order the sequence of invoking the functions">
													<div
														style={{
															display: 'flex',
															padding: '18px 15px 15px 0',
															cursor: 'pointer',
														}}
													>
														<div
															style={{
																display: 'flex',
																flexDirection: 'column',
															}}
															{...dragProvided.dragHandleProps}
														>
															<Icon type="caret-up" />
															<Icon
																type="caret-down"
																style={{ marginTop: '-6px' }}
															/>
														</div>
														<div
															style={{
																fontWeight: 'bolder',
																marginLeft: 5,
															}}
														>
															{item.order}
														</div>
													</div>
												</Tooltip>
												<List.Item
													key={item.function.service}
													extra={
														item.deploymentStatus === 'active' &&
														item.enabled && (
															<Actions
																item={item}
																refetchFunction={
																	this.refetchFunction
																}
															/>
														)
													}
													style={{
														flex: 1,
													}}
												>
													<FunctionItem
														item={item}
														onChange={e => this.handleEnable(e, item)}
														getFunction={getFunction}
													/>
												</List.Item>
											</div>
										)}
									/>
								)}
							/>
							{dropProvided.placeholder}
						</div>
					)}
				/>
				{deployModal && (
					<DeployFunctionModal handleCancel={() => this.handleCancel('deployModal')} />
				)}
			</Fragment>
		);
	}
}

FunctionsPage.propTypes = {
	appName: string.isRequired,
};

const mapStateToProps = state => ({
	type: get(state, '$getAppPlan.results.billing_type'),
	user: get(state, 'user', { data: {} }),
	isLoading: get(state, '$getAppFunctions.isFetching'),
	functions: get(state, '$getAppFunctions.results'),
	tier: get(state, '$getAppPlan.results.tier'),
	featureFunctions: get(state, '$getAppPlan.results.feature_functions', false),
});

const mapDispatchToProps = dispatch => ({
	putFunctions: (appName, payload) => dispatch(updateFunctions(appName, payload)),
	fetchFunctions: appName => dispatch(getFunctions(appName)),
	reorderFunctions: (source, destination) => dispatch(reorderFunction(source, destination)),
	fetchRegistries: () => dispatch(getPrivateRegistry()),
	getFunction: appName => dispatch(getSingleFunction(appName)),
});

export default connect(mapStateToProps, mapDispatchToProps)(FunctionsPage);
