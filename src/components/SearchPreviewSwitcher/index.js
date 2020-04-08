import React from 'react';
import * as PropTypes from 'prop-types';
import { Button, Modal } from 'antd';
import { IndexSwitcher } from '../IndexSwitcher';
import { modalStyles } from '../SearchPreviewModal/SearchPreviewModal';
import SearchPreview from '../../pages/SandboxPage/components/SearchPreview';

const SearchPreviewSwitcher = ({ app, filteredApps, onCancel, onSelect, visible }) => (
	<>
		<IndexSwitcher
			filteredApps={filteredApps}
			item={{
				label: (
					<Button type="primary" size="large" ghost>
						Test Search Relevancy
					</Button>
				),
			}}
			onSelect={onSelect}
		/>
		<Modal
			footer={null}
			width="95%"
			className={modalStyles}
			onCancel={onCancel}
			destroyOnClose
			visible={visible}
		>
			<SearchPreview app={app} />
		</Modal>
	</>
);

SearchPreviewSwitcher.propTypes = {
	app: PropTypes.string.isRequired,
	filteredApps: PropTypes.array,
	onCancel: PropTypes.func.isRequired,
	onSelect: PropTypes.func.isRequired,
	visible: PropTypes.bool,
};

SearchPreviewSwitcher.defaultProps = {
	filteredApps: [],
	visible: false,
};

export default SearchPreviewSwitcher;
