import React from 'react';
import PropTypes from 'prop-types';
import { DeleteOutlined, EditOutlined, MoreOutlined } from '@ant-design/icons';
import { Button, Checkbox, Dropdown, Menu, Typography } from 'antd';
import { css } from 'emotion';
import { Link } from 'react-router-dom';
import CloneRule from './CloneRule';

const menuStyle = css`
	font-size: 14px;
	i {
		font-size: 14px !important;
	}
`;

const MobileMenu = (props) => {
	const { rule, removeRule, toggleRule } = props;
	return (
		<Dropdown
			placement="bottomRight"
			overlay={
				<Menu className={menuStyle}>
					<Menu.Item key="0">
						<Link to={`/cluster/rules/${rule.id}`}>
							<EditOutlined /> <Typography.Text>Edit</Typography.Text>
						</Link>
					</Menu.Item>
					<Menu.Item key="1">
						<CloneRule rule={rule} isMobile />
					</Menu.Item>
					<Menu.Item key="2">
						<Checkbox
							checked={rule.enabled}
							onChange={(e) => toggleRule({ id: rule.id, enabled: e.target.checked })}
						>
							Rule Status
						</Checkbox>
					</Menu.Item>
					<Menu.Divider />
					<Menu.Item onClick={() => removeRule(rule.id)} key="3">
						<DeleteOutlined style={{ color: '#f5222d' }} />{' '}
						<Typography.Text style={{ color: '#f5222d' }}>Delete</Typography.Text>
					</Menu.Item>
				</Menu>
			}
			trigger={['click']}
		>
			<Button shape="circle" icon={<MoreOutlined />} />
		</Dropdown>
	);
};

MobileMenu.propTypes = {
	rule: PropTypes.object,
	removeRule: PropTypes.func.isRequired,
	toggleRule: PropTypes.func.isRequired,
};

MobileMenu.defaultProps = {
	rule: {},
};

export default MobileMenu;
