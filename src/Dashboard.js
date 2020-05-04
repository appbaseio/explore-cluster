import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import Loadable from 'react-loadable';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Button, Icon, Modal } from 'antd';
import get from 'lodash/get';
import URLSearchParams from '@ungap/url-search-params';
import * as Sentry from '@sentry/browser';

import { loadUser } from './actions';
import Loader from './components/Loader';
import Logo from './components/Logo';
import PrivateRoute from './pages/LoginPage/PrivateRoute';
import Wrapper from './pages/Wrapper';
import BillingPage from './pages/BillingPage';
import InstallPage from './pages/InstallPage';

Sentry.init({
	dsn: 'https://8e07fb23ba8f46d8a730e65496bb7f00@sentry.io/58038',
});

// routes
const LoginPage = Loadable({
	loader: () => import('./pages/LoginPage'),
	loading: Loader,
});

const SignupPage = Loadable({
	loader: () => import('./pages/SignupPage'),
	loading: Loader,
});

class Dashboard extends Component {
	state = {
		error: false,
		isLoading: true,
	};

	componentDidMount() {
		const { loadArcUser } = this.props;
		const params = new URLSearchParams(window.location.search);
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
		const { error, status } = this.props;
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
								Are you using a valid Arc ID? If so, please subscribe to a paid plan
								to continue using Arc. It takes up to 1 hour for the billing change
								to get reflected. If you have subscribed and continue to see this
								message, reach out to us at{' '}
								<a href="mailto:support@appbase.io">support@appbase.io</a>.
							</p>
						),
						okText: 'Go to billing',
						onOk: () => {
							window.location = '/billing';
						},
					}),
			);
		}
	}

	componentDidCatch(error, errorInfo) {
		this.setState({
			error: true,
		});
		Sentry.withScope((scope) => {
			Object.keys(errorInfo).forEach((key) => {
				scope.setExtra(key, errorInfo[key]);
			});
			Sentry.captureException(error);
		});
	}

	render() {
		const { user } = this.props;
		const { error, isLoading } = this.state;

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
							href="mailto:info@appbase.io"
							target="_blank"
							size="large"
							type="danger"
							css={{ marginLeft: '8' }}
						>
							<Icon type="info-circle" />
							Report Bug
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
					<PrivateRoute user={user} component={Wrapper} />
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
};

const mapStateToProps = ({ user }) => ({
	user,
	error: get(user, 'error'),
	status: get(user, 'error.actual.status'),
});

const mapDispatchToProps = (dispatch) => ({
	loadArcUser: (u, p) => dispatch(loadUser(u, p)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
