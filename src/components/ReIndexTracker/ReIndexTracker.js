import React from 'react';
import { connect } from 'react-redux';
import PropTypes, { string } from 'prop-types';
import get from 'lodash/get';
import isEqual from 'lodash/isEqual';
import { Icon, Alert } from 'antd';

import { setReIndexingTasks } from '../../batteries/modules/actions/settings';
import { getURL } from '../../constants/config';
import { getAuthToken } from '../../utils';

const getTaskStatus = (taskDetails) => {
	const indexName = get(taskDetails, 'task.description')
		.split(' ')
		.filter((i) => i.includes('_reindexed_'))[0];
	const appName = indexName.split('_reindexed_')[0].replace('[', '');
	const failures = get(taskDetails, 'response.failures', []);
	const taskId = `${get(taskDetails, 'task.node')}:${get(taskDetails, 'task.id')}`;
	const response = {
		taskId,
		appName,
		completed: taskDetails.completed,
		total: get(taskDetails, 'task.status.total'),
		indexed: get(taskDetails, 'task.status.created'),
		failures,
	};
	return response;
};

class ReIndexTracker extends React.Component {
	interval = null;

	state = {
		tasks: [],
	};

	componentDidMount() {
		this.fetchTaskStatus();
	}

	componentDidUpdate(prevProps) {
		const { reIndexingTasks } = this.props;
		if (!isEqual(reIndexingTasks, get(prevProps, 'reIndexingTasks'))) {
			if (reIndexingTasks.length) {
				this.fetchTaskStatus();
				this.interval = setInterval(() => {
					this.fetchTaskStatus();
				}, 2500);
			} else if (this.interval) {
				clearInterval(this.interval);
				this.interval = null;
			}
		}
	}

	componentWillUnmount() {
		if (this.interval) {
			clearInterval(this.interval);
			this.interval = null;
		}
	}

	fetchTaskStatus = () => {
		const { reIndexingTasks, updateReIndexingTasks } = this.props;
		if (reIndexingTasks.length) {
			Promise.all(
				reIndexingTasks.map(async (task) => {
					const res = await fetch(`${getURL()}/_tasks/${task}`, {
						headers: {
							Authorization: `Basic ${getAuthToken()}`,
						},
					});

					return res.json();
				}),
			)
				.then((allRes) => {
					const taskData = allRes.reduce(
						(agg, task) => [...agg, getTaskStatus(task)],
						[],
					);

					this.setState({
						tasks: taskData,
					});

					updateReIndexingTasks(
						taskData.filter((task) => !task.completed).map((task) => task.taskId),
					);
				})
				.catch((err) => {
					console.error(`Error getting task status`, err);
				});
		}
	};

	onClose = (index) => {
		const { tasks } = this.state;

		this.setState({
			tasks: [...tasks.splice(0, index), ...tasks.splice(index + 1, tasks.length)],
		});
	};

	render() {
		const { collapsed, appName } = this.props;
		const { tasks } = this.state;
		return tasks.length ? (
			<div
				style={{
					position: 'fixed',
					top: 60,
					left: collapsed ? 80 : 260,
					right: 0,
					zIndex: 100,
				}}
			>
				{tasks.map((task, index) => (
					<div key={task.taskId}>
						{task.appName === appName &&
							(!task.completed ? (
								<Alert
									showIcon
									type="warning"
									css={{
										marginBottom: 5,
									}}
									message={
										<div
											style={{
												display: 'flex',
												justifyContent: 'space-between',
												flexWrap: 'nowrap',
											}}
										>
											<div>
												Re-indexing for <b>{task.appName}</b> is in
												progress,{' '}
												<b>
													{task.indexed}/{task.total}
												</b>{' '}
												documents have been indexed. Once the documents are
												re-indexed, it may take a while for the shards to be
												reassigned. Changes you make will be saved but
												won&apos;t be deployed till the re-indexing process
												is completed.
											</div>
											<Icon
												type="close"
												onClick={() => this.onClose(index)}
												style={{ marginTop: 5 }}
											/>
										</div>
									}
								/>
							) : (
								<>
									{task.failures.length ? (
										<>
											{task.failures.map((failure) => (
												<Alert
													showIcon
													type="error"
													key={get(failure, 'cause.reason')}
													css={{
														marginBottom: 5,
													}}
													message={
														<div
															style={{
																display: 'flex',
																justifyContent: 'space-between',
																flexWrap: 'nowrap',
															}}
														>
															<div>
																Re-indexing failed for{' '}
																{task.appName}.{' '}
																{get(failure, 'cause.reason')}
															</div>
															<Icon
																type="close"
																onClick={() => this.onClose(index)}
																style={{ marginTop: 5 }}
															/>
														</div>
													}
												/>
											))}
										</>
									) : (
										<Alert
											showIcon
											type="success"
											css={{
												marginBottom: 5,
											}}
											message={
												<div
													style={{
														display: 'flex',
														justifyContent: 'space-between',
														flexWrap: 'nowrap',
													}}
												>
													<div>
														Re-indexing has successfully completed for{' '}
														{task.appName}. You may need to reload
														mappings to see the new changes reflected.
													</div>
													<Icon
														type="close"
														onClick={() => this.onClose(index)}
														style={{ marginTop: 5 }}
													/>
												</div>
											}
										/>
									)}
								</>
							))}
					</div>
				))}
			</div>
		) : null;
	}
}

ReIndexTracker.propTypes = {
	reIndexingTasks: PropTypes.arrayOf(string).isRequired,
	updateReIndexingTasks: PropTypes.func.isRequired,
	collapsed: PropTypes.bool.isRequired,
	appName: PropTypes.string.isRequired,
};

const mapStateToProps = (state) => ({
	reIndexingTasks: get(state, '$reIndexingTasks'),
	collapsed: get(state, 'sideBarCollapsed'),
	appName: get(state, '$getCurrentApp.name', 'default'),
});

const mapDispatchToProps = (dispatch) => ({
	updateReIndexingTasks: (data) => dispatch(setReIndexingTasks(data)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ReIndexTracker);
