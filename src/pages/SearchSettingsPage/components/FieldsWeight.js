import React from 'react';
import get from 'lodash/get';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { css } from 'react-emotion';
import { Icon, Tooltip, Empty, Row, Col, InputNumber, Select } from 'antd';
import FieldRow from '../../MappingsPage/components/FieldRow';
import ObjectField from '../../MappingsPage/components/ObjectField';
import { VIEWS } from '../../../constants/props';
import { getMappingsByPath, getMappingsInfo } from '../../../utils/mappings';

const headerRow = css`
	font-weight: 600;
	p {
		font-size: 14px;
		margin: 0;
	}

	i {
		margin-left: 5px;
	}
`;

const mappingHeaderLeft = [
	{
		title: 'Field Name',
		info: 'Names of the fields and nested-fields are represented with relative indentation.',
	},
];

const mappingHeaderRight = [
	{
		title: 'Field Weight',
		info:
			'Set the search weight to boost query matches against this field. Higher weight fields imply a higher boost.',
	},
];

const { Option } = Select;

const getFieldWeightMap = ({ fieldWeights, dataField }) => {
	const fieldWeightMap = dataField.reduce((agg, field, index) => {
		return {
			...agg,
			[field]: fieldWeights[index],
		};
	}, {});
	return fieldWeightMap;
};

class FieldWeights extends React.Component {
	state = {
		nonSearchableFields: [],
	};

	componentDidMount() {
		this.getNonSearchableField();
	}

	getNonSearchableField = () => {
		const { mappingWrapperProps, localMapping, localRelevancy } = this.props;
		const { flattenUsecase: usecases, flattenType: types } = mappingWrapperProps;
		let typeData = types;
		let useCaseData = usecases;

		const dataField = get(localRelevancy, 'search.dataField', []);

		if (localMapping) {
			const synonymsSettings = get(localRelevancy, 'synonyms');
			const indexSettings = get(localRelevancy, 'indexSettings');
			const languageSettings = get(localRelevancy, 'language');
			const { flattenType, flattenUsecase } = getMappingsInfo({
				mappings: localMapping,
				enableNgram: indexSettings.enableNgram,
				enableSynonyms: synonymsSettings.enabled,
				language: languageSettings.language,
			});
			typeData = flattenType;
			useCaseData = flattenUsecase;
		}

		if (useCaseData && typeData) {
			const newNonSearchableFields = Object.keys(typeData).reduce((agg, field) => {
				const isExistingField = dataField.some((x) => x === field);
				if (
					useCaseData[field] === 'aggs' ||
					useCaseData[field] === 'none' ||
					isExistingField === false
				) {
					return [...agg, field];
				}
				return [...agg];
			}, []);

			this.setState({ nonSearchableFields: newNonSearchableFields });
		}
	};

	renderMapping = ({
		// initialUseCase & initialType are passed to handle the delete field, otherwise usecase/type value can change with recursive iteration
		usecase,
		type,
		mappings,
		fieldWeightMap,
		path = '',
		init = false,
	}) => {
		const {
			mappingWrapperProps,
			handleDelete,
			handleFieldWeights,
			localRelevancy,
		} = this.props;
		const { flattenUsecase, setMapping } = mappingWrapperProps;

		if (init && (!usecase || Object.keys(usecase).length === 0)) {
			return (
				<Empty
					image={Empty.PRESENTED_IMAGE_SIMPLE}
					description={<span>No Mappings Present</span>}
				/>
			);
		}

		const dataField = get(localRelevancy, 'search.dataField', []);

		return Object.keys(usecase).map((field) => {
			const usecaseVal = get(usecase, field);
			const typeVal = get(type, field);
			const isObj = typeof usecaseVal === 'object';

			if (isObj) {
				return (
					<ObjectField
						key={field}
						path={`${path}${field}`}
						field={field}
						onDelete={(deletePath) =>
							handleDelete({
								field: deletePath,
								setMapping,
								flattenUsecase,
								mappings,
							})
						}
						view={VIEWS.SEARCH}
					>
						{this.renderMapping({
							usecase: usecaseVal,
							type: typeVal,
							path: `${path}${field}.`,
							mappings,
							fieldWeightMap,
						})}
					</ObjectField>
				);
			}

			const isExistingField = dataField.some((x) => x === `${path}${field}`);
			if (
				usecaseVal === 'none' ||
				usecaseVal === 'aggs' ||
				typeVal !== 'text' ||
				(dataField.length > 0 && isExistingField === false)
			) {
				return null;
			}

			return (
				<FieldRow
					view={VIEWS.SEARCH}
					key={`${path}${field}`}
					field={field}
					usecase={usecaseVal}
					type={typeVal}
					mapping={getMappingsByPath({ mappings, path: `${path}${field}` })}
					path={`${path}${field}`}
					setMapping={() => {}}
					renderColumn={({ path: fieldPath, mapping }) => (
						<div style={{ width: 150 }}>
							<InputNumber
								value={fieldWeightMap[fieldPath] || 1}
								min={0}
								onChange={(value) => {
									handleFieldWeights({
										weight: value,
										field: fieldPath,
										mapping,
									});
								}}
							/>
						</div>
					)}
					onDelete={(deletePath) =>
						handleDelete({
							field: deletePath,
							setMapping,
							flattenUsecase,
							mappings,
						})
					}
				/>
			);
		});
	};

	render() {
		const { nonSearchableFields } = this.state;
		const { mappingWrapperProps, handleAddSearchField, localRelevancy } = this.props;
		const { usecase, type, mappings, setMapping } = mappingWrapperProps;
		const { dataField, fieldWeights } = get(localRelevancy, `search`);
		const fieldWeightMap = getFieldWeightMap({ fieldWeights, dataField });

		return (
			<React.Fragment>
				<div>
					<>
						<Row
							type="flex"
							className={headerRow}
							justify="space-between"
							style={{ padding: '0 15px' }}
						>
							<Col>
								{mappingHeaderLeft.map((item) => (
									<p key={item.title}>
										{item.title}
										<Tooltip title={item.info}>
											<Icon type="info-circle" />
										</Tooltip>
									</p>
								))}
							</Col>
							<Col>
								<Row gutter={8}>
									{mappingHeaderRight.map((item) => (
										<Col key={item.title} xs={12}>
											<p style={{ width: 155 }}>
												{item.title}
												<Tooltip title={item.info}>
													<Icon type="info-circle" />
												</Tooltip>
											</p>
										</Col>
									))}
								</Row>
							</Col>
						</Row>
						<div
							style={{
								boxSizing: 'border-box',
								backgroundColor: 'rgba(0, 0, 0, 0.02)',
								margin: '15px 0px',
								padding: '15px',
								border: '1px solid rgba(0, 0, 0, 0.05)',
							}}
						>
							{this.renderMapping({
								usecase,
								type,
								init: true,
								mappings,
								fieldWeightMap,
							})}
						</div>
					</>
				</div>
				{nonSearchableFields.length > 0 ? (
					<div style={{ position: 'relative', display: 'inline-block' }}>
						<Select
							showSearch
							style={{ width: 300 }}
							placeholder="Add search fields from schema "
							value={undefined}
							onChange={(field) => {
								handleAddSearchField({ field, setMapping });
							}}
						>
							{nonSearchableFields.map((field) => (
								<Option key={field} value={field}>
									{field}
								</Option>
							))}
						</Select>
					</div>
				) : null}
			</React.Fragment>
		);
	}
}

FieldWeights.propTypes = {
	handleFieldWeights: PropTypes.func.isRequired,
	handleDelete: PropTypes.func.isRequired,
	handleAddSearchField: PropTypes.func.isRequired,
	mappingWrapperProps: PropTypes.object.isRequired,
	localRelevancy: PropTypes.object.isRequired,
	localMapping: PropTypes.object,
};

FieldWeights.defaultProps = {
	localMapping: null,
};

const mapStateToProps = (state) => {
	const appName = get(state, '$getCurrentApp.name');
	const localRelevancy = get(state, `$getLocalRelevancy.${appName}`);
	const localMapping = get(state, `$getLocalMapping.${appName}`);
	return {
		appName,
		localRelevancy,
		localMapping,
	};
};

export default connect(mapStateToProps)(FieldWeights);
