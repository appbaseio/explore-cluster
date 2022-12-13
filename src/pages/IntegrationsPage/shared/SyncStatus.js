import React from 'react';
import { css } from 'emotion';
import { BellOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { Card, Button, Tooltip, Badge } from 'antd';
import get from 'lodash/get';
import { string, object, func, bool } from 'prop-types';
import { connect } from 'react-redux';
import Flex from '../../../batteries/components/shared/Flex';
import { getAllVersions, deployUiBuilder, transformPreferences } from '../utils/sandpack-generator';
import { deployStatusMapper, getTemplate } from '../utils/index';
import {
	getSearchPreferenceDeploymentStatus as getSearchPreferenceDeploymentStatusAction,
	getSearchPreferences as getSearchPreferencesAction,
	getSearchPreferenceVersionCodeByVersion as getSearchPreferenceVersionCodeByVersionAction,
	getSearchPreferenceVersions as getSearchPreferenceVersionsAction,
	saveSearchPreference as saveSearchPreferenceAction,
} from '../../../batteries/modules/actions';

import AppConstants from '../../../batteries/modules/constants';
import DeployLogsModal from './ExportInline/Components/DeployLogsModal';
import DeployModal from './ExportInline/Components/DeployModal';
import PastVersionsDrawer from './ExportInline/Components/PastVersionsDrawer';
import { transformContent } from './ExportInline/Components/ModalHeader';
import UpgradeVersion from '../SearchUIBuilderPage/components/UpgradeVersion';

const headerStyles = css`
	b {
		font-size: 15px;
	}
	.link-button {
		padding: 0;
		width: fit-content;
	}
	.overflow {
		text-overflow: ellipsis;
		white-space: nowrap;
		overflow: hidden;
	}
	.deploy-url {
		max-width: 100%;
	}
	.sub-part {
		max-width: 33%;
		flex-direction: column;
	}
	.overflow-ellipsis {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		text-overflow: ellipsis;
	}
`;

const getURL = () => {
	const { host, protocol } = new URL(
		localStorage.getItem('url') || sessionStorage.getItem('url'),
	);
	const username = localStorage.getItem('username') || sessionStorage.getItem('username');
	const password = localStorage.getItem('password') || sessionStorage.getItem('password');
	const uri = `${protocol}//${username}:${password}@${host}`;
	return uri;
};

class SyncStatus extends React.Component {
	constructor(props) {
		super(props);
		const { form } = props;
		this.myInterval = null;
		this.state = {
			exportType: form.get('exportSettings.type').value,
			documents: 0,
			// eslint-disable-next-line
			products: 0,
			// eslint-disable-next-line
			collections: 0,
			modalType: '',
			errMsg: '',
			isLoading: false,
			allVersions: [],
			themeType: '',
			showPastVersionsDrawer: false,
			showTemplateUpdateBanner: false,
			showNotification: false,
		};
		this.fetchData();
	}

	componentDidMount() {
		const { form, versionState, preferenceId, getSearchPreferenceVersions } = this.props;
		if (!versionState) getSearchPreferenceVersions(preferenceId);
		const { deploymentStatus = {} } = versionState[preferenceId] ?? {};
		const exportTypeHandler = form.get('exportSettings.type');
		exportTypeHandler.valueChanges.subscribe(this.handleTypeChange);
		const themeType = form.get('themeType');
		themeType.valueChanges.subscribe(this.handleThemeTypeChange);
		this.fetchAllVersions();
		if (!Object.keys(deploymentStatus).length) this.fetchDeploymentStatus();

		const templateVersionIdControl = form.get('templateVersionId');
		const templateObj = getTemplate(themeType?.value || '');

		templateVersionIdControl.valueChanges.subscribe((val) => {
			this.handleTemplateVersionIdChanges(templateObj.version, val);
		});
	}

	componentWillUnmount() {
		const { form } = this.props;
		const exportTypeHandler = form.get('exportSettings.type');
		exportTypeHandler.valueChanges.unsubscribe(this.handleTypeChange);
	}

	get resyncURL() {
		const { index } = this.props;
		return `https://shopify-sync.appbase.io/?index=${index}&url=${getURL()}`;
	}

	get isShopify() {
		const { exportType } = this.state;
		return exportType === 'shopify';
	}

	handleThemeTypeChange = (value) => {
		const { themeType } = this.state;
		const { pipeline, form } = this.props;
		if (themeType !== value) {
			this.setState({
				themeType: value,
			});
			const templateVersionIdControl = form.get('templateVersionId');
			if (templateVersionIdControl.value && pipeline) {
				const templateObj = getTemplate(value);
				this.handleTemplateVersionIdChanges(templateObj.version, value);
			}
		}
	};

	handleTypeChange = (value) => {
		const { exportType } = this.state;
		if (exportType !== value)
			this.setState({
				exportType: value,
			});
	};

	fetchData = () => {
		const { index } = this.props;
		fetch(`${localStorage.getItem('url') || sessionStorage.getItem('url')}/${index}/_msearch`, {
			method: 'POST',
			headers: {
				Authorization: `Basic ${localStorage.getItem('authToken')}`,
				Accept: 'application/json',
				'Content-Type': 'application/x-ndjson',
			},
			body: `{}\n${JSON.stringify({
				query: { term: { type: 'products' } },
				size: 0,
			})}\n{}\n${JSON.stringify({
				query: { term: { type: 'collections' } },
				size: 0,
			})}\n{}\n${JSON.stringify({
				query: { match_all: {} },
				size: 0,
			})}\n`,
		})
			.then((res) => res.json())
			.then((res) => {
				this.setState({
					// eslint-disable-next-line
					products: get(res, 'responses[0].hits.total.value'),
					// eslint-disable-next-line
					collections: get(res, 'responses[1].hits.total.value'),
					documents: get(res, 'responses[2].hits.total.value'),
				});
			})
			.catch((e) => {
				console.error(e);
			});
	};

	handleDeploy = (body) => {
		const { preferenceId } = this.props;
		if (body.version_id === '') {
			// eslint-disable-next-line
			delete body.version_id;
		}
		deployUiBuilder(preferenceId, body)
			.then(() => {
				this.fetchDeploymentStatus('deployed');
				this.myInterval = setInterval(() => this.fetchDeploymentStatus(), 7000);
			})
			.catch((err) => {
				console.error(err);
				this.setState({
					isLoading: false,
				});
				if (err.message)
					this.setState({
						errMsg: err.message,
					});
				else
					this.setState({
						errMsg: 'Error in deployment',
					});
			});
	};

	fetchAllVersions = () => {
		const { preferenceId } = this.props;
		getAllVersions(preferenceId)
			.then((res) => {
				this.setState({
					allVersions: res.versions,
				});
			})
			.catch((err) => {
				console.error(err);
				// setErrMsg(err);
			});
	};

	fetchDeploymentStatus = (status = 'notDeployed') => {
		const { preferenceId, getDeploymentStatus } = this.props;
		getDeploymentStatus(preferenceId)
			.then((res) => {
				const state = res.status || res.state;
				if (status === 'deployed') {
					this.setState({
						modalType: 'deploy-logs',
					});
				}
				if (state === 'ERROR' || state === 'READY' || state === 'CANCELED')
					clearInterval(this.myInterval);
			})
			.catch((err) => {
				console.error(err);
				// setErrMsg(err);
			});
	};

	handleCancel = () => {
		this.setState({
			modalType: '',
		});

		this.setState({
			isLoading: false,
		});
	};

	fetchByVersionId = (versionId) => {
		const { themeType } = this.state;
		const {
			getCodeByVersionId,
			preferenceId,
			updateVersionStateForPreference,
			updateSearchPreferences,
			getSearchPreferenceVersions,
			getSearchPreferences,
		} = this.props;
		getCodeByVersionId(preferenceId, versionId)
			.then((response) => {
				const { res } = response.payload;

				const newContent = transformContent(res.content);
				const templateObj = getTemplate(themeType);
				const newPreferences = JSON.parse(
					newContent[`/${templateObj.preferences_path}`]
						.replace('const appbasePrefs = ', '')
						.replace('export default JSON.stringify(appbasePrefs);', '')
						.replace(';', '')
						.trim(),
				);
				updateVersionStateForPreference({
					preferenceId,
					patchPayload: {
						updatedCode: newContent,
						sandpackCode: newContent,
						initialCode: newContent,
					},
				});
				updateSearchPreferences(
					preferenceId,
					transformPreferences(newPreferences, true),
				).then(() => {
					getSearchPreferenceVersions(preferenceId);
					getSearchPreferences();
				});
			})
			.catch((err) => {
				console.error(err);
				// setErrMsg(err);
			});
	};

	handleTemplateVersionIdChanges = (latestTemplateVersion, val) => {
		if (val !== latestTemplateVersion)
			this.setState({
				showTemplateUpdateBanner: true,
			});
		else
			this.setState({
				showTemplateUpdateBanner: false,
			});
	};

	renderNotificationBadge = () => {
		const { showNotification } = this.state;
		return showNotification ? (
			<Badge dot>
				<BellOutlined
					onClick={() => {
						this.setState({
							showTemplateUpdateBanner: true,
						});
						this.setState({
							showNotification: false,
						});
					}}
				/>
			</Badge>
		) : (
			<></>
		);
	};

	render() {
		const {
			documents,

			modalType,
			errMsg,
			isLoading,
			allVersions,
			themeType,
			showPastVersionsDrawer,
			showTemplateUpdateBanner,
		} = this.state;
		const {
			form,
			versionState,
			preferenceId,
			updateVersionStateForPreference,
			getPreferencesPayload,
			isSaveSearchLoading,
		} = this.props;
		const title = form.get('name') ? form.get('name').value : '';
		const pipeline = form.get('pipeline') ? form.get('pipeline').value : '';
		const templateObj = getTemplate(themeType);
		const {
			currentVersion = {},
			updatedCode = {},
			deploymentStatus = {},
		} = versionState[preferenceId] ?? {};
		const status = deploymentStatus.status || deploymentStatus.state || '';
		const templateVersionIdControl = form.get('templateVersionId');
		const templateVersionId = templateVersionIdControl ? templateVersionIdControl.value : '';

		return (
			<Card>
				{templateObj.version !== templateVersionId && showTemplateUpdateBanner ? (
					<UpgradeVersion
						getPreferencesPayload={getPreferencesPayload}
						preferenceId={preferenceId}
						form={form}
						templateVersionId={templateObj.version}
						setShowTemplateUpdateBanner={(val) =>
							this.setState({ showTemplateUpdateBanner: val })
						}
						setShowNotification={(val) => this.setState({ showNotification: val })}
					/>
				) : null}
				{pipeline ? (
					<div className={headerStyles}>
						<Flex
							justifyContent="space-between"
							// alignItems="center"
						>
							<Flex className="sub-part">
								<b>{title}</b>
								{documents ? (
									<>
										<Flex>Number of Documents: {documents}</Flex>

										<Button type="link" href="browse" className="link-button">
											Browse Data
										</Button>
									</>
								) : (
									<Flex className="overflow-ellipsis">
										{form.get('description')
											? form.get('description').value
											: ''}
									</Flex>
								)}
							</Flex>

							<Flex className="sub-part">
								{themeType ? (
									<>
										<b>Search Template {this.renderNotificationBadge()}</b>
										<>{templateObj.label || themeType}</>
									</>
								) : null}
							</Flex>
							<Flex className="sub-part">
								<Flex style={{ gap: '10px' }} alignItems="center">
									<Tooltip title="Past Versions" style={{ fontSize: 14 }}>
										{/* Past Versions */}
										<ClockCircleOutlined
											style={{
												cursor: currentVersion.version_id
													? 'pointer'
													: 'not-allowed',
												color: currentVersion.version_id
													? 'rgba(0,0,0,0.65)'
													: '#bbb7b7',
											}}
											onClick={() => {
												if (currentVersion.version_id)
													this.setState({
														showPastVersionsDrawer: true,
													});
											}}
										/>
									</Tooltip>

									<Button
										type="primary"
										onClick={() => {
											this.setState({ modalType: 'deploy-modal' });
											this.fetchAllVersions();
										}}
										disabled={isSaveSearchLoading}
									>
										Deploy
									</Button>
								</Flex>
								{status && status !== 'Not deployed' ? (
									<span>
										<Button
											type="link"
											className="link-button"
											style={{ marginRight: 5 }}
											onClick={() =>
												this.setState({ modalType: 'deploy-logs' })
											}
										>
											Deploy Status
										</Button>
										{deployStatusMapper[status]}
									</span>
								) : null}
							</Flex>
						</Flex>
					</div>
				) : null}
				<DeployLogsModal
					open={modalType === 'deploy-logs'}
					handleCancel={this.handleCancel}
					deploymentStatus={deploymentStatus}
					uiBuilderName={title}
				/>
				<DeployModal
					errMsg={errMsg}
					setErrMsg={(msg) => {
						this.setState({
							errMsg: msg,
						});
					}}
					open={modalType === 'deploy-modal'}
					uiBuilderName={title}
					handleOk={(deployObj) => {
						this.setState({
							isLoading: true,
						});
						this.handleDeploy(deployObj);
					}}
					isLoading={isLoading}
					handleCancel={this.handleCancel}
					allVersions={allVersions}
					templateObj={templateObj}
					deploymentStatus={deploymentStatus}
				/>
				<PastVersionsDrawer
					visible={showPastVersionsDrawer}
					setVisible={() =>
						this.setState({
							showPastVersionsDrawer: !showPastVersionsDrawer,
						})
					}
					currentVersion={currentVersion}
					allVersions={allVersions}
					fetchByVersionId={this.fetchByVersionId}
					preferenceId={preferenceId}
					updatedCode={updatedCode}
					updateVersionStateForPreference={updateVersionStateForPreference}
				/>
			</Card>
		);
	}
}

SyncStatus.defaultProps = {
	preferenceId: '',
	versionState: {},
	pipeline: '',
	isSaveSearchLoading: false,
	getPreferencesPayload: () => {},
};

SyncStatus.propTypes = {
	index: string.isRequired,
	form: object.isRequired,
	preferenceId: string,
	versionState: object,
	getSearchPreferences: func.isRequired,
	getCodeByVersionId: func.isRequired,
	updateVersionStateForPreference: func.isRequired,
	updateSearchPreferences: func.isRequired,
	getSearchPreferenceVersions: func.isRequired,
	getDeploymentStatus: func.isRequired,
	pipeline: string,
	getPreferencesPayload: func,
	isSaveSearchLoading: bool,
};

const mapStateToProps = (state, props) => ({
	index: props.pipeline || get(state, '$getCurrentApp.name'),
	versionState: get(state, '$getSearchPreferencesVersions.results', {}),
	isSaveSearchLoading: get(state, '$saveSearchPreference.isFetching'),
});
const mapDispatchToProps = (dispatch) => ({
	getSearchPreferences: () => dispatch(getSearchPreferencesAction()),
	updateSearchPreferences: (preferenceId, payload) =>
		dispatch(saveSearchPreferenceAction(preferenceId, payload)),
	updateVersionStateForPreference: (payload) =>
		dispatch({
			type: AppConstants.APP.UI_BUILDER.SEARCH_PREFERENCE_VERSIONS
				.UPDATE_PREFERENCE_STATE_SUCCESS,
			payload,
		}),
	getSearchPreferenceVersions: (preferenceId) =>
		dispatch(getSearchPreferenceVersionsAction(preferenceId)),
	getCodeByVersionId: (preferenceId, versionId) =>
		dispatch(getSearchPreferenceVersionCodeByVersionAction(preferenceId, versionId)),
	getDeploymentStatus: (preferenceId) =>
		dispatch(getSearchPreferenceDeploymentStatusAction(preferenceId)),
});
export default connect(mapStateToProps, mapDispatchToProps)(SyncStatus);
