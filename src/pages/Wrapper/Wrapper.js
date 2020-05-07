import React from 'react';
import { Switch, Route } from 'react-router-dom';
import Loadable from 'react-loadable';

import Loader from '../../components/Loader';

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
	loader: () => import(/* webpackChunkName: "OnBoarding" */ '../OnboardingPage'),
	loading: Loader,
});

const EndPage = Loadable({
	loader: () => import(/* webpackChunkName: "EndScreenOnBoarding" */ '../OnboardingPage/EndScreen'),
	loading: Loader,
});

const Wrapper = () => (
	<Switch>
		<Route exact path="/tutorial" component={OnboardingPage} />
		<Route exact path="/tutorial/finish" component={EndPage} />
		<Route exact path="/profile" component={ProfilePage} />
		<Route path="/app/:appName?/:route?" component={AppWrapper} />
		<Route component={DashboardWrapper} />
	</Switch>
);

export default Wrapper;
