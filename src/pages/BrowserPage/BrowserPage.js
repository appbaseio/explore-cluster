import React, { Component } from 'react';
import { string, func, bool } from 'prop-types';
import { connect } from 'react-redux';
import get from 'lodash/get';
import Loadable from 'react-loadable';
import { injectGlobal } from 'emotion';
import URL from 'url-parser-lite';

import {
	setCurrentApp,
	getPermission as getPermissionFromAppbase,
} from '../../batteries/modules/actions';

import Loader from '../../components/Loader';
import { getURL } from '../../constants/config';

/* eslint-disable */
injectGlobal`
	.ace_editor,
	.ace_editor div,
	.ace_editor div span {
		font-family: monospace !important;
	}
`;

const DejavuComponent = Loadable({
	loader: () => import('@appbaseio/dejavu-browser'),
	loading: Loader,
});

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
		const SCALR_API = getURL();
		const { protocol, host } = URL(SCALR_API);
		const url = `${protocol}://${credentials}@${host}`;
		const dejavu = {
			url,
			appname: isCluster ? '*' : appName,
		};
		return (
			<section
				style={{
					backgroundColor: '#ffffff',
					height: `${window.innerHeight - 65}px`,
					padding: 20,
				}}
			>
				{credentials ? (
					<div>
						<DejavuComponent
							app={dejavu.appname}
							url={dejavu.url}
							credentials={credentials}
							URLParams={false}
							showHeaders={false}
							forceReconnect
							hasCloneApp={false}
						/>
					</div>
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

const mapStateToProps = state => {
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
