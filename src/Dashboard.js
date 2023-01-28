import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import Loadable from 'react-loadable';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import PropTypes from 'prop-types';
import { HomeOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { Button, Modal } from 'antd';
import get from 'lodash/get';
import URLSearchParams from '@ungap/url-search-params';
import * as Sentry from '@sentry/browser';

import { loadUser, setAppRoutes, setClusterRoutes } from './actions';
import { getAuthorizedViews, getOriginURL } from './utils';
import Loader from './components/Loader';
import Logo from './components/Logo';
import { APP_ROUTES, CLUSTER_ROUTES } from './constants/routes';
import { ALLOWED_ACTIONS_BY_BACKEND, BACKENDS } from './batteries/utils';

// routes
const LoginPage = Loadable({
	loader: () => import(/* webpackChunkName: "LoginPage" */ './pages/LoginPage'),
	loading: Loader,
});

const SignupPage = Loadable({
	loader: () => import(/* webpackChunkName: "SignupPage" */ './pages/SignupPage'),
	loading: Loader,
});

const BillingPage = Loadable({
	loader: () => import(/* webpackChunkName: "BillingPage" */ './pages/BillingPage'),
	loading: Loader,
});

const InstallPage = Loadable({
	loader: () => import(/* webpackChunkName: "InstallPage" */ './pages/InstallPage'),
	loading: Loader,
});

const Wrapper = Loadable({
	// eslint-disable-next-line import/no-cycle
	loader: () => import(/* webpackChunkName: "WrapperComponent" */ './pages/Wrapper'),
	loading: Loader,
});

const PrivateRoute = Loadable({
	loader: () => import(/* webpackChunkName: "PrivateRoute" */ './pages/LoginPage/PrivateRoute'),
	loading: Loader,
});

const LogoutRoute = Loadable({
	loader: () => import(/* webpackChunkName: "PrivateRoute" */ './pages/LogoutPage'),
	loading: Loader,
});

class Dashboard extends Component {
	state = {
		error: false,
		isLoading: true,
		redirectLocation: null,
	};

	eventId = null;

	componentDidMount() {
		const { loadArcUser } = this.props;
		const { pathname, search } = window.location;

		window.addEventListener('error', () => {
			const errorId = Sentry.lastEventId();
			this.eventId = errorId;
		});

		if (pathname !== '/login' && pathname !== '/' && search) {
			this.setState({
				redirectLocation: `${pathname}${search}`,
			});
		}

		const params = new URLSearchParams(search);
		const url = params.get('url');
		if (params.has('showProfile')) {
			const showProfile = params.get('showProfile');
			sessionStorage.setItem('showProfile', showProfile);
		} else {
			sessionStorage.setItem('showProfile', true);
		}
		if (params.has('showHelpChat')) {
			const showHelpChat = params.get('showHelpChat');
			sessionStorage.setItem('showHelpChat', showHelpChat);
		} else {
			sessionStorage.setItem('showHelpChat', true);
		}
		if (params.has('url')) {
			localStorage.setItem('url', getOriginURL(url));
		}
		if (params.has('header')) {
			const header = params.get('header');
			sessionStorage.setItem('header', header);
		} else {
			sessionStorage.setItem('header', true);
		}
		if (params.has('email')) {
			const email = params.get('email');
			sessionStorage.setItem('signup-email', email);
		} else {
			sessionStorage.setItem('signup-email', '');
		}
		if (params.has('cluster')) {
			const cluster = params.get('cluster');
			sessionStorage.setItem('cluster', cluster);
		}
		if (params.has('username') && params.has('password')) {
			const username = params.get('username');
			const password = params.get('password');
			const authToken = btoa(`${username}:${password}`);
			localStorage.setItem('username', username);
			localStorage.setItem('password', password);
			localStorage.setItem('authToken', authToken);
			loadArcUser(username, password, url);
		} else {
			this.setState({
				isLoading: false,
			});
		}
	}

	static getDerivedStateFromProps(props, state) {
		const { isLoading } = state;
		if (props.user.data && isLoading) {
			return {
				isLoading: false,
			};
		}

		return null;
	}

	componentDidUpdate(prevProps) {
		const { error, status, user, updateAppRoutes, updateClusterRoutes, backend, backendImage } =
			this.props;

		const { redirectLocation } = this.state;
		const allowedActions = get(user, 'data.allowedActions', []).filter((action) =>
			ALLOWED_ACTIONS_BY_BACKEND[backend].includes(action),
		);

		if (allowedActions.length) {
			updateAppRoutes(getAuthorizedViews(APP_ROUTES, allowedActions, backend));
			updateClusterRoutes(getAuthorizedViews(CLUSTER_ROUTES, allowedActions, backend));
		}
		if (status === 402 && error && error !== prevProps.error) {
			// eslint-disable-next-line
			this.setState(
				{
					isLoading: false,
				},
				() =>
					Modal.error({
						title: error.message,
						content: (
							<p>
								Are you using a valid reactivesearch.io ID? Subscribe to a plan to
								continue accessing reactivesearch.io. It can take up to 1 hour for a
								payment made to get reflected. Reach out to us at{' '}
								<a href="mailto:support@appbase.io">support@appbase.io</a> for any
								questions.
							</p>
						),
						okText: 'See Subscription Plans',
						onOk: () => {
							window.location = '/billing';
						},
					}),
			);
		}

		if (backendImage === 'multi-tenant-sls' && !backend && redirectLocation !== '/login') {
			window.location.href = '/cluster/configure-search-engine-backend';
		}
	}

	resetLocation = () => {
		this.setState({
			redirectLocation: null,
		});
	};

	componentDidCatch(error, errorInfo) {
		this.setState({
			error: true,
		});
		Sentry.withScope((scope) => {
			scope.setExtras(errorInfo);
			Sentry.captureException(error);
		});
	}

	render() {
		const { user } = this.props;
		const { error, isLoading, redirectLocation } = this.state;

		if (user.isLoading || isLoading) {
			return <Loader />;
		}

		if (error) {
			return (
				<section
					style={{
						justifyContent: 'center',
						alignItems: 'center',
						display: 'flex',
						flexDirection: 'column',
						height: '100vh',
						overflowY: 'auto',
					}}
				>
					<Logo />
					<h2 style={{ marginTop: 20 }}>Something went wrong!</h2>
					<p>Our team has been notified about this.</p>
					<section
						style={{
							display: 'flex',
						}}
					>
						<Button href="/" size="large" type="primary">
							<HomeOutlined style={{ margin: '0.25rem' }} />
							Back to Dashboard
						</Button>
						<Button
							size="large"
							danger
							css={{ marginLeft: '8' }}
							onClick={() => {
								Sentry.showReportDialog({
									eventId: this.eventId,
								});
							}}
						>
							<InfoCircleOutlined style={{ margin: '0.25rem' }} />
							Report this problem
						</Button>
					</section>
				</section>
			);
		}

		return (
			<Router>
				<Fragment>
					<Route exact path="/billing" component={BillingPage} />
					<Route exact path="/install" component={InstallPage} />
					<Route exact path="/login" component={LoginPage} />
					<Route exact path="/signup" component={SignupPage} />
					<Route exact path="/logout" component={LogoutRoute} />
					<PrivateRoute
						user={user}
						component={(props) => (
							<Wrapper
								{...props}
								resetLocation={this.resetLocation}
								redirectLocation={redirectLocation}
							/>
						)}
					/>
				</Fragment>
			</Router>
		);
	}
}

Dashboard.defaultProps = {
	error: undefined,
	backendImage: '',
	status: undefined,
	backend: BACKENDS.ELASTICSEARCH.name,
};

Dashboard.propTypes = {
	user: PropTypes.object.isRequired,
	loadArcUser: PropTypes.func.isRequired,
	status: PropTypes.number,
	error: PropTypes.any,
	updateAppRoutes: PropTypes.func.isRequired,
	updateClusterRoutes: PropTypes.func.isRequired,
	backendImage: PropTypes.string,
	backend: PropTypes.string,
};

const mapStateToProps = ({ user, $getAppPlan }) => ({
	user,
	error: get(user, 'error'),
	status: get(user, 'error.actual.status'),
	backendImage: get($getAppPlan, 'results.image_type'),
	backend: get($getAppPlan, 'results.backend'),
});

const mapDispatchToProps = (dispatch) => ({
	loadArcUser: (u, p, url) => dispatch(loadUser(u, p, url)),
	updateAppRoutes: (routes) => dispatch(setAppRoutes(routes)),
	updateClusterRoutes: (routes) => dispatch(setClusterRoutes(routes)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
