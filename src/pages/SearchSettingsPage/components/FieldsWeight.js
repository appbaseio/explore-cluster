import React from 'react';
import get from 'lodash/get';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { css } from 'react-emotion';
import { Icon, Tooltip, Empty, Row, Col, Select, Card, Switch } from 'antd';
import FieldRow from '../../MappingsPage/components/FieldRow';
import ObjectField from '../../MappingsPage/components/ObjectField';
import { VIEWS } from '../../../constants/props';
import {
	getMappingsByPath,
	getMappingsInfo,
	getValidSubFields,
	getSearchableFieldMap,
} from '../../../utils/mappings';
import Flex from '../../../batteries/components/shared/Flex';
import { SUB_FIELDS } from '../../../constants';
import { setLocalRelevancyState, setAdvanceSearchState } from '../../../batteries/modules/actions';
import { getFieldWeight as getSubFieldWeight } from '../../../utils';
import NumberInput from './NumberInput';

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

const fieldInfo = {
	[SUB_FIELDS.KEYWORD]: `Searches on the exact value of the field. You typically want to enable this and provide it the highest weight.`,
	[SUB_FIELDS.AUTOSUGGEST]: `Searches on the prefix value of the field. Enable this when you want users to do an autocomplete/suggestions search on the field. You should set a relatively lower weight for it.`,
	[SUB_FIELDS.SEARCH]: `Searches on an infix value of the field. Enable this when you want users to be able to find results by entering partial values. You should set a relatively lower weight for it.`,
	[SUB_FIELDS.LANGUAGE]: `Searches on the language analyzed value (as set in language settings) for the field. You should set a relatively moderate weight for it.`,
	[SUB_FIELDS.SYNONYMS]: `Enable this when you want users to be able to find results when searching for synonym pairs as set in the Synonyms view. You should set a relatively lower weight for it.`,
	[SUB_FIELDS.DELIMITER]: `Searches for values with non-alphanumeric characters effectively. Enable this if you have those values for the field. You should set a relatively moderate weight for it. `,
};

const { Option } = Select;

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
				if (typeData[field] === 'rank_feature' || typeData[field] === 'rank_features') {
					return [...agg];
				}
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

	handleAdvanceStateChange = (path, isShowingAdvanceOption) => {
		const { appName, updateAdvanceSearchState } = this.props;
		updateAdvanceSearchState(`${appName}_${path}`, isShowingAdvanceOption);
	};

	handleSubFieldToggle = (fieldPath, isEnabled, originalField, subField) => {
		const { localRelevancy, updateLocalRelevancy, appName } = this.props;
		let dataField = get(localRelevancy, 'search.dataField');
		let fieldWeights = get(localRelevancy, 'search.fieldWeights');
		if (isEnabled) {
			const originalFieldIndex = dataField.findIndex((f) => f === originalField);
			const originalFieldWeight = fieldWeights[originalFieldIndex];
			const fieldWeight = getSubFieldWeight(subField, originalFieldWeight);
			dataField = [...dataField, fieldPath];
			fieldWeights = [...fieldWeights, fieldWeight];
		} else {
			const fieldIndex = dataField.findIndex((f) => f === fieldPath);
			if (fieldIndex) {
				dataField = [...dataField.slice(0, fieldIndex), ...dataField.slice(fieldIndex + 1)];
				fieldWeights = [
					...fieldWeights.slice(0, fieldIndex),
					...fieldWeights.slice(fieldIndex + 1),
				];
			}
		}

		updateLocalRelevancy(appName, {
			...localRelevancy,
			search: {
				...get(localRelevancy, 'search'),
				dataField,
				fieldWeights,
			},
		});
	};

	handleSubFieldWeightChange = (fieldPath, val) => {
		const { localRelevancy, updateLocalRelevancy, appName } = this.props;
		const dataField = get(localRelevancy, 'search.dataField');
		let fieldWeights = get(localRelevancy, 'search.fieldWeights');
		const fieldIndex = dataField.findIndex((f) => f === fieldPath);
		fieldWeights = [
			...fieldWeights.slice(0, fieldIndex),
			Number(val).toFixed(1),
			...fieldWeights.slice(fieldIndex + 1),
		];
		updateLocalRelevancy(appName, {
			...localRelevancy,
			search: {
				...get(localRelevancy, 'search'),
				fieldWeights,
			},
		});
	};

	renderFields = ({ path = '', mappings, fieldWeightMap = {}, dataField = [] }) => {
		const {
			handleDelete,
			localRelevancy,
			handleFieldWeights,
			advanceSearchState,
			appName,
		} = this.props;

		const synonymsSettings = get(localRelevancy, 'synonyms');
		const indexSettings = get(localRelevancy, 'indexSettings');

		if (!dataField.length) {
			return (
				<Empty
					image={Empty.PRESENTED_IMAGE_SIMPLE}
					description={<span>No Search Fields Are Present</span>}
				/>
			);
		}

		return Object.keys(fieldWeightMap).map((field) => {
			const fieldPath = `${path}${field}`;
			const isObj = !get(fieldWeightMap, `${field}.__fields__`, null);

			if (isObj) {
				return (
					<ObjectField
						key={field}
						path={fieldPath}
						field={field}
						onDelete={(deletePath) => handleDelete(deletePath)}
						view={VIEWS.SEARCH}
					>
						{this.renderFields({
							path: `${fieldPath}.`,
							mappings,
							fieldWeightMap: get(fieldWeightMap, `${field}`),
							dataField,
						})}
					</ObjectField>
				);
			}

			const fieldMapping = getMappingsByPath({ mappings, path: fieldPath });

			const validSubFields = getValidSubFields({
				fieldMapping,
				enableNgram: indexSettings.enableNgram,
				enableSynonyms: synonymsSettings.enabled,
			});
			return (
				<>
					<FieldRow
						view={VIEWS.SEARCH}
						key={fieldPath}
						field={field}
						usecase="searchaggs"
						type="text"
						mapping={getMappingsByPath({ mappings, path: fieldPath })}
						path={fieldPath}
						setMapping={() => {}}
						showAdvanceOption
						isAdvanceOption={advanceSearchState[`${appName}_${fieldPath}`] || false}
						onAdvanceStateChange={this.handleAdvanceStateChange}
						renderColumn={({ path: fp, mapping }) => (
							<div style={{ width: 150 }}>
								<NumberInput
									defaultValue={
										get(fieldWeightMap, `${fieldPath}.__weight__`) || 1
									}
									min={1}
									step={0.5}
									onBlur={(value) => {
										handleFieldWeights({
											weight: Math.abs(value),
											field: fp,
											mapping,
										});
									}}
								/>
							</div>
						)}
						onDelete={(deletePath) => handleDelete(deletePath)}
					/>
					{advanceSearchState[`${appName}_${fieldPath}`] && (
						<Card>
							<p style={{ fontWeight: 'normal' }}>
								Reducing the ways to search a field can improve search latency. You
								can also set the individual weights to have a better control on the
								search relevancy.
							</p>
							{validSubFields.map((sf) => {
								const subFieldWeight = get(
									fieldWeightMap,
									`${field}.__fields__.${sf}`,
									null,
								);

								const isDisabled = subFieldWeight === null;

								return (
									<Flex
										key={`${path}${field}sf-${sf}`}
										style={{ marginBottom: 10 }}
										alignItems="center"
									>
										<div style={{ marginRight: 10, width: 100 }}>
											{sf === `lang` ? `language` : sf}&nbsp;
											<Tooltip title={fieldInfo[sf]}>
												<Icon type="info-circle" />
											</Tooltip>
										</div>
										<Switch
											style={{ marginRight: 10 }}
											checked={isDisabled === false}
											onChange={(val) =>
												this.handleSubFieldToggle(
													`${fieldPath}.${sf}`,
													val,
													fieldPath,
													sf,
												)
											}
										/>
										<NumberInput
											defaultValue={subFieldWeight}
											min={0.1}
											step={0.1}
											style={{ width: 100 }}
											disabled={isDisabled}
											onBlur={(value) => {
												this.handleSubFieldWeightChange(
													`${fieldPath}.${sf}`,
													value,
												);
											}}
										/>
									</Flex>
								);
							})}
						</Card>
					)}
				</>
			);
		});
	};

	render() {
		const { nonSearchableFields } = this.state;
		const { mappingWrapperProps, handleAddSearchField, localRelevancy } = this.props;
		const { mappings, setMapping } = mappingWrapperProps;

		const dataField = get(localRelevancy, 'search.dataField', []);
		const fieldWeights = get(localRelevancy, 'search.fieldWeights', []);
		const fieldWeightMap = getSearchableFieldMap({ dataField, fieldWeights });

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
							{mappings &&
								this.renderFields({
									mappings,
									path: '',
									init: true,
									dataField,
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
	updateLocalRelevancy: PropTypes.func.isRequired,
	appName: PropTypes.string.isRequired,
	advanceSearchState: PropTypes.object.isRequired,
	updateAdvanceSearchState: PropTypes.func.isRequired,
};

FieldWeights.defaultProps = {
	localMapping: null,
};

const mapStateToProps = (state) => {
	const appName = get(state, '$getCurrentApp.name');
	const localRelevancy = get(state, `$getLocalRelevancy.${appName}`);
	const localMapping = get(state, `$getLocalMapping.${appName}`);
	const advanceSearchState = get(state, `$getAdvanceSearchState`);
	return {
		appName,
		localRelevancy,
		localMapping,
		advanceSearchState,
	};
};

const mapDispatchToProps = (dispatch) => ({
	updateLocalRelevancy: (name, data) => dispatch(setLocalRelevancyState(name, data)),
	updateAdvanceSearchState: (fieldName, state) =>
		dispatch(setAdvanceSearchState(fieldName, state)),
});

export default connect(mapStateToProps, mapDispatchToProps)(FieldWeights);
