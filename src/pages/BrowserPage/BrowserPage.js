import React, { Component } from 'react';
import { string, func, bool } from 'prop-types';
import { connect } from 'react-redux';
import get from 'lodash/get';
import URL from 'url-parser-lite';

import {
	setCurrentApp,
	getPermission as getPermissionFromAppbase,
} from '../../batteries/modules/actions';

import Loader from '../../components/Loader';
import { SCALR_API } from '../../batteries/utils';

class BrowserPage extends Component {
	componentDidMount() {
		const { credentials } = this.props;
		if (!credentials) {
			this.init();
		}
	}

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
			// getPermission,
		} = this.props;
		updateCurrentApp(appName);
		// getPermission(appName);
	}

	render() {
		const { appName, credentials, isCluster } = this.props;
		console.log(SCALR_API);
		const { protocol, host } = URL(SCALR_API);
		const url = `${protocol}://${credentials}@${host}`;
		const iframeURL = `https://dejavu.appbase.io/?appname=${
			isCluster ? '*' : appName
		}&url=${url}&mode=view&sidebar=false&appswitcher=false`;

		return (
			<section>
				{credentials ? (
					<iframe
						height={`${window.innerHeight - 60 || 600}px`}
						width="100%"
						title="dejavu"
						src={iframeURL}
						frameBorder="0"
					/>
				) : (
					<Loader />
				)}
			</section>
		);
	}
}

BrowserPage.defaultProps = {
	isCluster: false,
};

BrowserPage.propTypes = {
	appName: string.isRequired,
	credentials: string.isRequired,
	updateCurrentApp: func.isRequired,
	isCluster: bool,
};

const mapStateToProps = (state) => {
	const { username, password } = get(state, 'user.data', {});
	return {
		credentials: username ? `${username}:${password}` : '',
	};
};

const mapDispatchToProps = dispatch => ({
	updateCurrentApp: appName => dispatch(setCurrentApp(appName, appName)),
	getPermission: appName => dispatch(getPermissionFromAppbase(appName)),
});

export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(BrowserPage);
