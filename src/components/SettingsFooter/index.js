import React from 'react';
import { Affix, Button } from 'antd';

// eslint-disable-next-line import/prefer-default-export
export function SettingsFooter({ loading, resetState, onReset, reviewAndSave = () => {} }) {
	return (
		<Affix offsetBottom={0}>
			<div className="flex flex-end card-footer">
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
		</Affix>
	);
}
