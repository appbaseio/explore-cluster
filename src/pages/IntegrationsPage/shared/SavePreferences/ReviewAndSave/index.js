import React, { useState, useEffect } from 'react';
import { withRouter } from 'react-router-dom';
import { Button, message, Modal } from 'antd';
import styled from 'react-emotion';
import get from 'lodash/get';
import { connect } from 'react-redux';
import { func, object, bool, string } from 'prop-types';
import DiffList from './DiffList';
import {
	generateInlineSandboxURL,
	getByVersionId,
	commitCode,
	preferencesInConstants,
} from '../../../utils/sandpack-generator';
import {
	saveSearchPreference,
	saveRecommendationPreference,
} from '../../../../../batteries/modules/actions';
import { getDiffDataAndCount } from '../../../utils/utils';
import { transformContent } from '../../ExportInline/Components/ModalHeader';
import { transformResultsDefaultFields, transformPreferences } from '../../../utils';

const Badge = styled.span`
	background: #f5222d;
	color: #fff;
	display: flex;
	justify-content: center;
	align-items: center;
	position: absolute;
	top: -10px;
	right: 0px;
	height: 25px;
	width: 25px;
	border-radius: 50%;
	z-index: 100;
`;

const ReviewAndSave = ({
	form,
	oldData,
	newData,
	isRecommLoading,
	isSearchLoading,
	label,
	buttonProps,
	updateSearchPreferences,
	updateRecommendationsPreferences,
	getPreferencesPayload,
	setHasChanged,
	isRecommendation,
	preferenceId,
	clientId,
	history,
	match,
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		if (oldData && oldData.resultSettings && !oldData.resultSettings.resultHighlight) {
			// eslint-disable-next-line
			oldData.resultSettings.resultHighlight = false;
		}
	}, []);

	useEffect(() => {
		if (!isRecommLoading || isSearchLoading) {
			setIsOpen(false);
		}
	}, [isRecommLoading, isSearchLoading]);

	const showModal = () => {
		setIsOpen(true);
	};

	const handleCancel = () => {
		setIsOpen(false);
	};

	const handleSave = () => {
		setIsLoading(true);
		if (isRecommendation) {
			updateRecommendationsPreferences(getPreferencesPayload()).then((action) => {
				setIsLoading(false);
				if (!(action && action.error)) {
					setHasChanged();
					if (match.params.id === 'new')
						setTimeout(() => {
							history.push(`/cluster/recommendations-builder/${preferenceId}`);
						}, 1000);
				}
			});
		} else {
			// Update preferences in sandpack
			handleCommitCode('system commit: auto save UI builder panel preferences');
		}
	};

	const handleCommitCode = async (commitMessage) => {
		const preferences = transformPreferences(getPreferencesPayload());
		const newPreferences = transformResultsDefaultFields(preferences);
		if (form.get('versionId').value) {
			// fetch by versionID and update constants file with new preferences
			getByVersionId(preferenceId, form.get('versionId').value)
				.then((resp) => {
					const content = transformContent(resp.content);
					const newPrefsWithAuth = { ...JSON.parse(JSON.stringify(newPreferences)) };

					const newContent = preferencesInConstants(content, newPrefsWithAuth);
					const body = {
						metadata: {
							commit: 'system commit: auto save page changes',
							user: localStorage.getItem('username'),
						},
						content: newContent,
					};

					commitCode(preferenceId, body)
						.then((res) => {
							// update deployed code versionId in preferences with res.version_id
							form.get('versionId').setValue(res.version_id);
							// inject auth0 clientId in authentication settings
							if (newPreferences.authenticationSettings && clientId) {
								newPreferences.authenticationSettings.clientId = clientId;
							}
							// Save the new preferences

							updateSearchPreferences(newPreferences).then((action) => {
								if (!(action && action.error)) {
									setHasChanged();
								}
								setIsLoading(false);
							});
						})
						.catch((err) => {
							setIsLoading(false);
							console.error(err);
							message.error('Failed to commit code.');
						});
				})
				.catch((err) => {
					setIsLoading(false);
					console.error('Error to get latest version', err);
					return {};
				});
		} else {
			const newPrefsWithAuth = { ...JSON.parse(JSON.stringify(newPreferences)) };

			const response = await generateInlineSandboxURL(newPrefsWithAuth);
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
					commit: commitMessage,
				},
				content: newObj,
			};
			commitCode(preferenceId, body)
				.then((res) => {
					// update deployed code versionId in preferences with res.version_id
					form.get('versionId').setValue(res.version_id);
					// Save the new preferences
					// inject auth0 clientId in authentication settings
					if (newPreferences.authenticationSettings && clientId) {
						newPreferences.authenticationSettings.clientId = clientId;
					}
					updateSearchPreferences(newPreferences).then((action) => {
						if (!(action && action.error)) {
							setHasChanged();
						}
						setIsLoading(false);
					});
				})
				.catch((err) => {
					setIsLoading(false);
					console.error(err);
					message.error('Failed to commit code.');
				});
		}
	};

	const { diffCount, diffDataArray } = getDiffDataAndCount(oldData, newData, isRecommendation);
	return (
		<div>
			<div style={{ position: 'relative' }}>
				{diffCount > 0 && <Badge>{diffCount}</Badge>}
				<Button
					style={{ marginRight: 10 }}
					size="large"
					type="primary"
					disabled={!diffCount}
					onClick={showModal}
					loading={isSearchLoading || isRecommLoading}
					data-cy="review-deploy-ui-builder"
					{...buttonProps}
				>
					Review and Save
				</Button>
			</div>
			<Modal
				visible={isOpen}
				title="Review Settings Before Saving"
				onOk={handleSave}
				width={1000}
				style={{
					top: 20,
				}}
				destroyOnClose
				okText={label}
				onCancel={handleCancel}
				cancelButtonProps={{ 'data-cy': 'cancel-modal-button' }}
				okButtonProps={{
					'data-cy': 'review-save-button',
					loading: isLoading,
				}}
				afterClose={() => {
					setIsLoading(false);
				}}
			>
				{isOpen && <DiffList diff={diffDataArray} />}
			</Modal>
		</div>
	);
};

ReviewAndSave.defaultProps = {
	buttonProps: null,
	preferenceId: null,
	isRecommLoading: false,
	isSearchLoading: false,
	isRecommendation: false,
	label: 'Save',
	clientId: '',
};

ReviewAndSave.propTypes = {
	isSearchLoading: bool,
	isRecommLoading: bool,
	label: string,
	buttonProps: object,
	preferenceId: string,
	oldData: object.isRequired,
	newData: object.isRequired,
	setHasChanged: func.isRequired,
	getPreferencesPayload: func.isRequired,
	getPreferences: func.isRequired,
	updateSearchPreferences: func.isRequired,
	updateRecommendationsPreferences: func.isRequired,
	isRecommendation: bool,
	form: object.isRequired,
	clientId: string,
	history: object.isRequired,
	match: object.isRequired,
};

const mapStateToProps = (state) => ({
	isSearchLoading: get(state, '$saveSearchPreference.isFetching'),
	isRecommLoading: get(state, '$saveRecommendationPreference.isFetching'),
	clientId: get(state, '$getAuth0Preferences.results')?.['_client_id'],
});

const mapDispatchToProps = (dispatch, props) => ({
	updateSearchPreferences: (payload) =>
		dispatch(saveSearchPreference(props.preferenceId, payload)),
	updateRecommendationsPreferences: (payload) =>
		dispatch(saveRecommendationPreference(props.preferenceId, payload)),
});

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(ReviewAndSave));
