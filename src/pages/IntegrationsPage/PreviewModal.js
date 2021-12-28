import React from 'react';
import { Button, Modal, Popover } from 'antd';
import { css } from 'react-emotion';
import get from 'lodash/get';
import { func, string, bool, object, number, oneOfType } from 'prop-types';
import StoreFrontPreview from './StoreFrontPreview';

const modalStyles = css`
	top: 0 !important;
	height: 100vh;
	padding-bottom: 0 !important;
	.ant-modal {
		top: 0;
	}
	.ant-modal-content {
		border-radius: 0;
		min-height: 100%;
		.ant-modal-body {
			padding: 0;
		}
	}
	@media (max-width: 767px) {
		margin: 0 !important;
	}
`;

class PreviewModal extends React.Component {
	state = {
		visible: false,
		currentProduct: undefined,
	};

	showModal = () => {
		this.setState({
			visible: true,
			currentProduct: undefined,
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

	handleProductSelection = (item) => {
		this.setState({
			currentProduct: item,
		});
	};

	render() {
		const { visible, currentProduct } = this.state;
		const {
			pipeline,
			preferences,
			label,
			isRecommendation,
			buttonProps,
			widgetId,
			displayProductPicker,
			similarToField,
		} = this.props;
		let title = label;
		if (displayProductPicker) {
			if (!currentProduct) {
				title = 'Select a product to continue';
			} else {
				const productId = get(currentProduct, '_id');
				if (productId) {
					title = (
						<span>
							Preview for Similar To Recommendations based on{' '}
							<Popover
								content={
									<pre
										style={{
											maxWidth: 400,
											maxHeight: 600,
										}}
									>
										{JSON.stringify(currentProduct, null, 2)}
									</pre>
								}
								title="Product Details"
							>
								<Button
									style={{
										padding: 0,
									}}
									type="link"
								>
									{productId}
								</Button>
							</Popover>
						</span>
					);
				}
			}
		}
		return (
			<React.Fragment>
				<Modal
					title={title}
					visible={visible}
					okText="Save"
					onOk={this.handleOk}
					onCancel={this.handleCancel}
					destroyOnClose
					footer={null}
					width="100%"
					className={modalStyles}
				>
					<StoreFrontPreview
						pipeline={pipeline}
						preferences={preferences}
						isRecommendation={isRecommendation}
						widgetId={widgetId}
						displayProductPicker={displayProductPicker}
						buttonProps={buttonProps}
						similarToField={similarToField}
						onSelectProduct={this.handleProductSelection}
					/>
				</Modal>
				<Button onClick={this.showModal} type="primary" size="large" {...buttonProps}>
					{label}
				</Button>
			</React.Fragment>
		);
	}
}

PreviewModal.propTypes = {
	preferences: func.isRequired,
	isRecommendation: bool,
	displayProductPicker: bool,
	pipeline: string,
	similarToField: string,
	label: string,
	widgetId: oneOfType([number, string]),
	buttonProps: object,
};

PreviewModal.defaultProps = {
	widgetId: undefined,
	pipeline: undefined,
	similarToField: undefined,
	displayProductPicker: false,
	isRecommendation: false,
	label: 'Preview',
	buttonProps: null,
};

export default PreviewModal;
