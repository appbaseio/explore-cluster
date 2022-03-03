import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import get from 'lodash/get';
import { message, notification } from 'antd';

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
		script: undefined,
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
		const {
			mappings,
			enableSynonyms,
			enableNgram,
			enableAutoSuggestion,
			language,
			isFetchingMapping,
		} = this.props;
		if (JSON.stringify(mappings) !== JSON.stringify(prevProps.mappings)) {
			this.init(mappings);
		}

		if (prevProps.isFetchingMapping === true && isFetchingMapping === false) {
			this.init(mappings);
		}

		if (
			enableNgram !== prevProps.enableNgram ||
			enableAutoSuggestion !== prevProps.enableAutoSuggestion ||
			enableSynonyms !== prevProps.enableSynonyms ||
			language !== prevProps.language
		) {
			this.updateFields();
		}
	}

	updateFields = () => {
		const { mappings, enableSynonyms, enableNgram, enableAutoSuggestion, language } =
			this.props;

		const updatedMappings = updateSubFields({
			mappings,
			enableSynonyms,
			enableNgram,
			enableAutoSuggestion,
			language,
		});

		this.setState({
			mappings: updatedMappings,
		});
	};

	init = (mappings) => {
		const { enableNgram, enableAutoSuggestion, enableSynonyms, language } = this.props;
		const { usecase, flattenType, flattenUsecase, type } = getMappingsInfo({
			mappings,
			enableNgram,
			enableAutoSuggestion,
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

	handleReindex = async () => {
		const { appName, credentials, updateReIndexingTasks } = this.props;
		const { mappings, deletedPaths, script } = this.state;
		this.setState({
			isReindexing: true,
		});

		const appSettings = await getSettings(appName, credentials).then((data) =>
			get(data, [appName, `settings`]),
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
			script,
		});

		reIndexPromise
			.then((res) => {
				this.setState({
					isReindexing: false,
					deletedPaths: [],
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
					message.success(`Re-indexing completed successfully`);
				}
				this.getMappings();
			})
			.catch((err) => {
				console.log(err);
				notification.error({
					message: 'Re-indexing failed',
					description: err.message || '',
				});
			});
	};

	setMapping = (data) => {
		const { usecase, type, mappings, flattenUsecase, flattenType } = this.state;

		const { enableNgram, enableAutoSuggestion, language, appName, updateLocalMappingState } =
			this.props;
		let updatedMappings = null;
		let updatedUsecase = null;
		let updatedType = null;
		let updatedFlattenUsecase = null;
		let updatedFlattenType = null;

		// this key was added to support passing a script to copy
		// field values when leveraging copy field funcitonality
		// assumption is that only one script value can be there at a time
		// coz only when field is copied
		let scriptValue;
		data.forEach((item) => {
			const { path, type: fieldType, usecase: fieldUseCase, script } = item;
			if (script) {
				scriptValue = script;
			}
			updatedMappings = updateMapping({
				originalMapping: mappings,
				usecase: fieldUseCase,
				path,
				type: fieldType,
				settings: {
					enableNgram,
					enableAutoSuggestion,
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
			script: scriptValue,
		});
		return updatedMappings;
	};

	render() {
		const { children, error, isFetchingMapping, isFetchingSetting, appName, localMapping } =
			this.props;
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
	enableAutoSuggestion: PropTypes.bool,
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
	enableAutoSuggestion: true,
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
		localMapping: get(state, [`$getLocalMapping`, appName], null),
		enableNgram:
			props.forceNgram !== undefined
				? props.forceNgram
				: get(
						get(state, ['$getAppSettings', 'settings', appName], defaultSettings),
						'indexSettings.enableNgram',
						true,
				  ),
		enableAutoSuggestion: get(
			get(state, ['$getAppSettings', 'settings', appName], defaultSettings),
			'indexSettings.enableAutoSuggestion',
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
