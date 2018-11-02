import React from 'react';
import { object } from 'prop-types';
import {
 Menu, Avatar, Dropdown, Icon,
} from 'antd';
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
	window.location.href = '/';
};

const menu = (
	<Menu>
		<Menu.Item onClick={handleLogout}>
			<Icon type="poweroff" theme="outlined" />
			Logout
		</Menu.Item>
	</Menu>
);

const UserMenu = ({ user }) => (
	<Dropdown overlay={menu} className={userMenu} trigger={['click']}>
		<div style={{ cursor: 'pointer' }}>
			<Avatar icon="user" />
			&nbsp;&nbsp;
			{user ? user.username : 'Loading...'}
			&nbsp;&nbsp;
			<Icon type="down" />
		</div>
	</Dropdown>
);

UserMenu.propTypes = {
	user: object.isRequired,
};

export default UserMenu;
