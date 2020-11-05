import React from 'react';
import { Button, Modal, Form, Switch, Radio } from 'antd';
import { FieldGroup, FieldControl } from 'react-reactive-form';
import { func } from 'prop-types';
import get from 'lodash/get';
import ExportToShopify from './ExportToShopify';
import ExportToOther from './ExportToOther';
import ExportToHackable from './ExportToHackable';
import TextInput from '../../components/Form/Input';
import { FormContext } from './utils';

class ExportModal extends React.Component {
	state = {
		visible: false,
		showInstruction: false,
	};

	getComponentByValue(exportSettingsControl) {
		const { preferences } = this.props;
		if (get(exportSettingsControl, 'value.exportAs') === 'hackable') {
			return <ExportToHackable control={exportSettingsControl} preferences={preferences} />;
		}
		if (get(exportSettingsControl, 'value.type') === 'shopify') {
			return <ExportToShopify control={exportSettingsControl} preferences={preferences} />;
		}
		return <ExportToOther control={exportSettingsControl} preferences={preferences} />;
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
		const { get: getControl } = this.context;
		const exportSettingsControl = getControl('exportSettings');
		return (
			<FieldGroup strict={false} control={exportSettingsControl}>
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
								this.getComponentByValue(exportSettingsControl)
							) : (
								<Form colon={false}>
									<FieldControl name="exportAs">
										{({ handler }) => (
											<Form.Item label="Select export mode">
												<Radio.Group {...handler()}>
													<Radio value="embed">Embed Mode</Radio>
													<Radio value="hackable">
														Hackable Mode (Export as CodeSandbox)
													</Radio>
												</Radio.Group>
											</Form.Item>
										)}
									</FieldControl>
									<TextInput
										name="credentials"
										label="API Credentials"
										inputProps={{
											placeholder: 'Enter API credentials',
										}}
									/>
									<div style={{ marginBottom: 24 }}>
										API credentials allow secure access to the appbase.io
										clusters. Check docs at{' '}
										<a
											target="blank"
											href="https://docs.appbase.io/docs/security/credentials/"
										>
											here
										</a>
										. <br />
										You can get the API credentials from{' '}
										<a href="credentials">API Credentials</a> page under{' '}
										<strong>Access Control</strong>.
									</div>

									<FieldControl name="openAsPage">
										{({ handler }) => (
											<>
												<Form.Item
													label="The search will appear with a CTA button. Do you instead
										want to show the search view directly?"
												>
													<Switch {...handler('checkbox')} />
												</Form.Item>
											</>
										)}
									</FieldControl>
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
