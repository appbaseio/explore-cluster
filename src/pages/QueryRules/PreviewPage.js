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

function PreviewPage({ showModal, handleCancel, selectedIndexes, rulesPayload }) {
	const [visible, setVisible] = useState(false);
	const [testSettings, setTestSetting] = useState({});

	useEffect(() => {
		setVisible(showModal);
		setSettingsPayload();
	}, [showModal]);

	function setSettingsPayload() {
		const newRulesPayload = {};
		rulesPayload?.query?.map((item) => {
			if(item.id === "search") {
				newRulesPayload["search"] = item;
			} else {
				newRulesPayload["result"] = item;
			}
		})
		setTestSetting(newRulesPayload);
	}

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
					testSettings={testSettings}
					// testSettings={{
					// 	...localRelevancy,
					// 	search: {
					// 		...localRelevancy.search,
					// 		fieldWeights: get(localRelevancy, 'search.fieldWeights', []).map((i) =>
					// 			Number(i),
					// 		),
					// 	},
					// }}
					hasTestSettings
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
	rulesPayload: PropTypes.object,
};

PreviewPage.defaultProps = {
	showModal: false,
	selectedIndexes: ['*'],
	rulesPayload: {}
};

export default PreviewPage;
