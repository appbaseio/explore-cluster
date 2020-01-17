import React, { Component } from 'react';
import { string, func } from 'prop-types';
import { connect } from 'react-redux';
import get from 'lodash/get';
import URL from 'url-parser-lite';

import {
	setCurrentApp,
	getPermission as getPermissionFromAppbase,
} from '../../batteries/modules/actions';

import Loader from '../../components/Loader';
import Frame from '../../components/Frame';
import { getURL } from '../../constants/config';

const LZMA = require('lzma/src/lzma-c');
require('urlsafe-base64/app.js');

class QueryExplorer extends Component {
	state = {
		isFrameLoading: true,
		isProcessingUrl: true,
		mirageAppUrl: '',
	};

	componentDidMount() {
		const { credentials } = this.props;
		if (!credentials) {
			this.init();
		} else {
			this.setUrl();
		}
	}

	componentDidUpdate(prevProps) {
		const { appName, appId } = this.props;
		if (appName !== prevProps.appName || appId !== prevProps.appId) {
			this.init();
			this.setUrl();
		}
	}

	setUrl = () => {
		const { appName, credentials } = this.props;
		const SCALR_API = getURL();
		const { protocol, host } = URL(SCALR_API);
		const appUrl = `${protocol}://${credentials}@${host}`;
		const mirage = JSON.stringify({
			url: appUrl,
			appname: appName,
		});

		LZMA.LZMA_WORKER.compress(mirage, 9, url => {
			const res = window.SafeEncode.encode(window.SafeEncode.buffer(url));
			this.setState({
				isProcessingUrl: false,
				mirageAppUrl: res,
			});
		});
	};

	frameLoaded = () => {
		this.setState({
			isFrameLoading: false,
		});
	};

	init() {
		// prettier-ignore
		const {
			updateCurrentApp,
			appName,
			appId,
			getPermission,
		} = this.props;
		updateCurrentApp(appName, appId);
		getPermission(appName);
	}

	render() {
		const { isProcessingUrl, mirageAppUrl, isFrameLoading } = this.state;
		const { credentials } = this.props;
		const iframeURL = `https://opensource.appbase.io/mirage/#?input_state=${mirageAppUrl}&hf=false&subscribe=false`;

		return (
			<section>
				{isFrameLoading && isProcessingUrl && <Loader />}
				{credentials ? (
					<Frame
						height={`${window.innerHeight - 90 || 600}px`}
						width="100%"
						id="mirage"
						src={iframeURL}
						frameBorder="0"
						onLoad={this.frameLoaded}
					/>
				) : (
					<Loader />
				)}
			</section>
		);
	}
}

QueryExplorer.propTypes = {
	appName: string.isRequired,
	appId: string.isRequired,
	credentials: string.isRequired,
	updateCurrentApp: func.isRequired,
	getPermission: func.isRequired,
};

const mapStateToProps = state => {
	const { username, password } = get(state, 'user.data', {});
	return {
		credentials: username ? `${username}:${password}` : '',
	};
};

const mapDispatchToProps = dispatch => ({
	updateCurrentApp: (appName, appId) => dispatch(setCurrentApp(appName, appId)),
	getPermission: appId => dispatch(getPermissionFromAppbase(appId)),
});

export default connect(mapStateToProps, mapDispatchToProps)(QueryExplorer);
