import React, { Component } from 'react';
import { string, func } from 'prop-types';
import { connect } from 'react-redux';
import get from 'lodash/get';

import { setCurrentApp } from '../../batteries/modules/actions';
import Loader from '../../components/Loader';
import SearchPreview from './components/SearchPreview';
import { event, timingEvent } from '../../utils/gtag';
import moment from '../../utils/moment';

class SandboxPage extends Component {
	constructor(props) {
		super(props);
		this.startTime = moment();
	}

	componentDidMount() {
		// triggering custom event for google analytics
		event({
			action: 'Search Preview',
			category: 'Develop',
			label: 'visit',
			value: null,
		});
	}

	componentDidUpdate(prevProps) {
		const { appName } = this.props;
		if (appName !== prevProps.appName) {
			this.init();
		}
	}

	componentWillUnmount() {
		// Sends the timing event to Google Analytics.
		timingEvent({
			action: 'timing_complete',
			category: 'Develop',
			label: 'search-preview-time',
			name: 'time',
			value: this.startTime.fromNow(),
		});
	}

	init() {
		// prettier-ignore
		const {
			updateCurrentApp,
			appName,
		} = this.props;
		updateCurrentApp(appName);
	}

	render() {
		const { appName, credentials } = this.props;

		if (!credentials) {
			return <Loader />;
		}

		return (
			<div>
				<SearchPreview app={appName} />
			</div>
		);
	}
}

SandboxPage.propTypes = {
	appName: string.isRequired,
	credentials: string, // eslint-disable-line
	updateCurrentApp: func.isRequired,
};

const mapStateToProps = (state) => {
	const { username, password } = get(state, 'user.data', {});
	return {
		credentials: username ? `${username}:${password}` : null,
	};
};

const mapDispatchToProps = (dispatch) => ({
	updateCurrentApp: (appName) => dispatch(setCurrentApp(appName, appName)),
});

export default connect(mapStateToProps, mapDispatchToProps)(SandboxPage);
