import React from 'react';
import { css } from 'react-emotion';
import { Input } from 'antd';

const EyeIcon = require('react-feather/dist/icons/eye').default;
const EditIcon = require('react-feather/dist/icons/edit').default;
const EyeOffIcon = require('react-feather/dist/icons/eye-off').default;

const iconBtn = css`
	cursor: pointer;
`;

class PasswordInput extends React.Component {
	state = {
		visible: false,
	};

	get Icon() {
		const {
			control: { pristine, reset },
			isEditing,
		} = this.props;
		const { visible } = this.state;
		if (pristine && isEditing) {
			return (
				<EditIcon
					css={iconBtn}
					onClick={() => {
						reset();
						this.inputRef.focus();
					}}
					size={14}
				/>
			);
		}
		if (visible) {
			return <EyeIcon css={iconBtn} onClick={this.handleClick} size={14} />;
		}
		return <EyeOffIcon css={iconBtn} onClick={this.handleClick} size={14} />;
	}

	handleClick = () => {
		this.setState(prevState => ({
			visible: !prevState.visible,
		}));
	};

	render() {
		const { visible } = this.state;
		const {
			control: { handler },
		} = this.props;
		return (
			<Input
				// eslint-disable-next-line
				ref={c => (this.inputRef = c)}
				type={visible ? 'text' : 'password'}
				addonAfter={this.Icon}
				{...handler()}
			/>
		);
	}
}

export default PasswordInput;
