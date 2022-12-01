import React, { useState } from 'react';
import { EyeOutlined } from '@ant-design/icons';
import { Modal } from 'antd';
import { func, object, string } from 'prop-types';
import styled from 'react-emotion';
import get from 'lodash/get';
import CopyCode from './CopyCode';
import LivePreview from './LivePreview';

const ModalContainer = styled('div')`
	.preview-container {
		padding: 20px;
		background: #e3e4e5;
		display: flex;
		justify-content: center;
	}
	.section-header {
		font-weight: bold;
		margin-top: 20px;
	}
	.icon-active {
		&:hover {
			color: #40a9ff;
		}
	}
	.copy-icon {
		float: right;
		font-size: 18px;
	}
`;

const SearchPreviewModal = ({ form, backend, getPreferencesPayload }) => {
	const [isOpen, setIsOpen] = useState(false);
	const indexSettings = form && form.get('indexSettings') ? form.get('indexSettings').value : {};
	const pipeline = form && form.get('pipeline') ? form.get('pipeline').value : '';
	const secondaryPipeline = get(indexSettings, 'index', '');

	const handleCancel = () => {
		setIsOpen(false);
	};

	const getSearchConfig = () => {
		const {
			autoSuggest,
			autoSuggestionSettings,
			resultTitle,
			resultDescription,
			showVoiceSearch,
		} = form.value;
		let valueFields = ['term_s'];
		if (resultTitle) {
			valueFields = [...valueFields, resultTitle.split('~')[0]];
		} else if (resultDescription) {
			valueFields = [...valueFields, resultDescription.split('~')[0]];
		}

		return {
			autoSuggest,
			...autoSuggestionSettings,
			showVoiceSearch,
			dataField: resultTitle.split('~')[0],
			popularSuggestionsConfig: {
				size: 3,
				sectionLabel: '<h3 class="section-label">Popular Suggestions</h3>',
			},
			recentSuggestionsConfig: {
				size: 3,
				sectionLabel: '<h3 class="section-label">Recent Suggestions</h3>',
			},
			enableIndexSuggestions: true,
			indexSuggestionsConfig: {
				sectionLabel: '<h3 class="section-label">Index Suggestions</h3>',
				size: 3,
				valueFields,
			},
		};
	};

	return (
		<>
			<EyeOutlined
				onClick={() => setIsOpen(true)}
				style={{ color: '#40a9ff', marginLeft: 10 }}
			/>
			<Modal
				title="Search Preview"
				visible={isOpen}
				onOk={handleCancel}
				onCancel={handleCancel}
				width="80%"
				bodyStyle={{ height: '80%' }}
			>
				<ModalContainer>
					<LivePreview
						backend={backend}
						form={form}
						getSearchConfig={getSearchConfig}
						indexSettings={indexSettings}
						pipeline={secondaryPipeline || pipeline}
					/>
					<CopyCode
						backend={backend}
						form={form}
						getSearchConfig={getSearchConfig}
						indexSettings={indexSettings}
						pipeline={secondaryPipeline || pipeline}
						getPreferencesPayload={getPreferencesPayload}
					/>
				</ModalContainer>
			</Modal>
		</>
	);
};

SearchPreviewModal.propTypes = {
	form: object,
	backend: string.isRequired,
	getPreferencesPayload: func,
};

SearchPreviewModal.defaultProps = {
	form: {},
	getPreferencesPayload: () => {},
};

export default SearchPreviewModal;
