import React from 'react';
import { Alert, Button, message } from 'antd';
import { bool, func, string } from 'prop-types';
import { connect } from 'react-redux';
import { css } from 'emotion';
import { commitCode, generateInlineSandboxURL } from '../../utils/sandpack-generator';
import { saveSearchPreference } from '../../../../batteries/modules/actions';
import { transformPreferences } from '../../utils/index';
import AppConstants from '../../../../batteries/modules/constants';

const updateTemplateBannerStyles = css`
	margin-bottom: 15px;
	.banner-container {
		position: relative;
		display: flex;
		align-items: center;
	}
	.ant-alert-close-icon {
		position: absolute;
		right: 15px;
		top: 10px;
	}
`;
const UpgradeVersion = ({
	setShowNotification,
	setShowTemplateUpdateBanner,
	preferenceId,
	templateVersionId,
	updateSearchPreferences,
	getPreferencesPayload,
	setTemplateVersionId,
	getAllVersions,
	setIsCodeCommitting,
	isCodeCommitting,
	updateVersionStateForPreference,
}) => {
	const handleCommitCode = async () => {
		setIsCodeCommitting(true);
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
				updateVersionStateForPreference({
					preferenceId,
					patchPayload: {
						currentVersion: {
							version_id: res.version_id,
							updated_at: res.updated_at || res.created_at,
							commit: 'system commit: update the template code',
						},
					},
				});
				// update deployed code versionId in preferences with res.version_id
				newPreferences.globalSettings.meta.deploySettings.versionId = res.version_id;
				// Save the new preferences
				updateSearchPreferences(newPreferences).then((action) => {
					if (!(action && action.error)) {
						setShowTemplateUpdateBanner(false);
						setShowNotification(false);
						getAllVersions();
						message.info('Template code updated successfully!');
					}

					setIsCodeCommitting(false);
				});
			})
			.catch((err) => {
				setIsCodeCommitting(false);
				console.error(err);
				message.error('There was a problem updating the template code!.');
			});
	};

	return (
		<div className={updateTemplateBannerStyles}>
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
						loading={isCodeCommitting}
					>
						Update
					</Button>
				}
				closable
				onClose={() => {
					setShowTemplateUpdateBanner(false);
					setShowNotification(true);
				}}
				className="banner-container"
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
	getAllVersions: () => {},
	setIsCodeCommitting: () => {},
	isCodeCommitting: false,
};

UpgradeVersion.propTypes = {
	setShowTemplateUpdateBanner: bool,
	preferenceId: string,
	templateVersionId: string,
	getPreferencesPayload: func.isRequired,
	updateSearchPreferences: func.isRequired,
	setShowNotification: func,
	setTemplateVersionId: func,
	getAllVersions: func,
	setIsCodeCommitting: func,
	isCodeCommitting: bool,
	updateVersionStateForPreference: func.isRequired,
};

const mapDispatchToProps = (dispatch, props) => ({
	updateVersionStateForPreference: (payload) =>
		dispatch({
			type: AppConstants.APP.UI_BUILDER.SEARCH_PREFERENCE_VERSIONS
				.UPDATE_PREFERENCE_STATE_SUCCESS,
			payload,
		}),
	updateSearchPreferences: (payload) =>
		dispatch(saveSearchPreference(props.preferenceId, payload)),
});

export default connect(null, mapDispatchToProps)(UpgradeVersion);
