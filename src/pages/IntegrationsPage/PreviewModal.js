import React from 'react';
import { Button, Modal } from 'antd';
import { css } from 'react-emotion';
import { func, string, bool } from 'prop-types';
import StoreFrontPreview from './StoreFrontPreview';

const modalStyles = css`
	top: 0 !important;
	height: 100vh;
	padding-bottom: 0 !important;
	overflow-y: scroll;
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
		const { preferences, label, isRecommendation } = this.props;
		return (
			<React.Fragment>
				<Modal
					title={label}
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
						preferences={preferences}
						isRecommendation={isRecommendation}
					/>
				</Modal>
				<Button onClick={this.showModal} type="primary" size="large">
					{label}
				</Button>
			</React.Fragment>
		);
	}
}

PreviewModal.propTypes = {
	preferences: func.isRequired,
	isRecommendation: bool,
	label: string,
};

PreviewModal.defaultProps = {
	isRecommendation: false,
	label: 'StoreFront Preview',
};

export default PreviewModal;
