import React from 'react';
import { Affix, Button } from 'antd';

// eslint-disable-next-line import/prefer-default-export
export function SettingsFooter({
	loading,
	onSubmit,
	resetState,
	onReset,
	saveText = 'Save Settings',
	disabled = false,
	reviewAndSave = () => {},
}) {
	return (
		<Affix offsetBottom={0}>
			<div className="flex flex-end card-footer">
				{reviewAndSave()}
				<Button
					onClick={onReset}
					style={{ marginRight: 10 }}
					size="large"
					loading={resetState.loading}
					disabled={loading}
				>
					Reset to Default Settings
				</Button>
				<Button
					loading={loading}
					size="large"
					type="primary"
					onClick={onSubmit}
					disabled={resetState.loading || disabled}
				>
					{saveText}
				</Button>
			</div>
		</Affix>
	);
}
