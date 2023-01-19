import React, { Component } from 'react';
import { string, func, bool } from 'prop-types';
import { connect } from 'react-redux';
import get from 'lodash/get';
import Loadable from 'react-loadable';
import { injectGlobal } from 'emotion';
import URL from 'url-parser-lite';
import { event, timingEvent } from '../../utils/gtag';
import moment from '../../utils/moment';

import {
	setCurrentApp,
	getPermission as getPermissionFromAppbase,
} from '../../batteries/modules/actions';

import Loader from '../../components/Loader';
import { getURL } from '../../constants/config';
import { withErrorToaster } from '../../batteries/components/shared/ErrorToaster/ErrorToaster';

/* eslint-disable */
injectGlobal`
	.ace_editor,
	.ace_editor div,
	.ace_editor div span {
		font-family: monospace !important;
	}
`;

const DejavuComponent = Loadable({
	loader: () => import(/* webpackChunkName: "DejavuComponent" */ '@appbaseio/dejavu-browser'),
	loading: Loader,
});

class BrowserPage extends Component {
	constructor(props) {
		super(props);
		this.startTime = moment();
	}
	componentDidMount() {
		// triggering custom event for google analytics
		event({
			action: 'Browse Results',
			category: 'Develop',
			label: 'visit',
			value: null,
		});
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

	componentWillUnmount() {
		// Sends the timing event to Google Analytics.
		timingEvent({
			action: 'timing_complete',
			category: 'Develop',
			label: 'browse-results-time',
			name: 'time',
			value: this.startTime.fromNow(),
		});
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
							app={dejavu.appname || '*'}
							url={dejavu.url}
							credentials={credentials}
							URLParams={false}
							showHeaders={false}
							forceReconnect
							hasCloneApp={false}
							enableReactivesearch={true}
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

const mapStateToProps = (state) => {
	const { username, password } = get(state, 'user.data', {});
	return {
		credentials: username ? `${username}:${password}` : '',
	};
};

const mapDispatchToProps = (dispatch) => ({
	updateCurrentApp: (appName) => dispatch(setCurrentApp(appName, appName)),
	getPermission: (appName) => dispatch(getPermissionFromAppbase(appName)),
});

export default withErrorToaster(connect(mapStateToProps, mapDispatchToProps)(BrowserPage));
