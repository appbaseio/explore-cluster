import React, { useEffect, useState } from 'react';
import get from 'lodash/get';
import { Button, Card, message, Tag, Tooltip } from 'antd';
import moment from 'moment';
import { array, func, object } from 'prop-types';
import { connect } from 'react-redux';
import { ExportOutlined } from '@ant-design/icons';
import { UIBuildersListStyles } from './styles';
import Flex from '../../../../batteries/components/shared/Flex';
import { templatePreviews } from '../../utils/utils';
import {
	getPipelines,
	getSearchPreferenceDeploymentStatus,
	saveSearchPreference,
} from '../../../../batteries/modules/actions';
import { deployStatusMapper, transformPreferences } from '../../utils';
import DeployLogsModal from '../../shared/ExportInline/Components/DeployLogsModal';
import { getAllDomains } from '../../utils/domain-apis';

const UIBuildersListItem = ({
	preference,
	getDeploymentStatus,
	versionState,
	handleEdit,
	pipelines,
	fetchPipelines,
	updateSearchPreferences,
	getPreferencesPayload,
}) => {
	const [modalType, setModalType] = useState('');
	const [domainsData, setDomainsData] = useState([]);
	const [previewImage, setPreviewImage] = useState('');

	useEffect(() => {
		const { deploymentStatus = {} } = versionState[preference.id] ?? {};
		if (!Object.keys(deploymentStatus).length) fetchDeploymentStatus();
		fetchAllDomains();
		if (!pipelines.length) fetchPipelines();
		// getDeployedPreview();
	}, []);

	useEffect(() => {
		getImage();
	}, [preference, versionState]);

	const fetchDeploymentStatus = () => {
		getDeploymentStatus(preference.id);
	};

	const handleCancel = () => {
		setModalType('');
	};

	const validDomain = (url) => {
		if (url && !url.includes('http')) return `https://${url}`;
		return url;
	};

	const fetchAllDomains = () => {
		getAllDomains(preference.id)
			.then((res) => res.json())
			.then((res) => {
				if (!res.error) {
					const newDomainsData = res.domains || [];
					setDomainsData(newDomainsData);
					// fetchDomainStatus(newDomainsData.map((resp) => resp.name));
				}
			})
			.catch((err) => {
				console.error('Error to fetch all domains', err);
			});
	};

	const handleSave = (newPreferences) => {
		if (newPreferences.id)
			updateSearchPreferences(newPreferences).then((action) => {
				if (action && action.error) {
					console.error(action.error);
					message.info('Preview Image is not saved successfully!');
				}
			});
	};

	const getDeployedPreview = async () => {
		const { globalSettings } = preference;
		const deploymentURL = get(globalSettings, 'meta.deploySettings.deploymentURL', '');
		const { deploymentStatus = {} } = versionState[preference.id] ?? {};
		if (deploymentStatus.url) {
			if (deploymentURL !== deploymentStatus.url) {
				const imgURL = `https://api.screenshotmachine.com?
				key=48a3d7
				&url=${deploymentStatus.url}
				&dimension=1024x768
				&delay=2000`;
				const preferences = { ...getPreferencesPayload() };
				const newPreferences = transformPreferences(preferences);
				newPreferences.globalSettings.meta.deploySettings.previewImage = imgURL;
				newPreferences.globalSettings.meta.deploySettings.deploymentURL =
					deploymentStatus.url;
				handleSave(newPreferences);
				return imgURL;
			}
			return get(globalSettings, 'meta.deploySettings.previewImage', '');
		}
		const themeType = get(preference, 'themeSettings.type', '');
		return templatePreviews[themeType];
	};

	const getImage = () => {
		getDeployedPreview().then((res) => setPreviewImage(res));
	};
	const handleEditUIBuilder = () => {
		handleEdit(preference.id);
	};

	const themeType = get(preference, 'themeSettings.type', '');
	const { deploymentStatus = {} } = versionState[preference.id] ?? {};
	const status = deploymentStatus.status || deploymentStatus.state || '';
	const domains = domainsData.map((i) => i.name);
	const { pageSettings = {} } = preference;
	const { indexSettings = {} } = pageSettings.pages[pageSettings.currentPage || 'home'] || {};
	const { endpoint = {} } = indexSettings;

	return (
		<div className={UIBuildersListStyles}>
			<Card hoverable onClick={handleEditUIBuilder}>
				<Flex className="card-body">
					<div>
						<img
							src={previewImage}
							alt={`${themeType}-preview`}
							className="preview-image"
						/>
					</div>
					<div className="content">
						{domains.length ? (
							<Flex className="sub-item">
								<b>DOMAINS</b>
								<a
									href={validDomain(domains[0])}
									target="_blank"
									rel="noreferrer"
									className=" overflow"
									onClick={(e) => {
										e.stopPropagation();
									}}
								>
									{domains[0]}
								</a>

								{domains.length - 1 ? (
									<Tooltip
										title={
											<div>
												{[...domains].slice(1).map((i) => (
													<a
														href={validDomain(i)}
														target="_blank"
														rel="noreferrer"
														className={UIBuildersListStyles}
														style={{
															display: 'flex',
															alignItems: 'center',
														}}
														onClick={(e) => {
															e.stopPropagation();
														}}
													>
														<div className="ellipsis-overflow domain-link link-content">
															{i}
														</div>
														<ExportOutlined className="link-content" />
													</a>
												))}
											</div>
										}
									>
										<Tag color="processing" className="ml-5">
											+ {domains.length - 1}
										</Tag>
									</Tooltip>
								) : null}
							</Flex>
						) : null}

						{preference.name && (
							<Flex className="sub-item">
								<b>Name</b>
								<span className="max-width overflow">{preference.name}</span>
							</Flex>
						)}

						{preference.description && (
							<Flex className="sub-item ">
								<b>Description</b>
								<span className="max-width overflow">{preference.description}</span>
							</Flex>
						)}

						<Flex className="sub-item">
							<b>Pipeline</b>
							<span className="max-width overflow">
								{endpoint.method}&nbsp;{endpoint.url}
							</span>
						</Flex>
						<Flex justifyContent="space-between" alignItems="center">
							{status && status !== 'Not deployed' ? (
								<Flex
									className="sub-item"
									alignItems="center"
									style={{ margin: 0 }}
								>
									<b>Deploy Status</b>
									<div>
										<span className="status-container">{status}</span>
										<span>{deployStatusMapper[status]}</span>
										<Button
											type="link"
											className="link-button"
											onClick={(e) => {
												setModalType('deploy-logs');
												e.stopPropagation();
											}}
										>
											View details
										</Button>
									</div>
								</Flex>
							) : null}

							<Flex className="sub-item" style={{ margin: 0 }}>
								<b>Updated</b>
								<span className="max-width overflow">
									{moment
										.unix(preference.updated_at || preference.created_at)
										.format('ddd D MMM, hh:mm A')}
								</span>
							</Flex>
						</Flex>
					</div>
				</Flex>
			</Card>
			<DeployLogsModal
				open={modalType === 'deploy-logs'}
				handleCancel={handleCancel}
				deploymentStatus={deploymentStatus}
				uiBuilderName={preference.name}
				preferenceId={preference.id}
			/>
		</div>
	);
};

UIBuildersListItem.defaultProps = {
	preference: {},
	handleEdit: () => {},
	pipelines: [],
};

UIBuildersListItem.propTypes = {
	preference: object,
	getDeploymentStatus: func.isRequired,
	versionState: object.isRequired,
	handleEdit: func,
	pipelines: array,
	fetchPipelines: func.isRequired,
	updateSearchPreferences: func.isRequired,
	getPreferencesPayload: func.isRequired,
};

const mapStateToProps = (state) => ({
	versionState: get(state, '$getSearchPreferencesVersions.results', {}),
	pipelines: get(state, '$getAppPipelines.results'),
});

const mapDispatchToProps = (dispatch, props) => ({
	getDeploymentStatus: (preferenceId) =>
		dispatch(getSearchPreferenceDeploymentStatus(preferenceId)),
	fetchPipelines: () => dispatch(getPipelines(false)),
	updateSearchPreferences: (payload) =>
		dispatch(saveSearchPreference(props.preference.id, payload)),
});

export default connect(mapStateToProps, mapDispatchToProps)(UIBuildersListItem);
