import React from 'react';
import PropTypes from 'prop-types';
import { Button, Modal, Tooltip } from 'antd';
import { css } from 'emotion';

import SearchPreview from '../../pages/SandboxPage/components/SearchPreview';

export const modalStyles = css`
	&.ant-modal {
		top: 5% !important;
	}

	.ant-modal-body {
		max-height: 90vh;
		overflow-y: scroll;
	}
`;

class SearchPreviewModal extends React.Component {
	state = {
		visible: false,
	};

	toggleVisibilty = () => {
		this.setState((prevState) => ({
			visible: !prevState.visible,
		}));
	};

	render() {
		const { visible } = this.state;
		const { app, searchPreviewProps, buttonProps } = this.props;
		return (
			<React.Fragment>
				{buttonProps && buttonProps.showTooltip && buttonProps.tooltip ? (
					<Tooltip title={buttonProps.tooltip}>
						<Button type="primary" size="large" onClick={this.toggleVisibilty} ghost>
							Test Search Relevancy
						</Button>
					</Tooltip>
				) : (
					<Button type="primary" size="large" onClick={this.toggleVisibilty} ghost>
						Test Search Relevancy
					</Button>
				)}

				<Modal
					footer={null}
					width="95%"
					className={modalStyles}
					onCancel={this.toggleVisibilty}
					destroyOnClose
					visible={visible}
				>
					<SearchPreview app={app} {...searchPreviewProps} />
				</Modal>
			</React.Fragment>
		);
	}
}

SearchPreviewModal.propTypes = {
	app: PropTypes.string.isRequired,
	searchPreviewProps: PropTypes.object,
	buttonProps: PropTypes.object,
};

SearchPreviewModal.defaultProps = {
	searchPreviewProps: {},
	buttonProps: {},
};

export default SearchPreviewModal;
