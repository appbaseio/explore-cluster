import React from 'react';
import { Button, Checkbox, Dropdown, Icon, Menu, Typography } from 'antd';
import { css } from 'emotion';
import CloneRule from './CloneRule';

const menuStyle = css`
	font-size: 14px;
	i {
		font-size: 14px !important;
	}
`;

const MobileMenu = props => {
	const { rule, removeRule } = props;
	return (
		<Dropdown
			placement="bottomRight"
			overlay={
				<Menu className={menuStyle}>
					<Menu.Item key="0">
						<Icon type="edit" /> <Typography.Text>Edit</Typography.Text>
					</Menu.Item>
					<Menu.Item key="1">
						<CloneRule rule={rule} isMobile />
					</Menu.Item>
					<Menu.Item key="2">
						<Checkbox>Rule Status</Checkbox>
					</Menu.Item>
					<Menu.Divider />
					<Menu.Item onClick={() => removeRule(rule.id)} key="3">
						<Icon style={{ color: '#f5222d' }} type="delete" />{' '}
						<Typography.Text style={{ color: '#f5222d' }}>Delete</Typography.Text>
					</Menu.Item>
				</Menu>
			}
			trigger={['click']}
		>
			<Button shape="circle" icon="more" />
		</Dropdown>
	);
};

export default MobileMenu;
