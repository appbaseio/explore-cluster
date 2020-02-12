import React from 'react';
import { Menu, Dropdown, Button, Icon, Checkbox, Typography } from 'antd';
import { css } from 'emotion';

const menuStyle = css`
	font-size: 14px;
	i {
		font-size: 14px !important;
	}
`;

const menu = (
	<Menu className={menuStyle}>
		<Menu.Item key="0">
			<Icon type="edit" /> <Typography.Text>Edit</Typography.Text>
		</Menu.Item>
		<Menu.Item key="1">
			<Icon type="copy" /> <Typography.Text>Clone</Typography.Text>
		</Menu.Item>
		<Menu.Item key="2">
			<Checkbox>Rule Status</Checkbox>
		</Menu.Item>
		<Menu.Divider />
		<Menu.Item key="3">
			<Icon style={{ color: '#f5222d' }} type="delete" />{' '}
			<Typography.Text style={{ color: '#f5222d' }}>Delete</Typography.Text>
		</Menu.Item>
	</Menu>
);

const MobileMenu = () => (
	<Dropdown placement="bottomRight" overlay={menu} trigger={['click']}>
		<Button shape="circle" icon="more" />
	</Dropdown>
);

export default MobileMenu;
