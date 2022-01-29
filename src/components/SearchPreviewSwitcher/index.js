import React from 'react';
import * as PropTypes from 'prop-types';
import { Button, Modal } from 'antd';
import IndexSwitcher from '../IndexSwitcher';
import { modalStyles } from '../SearchPreviewModal/SearchPreviewModal';
import SearchPreview from '../../pages/SandboxPage/components/SearchPreview';

const SearchPreviewSwitcher = ({ app, filteredApps, onCancel, onSelect, visible, page }) => {
	const indexName = sessionStorage.getItem('appName');

	return (
		<>
			<IndexSwitcher
				filteredApps={filteredApps}
				item={{
					label: (
						<Button
							type="primary"
							size="large"
							ghost
							onClick={() => {
								if (indexName) onSelect(indexName);
							}}
						>
							Test Search Relevancy
						</Button>
					),
				}}
				onSelect={onSelect}
			/>
			{visible && (
				<Modal
					footer={null}
					width="95%"
					className={modalStyles}
					onCancel={onCancel}
					destroyOnClose
					visible={visible}
				>
					<SearchPreview app={app} page={page} />
				</Modal>
			)}
		</>
	);
};

SearchPreviewSwitcher.propTypes = {
	app: PropTypes.string,
	filteredApps: PropTypes.array,
	onCancel: PropTypes.func.isRequired,
	onSelect: PropTypes.func.isRequired,
	visible: PropTypes.bool,
	page: PropTypes.string,
};

SearchPreviewSwitcher.defaultProps = {
	filteredApps: [],
	visible: false,
	app: undefined,
	page: '',
};

export default SearchPreviewSwitcher;
