import React, { Fragment, useState } from 'react';
import {
 Button, Card, Col, Divider, Icon, List, Row, Switch, Tooltip,
} from 'antd';
import { connect } from 'react-redux';
import { string } from 'prop-types';
import get from 'lodash/get';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';

import Loader from '../../components/Loader';
import Header from '../../components/Header';
import { getFunctions, reorderFunction, updateFunctions } from '../../batteries/modules/actions';
import CreateFunction from './CreateFunction';
import TriggerFunction from './TriggerFunction';
import InvokeFunctionModal from '../../components/InvokeFunctionModal';
import DeployFunctionModal from '../../components/DeployFunctionModal';
import DeleteFunction from './DeleteFunction';

const IconText = ({ type, text }) => (
	<span>
		<Icon type={type} style={{ marginRight: 8 }} />
		{text}
	</span>
);

function InvokeButton({ item }) {
	const [visible, setVisible] = useState(false);
	return (
		<>
			<Button onClick={() => setVisible(true)} style={{ marginLeft: 8 }} type="primary">
				<Icon type="experiment" />
				Invoke Function
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

class FunctionsPage extends React.Component {
	state = { invokeModal: false, deployModal: false };

	componentDidMount() {
		const { fetchFunctions, appName } = this.props;
		fetchFunctions(appName);
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
	}

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
		const { isLoading, functions } = this.props;
		const { deployModal } = this.state;
		this.sortedDataSource = (functions || []).sort((a, b) => a.order - b.order);

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
				<DragDropContext onDragStart={this.onDragStart} onDragEnd={this.onDragEnd}>
					<section style={{ padding: 50 }}>
						<Card bordered title="All Functions">
							<Droppable droppableId="LIST">
								{dropProvided => (
									<div ref={dropProvided.innerRef}>
										<List
											rowKey={item => item.function.service}
											itemLayout="vertical"
											dataSource={this.sortedDataSource}
											renderItem={(item, index) => (
												<Draggable
													key={item.function.service}
													draggableId={item.function.service}
													index={index}
												>
													{(dragProvided) => {
														console.log({ dragProvided });
														return (
															<div
																ref={dragProvided.innerRef}
																{...dragProvided.draggableProps}
																{...dragProvided.dragHandleProps}
															>
																<List.Item
																	key={item.function.service}
																	extra={(
                  <React.Fragment>
																			<TriggerFunction
																				isLoading={
																					item.triggerUpdation
																				}
																				refetchFunction={
																					this
																						.refetchFunction
																				}
																				node={item}
																			/>

																			<InvokeButton
																				item={item}
																			/>
																			<DeleteFunction
																				name={
																					item.function
																						.service
																				}
																				loading={
																					item.isDeleting
																				}
																			/>
																		</React.Fragment>
                )}
																>
																	<List.Item.Meta
																		title={(
                   <React.Fragment>
																				{
																					item.function
																						.service
																				}
																				<Tooltip
																					title={`${
																						item.enabled
																							? 'Disable'
																							: 'Enable'
																					} Function`}
																				>
																					<Switch
																						style={{
																							marginLeft: 8,
																						}}
																						loading={
																							item.isToggling
																						}
																						onChange={e => this.handleEnable(
																								e,
																								item,
																							)
																						}
																						checked={
																							item.enabled
																						}
																					/>
																				</Tooltip>
																			</React.Fragment>
                 )}
																		description={[
																			<IconText
																				type="container"
																				key="container"
																				text={
																					item.function
																						.image
																				}
																			/>,
																			<Divider
																				type="vertical"
																				style={{
																					margin:
																						'0 16px',
																				}}
																			/>,
																			<IconText
																				text={
																					item.function
																						.invocation_count
																				}
																				type="api"
																				key="api"
																			/>,
																		]}
																	/>
																</List.Item>
															</div>
														);
													}}
												</Draggable>
											)}
										/>
									</div>
								)}
							</Droppable>
						</Card>
					</section>
				</DragDropContext>
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
});

const mapDispatchToProps = dispatch => ({
	putFunctions: (appName, payload) => dispatch(updateFunctions(appName, payload)),
	fetchFunctions: appName => dispatch(getFunctions(appName)),
	reorderFunctions: (source, destination) => dispatch(reorderFunction(source, destination)),
});

export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(FunctionsPage);
