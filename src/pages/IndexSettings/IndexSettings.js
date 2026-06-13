/* eslint-disable camelcase */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import get from 'lodash/get';
import { Card, notification, message, Button, Modal, Input, Typography } from 'antd';

import { getAppMappings, setCurrentApp, addReIndexingTasks } from '../../batteries/modules/actions';
import { getURL, getVersion } from '../../constants/config';
import { getRawMappingsByAppName } from '../../batteries/modules/selectors';
import Banner from '../../batteries/components/shared/UpgradePlan/Banner';
import { container } from '../ResultsPage/styles';
import {
	getESVersion,
	getNodes,
	fetchSettings,
	getSettings,
	getUpdatedSettings,
	reIndex,
	getTypesFromMapping,
	updateSettings,
} from '../../batteries/utils/mappings';
import Replicas from './Replicas';
import Shards from './Shards';
import Loader from '../../batteries/components/shared/Loader';
import { appendApp, loadApps, removeAppData } from '../../actions';
import ErrorToaster from '../../batteries/components/shared/ErrorToaster';
import { withErrorToaster } from '../../batteries/components/shared/ErrorToaster/ErrorToaster';
import { event, timingEvent } from '../../utils/gtag';
import moment from '../../utils/moment';
import { supportsIndexShardsAndReplicas } from '../../batteries/utils';

// helper to call ES with basic auth
const esRequest = async ({ path, method = 'GET', credentials, body }) => {
	const url = `${getURL()}${path}`;
	const headers = {
		'Content-Type': 'application/json',
		Authorization: `Basic ${btoa(credentials)}`,
	};
	const res = await fetch(url, {
		method,
		headers,
		body: body ? JSON.stringify(body) : undefined,
	});
	if (!res.ok) {
		const text = await res.text();
		throw new Error(text || `${method} ${path} failed with ${res.status}`);
	}
	return res.json().catch(() => ({}));
};

const bannerMessage = {
	title: 'Index Settings',
	buttonText: 'Read Docs',
	href: 'https://docs.reactivesearch.io/docs/search/relevancy/#index-settings',
	videoLink: 'https://youtu.be/oRIsIHkTN9Y',
};

const sortObjectDeep = (obj) => {
	if (Array.isArray(obj)) return obj.map(sortObjectDeep);
	if (obj && typeof obj === 'object') {
		return Object.keys(obj)
			.sort((a, b) => a.localeCompare(b))
			.reduce((acc, k) => {
				acc[k] = sortObjectDeep(obj[k]);
				return acc;
			}, {});
	}
	return obj;
};

class IndexSettings extends React.Component {
	constructor(props) {
		super(props);
		this.startTime = moment();
		this.allocated_shards = null;
		this.allocated_replicas = null;
		this.state = {
			shards: null,
			replicas: null,
			visible: false,
			isReindexing: false,
			isFetching: false,
			shardsModal: false,
			replicasModal: false,
			isUpdating: false,
			showAnalysisEditor: false,
			analysisJson: '{}',
			analysisLoading: false,
			analysisJsonValid: true,
		};
	}

	async componentDidMount() {
		// triggering custom event for google analytics
		event({
			action: 'Index Settings',
			category: 'Search Relevancy',
			label: 'visit',
			value: null,
		});

		const { appName, credentials, fetchMappings, mappings, fetchApps } = this.props;
		const url = getURL();
		this.initializeSettings();
		fetchApps();
		if (!mappings) {
			fetchMappings(appName, credentials, url);
		}
	}

	componentDidUpdate(prevProps) {
		const { appName, backend } = this.props;

		if (prevProps.appName !== appName || prevProps.backend !== backend) {
			this.initializeSettings();
		}
	}

	componentWillUnmount() {
		// Sends the timing event to Google Analytics.
		timingEvent({
			action: 'timing_complete',
			category: 'Search Relevancy',
			label: 'index-settings-time',
			name: 'time',
			value: this.startTime.fromNow(),
		});
	}

	handleModal = (name) => {
		this.setState((prevState) => ({
			[name]: !prevState[name],
		}));
	};

	initializeSettings = async () => {
		const { credentials, appName, backend } = this.props;
		const esVersion = getVersion() || (await getESVersion(appName, credentials));
		const showShardsAndReplicas = supportsIndexShardsAndReplicas(backend);

		if (showShardsAndReplicas) {
			const nodes = await getNodes(appName, credentials);

			this.setState({
				esVersion: esVersion.split('.')[0],
				totalNodes: nodes._nodes.total,
				shardsReplicasSupported: true,
			});

			fetchSettings({ appName, credentials }).then(({ shards, replicas }) => {
				this.allocated_replicas = replicas;
				this.allocated_shards = shards;
				this.setState({
					shards,
					replicas,
				});
			});
		} else {
			this.setState({
				esVersion: esVersion.split('.')[0],
				shardsReplicasSupported: false,
			});
		}
	};

	handleSlider = (name, value) => {
		this.setState({
			[name]: value,
		});
	};

	loadAnalysis = async () => {
		const { appName, credentials } = this.props;
		this.setState({ analysisLoading: true });
		try {
			// Prefer current settings; fall back to defaults if present
			const data = await getSettings(appName, credentials);
			const current = get(data, [appName, 'settings', 'index', 'analysis'], {}) || {};
			const sorted = sortObjectDeep(current || {});
			this.setState({
				analysisJson: JSON.stringify(sorted, null, 2),
				showAnalysisEditor: true,
				analysisJsonValid: true,
			});
		} catch (e) {
			notification.error({ message: 'Failed to load analysis', description: e.message });
		} finally {
			this.setState({ analysisLoading: false });
		}
	};

	closeIndex = async () => {
		const { appName, credentials } = this.props;
		// POST /{index}/_close
		return esRequest({ path: `/${appName}/_close`, method: 'POST', credentials });
	};

	openIndex = async () => {
		const { appName, credentials } = this.props;
		// POST /{index}/_open
		return esRequest({ path: `/${appName}/_open`, method: 'POST', credentials });
	};

	saveAnalysis = async () => {
		const { appName, credentials } = this.props;
		const { analysisJson } = this.state;
		let parsed;
		try {
			parsed = JSON.parse(analysisJson);
		} catch (e) {
			message.error('Invalid JSON');
			return;
		}

		this.setState({ analysisLoading: true });
		try {
			// Close → PUT settings → Open
			await this.closeIndex();
			const res = await updateSettings({
				appName,
				settings: { index: { analysis: parsed } },
				credentials,
			});
			if (!res.acknowledged) {
				throw new Error(res.message || 'Update not acknowledged');
			}
			await this.openIndex();
			message.success('Analysis updated');
			this.setState({ showAnalysisEditor: false });
			// refresh shards/replicas display to keep UI in sync
			this.initializeSettings();
		} catch (e) {
			notification.error({ message: 'Failed to update analysis', description: e.message });
			// best effort re-open in case it failed after close
			try {
				await this.openIndex();
			} catch (err) {
				// eslint-disable-next-line no-console
				console.debug('Failed to re-open index after analysis update error', err);
			}
		} finally {
			this.setState({ analysisLoading: false });
		}
	};

	updateReplicas = () => {
		const { replicas } = this.state;
		const { appName, credentials, addApp, apps } = this.props;
		this.handleModal('replicasModal');

		this.setState({
			isUpdating: true,
		});
		updateSettings({
			appName,
			settings: {
				index: {
					number_of_replicas: replicas,
				},
			},
			credentials,
		})
			.then((res) => {
				if (res.acknowledged) {
					addApp({ [appName]: { ...get(apps, ['data', appName], {}), rep: replicas } });
					message.success('Replicas updated successfully');
				} else {
					notification.error({
						message: 'Replicas updation Failed',
						description: res.message || JSON.stringify(res),
					});
				}
				this.setState({
					isUpdating: false,
				});
			})
			.catch((e) => {
				notification.error({
					message: 'Replicas updation Failed',
					description: e.message || JSON.stringify(e),
				});
				this.setState({
					isUpdating: false,
				});
			});
	};

	updateShards = () => {
		this.handleModal('shardsModal');

		this.setState({
			isReindexing: true,
		});
		this.reIndex();
	};

	reIndex = async () => {
		const { appName, credentials, mappings, addApp, apps, updateReIndexingTasks } = this.props;
		const { shards, replicas, esVersion } = this.state;
		const type = getTypesFromMapping(mappings);
		let appSettings = await getSettings(appName, credentials).then(
			(data) => data[appName].settings,
		);

		const { backend } = this.props;
		appSettings = getUpdatedSettings({ settings: appSettings, shards, replicas, backend });

		const reIndexPromise = reIndex({
			mappings,
			appId: appName,
			excludeFields: [],
			type,
			esVersion,
			credentials,
			settings: appSettings,
		});

		reIndexPromise
			.then((res) => {
				this.setState({
					isReindexing: false,
				});
				if (get(res, 'failures', []).length) {
					get(res, 'failures', []).forEach((fail) => {
						message.error(`Re-indexing failed: ${fail.cause.reason}`);
					});
					return;
				}
				if (res.task) {
					updateReIndexingTasks(res.task);
				} else {
					message.success('Number of shards updated successfully');
				}
				addApp({
					[appName]: {
						...get(apps, ['data', appName], {}),
						pri: shards,
						rep: replicas,
					},
				});
			})
			.catch((err) => {
				// eslint-disable-next-line no-console
				console.error(err);
				message.error(err.message || `Failed to update shards`);
				this.setState({
					isReindexing: false,
					showError: true,
				});
			});
	};

	render() {
		const {
			shards,
			replicas,
			isReindexing,
			shardsModal,
			replicasModal,
			totalNodes,
			isUpdating,
			showAnalysisEditor,
			analysisJson,
			analysisLoading,
			analysisJsonValid,
		} = this.state;
		const { allocated_replicas, allocated_shards } = this;
		const { isFetchingMapping, backend } = this.props;
		const { shardsReplicasSupported } = this.state;
		const showShardsAndReplicas =
			shardsReplicasSupported !== undefined
				? shardsReplicasSupported
				: supportsIndexShardsAndReplicas(backend);

		if (isFetchingMapping) {
			return (
				<React.Fragment>
					<Banner {...bannerMessage} />

					<div className={container}>
						<Card>Fetching Mappings...</Card>
					</div>
				</React.Fragment>
			);
		}

		return (
			<React.Fragment>
				<Banner {...bannerMessage} />

				<Loader show={isReindexing} message="Re-indexing your data... Please wait!" />
				<div className={container}>
					{showShardsAndReplicas ? (
						<ErrorToaster>
							<Shards
								handleSlider={this.handleSlider}
								updateShards={() => this.updateShards()}
								handleModal={this.handleModal}
								shardsModal={shardsModal}
								shards={shards}
								allocated_shards={allocated_shards}
							/>
						</ErrorToaster>
					) : null}

					{showShardsAndReplicas ? (
						<ErrorToaster>
							<Replicas
								handleSlider={this.handleSlider}
								updateReplicas={this.updateReplicas}
								handleModal={this.handleModal}
								replicasModal={replicasModal}
								totalNodes={totalNodes}
								replicas={replicas}
								loading={isUpdating}
								allocated_replicas={allocated_replicas}
							/>
						</ErrorToaster>
					) : null}

					<ErrorToaster>
						{/* Scoped styles for the card title */}
						<style>{`
                            .analysis-card-title {
                                display: flex;
                                justify-content: space-between;
                                align-items: center;
                            }
                            .analysis-card-title h4 {
                                font-weight: 600;
                                margin: 5px 0;
                            }
                            .analysis-card-title p {
                                margin: 5px 0;
                                color: rgba(0, 0, 0, 0.65);
                                font-size: 14px;
                                white-space: initial;
                            }
                            @media (max-width: 768px) {
                                .analysis-card-title {
                                    width: 100%;
                                    flex-direction: column;
                                }
                                .analysis-card-title p {
                                    margin: 2px 0;
                                }
                            }
                        `}</style>

						<Card
							title={
								<div className="analysis-card-title">
									<div>
										<h4>Analysis (JSON)</h4>
										<p>Add or edit analyzers, tokenizers, and filters.</p>
									</div>
									<Button
										type="primary"
										onClick={this.loadAnalysis}
										loading={analysisLoading}
									>
										Edit JSON
									</Button>
								</div>
							}
							bodyStyle={{ padding: 0 }}
						/>
					</ErrorToaster>
				</div>

				<Modal
					title="Edit analysis JSON"
					open={showAnalysisEditor}
					width={900}
					onCancel={() => this.setState({ showAnalysisEditor: false })}
					footer={
						<div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
							<Button
								type="primary"
								onClick={this.saveAnalysis}
								loading={analysisLoading}
								disabled={!analysisJsonValid}
							>
								Update Analysis Settings
							</Button>
							<div>
								<Button
									onClick={() => this.setState({ showAnalysisEditor: false })}
								>
									Cancel
								</Button>
							</div>
						</div>
					}
				>
					<Input.TextArea
						autoSize={{ minRows: 18 }}
						value={analysisJson}
						onChange={(e) => {
							const val = e.target.value;
							let isValid = true;
							try {
								JSON.parse(val);
							} catch (_) {
								isValid = false;
							}
							this.setState({ analysisJson: val, analysisJsonValid: isValid });
						}}
						style={{
							borderColor: analysisJsonValid ? undefined : '#ff4d4f',
						}}
					/>
					<div style={{ marginTop: 8 }}>
						<Typography.Text type="secondary">
							This will POST <code>/{'{index}'}/_close</code>, update{' '}
							<code>settings.index.analysis</code>, then POST{' '}
							<code>/{'{index}'}/_open</code>.
						</Typography.Text>
					</div>
				</Modal>
			</React.Fragment>
		);
	}
}

IndexSettings.propTypes = {
	appName: PropTypes.string.isRequired,
	credentials: PropTypes.string.isRequired,
	fetchMappings: PropTypes.func.isRequired,
	mappings: PropTypes.object,
	fetchApps: PropTypes.func.isRequired,
	addApp: PropTypes.func.isRequired,
	apps: PropTypes.object,
	isFetchingMapping: PropTypes.bool,
	updateReIndexingTasks: PropTypes.func.isRequired,
	backend: PropTypes.string,
};

IndexSettings.defaultProps = {
	mappings: null,
	apps: {},
	isFetchingMapping: false,
	backend: '',
};

const mapStateToProps = (state) => {
	const mappings = getRawMappingsByAppName(state) || null;

	const { username, password } = get(state, 'user.data', {});
	const appName = get(state, '$getCurrentApp.name');
	return {
		apps: state.apps,
		credentials: username ? `${username}:${password}` : null,
		mappings,
		isFetchingMapping: get(state, '$getAppMappings.isFetching'),
		appName,
		backend: get(state, '$getAppPlan.results.backend', ''),
	};
};

const mapDispatchToProps = (dispatch) => ({
	fetchMappings: (appName, credentials, url) =>
		dispatch(getAppMappings(appName, credentials, url)),
	updateCurrentApp: (app) => dispatch(setCurrentApp(app)),
	addApp: (app) => dispatch(appendApp(app)),
	deleteApp: (appName) => dispatch(removeAppData(appName)),
	fetchApps: () => dispatch(loadApps()),
	updateReIndexingTasks: (data) => dispatch(addReIndexingTasks(data)),
});

export default withErrorToaster(connect(mapStateToProps, mapDispatchToProps)(IndexSettings));
