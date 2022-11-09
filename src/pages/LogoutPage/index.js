import React, { useEffect } from 'react';
import { withRouter } from 'react-router-dom';

const LogoutPage = () => {
	useEffect(() => {
		handleLogout();
	}, []);

	const handleLogout = () => {
		localStorage.removeItem('persist:root');
		sessionStorage.removeItem('url');
		sessionStorage.removeItem('username');
		sessionStorage.removeItem('password');
		localStorage.removeItem('url');
		localStorage.removeItem('username');
		localStorage.removeItem('password');
		sessionStorage.removeItem('isAdmin');
		sessionStorage.removeItem('allowedActions');
		sessionStorage.removeItem('appName');
		sessionStorage.removeItem('redirectUrl');
		localStorage.removeItem('isAdmin');
		localStorage.removeItem('allowedActions');
		localStorage.removeItem('authToken');
		localStorage.removeItem('isUsingOpenSearch');
		window.location.href = '/';
	};

	return <></>;
};

export default withRouter(LogoutPage);
