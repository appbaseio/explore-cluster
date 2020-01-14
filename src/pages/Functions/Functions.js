import React, { Fragment, useState } from 'react';
import {
 Button, Card, Col, Collapse, Divider, Icon, List, Row, Switch, Tooltip,
} from 'antd';
import { connect } from 'react-redux';
import { string } from 'prop-types';
import get from 'lodash/get';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';

import { css } from 'emotion';
import Loader from '../../components/Loader';
import Header from '../../components/Header';
import { getFunctions, reorderFunction, updateFunctions } from '../../batteries/modules/actions';
import CreateFunction from './CreateFunction';
import TriggerFunction from './TriggerFunction';
import InvokeFunctionModal from '../../components/InvokeFunctionModal';
import DeployFunctionModal from '../../components/DeployFunctionModal';
import DeleteFunction from './DeleteFunction';
import { getPrivateRegistry } from '../../batteries/modules/actions/registry';
import Logs from './Logs';
import { isValidPlan } from '../../batteries/utils';
import Banner from '../../batteries/components/shared/UpgradePlan/Banner';
import Overlay from '../../components/Overlay';

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
				/>
			)}
		</>
	);
}

function BeautifulDnd(props: {
	onDragStart: () => void,
	onDragEnd: result => undefined,
	render: (dropProvided: any) => *,
}) {
	return (
		<DragDropContext onDragStart={props.onDragStart} onDragEnd={props.onDragEnd}>
			<section style={{ padding: 50 }}>
				<Card bordered title="All Functions">
					<Droppable droppableId="LIST">{props.render}</Droppable>
				</Card>
			</section>
		</DragDropContext>
	);
}

function DndDraggable(props: { item: T, index: number, render: (dragProvided: any) => * }) {
	return (
		<Draggable draggableId={props.item.function.service} index={props.index}>
			{props.render}
		</Draggable>
	);
}

function UpdateFunction({ item }) {
	const [visible, setVisible] = useState(false);
	return (
		<>
			<Icon
				onClick={() => setVisible(true)}
				style={{ cursor: 'pointer' }}
				theme="twoTone"
				type="edit"
			/>
			{visible && <DeployFunctionModal handleCancel={() => setVisible(false)} node={item} />}
		</>
	);
}

function Actions(props: { item: T, refetchFunction: () => void }) {
	return (
		<React.Fragment>
			<TriggerFunction
				isLoading={props.item.triggerUpdation}
				refetchFunction={props.refetchFunction}
				node={props.item}
			/>

			<InvokeButton item={props.item} />
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
`;

const bannerDetails = {
	title: 'Functions',
	description: 'GUI to manage functions for query suggestions.',
	buttonText: 'Read more',
	icon: 'pencil',
};

function Log({ name, style }) {
	return (
		<Collapse style={{ marginTop: 10 }} destroyInactivePanel>
			<Collapse.Panel key="show-logs" header="Show Logs">
				<Logs style={style} name={name} />
			</Collapse.Panel>
		</Collapse>
	);
}

function FunctionItem(props: { item: T, onChange: (e?: any) => undefined }) {
	const {
 function: func, enabled, availableReplicas, isToggling, order,
} = props.item;
	return (
		<List.Item.Meta
			title={(
    <React.Fragment>
					{func.service}
					{availableReplicas > 0 ? (
						<Tooltip title={`${enabled ? 'Disable' : 'Enable'} Function`}>
							<Switch
								style={{
									marginLeft: 8,
								}}
								loading={isToggling}
								onChange={props.onChange}
								checked={enabled}
							/>
						</Tooltip>
					) : (
						<span className={tagStyle}>
							{availableReplicas === 0 ? 'failed' : 'Deployment in progress'}
						</span>
					)}
					<Tooltip title="Drag to re-order the sequence of invoking the functions">
						<span className={tagStyle}>Order: {order}</span>
					</Tooltip>
				</React.Fragment>
  )}
			description={(
    <>
					<IconText type="container" key="container" text={props.item.function.image} />
					<VerticalDivider />
					<IconText
						text={(props.item.invocationCount || '').toString()}
						type="api"
						key="api"
					/>
					{props.item.availableReplicas > 0 && (
						<div className="showOnHover">
							<VerticalDivider />
							<UpdateFunction item={props.item} />
							<VerticalDivider />
							<DeleteFunction
								name={props.item.function.service}
								loading={props.item.isDeleting}
							/>
						</div>
					)}
				</>
  )}
		/>
	);
}

const listClass = css`
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
	state = { invokeModal: false, deployModal: false };

	componentDidMount() {
		const { fetchFunctions, appName, fetchRegistries } = this.props;
		fetchFunctions(appName);
		fetchRegistries();
	}

	getListStyle(index, dragSnapshot) {
		return {
			padding: 10,
			backgroundColor: dragSnapshot.isDragging ? '#91d5ff' : 'initial',
			border: dragSnapshot.isDragging ? '1px solid #40a9ff' : 'initial',
			borderBottom: index !== this.sortedDataSource.length - 1 ? '1px solid #e8e8e8' : null,
		};
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
		});
	};

	handleCancel = (modalKey) => {
		this.setState({ [modalKey]: false });
	};

	onDragStart = () => {
		// Add a little vibration if the browser supports it.
		// Add's a nice little physical feedback
		if (window.navigator.vibrate) {
			window.navigator.vibrate(100);
		}
	};

	onDragEnd = (result) => {
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
		const {
 isLoading, functions, tier, featureFunctions,
} = this.props;
		const { deployModal } = this.state;
		this.sortedDataSource = (functions || []).sort((a, b) => a.order - b.order);

		if (!isValidPlan(tier, featureFunctions)) {
			return (
				<React.Fragment>
					<Banner {...bannerDetails} />
					<Overlay
						style={{
							maxWidth: '70%',
						}}
						src="https://i.imgur.com/JvTEWo5.png"
						alt="functions"
					/>
				</React.Fragment>
			);
		}

		if (isLoading) {
			return <Loader />;
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
										Create &quot;If this, then that&quot; style functions to add
										your own custom search and security logic.
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
								rowKey={item => item.function.service}
								itemLayout="vertical"
								dataSource={this.sortedDataSource}
								renderItem={(item, index) => (
									<DndDraggable
										key={item.function.service}
										item={item}
										index={index}
										render={(dragProvided, dragSnapshot) => (
											<div
												ref={dragProvided.innerRef}
												{...dragProvided.draggableProps}
												{...dragProvided.dragHandleProps}
											>
												<List.Item
													className={listClass}
													style={this.getListStyle(index, dragSnapshot)}
													key={item.function.service}
													extra={
														item.availableReplicas > 0 && (
															<Actions
																item={item}
																refetchFunction={
																	this.refetchFunction
																}
															/>
														)
													}
												>
													<FunctionItem
														item={item}
														onChange={e => this.handleEnable(e, item)}
													/>
													<Log
														name={item.function.service}
														style={{
															width:
																item.availableReplicas > 0
																	? '45vw'
																	: '100%',
														}}
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
});

export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(FunctionsPage);
