import React from 'react';
import { connect } from 'react-redux';
import get from 'lodash/get';
import { Button, Modal, notification, Affix, Row, Skeleton, Alert, Empty } from 'antd';
import omit from 'lodash/omit';
import PropTypes from 'prop-types';

import { updateObjectNestedProperty } from './utils';
import {
	getMappingsInfo,
	updateMapping,
	deleteMappingField,
	getMappingsByPath,
} from './utils/mappings';
import { getURL, getVersion } from '../../../constants/config';
import Loader from '../../../batteries/components/shared/Loader';
import {
	getAppMappings,
	getSettings as getSearchSettings,
} from '../../../batteries/modules/actions';
import { getRawMappingsByAppName } from '../../../batteries/modules/selectors';
import { getSettings, reIndex } from '../../../batteries/utils/mappings';
import SearchPreviewModal from '../../../components/SearchPreviewModal';

import { footerStyles, row, container } from './styles';
import ObjectField from './ObjectField';
import FieldRow from './FieldRow';
import MappingsCard from './MappingsCard';

// TODO: Add support for synonyms, language and search fields. Recursively update the fields.
// Track from CDU and recursively traverse mappings to update Fields

// TODO Next: Use in Search Settings
// TODO Next: Use in Aggs Settings

class Mappings extends React.Component {
	URL = getURL();

	flattenType = null;

	flattenUsecase = null;

	originalMappingsUsecase = null;

	originalMappingsType = null;

	state = {
		usecase: {},
		type: {},
		rawMappings: null,
		isReindexing: false,
	};

	componentDidMount() {
		const { mappings, appName, fetchSearchSettings, searchRelevancy } = this.props;

		if (mappings) {
			this.init(mappings);
		} else {
			this.getMappings();
		}

		if (!searchRelevancy) fetchSearchSettings(appName);
	}

	componentDidUpdate(prevProps, prevState) {
		const { mappings, onChange } = this.props;
		const { usecase } = this.state;
		if (JSON.stringify(mappings) !== JSON.stringify(prevProps.mappings)) {
			this.init(mappings);
		}

		if (onChange && JSON.stringify(usecase) !== JSON.stringify(prevState.usecase)) {
			onChange();
		}
	}

	getMappings = () => {
		const { appName, credentials, fetchMappings } = this.props;
		if (credentials && appName) {
			fetchMappings(appName, credentials, this.URL);
		}
	};

	init = (mappings) => {
		const { onChange } = this.props;
		const { usecase, flattenType, flattenUsecase, type } = getMappingsInfo(mappings);
		this.flattenType = flattenType;
		this.flattenUsecase = flattenUsecase;
		this.originalMappingsUsecase = usecase;
		this.originalMappingsType = type;
		// eslint-disable-next-line
		this.setState(
			{
				usecase,
				type,
				rawMappings: mappings,
			},
			() => {
				if (onChange) {
					onChange();
				}
			},
		);
	};

	setMapping = ({ usecase, path, type }) => {
		const { rawMappings, usecase: currentUsecase, type: currentType } = this.state;
		const { enableSynonyms, enableNgram, language } = this.props;
		const updatedMappings = updateMapping({
			originalMapping: rawMappings,
			usecase,
			path,
			type,
			settings: {
				enableNgram,
				enableSynonyms,
				language,
			},
		});
		const updatedUsecase = updateObjectNestedProperty({
			obj: currentUsecase,
			fields: path.split('.'),
			value: usecase,
		});

		const updatedType = updateObjectNestedProperty({
			obj: currentType,
			fields: path.split('.'),
			value: type,
		});

		this.flattenUsecase = {
			...this.flattenUsecase,
			[path]: usecase,
		};

		this.flattenType = {
			...this.flattenType,
			[path]: type,
		};

		this.setState({
			rawMappings: updatedMappings,
			usecase: updatedUsecase,
			type: updatedType,
		});
	};

	handleDelete = (path) => {
		const { usecase, type, rawMappings } = this.state;
		this.flattenType = omit(this.flattenType, path);
		this.flattenUsecase = omit(this.flattenUsecase, path);

		const updatedUsecase = omit(usecase, path);
		const updatedType = omit(type, path);
		const updatedMappings = deleteMappingField({ originalMapping: rawMappings, path });
		this.setState({
			usecase: updatedUsecase,
			type: updatedType,
			rawMappings: updatedMappings,
		});
	};

	handleReindex = async () => {
		const { appName, credentials, enableNgram } = this.props;
		const { rawMappings } = this.state;

		this.setState({
			isReindexing: true,
		});

		const appSettings = await getSettings(appName, credentials).then((data) =>
			get(data, `${appName}.settings`),
		);

		const startTime = Date.now();
		reIndex({
			mappings: rawMappings,
			appId: appName,
			version: getVersion(),
			credentials,
			settings: {
				analysis: {
					...get(appSettings, 'analysis'),
				},
			},
			enableNgram,
		})
			.then(this.onSuccessfulReindex)
			.catch((err) => {
				this.onFailedReindex({
					error: err,
					startTime,
				});
			});
	};

	onSuccessfulReindex = () => {
		this.setState({
			isReindexing: false,
		});
		this.getMappings();
	};

	onFailedReindex = ({ startTime, error }) => {
		const currentTime = Date.now();
		this.setState({
			isReindexing: false,
		});
		if (currentTime - startTime >= 60000) {
			Modal.confirm({
				title: 'Re-indexing Progress',
				content: 'Reindexing is still in progress.',
			});
		} else {
			notification.error({
				message: 'Reindexing error',
				description: error.message || JSON.stringify(error, null, 4),
			});
		}
	};

	cancelChanges = () => {
		const { mappings } = this.props;
		this.setState({
			rawMappings: mappings,
			usecase: this.originalMappingsUsecase,
			type: this.originalMappingsType,
		});
	};

	renderMapping = ({ usecase, type, path = '', rawMappings, init = false }) => {
		const { hideAggsFields, hideSearchFields, hideTypeColumn, renderColumn } = this.props;
		if (!usecase) {
			return null;
		}

		if (init && Object.keys(usecase).length === 0) {
			return (
				<Empty
					image={Empty.PRESENTED_IMAGE_SIMPLE}
					description={<span>No Mappings Present</span>}
				/>
			);
		}

		return Object.keys(usecase).map((field) => {
			if (typeof usecase[field] === 'object') {
				return (
					<ObjectField
						path={`${path}${field}`}
						field={field}
						onDelete={this.handleDelete}
					>
						{this.renderMapping({
							usecase: usecase[field],
							type: type[field],
							path: `${path}${field}.`,
							rawMappings,
						})}
					</ObjectField>
				);
			}

			return (
				<FieldRow
					key={field}
					field={field}
					usecase={usecase[field]}
					type={type[field]}
					mapping={getMappingsByPath({ mappings: rawMappings, path: `${path}${field}` })}
					path={`${path}${field}`}
					setMapping={this.setMapping}
					onDelete={this.handleDelete}
					hideAggsFields={hideAggsFields}
					hideSearchFields={hideSearchFields}
					hideTypeColumn={hideTypeColumn}
					renderColumn={renderColumn}
				/>
			);
			// return (
			// 	<div key={field}>
			// 		Field is {field}, mapping is{' '}
			// 		<UsecaseDropdown
			// 			value={usecase[field]}
			// 			type={type[field]}
			// 			onUsecaseChange={this.setMapping}
			// 			path={`${path}${field}`}
			// 		/>{' '}
			// 		and type is{' '}
			// 		<TypeDropdown
			// 			value={type[field]}
			// 			usecase={usecase[field]}
			// 			onTypeChange={this.setMapping}
			// 			path={`${path}${field}`}
			// 		/>
			// 		<Button
			// 			icon="delete"
			// 			shape="circle-outline"
			// 			onClick={() => this.handleDelete(`${path}${field}`)}
			// 		/>
			// 	</div>
			// );
		});
	};

	render() {
		const { isFetchingMapping, error, appName, hideCardTitle } = this.props;
		const { usecase, type, isReindexing, rawMappings } = this.state;
		const hasMappingsChanged =
			JSON.stringify(usecase) !== JSON.stringify(this.originalMappingsUsecase) ||
			JSON.stringify(type) !== JSON.stringify(this.originalMappingsType);

		if (isFetchingMapping) {
			return (
				<div className={container}>
					<MappingsCard
						getMappings={this.getMappings}
						usecase={{}}
						hideCardTitle={hideCardTitle}
						setMapping={this.setMapping}
					>
						<Skeleton />
					</MappingsCard>
				</div>
			);
		}

		if (error) {
			return (
				<div className={container}>
					<MappingsCard
						getMappings={this.getMappings}
						usecase={{}}
						hideCardTitle={hideCardTitle}
						setMapping={this.setMapping}
					>
						<Row>
							<Alert
								type="error"
								message={
									error.message || <pre>{JSON.stringify(error, null, 4)}</pre>
								}
							/>
						</Row>
					</MappingsCard>
				</div>
			);
		}

		return (
			<div className={container}>
				<MappingsCard
					getMappings={this.getMappings}
					usecase={usecase}
					hideCardTitle={hideCardTitle}
					setMapping={this.setMapping}
				>
					<Row className={row}>
						{this.renderMapping({
							usecase,
							type,
							rawMappings,
							init: true,
						})}
					</Row>
					<Loader show={isReindexing} message="Re-indexing your data... Please wait!" />
				</MappingsCard>
				<Affix offsetBottom={0}>
					<div className={footerStyles}>
						<SearchPreviewModal app={appName} />
						<div>
							<Button
								type="primary"
								size="large"
								style={{ margin: '0 10px' }}
								onClick={this.handleReindex}
								disabled={!hasMappingsChanged}
							>
								Confirm Mapping Changes
							</Button>
							<Button
								size="large"
								disabled={!hasMappingsChanged}
								onClick={this.cancelChanges}
							>
								Cancel
							</Button>
						</div>
					</div>
				</Affix>
			</div>
		);
	}
}

Mappings.propTypes = {
	appName: PropTypes.string.isRequired,
	credentials: PropTypes.string.isRequired,
	mappings: PropTypes.object,
	isFetchingMapping: PropTypes.bool,
	error: PropTypes.object,
	enableNgram: PropTypes.bool,
	enableSynonyms: PropTypes.bool,
	language: PropTypes.string,
	searchRelevancy: PropTypes.object,
	// Search & Aggs Settings specific Props
	hideCardTitle: PropTypes.bool,
	hideAggsFields: PropTypes.bool,
	hideSearchFields: PropTypes.bool,
	hideTypeColumn: PropTypes.bool,
	renderColumn: PropTypes.func,
	onChange: PropTypes.func,
	// Actions
	fetchMappings: PropTypes.func.isRequired,
	fetchSearchSettings: PropTypes.func.isRequired,
};

Mappings.defaultProps = {
	error: null,
	mappings: null,
	isFetchingMapping: false,
	enableNgram: true,
	enableSynonyms: true,
	language: 'universal',
	searchRelevancy: null,
	// Search & Aggs Settings specific Props
	hideCardTitle: false,
	hideAggsFields: false,
	hideSearchFields: false,
	hideTypeColumn: false,
	renderColumn: null,
	onChange: null,
};

const mapStateToProps = (state, props) => {
	const { appName } = props;
	const { username, password } = get(state, 'user.data', {});
	const defaultSettings = get(state, `$getAppSettings.defaultSettings`);
	const errorCode = get(state, '$getAppSettings.error.actual.code');
	const defaultSearchSettings = errorCode === 404 ? defaultSettings : null;
	return {
		appName,
		mappings: getRawMappingsByAppName(state) || null,
		searchRelevancy: get(
			state,
			['$getAppSettings', 'settings', appName],
			defaultSearchSettings,
		),
		isFetchingMapping: get(state, '$getAppMappings.isFetching'),
		error: get(state, '$getAppMappings.error', null),
		credentials: username ? `${username}:${password}` : null,
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
});

export default connect(mapStateToProps, mapDispatchToProps)(Mappings);
