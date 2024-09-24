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
			case 'twitter':
				window.open('https://x.com/reactiveCo', '_blank');
				break;
			case 'updates':
				window.open('https://reactivesearch.io/', '_blank');
				break;
			case 'privacy':
				window.open('https://reactivesearch.io/privacy/', '_blank');
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
				<Menu.Item key="twitter">
					<p className={subHeading}>@reactiveCo - Twitter/X</p>
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
