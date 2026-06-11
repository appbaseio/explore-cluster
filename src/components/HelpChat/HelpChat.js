import React from 'react';
import ReactDOM from 'react-dom';
import { BugOutlined } from '@ant-design/icons';
import { Button, Dropdown, Menu } from 'antd';
import { css } from 'emotion';

import { heading, subHeading } from './styles';

const GITHUB_ISSUES_URL = 'https://github.com/appbaseio/explore-cluster/issues/new';

const helpIcon = css`
	.anticon {
		font-size: 22px !important;
		position: relative;
		top: -1px;
	}
`;

class HelpButton extends React.Component {
	handleClick = ({ key }) => {
		if (key === 'github') {
			window.open(GITHUB_ISSUES_URL, '_blank');
		}
	};

	render() {
		const menu = (
			<Menu onClick={this.handleClick}>
				<Menu.Item key="github" style={{ padding: '10px 15px' }}>
					<h3 className={heading}>Found a bug?</h3>
					<p className={subHeading}>Report it on GitHub</p>
				</Menu.Item>
			</Menu>
		);
		return (
			<React.Fragment>
				<Dropdown overlay={menu} trigger={['click']} placement="topLeft">
					<Button
						className={helpIcon}
						type="primary"
						size="large"
						shape="circle"
						icon={<BugOutlined />}
					/>
				</Dropdown>
			</React.Fragment>
		);
	}
}

const HelpChat = (props) =>
	ReactDOM.createPortal(<HelpButton {...props} />, document.getElementById('help'));

export default HelpChat;
