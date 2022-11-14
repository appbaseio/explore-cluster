import React from 'react';
import PropTypes from 'prop-types';
import { css } from 'react-emotion';
import { EditOutlined, EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import { Input } from 'antd';

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
				<EditOutlined
					className={iconBtn}
					onClick={() => {
						// Enable the input
						// object method destructuring won't work
						// eslint-disable-next-line
						this.props.control.enable();
						// Reset the password input
						reset();
						setTimeout(() => this.inputRef.focus(), 0);
					}}
				/>
			);
		}
		if (visible) {
			return <EyeOutlined className={iconBtn} onClick={this.handleClick} />;
		}
		return <EyeInvisibleOutlined className={iconBtn} onClick={this.handleClick} />;
	}

	handleClick = () => {
		this.setState((prevState) => ({
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
				ref={(c) => (this.inputRef = c)}
				type={visible ? 'text' : 'password'}
				addonAfter={this.Icon}
				{...handler()}
			/>
		);
	}
}

PasswordInput.propTypes = {
	control: PropTypes.object,
	isEditing: PropTypes.bool,
};

PasswordInput.defaultProps = {
	control: {},
	isEditing: false,
};

export default PasswordInput;
