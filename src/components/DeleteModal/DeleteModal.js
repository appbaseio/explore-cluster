import React from 'react';
import { createRoot } from 'react-dom/client';
import PropTypes from 'prop-types';
import { Modal, Input, Typography } from 'antd';
import { children as childrenProp } from '../../utils/prop-types';

class DeleteModal extends React.Component {
	static open = (props) => {
		const container = document.createElement('div');
		document.body.appendChild(container);

		const root = createRoot(container);

		const handleClose = () => {
			props.onDelete();
			root.unmount();
			document.body.removeChild(container);
		};

		root.render(<DeleteModal {...props} onDelete={handleClose} isVisible />);
	};

	constructor(props) {
		super(props);
		this.state = {
			input: '',
			isVisible: !!props.isVisible,
		};
	}

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
				{children
					? children({
							handleModal: this.handleVisibility,
					  })
					: null}
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
	children: childrenProp,
	onDelete: PropTypes.func.isRequired,
	title: PropTypes.string.isRequired,
	valueType: PropTypes.string,
	text: PropTypes.oneOf([PropTypes.string, PropTypes.node]),
	isVisible: PropTypes.bool,
};

DeleteModal.defaultProps = {
	text: undefined,
	valueType: '',
	isVisible: false,
	children: () => <></>,
};

export default DeleteModal;
