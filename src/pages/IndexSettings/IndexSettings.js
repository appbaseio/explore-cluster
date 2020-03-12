import React from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';
import { Card, notification } from 'antd';

import { getAppMappings, setCurrentApp } from '../../batteries/modules/actions';
import { getURL } from '../../constants/config';
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
} from '../../batteries/utils/mappings';
import Replicas from './Replicas';
import Shards from './Shards';
import Loader from '../../batteries/components/shared/Loader';
import { getReIndexedName } from '../../utils';

const bannerMessage = {
	title: 'Index Settings',
	buttonText: 'Read Docs',
};

class IndexSettings extends React.Component {
	state = {
		shards: null,
		replicas: null,
		visible: false,
		isUpdating: false,
		isFetching: false,
		shardsModal: false,
		replicasModal: false,
	};

	allocated_shards = null;
	allocated_replicas = null;

	async componentDidMount() {
		const { appName, credentials, fetchMappings } = this.props;
		const url = getURL();
		this.initializeSettings();

		fetchMappings(appName, credentials, url);
	}

	componentDidUpdate(prevProps) {
		const { appName } = this.props;

		if (prevProps.appName !== appName) {
			this.initializeSettings();
		}
	}

	handleModal = name => {
		this.setState(prevState => ({
			[name]: !prevState[name],
		}));
	};

	initializeSettings = async () => {
		const { credentials, appName } = this.props;

		const esVersion = await getESVersion(appName, credentials);
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
		this.handleModal('replicasModal');

		this.setState({
			isUpdating: true,
		});
		this.reIndex();
	};

	updateShards = () => {
		this.handleModal('shardsModal');

		this.setState({
			isUpdating: true,
		});
		this.reIndex();
	};

	reIndex = async () => {
		const { appName, credentials, mappings, history, updateCurrentApp } = this.props;
		const { shards, replicas, esVersion } = this.state;
		const type = getTypesFromMapping(mappings);
		let appSettings = await getSettings(appName, credentials).then(
			data => data[appName].settings,
		);

		appSettings = getUpdatedSettings({ settings: appSettings, shards, replicas });

		reIndex(mappings, appName, [], type, esVersion, credentials, appSettings)
			.then(() => {
				this.setState({
					isUpdating: false,
				});

				const updatedAppName = getReIndexedName(appName);
				updateCurrentApp(updatedAppName);

				history.replace(`/app/${updatedAppName}/index-settings/`);
			})
			.catch(err => {
				console.error(err);
				notification.error({
					description: JSON.stringify(err),
					message: 'Reindexing Failed',
				});
				this.setState({
					isUpdating: false,
					showError: true,
				});
			});
	};

	render() {
		const { shards, replicas, isUpdating, shardsModal, replicasModal, totalNodes } = this.state;
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

				<Loader show={isUpdating} message="Re-indexing your data... Please wait!" />
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
						allocated_replicas={allocated_replicas}
					/>
				</div>
			</React.Fragment>
		);
	}
}

const mapStateToProps = state => {
	const mappings = getRawMappingsByAppName(state) || null;

	const { username, password } = get(state, 'user.data', {});
	const appName = get(state, '$getCurrentApp.name');
	return {
		credentials: username ? `${username}:${password}` : null,
		mappings,
		isFetchingMapping: get(state, '$getAppMappings.isFetching'),
		appName,
	};
};

const mapDispatchToProps = dispatch => ({
	fetchMappings: (appName, credentials, url) =>
		dispatch(getAppMappings(appName, credentials, url)),
	updateCurrentApp: app => dispatch(setCurrentApp(app)),
});

export default connect(mapStateToProps, mapDispatchToProps)(IndexSettings);
