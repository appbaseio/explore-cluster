import React from 'react';
import { Button, Modal } from 'antd';
import { func } from 'prop-types';
import StoreFrontPreview from './StoreFrontPreview';

class ExportModal extends React.Component {
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
		const { preferences } = this.props;
		return (
			<React.Fragment>
				<Modal
					title="StoreFront Preview"
					visible={visible}
					okText="Save"
					onOk={this.handleOk}
					onCancel={this.handleCancel}
					destroyOnClose
					footer={null}
					width="100%"
				>
					<StoreFrontPreview preferences={preferences} />
				</Modal>
				<Button onClick={this.showModal} type="primary" size="large">
					StoreFront Preview
				</Button>
			</React.Fragment>
		);
	}
}

ExportModal.propTypes = {
	preferences: func.isRequired,
};

export default ExportModal;
