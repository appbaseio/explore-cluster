import React from 'react';
import { Modal, Input, Typography } from 'antd';

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
		const { name, value, children, title, text } = this.props;
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
						type: 'danger',
					}}
					okText="Delete"
					onOk={this.handleOk}
					visible={isVisible}
					onCancel={this.handleVisibility}
				>
					<Typography.Paragraph>
						{text || (
							<React.Fragment>
								Type the {name} name <strong>{value}</strong> below to delete the{' '}
								{name}. This action cannot be undone.
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

export default DeleteModal;
