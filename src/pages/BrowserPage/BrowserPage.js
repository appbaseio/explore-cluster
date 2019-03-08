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
import Frame from '../../components/Frame';
import { getURL } from '../../constants/config';

class BrowserPage extends Component {
	state = {
		isFrameLoading: true,
	};

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
			// getPermission,
		} = this.props;
		updateCurrentApp(appName);
		// getPermission(appName);
	}

	render() {
		const { appName, credentials, isCluster } = this.props;
		const { isFrameLoading } = this.state;
		const SCALR_API = getURL();
		const { protocol, host } = URL(SCALR_API);
		const url = `${protocol}://${credentials}@${host}`;
		const iframeURL = `https://dejavu.appbase.io/?appname=${
			isCluster ? '*' : appName
		}&url=${url}&footer=false&sidebar=false&appswitcher=false&mode=edit&cloneApp=false&oldBanner=false`;

		return (
			<section>
				{credentials ? (
					<React.Fragment>
						{isFrameLoading && <Loader />}
						<Frame
							height={`${window.innerHeight - 60 || 600}px`}
							width="100%"
							title="dejavu"
							id="dejavu"
							onLoad={this.frameLoaded}
							src={iframeURL}
							frameBorder="0"
						/>
					</React.Fragment>
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
