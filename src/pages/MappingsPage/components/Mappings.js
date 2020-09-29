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
	updateSubFields,
	reIndex,
} from './utils/mappings';
import { getURL, getVersion } from '../../../constants/config';
import Loader from '../../../batteries/components/shared/Loader';
import {
	getAppMappings,
	getSettings as getSearchSettings,
} from '../../../batteries/modules/actions';
import { getRawMappingsByAppName } from '../../../batteries/modules/selectors';
import { getSettings } from '../../../batteries/utils/mappings';
import SearchPreviewModal from '../../../components/SearchPreviewModal';
import { VIEWS } from '../../../constants/props';
import { footerStyles, row } from './styles';
import ObjectField from './ObjectField';
import FieldRow from './FieldRow';
import MappingsCard from './MappingsCard';

class Mappings extends React.Component {
	URL = getURL();

	flattenType = null;

	flattenUsecase = null;

	originalMappings = null;

	originalMappingsUsecase = null;

	originalMappingsType = null;

	originalFlattenUsecase = null;

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
		const { mappings, onChange, enableSynonyms, enableNgram, language } = this.props;
		const { rawMappings } = this.state;
		if (JSON.stringify(mappings) !== JSON.stringify(prevProps.mappings)) {
			this.init(mappings);
		}

		if (
			enableNgram !== prevProps.enableNgram ||
			enableSynonyms !== prevProps.enableSynonyms ||
			language !== prevProps.language
		) {
			this.updateFields();
		}

		if (onChange && JSON.stringify(rawMappings) !== JSON.stringify(prevState.rawMappings)) {
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
		const { enableNgram, enableSynonyms, language } = this.props;
		const { usecase, flattenType, flattenUsecase, type } = getMappingsInfo({
			mappings,
			enableNgram,
			enableSynonyms,
			language,
		});
		this.flattenType = flattenType;
		this.originalFlattenMappingsType = flattenType;
		this.originalMappingsType = type;

		this.flattenUsecase = flattenUsecase;
		this.originalFlattenUsecase = flattenUsecase;
		this.originalMappingsUsecase = usecase;

		this.originalMappings = mappings;
		// eslint-disable-next-line
		this.setState(
			{
				usecase,
				type,
				rawMappings: mappings,
			},
			this.updateFields,
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

	updateFields = () => {
		const { mappings, enableSynonyms, enableNgram, language } = this.props;

		const updatedMappings = updateSubFields({
			mappings,
			enableSynonyms,
			enableNgram,
			language,
		});
		this.setState({
			rawMappings: updatedMappings,
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
		const { appName, credentials } = this.props;
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
			appName,
			version: getVersion(),
			credentials,
			settings: {
				analysis: {
					...get(appSettings, 'index.analysis'),
				},
			},
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
		this.flattenUsecase = this.originalFlattenUsecase;
		this.flattenType = this.originalFlattenMappingsType;

		this.setState({
			rawMappings: mappings,
			usecase: this.originalMappingsUsecase,
			type: this.originalMappingsType,
		});
	};

	renderMapping = ({ usecase, type, path = '', rawMappings, init = false }) => {
		const { hideTypeColumn, renderColumn, view } = this.props;
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
							usecase: get(usecase, field),
							type: get(type, field),
							path: `${path}${field}.`,
							rawMappings,
						})}
					</ObjectField>
				);
			}

			return (
				<FieldRow
					view={view}
					key={field}
					field={field}
					usecase={get(usecase, field)}
					type={get(type, field)}
					mapping={getMappingsByPath({ mappings: rawMappings, path: `${path}${field}` })}
					path={`${path}${field}`}
					setMapping={this.setMapping}
					onDelete={this.handleDelete}
					hideTypeColumn={hideTypeColumn}
					renderColumn={renderColumn}
				/>
			);
		});
	};

	render() {
		const {
			isFetchingMapping,
			error,
			appName,
			hideCardTitle,
			hideFooter,
			cardProps,
			headerRowProps,
		} = this.props;
		const { usecase, type, isReindexing, rawMappings } = this.state;
		const hasMappingsChanged =
			JSON.stringify(usecase) !== JSON.stringify(this.originalMappingsUsecase) ||
			JSON.stringify(type) !== JSON.stringify(this.originalMappingsType);

		const mappingCardProps = {
			getMappings: this.getMappings,
			hideCardTitle,
			setMapping: this.setMapping,
			cardProps,
			headerRowProps,
		};

		if (isFetchingMapping) {
			return (
				<MappingsCard {...mappingCardProps}>
					<Skeleton />
				</MappingsCard>
			);
		}

		if (error) {
			return (
				<MappingsCard {...mappingCardProps}>
					<Row>
						<Alert
							type="error"
							message={error.message || <pre>{JSON.stringify(error, null, 4)}</pre>}
						/>
					</Row>
				</MappingsCard>
			);
		}

		return (
			<React.Fragment>
				<MappingsCard {...mappingCardProps} usecase={usecase}>
					<Row className={row}>
						{this.renderMapping({
							usecase,
							type,
							rawMappings,
							init: true,
						})}
					</Row>
				</MappingsCard>
				<Loader show={isReindexing} message="Re-indexing your data... Please wait!" />
				{hideFooter ? null : (
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
				)}
			</React.Fragment>
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
	hideTypeColumn: PropTypes.bool,
	renderColumn: PropTypes.func,
	onChange: PropTypes.func,
	hideFooter: PropTypes.bool,
	cardProps: PropTypes.object,
	headerRowProps: PropTypes.object,
	view: PropTypes.string,
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
	hideTypeColumn: false,
	hideFooter: false,
	cardProps: {},
	headerRowProps: {},
	renderColumn: null,
	onChange: null,
	view: VIEWS.SCHEMA,
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

export default connect(mapStateToProps, mapDispatchToProps, null, { withRef: true })(Mappings);
