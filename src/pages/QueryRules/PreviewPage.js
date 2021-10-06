import React, { useEffect, useState } from 'react';
import { Modal, Tabs } from 'antd';
import PropTypes from 'prop-types';
import { css } from 'react-emotion';
import { connect } from 'react-redux';
import SearchPreview from '../SandboxPage/components/SearchPreview';
import { setSearchState } from '../../batteries/modules/actions';

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

const { TabPane } = Tabs;

function PreviewPage({ showModal, handleCancel, selectedIndexes, previewType, onChange }) {
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		setVisible(showModal);
	}, [showModal]);

	return (
		<div>
			<Modal
				title="Query Rules Preview"
				visible={visible}
				okText="Save"
				onOk={handleCancel}
				onCancel={handleCancel}
				destroyOnClose
				footer={null}
				width="100%"
				className={modalStyles}
			>
				{previewType === 'preview' ? (
					<SearchPreview app={selectedIndexes.join(',')} page="rules" />
				) : (
					<Tabs defaultActiveKey="1" onChange={onChange}>
						<TabPane tab="Without rule applied" key="1">
							<SearchPreview app={selectedIndexes.join(',')} page="rules" />
						</TabPane>
						<TabPane tab="With rule applied" key="2">
							<SearchPreview app={selectedIndexes.join(',')} page="rules" />
						</TabPane>
					</Tabs>
				)}
			</Modal>
		</div>
	);
}

PreviewPage.propTypes = {
	showModal: PropTypes.bool,
	handleCancel: PropTypes.func.isRequired,
	selectedIndexes: PropTypes.array,
	previewType: PropTypes.string,
	onChange: PropTypes.func.isRequired,
};

PreviewPage.defaultProps = {
	showModal: false,
	selectedIndexes: ['*'],
	previewType: 'preview',
};

const mapDispatchToProps = (dispatch) => ({
	saveState: (state) => dispatch(setSearchState(state)),
});

export default connect(null, mapDispatchToProps)(PreviewPage);
