import React from 'react';
import { connect } from 'react-redux';
import PropTypes, { string } from 'prop-types';
import get from 'lodash/get';
import isEqual from 'lodash/isEqual';
import { notification } from 'antd';

import { setReIndexingTasks } from '../../batteries/modules/actions/settings';
import { getURL } from '../../constants/config';
import { getAuthToken } from '../../utils';

class ReIndexTracker extends React.Component {
	interval = null;

	componentDidMount() {
		this.fetchTaskStatus();
	}

	componentDidUpdate(prevProps) {
		const { reIndexingTasks } = this.props;
		if (!isEqual(reIndexingTasks, get(prevProps, 'reIndexingTasks'))) {
			if (reIndexingTasks.length) {
				this.interval = setInterval(() => {
					this.fetchTaskStatus();
				}, 5000);
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
					const completedTasks = allRes.filter((task) => task.completed);

					completedTasks.forEach((task) => {
						if (get(task, 'response.failures', []).length) {
							get(task, 'response.failures', []).forEach((fail) => {
								notification.error({
									message: `Re-indexing failed`,
									description: fail.cause.reason,
								});
							});
						}
					});

					updateReIndexingTasks(
						allRes
							.filter((task) => !task.completed)
							.map((task) => `${get(task, 'task.node')}:${get(task, 'task.id')}`),
					);
				})
				.catch((err) => {
					console.error(`Error getting task status`, err);
				});
		}
	};

	render() {
		return <div />;
	}
}

ReIndexTracker.propTypes = {
	reIndexingTasks: PropTypes.arrayOf(string).isRequired,
	updateReIndexingTasks: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
	reIndexingTasks: get(state, '$reIndexingTasks'),
});

const mapDispatchToProps = (dispatch) => ({
	updateReIndexingTasks: (data) => dispatch(setReIndexingTasks(data)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ReIndexTracker);
