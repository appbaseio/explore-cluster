import React, { useState } from 'react';
import { Alert, Button, message } from 'antd';
import { bool, func, string } from 'prop-types';
import { connect } from 'react-redux';
import { commitCode, generateInlineSandboxURL } from '../../utils/sandpack-generator';
import { saveSearchPreference } from '../../../../batteries/modules/actions';
import { transformPreferences } from '../../utils/index';

const UpgradeVersion = ({
	setShowNotification,
	setShowTemplateUpdateBanner,
	preferenceId,
	templateVersionId,
	updateSearchPreferences,
	getPreferencesPayload,
	setTemplateVersionId,
}) => {
	const [isLoading, setIsLoading] = useState(false);

	const handleCommitCode = async () => {
		setIsLoading(true);
		const newPreferences = transformPreferences(getPreferencesPayload());
		// update templateVersionId in preferences with templateVersionId
		newPreferences.globalSettings.meta.templateSettings.templateVersionId = templateVersionId;
		const response = await generateInlineSandboxURL(newPreferences);
		const newObj = {};
		Object.keys(response).forEach((path) => {
			if (path[0] === '/') {
				const newPath = path.slice(1);
				newObj[newPath] = response[path];
			} else {
				newObj[path] = response[path];
			}
		});
		const body = {
			metadata: {
				commit: 'system commit: update the template code',
			},
			content: newObj,
		};

		commitCode(preferenceId, body)
			.then((res) => {
				// update deployed code versionId in preferences with res.version_id
				newPreferences.globalSettings.meta.deploySettings.versionId = res.version_id;
				// Save the new preferences
				updateSearchPreferences(newPreferences).then((action) => {
					if (!(action && action.error)) {
						setShowTemplateUpdateBanner(false);
						setShowNotification(false);
						message.info('Code is committed successfully');
					}
					setIsLoading(false);
				});
			})
			.catch((err) => {
				setIsLoading(false);
				console.error(err);
				message.error('Failed to commit code.');
			});
	};

	return (
		<div>
			<Alert
				message={<b>Update v{templateVersionId}</b>}
				description="A new template update is available. Would you like to update the code? (This will
		add a commit, you can always view the diff and revert to your current version)"
				type="info"
				action={
					<Button
						size="small"
						type="primary"
						onClick={() => {
							setTemplateVersionId();
							handleCommitCode();
						}}
						loading={isLoading}
					>
						Update
					</Button>
				}
				closable
				onClose={() => {
					setShowTemplateUpdateBanner(false);
					setShowNotification(true);
				}}
			/>
		</div>
	);
};

UpgradeVersion.defaultProps = {
	setShowTemplateUpdateBanner: false,
	preferenceId: '',
	templateVersionId: '',
	setShowNotification: () => {},
	setTemplateVersionId: () => {},
};

UpgradeVersion.propTypes = {
	setShowTemplateUpdateBanner: bool,
	preferenceId: string,
	templateVersionId: string,
	getPreferencesPayload: func.isRequired,
	updateSearchPreferences: func.isRequired,
	setShowNotification: func,
	setTemplateVersionId: func,
};

const mapDispatchToProps = (dispatch, props) => ({
	updateSearchPreferences: (payload) =>
		dispatch(saveSearchPreference(props.preferenceId, payload)),
});

export default connect(null, mapDispatchToProps)(UpgradeVersion);
