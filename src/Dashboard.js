import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import Loadable from 'react-loadable';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Button, Icon, Modal } from 'antd';
import get from 'lodash/get';
import URLSearchParams from '@ungap/url-search-params';
import * as Sentry from '@sentry/browser';

import { loadUser, setAppRoutes, setClusterRoutes } from './actions';
import { getAuthorizedViews } from './utils';
import Loader from './components/Loader';
import Logo from './components/Logo';
import { APP_ROUTES, CLUSTER_ROUTES } from './constants/routes';

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
	loader: () => import(/* webpackChunkName: "WrapperComponent" */ './pages/Wrapper'),
	loading: Loader,
});

const PrivateRoute = Loadable({
	loader: () => import(/* webpackChunkName: "PrivateRoute" */ './pages/LoginPage/PrivateRoute'),
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
			const url = params.get('url');
			sessionStorage.setItem('url', url);
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

			sessionStorage.setItem('username', username);
			sessionStorage.setItem('password', password);

			loadArcUser(username, password);
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
		const { error, status, user, updateAppRoutes, updateClusterRoutes } = this.props;
		const allowedActions = get(user, 'data.allowedActions', []);
		const isAdmin = get(user, 'data.isAdmin', false);
		if (!isAdmin && allowedActions.length) {
			updateAppRoutes(getAuthorizedViews(APP_ROUTES, allowedActions));
			updateClusterRoutes(getAuthorizedViews(CLUSTER_ROUTES, allowedActions));
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
								Are you using a valid appbase.io ID? Subscribe to a plan to continue
								accessing appbase.io. It can take up to 1 hour for a payment made to
								get reflected. Reach out to us at{' '}
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
					css={{
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
						css={{
							display: 'flex',
						}}
					>
						<Button href="/" size="large" type="primary">
							<Icon type="home" />
							Back to Dashboard
						</Button>
						<Button
							size="large"
							type="danger"
							css={{ marginLeft: '8' }}
							onClick={() => {
								Sentry.showReportDialog({
									eventId: this.eventId,
								});
							}}
						>
							<Icon type="info-circle" />
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
	status: undefined,
};

Dashboard.propTypes = {
	user: PropTypes.object.isRequired,
	loadArcUser: PropTypes.func.isRequired,
	status: PropTypes.number,
	error: PropTypes.any,
	updateAppRoutes: PropTypes.func.isRequired,
	updateClusterRoutes: PropTypes.func.isRequired,
};

const mapStateToProps = ({ user }) => ({
	user,
	error: get(user, 'error'),
	status: get(user, 'error.actual.status'),
});

const mapDispatchToProps = (dispatch) => ({
	loadArcUser: (u, p) => dispatch(loadUser(u, p)),
	updateAppRoutes: (routes) => dispatch(setAppRoutes(routes)),
	updateClusterRoutes: (routes) => dispatch(setClusterRoutes(routes)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
