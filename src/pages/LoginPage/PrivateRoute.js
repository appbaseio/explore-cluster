import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import PropTypes from 'prop-types';
import HelpChat from '../../components/HelpChat';
import { children } from '../../utils/prop-types';

const AUTH_ROUTES = ['/login', '/signup', '/install', '/billing'];

function getHelpChatParam() {
	const storedValue = sessionStorage.getItem('showHelpChat');

	if (storedValue) {
		return JSON.parse(storedValue);
	}
	return true;
}

const PrivateRoute = ({ component: Component, user, ...rest }) => {
	return (
		<Route
			{...rest}
			render={(props) => {
				if (user.data) {
					return (
						<React.Fragment>
							<Component {...props} />
							{getHelpChatParam() ? <HelpChat user={user.data} /> : null}
						</React.Fragment>
					);
				}
				if (!AUTH_ROUTES.includes(window.location.pathname)) {
					if (
						window.location.pathname &&
						window.location.pathname !== '/login' &&
						window.location.pathname !== '/'
					) {
						sessionStorage.setItem('redirectUrl', window.location.pathname);
						return <Redirect to={`/login?redirectTo=${window.location.pathname}`} />;
					}
					return <Redirect to="/login" />;
				}
				return null;
			}}
		/>
	);
};

PrivateRoute.propTypes = {
	user: PropTypes.object.isRequired,
	component: children.isRequired,
};

export default PrivateRoute;
