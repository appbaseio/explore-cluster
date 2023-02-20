import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Input, Typography } from 'antd';
import { children as childrenProp } from '../../utils/prop-types';

class DeleteModal extends React.Component {
	state = {
		input: '',
		isVisible: false,
	};

	handleVisibility = () => {
		this.setState((prevState) => ({
			isVisible: !prevState.isVisible,
		}));
	};

	handleInput = (e) => {
		this.setState({
			[e.target.name]: e.target.value,
		});
	};

	handleOk = () => {
		const { onDelete } = this.props;
		this.handleVisibility();

		onDelete();
	};

	render() {
		const { input, isVisible } = this.state;
		const { name, value, children, title, text, valueType } = this.props;
		const isMatching = value === input;
		return (
			<React.Fragment>
				{children({
					handleModal: this.handleVisibility,
				})}
				<Modal
					title={title}
					okButtonProps={{
						disabled: !isMatching,
						danger: true,
					}}
					okText="Delete"
					onOk={this.handleOk}
					open={isVisible}
					onCancel={this.handleVisibility}
				>
					<Typography.Paragraph>
						{text || (
							<React.Fragment>
								Type the {name} {valueType || 'name'} <strong>{value}</strong> below
								to delete the {name}. This action cannot be undone.
							</React.Fragment>
						)}
					</Typography.Paragraph>
					<Input
						value={input}
						placeholder={`Confirm ${name} name`}
						name="input"
						onChange={this.handleInput}
					/>
				</Modal>
			</React.Fragment>
		);
	}
}

DeleteModal.propTypes = {
	name: PropTypes.string.isRequired,
	value: PropTypes.string.isRequired,
	children: childrenProp.isRequired,
	onDelete: PropTypes.func.isRequired,
	title: PropTypes.string.isRequired,
	valueType: PropTypes.string,
	text: PropTypes.oneOf([PropTypes.string, PropTypes.node]),
};

DeleteModal.defaultProps = {
	text: undefined,
	valueType: '',
};

export default DeleteModal;
