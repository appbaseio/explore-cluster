/* eslint-disable camelcase */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { get } from 'lodash';
import { Card, notification, message } from 'antd';

import { getAppMappings, setCurrentApp } from '../../batteries/modules/actions';
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

const bannerMessage = {
	title: 'Index Settings',
	buttonText: 'Read Docs',
	href: 'https://docs.appbase.io/docs/search/relevancy/#index-settings',
};

class IndexSettings extends React.Component {
	state = {
		shards: null,
		replicas: null,
		visible: false,
		isReindexing: false,
		isFetching: false,
		shardsModal: false,
		replicasModal: false,
		isUpdating: false,
	};

	allocated_shards = null;

	allocated_replicas = null;

	async componentDidMount() {
		const { appName, credentials, fetchMappings, mappings, fetchApps } = this.props;
		const url = getURL();
		this.initializeSettings();
		fetchApps();
		if (!mappings) {
			fetchMappings(appName, credentials, url);
		}
	}

	componentDidUpdate(prevProps) {
		const { appName } = this.props;

		if (prevProps.appName !== appName) {
			this.initializeSettings();
		}
	}

	handleModal = (name) => {
		this.setState((prevState) => ({
			[name]: !prevState[name],
		}));
	};

	initializeSettings = async () => {
		const { credentials, appName } = this.props;

		const esVersion = getVersion() || (await getESVersion(appName, credentials));
		const nodes = await getNodes(appName, credentials);

		this.setState({
			esVersion: esVersion.split('.')[0],
			totalNodes: nodes._nodes.total,
		});

		fetchSettings({ appName, credentials }).then(({ shards, replicas }) => {
			this.allocated_replicas = replicas;
			this.allocated_shards = shards;
			this.setState({
				shards,
				replicas,
			});
		});
	};

	handleSlider = (name, value) => {
		this.setState({
			[name]: value,
		});
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
		const { appName, credentials, mappings, addApp, apps } = this.props;
		const { shards, replicas, esVersion } = this.state;
		const type = getTypesFromMapping(mappings);
		let appSettings = await getSettings(appName, credentials).then(
			(data) => data[appName].settings,
		);

		appSettings = getUpdatedSettings({ settings: appSettings, shards, replicas });

		reIndex({
			mappings,
			appId: appName,
			excludeFields: [],
			type,
			esVersion,
			credentials,
			settings: appSettings,
		})
			.then(() => {
				this.setState({
					isReindexing: false,
				});
				addApp({
					[appName]: { ...get(apps, ['data', appName], {}), pri: shards, rep: replicas },
				});
				message.success('Number of shards updated successfully');
			})
			.catch((err) => {
				console.error(err);
				notification.error({
					description: JSON.stringify(err),
					message: 'Reindexing Failed',
				});
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
		} = this.state;
		const { allocated_replicas, allocated_shards } = this;
		const { isFetchingMapping } = this.props;

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
					<Shards
						handleSlider={this.handleSlider}
						updateShards={this.updateShards}
						handleModal={this.handleModal}
						shardsModal={shardsModal}
						shards={shards}
						allocated_shards={allocated_shards}
					/>

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
				</div>
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
};

IndexSettings.defaultProps = {
	mappings: null,
	apps: {},
	isFetchingMapping: false,
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
	};
};

const mapDispatchToProps = (dispatch) => ({
	fetchMappings: (appName, credentials, url) =>
		dispatch(getAppMappings(appName, credentials, url)),
	updateCurrentApp: (app) => dispatch(setCurrentApp(app)),
	addApp: (app) => dispatch(appendApp(app)),
	deleteApp: (appName) => dispatch(removeAppData(appName)),
	fetchApps: () => dispatch(loadApps()),
});

export default connect(mapStateToProps, mapDispatchToProps)(IndexSettings);
