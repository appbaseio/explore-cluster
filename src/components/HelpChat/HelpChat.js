import React from 'react';
import ReactDOM from 'react-dom';
import { QuestionOutlined } from '@ant-design/icons';
import { Button, Dropdown, Menu } from 'antd';
import { css } from 'emotion';

import { heading, subHeading } from './styles';

const helpIcon = css`
	i {
		font-size: 22px !important;
		position: relative;
	}
`;

class HelpButton extends React.Component {
	handleClick = (e) => {
		const { key } = e;
		switch (key) {
			case 'chat': {
				window.Intercom('show');
				break;
			}
			case 'support':
				window.open('https://appbase.io/pricing/#support', '_blank');
				break;
			case 'twitter':
				window.open('https://twitter.com/appbaseio', '_blank');
				break;
			case 'updates':
				window.open('https://appbase.io/', '_blank');
				break;
			case 'privacy':
				window.open('https://appbase.io/privacy/', '_blank');
				break;
			case 'whats_new':
				window.open(
					'https://www.notion.so/appbase/Appbase-io-Change-Log-506702ad91c147c3a6674e988ba59f91',
					'_blank',
				);
				break;
			default:
		}
	};

	render() {
		const menu = (
			<Menu onClick={this.handleClick}>
				<Menu.Item key="chat" style={{ padding: '10px 15px' }}>
					<h3 className={heading}>
						Ask us anything!{' '}
						<span role="img" aria-label="Wave">
							👋
						</span>
					</h3>
					<p className={subHeading}>We reply to every issue.</p>
				</Menu.Item>
				<Menu.Item key="support">
					<h3 className={heading}>Get Support!</h3>
				</Menu.Item>
				<Menu.Item key="whats_new">
					{/* eslint-disable-next-line react/jsx-curly-brace-presence */}
					<p className={subHeading}>See what{`'`}s new ✨</p>
				</Menu.Item>
				<Menu.Item key="twitter">
					<p className={subHeading}>@appbaseio - Twitter</p>
				</Menu.Item>
				<Menu.Item key="privacy">
					<p className={subHeading}>Terms & Privacy</p>
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
						icon={<QuestionOutlined />}
					/>
				</Dropdown>
			</React.Fragment>
		);
	}
}

const HelpChat = (props) =>
	ReactDOM.createPortal(<HelpButton {...props} />, document.getElementById('help'));

export default HelpChat;
