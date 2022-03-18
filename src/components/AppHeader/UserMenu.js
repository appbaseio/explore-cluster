import React from 'react';
import { object } from 'prop-types';
import get from 'lodash/get';
import { Menu, Avatar, Dropdown, Icon } from 'antd';
import { css } from 'react-emotion';
import { media } from '../../utils/media';

const userMenu = css`
	${media.small(css`
		display: none;
	`)};

	i.anticon.anticon-user {
		font-size: 16px !important;
	}
`;

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
	localStorage.removeItem('isUsingOpenSearch');
	window.location.href = '/';
};

const menu = (
	<Menu>
		<Menu.Item onClick={handleLogout} data-cy="logout-button">
			<Icon type="poweroff" theme="outlined" />
			Logout
		</Menu.Item>
	</Menu>
);

const UserMenu = ({ user }) => (
	<Dropdown overlay={menu} className={userMenu} trigger={['click']}>
		<div style={{ cursor: 'pointer' }} data-cy="logout-menu">
			<Avatar icon="user" />
			&nbsp;&nbsp;
			{get(user, 'username', 'Loading...')}
			&nbsp;&nbsp;
			<Icon type="down" />
		</div>
	</Dropdown>
);

UserMenu.propTypes = {
	user: object.isRequired,
};

export default UserMenu;
