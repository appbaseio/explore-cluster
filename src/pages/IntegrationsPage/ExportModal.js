import React from 'react';
import { Button, Modal, Switch, Radio, Form } from 'antd';
import { FieldGroup, FieldControl } from 'react-reactive-form';
import { func, object, number, bool, oneOfType, string } from 'prop-types';
import get from 'lodash/get';
import ExportToShopify from './ExportToShopify';
import ExportToOther from './ExportToOther';
import ExportToHackable from './ExportToHackable';
import { FormContext } from './utils';

class ExportModal extends React.Component {
	state = {
		visible: false,
		showInstruction: false,
	};

	getComponentByValue(exportSettingsControl) {
		const { preferences, isRecommendation, widgetId } = this.props;
		if (get(exportSettingsControl, 'value.exportAs') === 'hackable') {
			return (
				<ExportToHackable
					isRecommendation={isRecommendation}
					widgetId={widgetId}
					control={exportSettingsControl}
					preferences={preferences}
				/>
			);
		}
		if (get(exportSettingsControl, 'value.type') === 'shopify') {
			return (
				<ExportToShopify
					isRecommendation={isRecommendation}
					widgetId={widgetId}
					control={exportSettingsControl}
					preferences={preferences}
				/>
			);
		}
		return (
			<ExportToOther
				isRecommendation={isRecommendation}
				widgetId={widgetId}
				control={exportSettingsControl}
				preferences={preferences}
			/>
		);
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
		const { buttonProps, isRecommendation } = this.props;
		const { get: getControl } = this.context;
		const exportSettingsControl = getControl('exportSettings');
		return (
			<FieldGroup strict={false} control={exportSettingsControl}>
				{({ invalid }) => (
					<React.Fragment>
						<Modal
							title="Export Code"
							open={visible}
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
									{!isRecommendation && (
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
									)}
								</Form>
							)}
						</Modal>
						<Button onClick={this.showModal} size="large" {...buttonProps}>
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
	isRecommendation: bool,
	buttonProps: object,
	widgetId: oneOfType([number, string]),
};

ExportModal.defaultProps = {
	buttonProps: null,
	isRecommendation: false,
	widgetId: undefined,
};

export default ExportModal;
