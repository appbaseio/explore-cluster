import React from 'react';
import { Switch, Route } from 'react-router-dom';
import Loadable from 'react-loadable';
import PropTypes from 'prop-types';

import Loader from '../../components/Loader';
import { addIntercomScript } from '../../utils';

const AppWrapper = Loadable({
	loader: () => import(/* webpackChunkName: "AppWrapper" */ '../AppWrapper'),
	loading: () => <div />,
});

const ProfilePage = Loadable({
	loader: () => import(/* webpackChunkName: "ProfilePage" */ '../ProfilePage'),
	loading: Loader,
});

const DashboardWrapper = Loadable({
	loader: () => import(/* webpackChunkName: "DashboardWrapper" */ '../DashboardWrapper'),
	loading: Loader,
});

const OnboardingPage = Loadable({
	loader: () => import(/* webpackChunkName: "OnBoardingPage" */ '../OnboardingPage'),
	loading: Loader,
});

const EndPage = Loadable({
	loader: () => import(/* webpackChunkName: "EndScreen" */ '../OnboardingPage/EndScreen'),
	loading: Loader,
});

class Wrapper extends React.Component {
	componentDidMount() {
		const { redirectLocation, history, resetLocation } = this.props;
		if (redirectLocation && redirectLocation !== '/' && redirectLocation !== '/login') {
			history.push(redirectLocation);
			resetLocation();
		}
		addIntercomScript();
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
