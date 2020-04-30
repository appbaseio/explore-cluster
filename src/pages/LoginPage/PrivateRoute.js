import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import PropTypes from 'prop-types';
import HelpChat from '../../components/HelpChat';

const AUTH_ROUTES = ['/login', '/signup', '/install', '/billing'];

function getHelpChatParam() {
	const storedValue = sessionStorage.showHelpChat;

	if (storedValue) {
		return JSON.parse(storedValue);
	}
	return true;
}

const PrivateRoute = ({ component: Component, user, ...rest }) => (
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
			return AUTH_ROUTES.includes(window.location.pathname) ? null : <Redirect to="/login" />;
		}}
	/>
);

PrivateRoute.propTypes = {
	user: PropTypes.object.isRequired,
	component: PropTypes.node.isRequired,
};

export default PrivateRoute;
