import React from 'react';
import { object } from 'prop-types';
import get from 'lodash/get';
import { DownOutlined, PoweroffOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Dropdown } from 'antd';
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
	localStorage.removeItem('isAdmin');
	localStorage.removeItem('allowedActions');
	localStorage.removeItem('authToken');
	localStorage.removeItem('isUsingOpenSearch');
	window.location.href = '/';
};

const menu = [
	{
		key: '1',
		label: (
			<div onClick={handleLogout} data-cy="logout-button">
				<PoweroffOutlined />
				Logout
			</div>
		),
	},
];

const UserMenu = ({ user }) => (
	<Dropdown menu={{ items: menu }} className={userMenu} trigger={['click']}>
		<div style={{ cursor: 'pointer' }} data-cy="logout-menu">
			<Avatar icon={<UserOutlined />} />
			&nbsp;&nbsp;
			{get(user, 'username', 'Loading...')}
			&nbsp;&nbsp;
			<DownOutlined />
		</div>
	</Dropdown>
);

UserMenu.propTypes = {
	user: object.isRequired,
};

export default UserMenu;
