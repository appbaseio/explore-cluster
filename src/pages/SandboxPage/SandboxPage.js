import React, { Component } from 'react';
import { string, func } from 'prop-types';
import { connect } from 'react-redux';
import get from 'lodash/get';

import { setCurrentApp } from '../../batteries/modules/actions';
import SearchSandbox from '../../batteries/components/SearchSandbox';
import Editor from '../../batteries/components/SearchSandbox/containers/Editor';
import Loader from '../../components/Loader';

class SandboxPage extends Component {
	componentDidUpdate(prevProps) {
		const { appName } = this.props;
		if (appName !== prevProps.appName) {
			this.init();
		}
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
			<SearchSandbox appId={appName} appName={appName} credentials={credentials} isDashboard>
				<Editor />
			</SearchSandbox>
		);
	}
}

SandboxPage.propTypes = {
	appName: string.isRequired,
	credentials: string, // eslint-disable-line
	updateCurrentApp: func.isRequired,
};

const mapStateToProps = state => {
	const { username, password } = get(state, 'user.data', {});
	return {
		credentials: username ? `${username}:${password}` : null,
	};
};

const mapDispatchToProps = dispatch => ({
	updateCurrentApp: appName => dispatch(setCurrentApp(appName, appName)),
});

export default connect(mapStateToProps, mapDispatchToProps)(SandboxPage);
