import React from 'react';
import { Button, Modal, Input, Form } from 'antd';
import { FieldGroup, FieldControl } from 'react-reactive-form';

class CustomizeFilter extends React.Component {
	state = {
		visible: false,
	};

	showModal = () => {
		this.setState({
			visible: true,
		});
	};

	handleOk = () => {
		this.setState({
			visible: false,
		});
	};

	handleCancel = () => {
		this.setState({
			visible: false,
		});
	};

	render() {
		const { visible } = this.state;
		return (
			<React.Fragment>
				<Button onClick={this.showModal}>Customize</Button>
				<Modal
					title="Customize Filter"
					visible={visible}
					okText="Save"
					onOk={this.handleOk}
					onCancel={this.handleCancel}
				>
					<FieldGroup name="customize">
						{() => (
							<Form>
								<FieldControl name="dataField">
									{({ disabled, handler }) =>
										disabled ? null : (
											<Form.Item label="DataField">
												<Input {...handler()} />
											</Form.Item>
										)
									}
								</FieldControl>
								<FieldControl name="title">
									{({ handler }) => (
										<Form.Item label="Title">
											<Input {...handler()} />
										</Form.Item>
									)}
								</FieldControl>
							</Form>
						)}
					</FieldGroup>
				</Modal>
			</React.Fragment>
		);
	}
}

export default CustomizeFilter;
