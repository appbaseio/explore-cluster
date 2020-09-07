import React from 'react';
import PropTypes from 'prop-types';
import { Affix, Button } from 'antd';
import SearchPreviewModal from '../SearchPreviewModal';

function SettingsFooter({
	loading,
	resetState,
	onReset,
	reviewAndSave = () => {},
	showSearchPreview,
	searchPreviewModalProps,
	app,
	showReset = true,
}) {
	return (
		<Affix offsetBottom={0}>
			<div className="flex space-between card-footer">
				{app && showSearchPreview ? (
					<SearchPreviewModal {...searchPreviewModalProps} app={app} />
				) : (
					<div />
				)}
				<div>
					{showReset && (
						<Button
							onClick={onReset}
							style={{ marginRight: 10 }}
							size="large"
							loading={resetState.loading}
							disabled={loading}
							data-cy="reset-to-default"
						>
							Reset To Default Settings
						</Button>
					)}
					{reviewAndSave()}
				</div>
			</div>
		</Affix>
	);
}

SettingsFooter.propTypes = {
	searchPreviewModalProps: PropTypes.object,
	loading: PropTypes.bool,
	resetState: PropTypes.object,
	onReset: PropTypes.func.isRequired,
	reviewAndSave: PropTypes.func,
	showSearchPreview: PropTypes.bool,
	app: PropTypes.string,
	showReset: PropTypes.bool,
};

SettingsFooter.defaultProps = {
	searchPreviewModalProps: {},
	loading: false,
	resetState: {},
	reviewAndSave: () => {},
	showSearchPreview: false,
	app: undefined,
	showReset: true,
};

export default SettingsFooter;
