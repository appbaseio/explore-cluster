import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import get from 'lodash/get';
import { Notification } from 'antd';

import {
	getMappingsInfo,
	updateSubFields,
	reIndex,
	updateMapping,
	updateObjectNestedProperty,
} from '../../utils/mappings';
import { getVersion } from '../../constants/config';
import { getSettings } from '../../batteries/utils/mappings';
import {
	getAppMappings,
	getSettings as getSearchSettings,
	setLocalMappingState,
	addReIndexingTasks,
} from '../../batteries/modules/actions';
import { getRawMappingsByAppName } from '../../batteries/modules/selectors';

class MappingsWrapper extends React.Component {
	state = {
		usecase: {},
		mappings: null,
		type: {},
		flattenType: null,
		flattenUsecase: null,
		deletedPaths: [],
		originalType: null,
		originalUseCas: null,
	};

	componentDidMount() {
		const { mappings, searchRelevancy, localMapping } = this.props;
		if (localMapping || mappings) {
			this.init(localMapping || mappings);
		} else {
			this.getMappings();
		}

		if (!searchRelevancy) {
			this.getSettings();
		}
	}

	componentDidUpdate(prevProps) {
		const { mappings, enableSynonyms, enableNgram, language, isFetchingMapping } = this.props;
		if (JSON.stringify(mappings) !== JSON.stringify(prevProps.mappings)) {
			this.init(mappings);
		}

		if (prevProps.isFetchingMapping === true && isFetchingMapping === false) {
			this.init(mappings);
		}

		if (
			enableNgram !== prevProps.enableNgram ||
			enableSynonyms !== prevProps.enableSynonyms ||
			language !== prevProps.language
		) {
			this.updateFields();
		}
	}

	updateFields = () => {
		const { mappings, enableSynonyms, enableNgram, language } = this.props;

		const updatedMappings = updateSubFields({
			mappings,
			enableSynonyms,
			enableNgram,
			language,
		});

		this.setState({
			mappings: updatedMappings,
		});
	};

	init = (mappings) => {
		const { enableNgram, enableSynonyms, language } = this.props;
		const { usecase, flattenType, flattenUsecase, type } = getMappingsInfo({
			mappings,
			enableNgram,
			enableSynonyms,
			language,
		});

		// eslint-disable-next-line
		this.setState(
			{
				usecase,
				type,
				mappings,
				flattenType,
				flattenUsecase,
				originalType: type,
				originalUseCase: usecase,
			},
			this.updateFields,
		);
	};

	getMappings = () => {
		const { appName, credentials, fetchMappings, updateLocalMappingState } = this.props;
		if (credentials && appName) {
			updateLocalMappingState(appName, null);
			fetchMappings(appName, credentials, this.URL);
		}
	};

	getSettings = () => {
		const { appName, fetchSearchSettings } = this.props;
		fetchSearchSettings(appName);
	};

	updateState = (newData) => {
		this.setState((currentState) => ({
			...currentState,
			...newData,
		}));
	};

	cancelChanges = () => {
		const { mappings } = this.props;
		const { originalType, originalUseCase } = this.state;

		this.setState({
			mappings,
			usecase: originalUseCase,
			type: originalType,
		});
	};

	handleReindex = async (refetchReIndexingInfo) => {
		const { appName, credentials, updateReIndexingTasks } = this.props;
		const { mappings, deletedPaths } = this.state;

		this.setState({
			isReindexing: true,
		});

		const appSettings = await getSettings(appName, credentials).then((data) =>
			get(data, `${appName}.settings`),
		);

		const reIndexPromise = reIndex({
			mappings,
			appName,
			version: getVersion(),
			credentials,
			excludeFields: deletedPaths,
			settings: {
				analysis: {
					...get(appSettings, 'index.analysis'),
				},
			},
		});

		reIndexPromise
			.then((res) => {
				this.setState({
					isReindexing: false,
					deletedPaths: [],
				});
				if (get(res, 'failures', []).length) {
					get(res, 'failures', []).forEach((fail) => {
						Notification.error({
							message: 'Re-indexing failed',
							description: fail.cause.reason,
						});
					});
					return;
				}
				if (res.task) {
					if (refetchReIndexingInfo) {
						setTimeout(() => {
							refetchReIndexingInfo();
						}, 500);
					}
					updateReIndexingTasks(res.task);
				}
				this.getMappings();
			})
			.catch((err) => {
				console.log(err);
				Notification.error({
					message: 'Re-indexing failed',
					description: err.message || '',
				});
			});
	};

	setMapping = (data) => {
		const { usecase, type, mappings, flattenUsecase, flattenType } = this.state;

		const { enableNgram, language, appName, updateLocalMappingState } = this.props;
		let updatedMappings = null;
		let updatedUsecase = null;
		let updatedType = null;
		let updatedFlattenUsecase = null;
		let updatedFlattenType = null;
		data.forEach((item) => {
			const { path, type: fieldType, usecase: fieldUseCase } = item;
			updatedMappings = updateMapping({
				originalMapping: mappings,
				usecase: fieldUseCase,
				path,
				type: fieldType,
				settings: {
					enableNgram,
					enableSynonyms: true,
					language,
				},
			});

			updatedUsecase = updateObjectNestedProperty({
				obj: usecase,
				fields: path.split('.'),
				value: fieldUseCase,
			});
			updatedType = updateObjectNestedProperty({
				obj: type,
				fields: path.split('.'),
				value: fieldType,
			});

			updatedFlattenUsecase = {
				...flattenUsecase,
				[path]: usecase,
			};

			updatedFlattenType = {
				...flattenType,
				[path]: fieldType,
			};
		});

		updateLocalMappingState(appName, updatedMappings);

		this.updateState({
			mappings: updatedMappings,
			usecase: updatedUsecase,
			type: updatedType,
			flattenType: updatedFlattenType,
			flattenUsecase: updatedFlattenUsecase,
		});
		return updatedMappings;
	};

	render() {
		const {
			children,
			error,
			isFetchingMapping,
			isFetchingSetting,
			appName,
			localMapping,
		} = this.props;
		const {
			usecase,
			mappings,
			type,
			flattenType,
			flattenUsecase,
			deletedPaths,
			originalType,
			originalUseCase,
			isReindexing,
		} = this.state;
		const hasMappingsChanged =
			JSON.stringify(type) !== JSON.stringify(originalType) ||
			JSON.stringify(usecase) !== JSON.stringify(originalUseCase);

		return (
			<div key={Date.now()}>
				{children({
					usecase,
					mappings,
					type,
					flattenType,
					flattenUsecase,
					deletedPaths,
					originalType,
					originalUseCase,
					error,
					appName,
					isFetchingMapping,
					isFetchingSetting,
					isReindexing,
					hasMappingsChanged,
					localMapping,
					reloadMappings: this.getMappings,
					reloadSettings: this.getSettings,
					updateState: this.updateState,
					cancelChanges: this.cancelChanges,
					handleReindex: this.handleReindex,
					setMapping: this.setMapping,
				})}
			</div>
		);
	}
}

MappingsWrapper.propTypes = {
	appName: PropTypes.string.isRequired,
	credentials: PropTypes.string.isRequired,
	mappings: PropTypes.object,
	enableNgram: PropTypes.bool,
	enableSynonyms: PropTypes.bool,
	language: PropTypes.string,
	searchRelevancy: PropTypes.object,
	// Actions
	fetchMappings: PropTypes.func.isRequired,
	fetchSearchSettings: PropTypes.func.isRequired,
	children: PropTypes.func.isRequired,
	isFetchingMapping: PropTypes.bool.isRequired,
	isFetchingSetting: PropTypes.bool.isRequired,
	error: PropTypes.object,
	localMapping: PropTypes.object,
	updateLocalMappingState: PropTypes.func.isRequired,
	updateReIndexingTasks: PropTypes.func.isRequired,
};

MappingsWrapper.defaultProps = {
	mappings: null,
	searchRelevancy: null,
	enableNgram: true,
	enableSynonyms: true,
	language: 'universal',
	error: null,
	localMapping: null,
};

const mapStateToProps = (state, props) => {
	const appName = get(state, '$getCurrentApp.name');
	const { username, password } = get(state, 'user.data', {});
	const defaultSettings = get(state, `$getAppSettings.defaultSettings`);
	const errorCode = get(state, '$getAppSettings.error.actual.code');
	const defaultSearchSettings = errorCode === 404 ? defaultSettings : null;

	return {
		appName,
		collapsed: get(state, 'sideBarCollapsed'),
		mappings: getRawMappingsByAppName(state) || null,
		searchRelevancy: get(
			state,
			['$getAppSettings', 'settings', appName],
			defaultSearchSettings,
		),
		credentials: username ? `${username}:${password}` : null,
		isFetchingMapping: get(state, '$getAppMappings.isFetching', false),
		isFetchingSetting: get(state, '$getAppSettings.isFetching', false),
		error: get(state, '$getAppMappings.error', null),
		localMapping: get(state, `$getLocalMapping.${appName}`, null),
		enableNgram:
			props.forceNgram !== undefined
				? props.forceNgram
				: get(
						get(state, ['$getAppSettings', 'settings', appName], defaultSettings),
						'indexSettings.enableNgram',
						true,
				  ),
		enableSynonyms:
			props.forceSynonyms !== undefined
				? props.forceSynonyms
				: get(
						get(state, ['$getAppSettings', 'settings', appName], defaultSettings),
						'synonyms.enabled',
						true,
				  ),
		language: get(
			get(state, ['$getAppSettings', 'settings', appName], defaultSettings),
			'language.language',
			'universal',
		),
	};
};

const mapDispatchToProps = (dispatch) => ({
	fetchMappings: (appName, credentials, url) =>
		dispatch(getAppMappings(appName, credentials, url)),
	fetchSearchSettings: (name) => dispatch(getSearchSettings(name)),
	updateLocalMappingState: (appName, data) => dispatch(setLocalMappingState(appName, data)),
	updateReIndexingTasks: (data) => dispatch(addReIndexingTasks(data)),
});

export default connect(mapStateToProps, mapDispatchToProps)(MappingsWrapper);
