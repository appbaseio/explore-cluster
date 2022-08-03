import React from 'react';
import { Button, Icon, Modal, Popover } from 'antd';
import { css } from 'react-emotion';
import get from 'lodash/get';
import { func, string, bool, object, number, oneOfType } from 'prop-types';
import { FieldGroup } from 'react-reactive-form';
import StoreFrontPreview from './StoreFrontPreview';
import SandpackModal from './SandpackModal';
import PageRoutes from './PageRoutes';
import Loader from '../../components/Loader';

export const modalStyles = css`
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
	.sp-preview-iframe {
		height: 100%;
		width: 100%;
	}
	.sp-preview-container {
		height: 100%;
	}
	.sp-preview-iframe {
		border-width: 0px;
	}
`;

class PreviewModal extends React.Component {
	state = {
		visible: false,
		currentProduct: undefined,
		isMobile: false,
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

	handleViewChange = () => {
		this.setState((prevState) => ({
			isMobile: !prevState.isMobile,
		}));
	};

	render() {
		const { visible, currentProduct, isMobile } = this.state;
		const {
			pipeline,
			preferences,
			label,
			isRecommendation,
			buttonProps,
			widgetId,
			displayProductPicker,
			similarToField,
			preferenceId,
			getPreferencesPayload,
			form,
			isEditorLoading,
			setIsEditorLoading,
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
					title={
						<div
							style={{
								display: 'flex',
								alignItems: 'center',
								width: '50%',
								justifyContent: 'space-between',
							}}
						>
							{title}
							<span style={{ marginLeft: '13%' }}>
								<FieldGroup
									control={form}
									strict={false}
									render={() => (
										<PageRoutes
											getPreferencesPayload={getPreferencesPayload}
											preferences={preferences()}
											form={form}
											setIsEditorLoading={setIsEditorLoading}
										/>
									)}
								/>
							</span>

							<span>
								{!displayProductPicker ? (
									<Button onClick={this.handleViewChange}>
										<Icon
											style={{
												fontSize: 20,
												position: 'relative',
												top: '1px',
												margin: '0 7px',
											}}
											type={isMobile ? 'desktop' : 'mobile'}
										/>
									</Button>
								) : null}
							</span>
						</div>
					}
					visible={visible}
					okText="Save"
					onOk={this.handleOk}
					onCancel={this.handleCancel}
					destroyOnClose
					footer={null}
					width="100%"
					className={modalStyles}
				>
					<div
						style={{
							display: 'flex',
							justifyContent: 'center',
						}}
					>
						{isRecommendation ? (
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
						) : (
							<div
								style={{
									border: isMobile ? '1px solid rgb(204, 204, 204)' : undefined,
									width: isMobile ? 400 : '100%',
								}}
							>
								{isEditorLoading ? (
									<Loader />
								) : (
									<SandpackModal
										preferenceId={preferenceId}
										preferences={preferences()}
									/>
								)}
							</div>
						)}
					</div>
				</Modal>
				<Button onClick={this.showModal} type="primary" size="large" {...buttonProps}>
					<Icon type="eye" /> {label}
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
	preferenceId: string,
	getPreferencesPayload: func.isRequired,
	form: object,
	isEditorLoading: bool,
	setIsEditorLoading: func,
};

PreviewModal.defaultProps = {
	widgetId: undefined,
	pipeline: undefined,
	similarToField: undefined,
	displayProductPicker: false,
	isRecommendation: false,
	label: 'UI Preview',
	buttonProps: null,
	preferenceId: '',
	form: {},
	isEditorLoading: false,
	setIsEditorLoading: () => {},
};

export default PreviewModal;
