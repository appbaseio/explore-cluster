import React from 'react';
import { Affix, Button } from 'antd';
import SearchPreviewModal from '../SearchPreviewModal';

// eslint-disable-next-line import/prefer-default-export
export function SettingsFooter({
	loading,
	resetState,
	onReset,
	reviewAndSave = () => {},
	showSearchPreview,
	app,
}) {
	return (
		<Affix offsetBottom={0}>
			<div className="flex space-between card-footer">
				{app && showSearchPreview ? <SearchPreviewModal app={app} /> : <div />}
				<div>
					<Button
						onClick={onReset}
						style={{ marginRight: 10 }}
						size="large"
						loading={resetState.loading}
						disabled={loading}
					>
						Reset to Default Settings
					</Button>
					{reviewAndSave()}
				</div>
			</div>
		</Affix>
	);
}
