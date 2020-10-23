import React from 'react';
import { Button, Modal, Form, Switch } from 'antd';
import { FieldGroup, FieldControl } from 'react-reactive-form';
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
									API credentials allow secure access to the appbase.io clusters.
									Check docs at{' '}
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
									<FieldControl name="openWithModal">
										{({ handler, value }) => (
											<>
												<Form.Item
													label="The search will appear with a CTA button. Do you instead
										want to show the search view directly?"
												>
													<Switch {...handler('checkbox')} />
												</Form.Item>

												{!value ? (
													<>
														<div>
															By default, the above CTA is relatively
															positioned. Place it in your DOM next to
															the element where you want it to appear.
															If you wish it to position it
															absolutely, add a style attribute. For
															example, the following snippet positions
															it to the top left.
														</div>
														<div>
															<pre
																css={{
																	background: '#eee',
																	padding: '20px 20px',
																	margin: '20px 0',
																}}
															>
																{`<div id="reactivesearch-shopify-1" style="position:absolute;top:10px;left:10px;" />`}
															</pre>
														</div>
													</>
												) : null}
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
