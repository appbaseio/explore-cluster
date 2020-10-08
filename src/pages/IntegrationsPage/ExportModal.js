import React from 'react';
import { Button, Modal, Form } from 'antd';
import { FieldGroup } from 'react-reactive-form';
import { func } from 'prop-types';
import ExportToShopify from './ExportToShopify';
import ExportToOther from './ExportToOther';
import TextInput from '../../components/Form/Input';
import { FormContext } from './utils';

class ExportModal extends React.Component {
	state = {
		visible: false,
		showInstruction: false,
	};

	getComponentByValue(value) {
		const { preferences } = this.props;
		const { get } = this.context;
		if (value === 'shopify') {
			return <ExportToShopify control={get('exportSettings')} preferences={preferences} />;
		}
		return <ExportToOther control={get('exportSettings')} preferences={preferences} />;
	}

	showModal = () => {
		this.setState({
			visible: true,
		});
	};

	handleOk = () => {
		const { showInstruction } = this.state;
		if (showInstruction) {
			this.setState({
				showInstruction: false,
				visible: false,
			});
		} else {
			this.setState({
				showInstruction: true,
			});
		}
	};

	handleCancel = () => {
		this.setState({
			visible: false,
			showInstruction: false,
		});
	};

	static contextType = FormContext;

	render() {
		const { visible, showInstruction } = this.state;
		const { get } = this.context;
		return (
			<FieldGroup strict={false} control={get('exportSettings')}>
				{({ invalid }) => (
					<React.Fragment>
						<Modal
							title="Export Code"
							visible={visible}
							okText={showInstruction ? 'Ok' : 'Continue'}
							onOk={this.handleOk}
							onCancel={this.handleCancel}
							destroyOnClose
							okButtonProps={{
								disabled: invalid,
							}}
							width="calc(100% - 100px)"
						>
							{showInstruction ? (
								this.getComponentByValue(
									get('exportSettings.type')
										? get('exportSettings.type').value
										: '',
								)
							) : (
								<Form>
									<TextInput
										name="credentials"
										label="API Credentials"
										inputProps={{
											placeholder: 'Enter API credentials',
										}}
									/>
								</Form>
							)}
						</Modal>
						<Button onClick={this.showModal} size="large">
							Export Code
						</Button>
					</React.Fragment>
				)}
			</FieldGroup>
		);
	}
}

ExportModal.propTypes = {
	preferences: func.isRequired,
};

export default ExportModal;
