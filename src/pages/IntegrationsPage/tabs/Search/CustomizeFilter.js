import React from 'react';
import { Button, Modal, Form } from 'antd';
import { string, object, func } from 'prop-types';
import { FieldGroup, FieldControl } from 'react-reactive-form';
import DataFieldSelector from '../../../../components/Form/DataFieldSelector';
import TextInput from '../../../../components/Form/Input';

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
		const { onSave, control } = this.props;
		if (onSave) {
			onSave(control);
		}
		this.setState({
			visible: false,
		});
	};

	handleCancel = () => {
		const { onCancel } = this.props;
		if (onCancel) {
			onCancel();
		}
		this.setState({
			visible: false,
		});
	};

	render() {
		const { visible } = this.state;
		const { buttonLabel, control, buttonProps } = this.props;
		return (
			<React.Fragment>
				<Button {...buttonProps} onClick={this.showModal}>
					{buttonLabel}
				</Button>
				<FieldGroup
					strict={false}
					name={control ? undefined : 'customize'}
					control={control}
				>
					{({ pristine, invalid }) => (
						<Modal
							title="Customize Filter"
							visible={visible}
							onOk={this.handleOk}
							onCancel={this.handleCancel}
							destroyOnClose
							footer={[
								<Button key="back" onClick={this.handleCancel}>
									Cancel
								</Button>,
								<Button
									disabled={invalid || pristine}
									key="submit"
									type="primary"
									onClick={this.handleOk}
								>
									Save
								</Button>,
							]}
						>
							<Form>
								<FieldControl name="dataField">
									{(formControl) =>
										formControl.disabled ? null : (
											<Form.Item label="DataField">
												<DataFieldSelector control={formControl} />
											</Form.Item>
										)
									}
								</FieldControl>
								<Form.Item>
									<TextInput
										name="title"
										label="Title"
										inputProps={{
											placeholder: 'Enter title',
										}}
									/>
								</Form.Item>
							</Form>
						</Modal>
					)}
				</FieldGroup>
			</React.Fragment>
		);
	}
}

CustomizeFilter.defaultProps = {
	buttonLabel: 'Customize',
	control: null,
	onSave: null,
	onCancel: null,
	buttonProps: null,
};
CustomizeFilter.propTypes = {
	buttonLabel: string,
	buttonProps: object,
	control: object,
	onSave: func,
	onCancel: func,
};

export default CustomizeFilter;
