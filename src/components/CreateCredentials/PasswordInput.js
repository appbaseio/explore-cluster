import React from 'react';
import { css } from 'react-emotion';
import { Input } from 'antd';

const EyeIcon = require('react-feather/dist/icons/eye').default;
const EyeOffIcon = require('react-feather/dist/icons/eye-off').default;

const iconBtn = css`
	cursor: pointer;
`;

class PasswordInput extends React.Component {
	state = {
		visible: false,
	};

	handleClick = () => {
		this.setState(prevState => ({
			visible: !prevState.visible,
		}));
	};

	render() {
		const { visible } = this.state;
		return (
			<Input
				type={visible ? 'text' : 'password'}
				addonAfter={
					visible ? (
						<EyeIcon css={iconBtn} onClick={this.handleClick} size={14} />
					) : (
						<EyeOffIcon css={iconBtn} onClick={this.handleClick} size={14} />
					)
				}
				{...this.props}
			/>
		);
	}
}

export default PasswordInput;
