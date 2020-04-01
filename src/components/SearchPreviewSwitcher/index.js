import { Button, Modal } from 'antd';
import React from 'react';
import { IndexSwitcher } from '../IndexSwitcher';
import { modalStyles } from '../SearchPreviewModal/SearchPreviewModal';
import SearchPreview from '../../pages/SandboxPage/components/SearchPreview';

// eslint-disable-next-line import/prefer-default-export
export function SearchPreviewSwitcher({ app, filteredApps, onCancel, onSelect, visible }) {
	return (
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
}
