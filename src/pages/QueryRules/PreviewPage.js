import React, { useEffect, useState } from 'react';
import { Modal } from 'antd';
import PropTypes from 'prop-types';
import { css } from 'react-emotion';
import SearchPreview from '../SandboxPage/components/SearchPreview';

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

function PreviewPage({ showModal, handleCancel, selectedIndexes }) {
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		setVisible(showModal);
	}, [showModal]);

	return (
		<div>
			<Modal
				title="Preview"
				visible={visible}
				okText="Save"
				onOk={handleCancel}
				onCancel={handleCancel}
				destroyOnClose
				footer={null}
				width="100%"
				className={modalStyles}
			>
				<SearchPreview
					app={selectedIndexes.join(',')}
					// testSettings={{
					// 	...localRelevancy,
					// 	search: {
					// 		...localRelevancy.search,
					// 		fieldWeights: get(localRelevancy, 'search.fieldWeights', []).map((i) =>
					// 			Number(i),
					// 		),
					// 	},
					// }}
					hasTestSettings={false}
					// handleModal
					// showFeaturedProducts
					// selectButtonLabel={selectButtonLabel}
					// value={value}
					// onChange={onChange}
				/>
			</Modal>
		</div>
	);
}

PreviewPage.propTypes = {
	showModal: PropTypes.bool,
	handleCancel: PropTypes.func.isRequired,
	selectedIndexes: PropTypes.array,
};

PreviewPage.defaultProps = {
	showModal: false,
	selectedIndexes: ['*'],
};

export default PreviewPage;
