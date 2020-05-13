import React from 'react';
import { Switch, Route } from 'react-router-dom';
import Loadable from 'react-loadable';
import PropTypes from 'prop-types';

import Loader from '../../components/Loader';

const AppWrapper = Loadable({
	loader: () => import('../AppWrapper'),
	loading: () => <div />,
});

const ProfilePage = Loadable({
	loader: () => import('../ProfilePage'),
	loading: Loader,
});

const DashboardWrapper = Loadable({
	loader: () => import('../DashboardWrapper'),
	loading: Loader,
});

const OnboardingPage = Loadable({
	loader: () => import('../OnboardingPage'),
	loading: Loader,
});

const EndPage = Loadable({
	loader: () => import('../OnboardingPage/EndScreen'),
	loading: Loader,
});

class Wrapper extends React.Component {
	componentDidMount() {
		const { redirectLocation, history, resetLocation } = this.props;
		if (redirectLocation && redirectLocation !== '/' && redirectLocation !== '/login') {
			history.push(redirectLocation);
			resetLocation();
		}
	}

	render() {
		return (
			<Switch>
				<Route exact path="/tutorial" component={OnboardingPage} />
				<Route exact path="/tutorial/finish" component={EndPage} />
				<Route exact path="/profile" component={ProfilePage} />
				<Route path="/app/:appName?/:route?" component={AppWrapper} />
				<Route component={DashboardWrapper} />
			</Switch>
		);
	}
}

Wrapper.defaultProps = {
	redirectLocation: '',
};

Wrapper.propTypes = {
	redirectLocation: PropTypes.string,
	history: PropTypes.object.isRequired,
	resetLocation: PropTypes.func.isRequired,
};

export default Wrapper;
