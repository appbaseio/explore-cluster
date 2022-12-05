import React from 'react';
import PropTypes from 'prop-types';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Tooltip, Card, Empty, Select } from 'antd';
import get from 'lodash/get';
import { connect } from 'react-redux';
import { css } from 'emotion';

import VersionController from '../../../batteries/components/shared/VersionController';
import { getVersion } from '../../../constants/config';
import { setLocalRelevancyState } from '../../../batteries/modules/actions';
import FieldRow from '../../MappingsPage/components/FieldRow';
import { VIEWS } from '../../../constants/props';
import Flex from '../../../batteries/components/shared/Flex';
import { renameObjectKey } from '../../../utils';
import NumberInput from './NumberInput';

const FUNCTIONS = {
	SATURATION: 'saturation',
	LOG: 'log',
	SIGMOID: 'sigmoid',
};

const headerRow = css`
	font-weight: 600;
	padding-right: 15px;
	padding-bottom: 10px;
	p {
		font-size: 14px;
		margin: 0;
	}

	i {
		margin-left: 5px;
	}
`;

const RankFeature = ({ mappingWrapperProps, localRelevancy, updateLocalRelevancy, appName }) => {
	const esVersion = parseInt(getVersion()[0], 10);

	if (esVersion < 7) {
		return null;
	}

	const flattenType = get(mappingWrapperProps, 'flattenType', null) || {};

	const rankFields = Object.keys(flattenType).filter(
		(key) => flattenType[key] === `rank_feature` || flattenType[key] === 'rank_features',
	);

	const relevancyRankFields = get(localRelevancy, `search.rankFeature`, {});
	const relevancyRankFieldNames = Object.keys(relevancyRankFields);

	const hasSigmoidField = Object.keys(relevancyRankFields).some((field) =>
		Boolean(relevancyRankFields[field].sigmoid),
	);

	const handleFieldChange = (field) => {
		updateLocalRelevancy(appName, {
			...localRelevancy,
			search: {
				...get(localRelevancy, 'search', {}),
				rankFeature: {
					...get(localRelevancy, 'search.rankFeature', {}),
					[field]: {
						saturation: {},
						boost: 1,
					},
				},
			},
		});
	};

	const handleRemoveRankField = (fieldPath) => {
		const nestedFields = rankFields.filter((field) => field.indexOf(`${fieldPath}.`) > -1);
		const rankFeatures = { ...get(localRelevancy, 'search.rankFeature', {}) };
		if (!nestedFields.length) {
			// just remove single field
			delete rankFeatures[fieldPath];
		} else {
			// remove all the fields containing this path
			Object.keys(rankFeatures).forEach((field) => {
				if (nestedFields.includes(field)) {
					delete rankFeatures[field];
				}
			});
		}
		updateLocalRelevancy(appName, {
			...localRelevancy,
			search: {
				...get(localRelevancy, 'search', {}),
				rankFeature: {
					...rankFeatures,
				},
			},
		});
	};

	const handleFunctionChange = (field, functionName) => {
		let functionDefaultValue = {};

		if (functionName === FUNCTIONS.LOG) {
			functionDefaultValue = {
				scaling_factor: 1,
			};
		}

		if (functionName === FUNCTIONS.SIGMOID) {
			functionDefaultValue = {
				exponent: 0.5,
			};
		}
		updateLocalRelevancy(appName, {
			...localRelevancy,
			search: {
				...get(localRelevancy, 'search', {}),
				rankFeature: {
					...get(localRelevancy, 'search.rankFeature', {}),
					[field]: {
						[functionName]: functionDefaultValue,
						boost: 1,
					},
				},
			},
		});
	};

	const handleParamChange = (field, functionName, param, val) => {
		updateLocalRelevancy(appName, {
			...localRelevancy,
			search: {
				...get(localRelevancy, 'search', {}),
				rankFeature: {
					...get(localRelevancy, 'search.rankFeature', {}),
					[field]: {
						[functionName]: {
							...get(localRelevancy, `search.rankFeature`)[field][functionName],
							[param]: parseFloat(Math.abs(val).toFixed(1)),
						},
					},
				},
			},
		});
	};

	const handleBoostChange = (field, val) => {
		updateLocalRelevancy(appName, {
			...localRelevancy,
			search: {
				...get(localRelevancy, 'search', {}),
				rankFeature: {
					...get(localRelevancy, 'search.rankFeature', {}),
					[field]: {
						...get(localRelevancy, `search.rankFeature`)[field],
						boost: val,
					},
				},
			},
		});
	};

	const handleFieldNameChange = (oldFieldName, newFieldName) => {
		const rankFeature = get(localRelevancy, 'search.rankFeature', {});

		// const newRankFeature = {
		// 	...rankFeature,
		// 	[newFieldName]: {
		// 		...rankFeature[oldFieldName],
		// 	},
		// };

		// delete newRankFeature[oldFieldName];

		updateLocalRelevancy(appName, {
			...localRelevancy,
			search: {
				...get(localRelevancy, 'search', {}),
				rankFeature: { ...renameObjectKey(rankFeature, oldFieldName, newFieldName) },
			},
		});
	};

	const renderFields = () => {
		return Object.keys(relevancyRankFields).map((field) => {
			const functionName = Object.keys(relevancyRankFields[field]).find((i) => i !== 'boost');
			const functionValue = relevancyRankFields[field][functionName];

			return (
				<FieldRow
					key={`${field}`}
					field={field}
					usecase="none"
					view={VIEWS.RANK_FEATURE}
					type="rank_feature"
					mapping={{ type: flattenType[`${field}`] }}
					path={`${field}`}
					setMapping={() => {}}
					isFieldNameEditable
					onFieldNameChange={handleFieldNameChange}
					renderColumn={({ path: fieldPath }) => (
						<Flex key={fieldPath}>
							<NumberInput
								key={`boost-${field}`}
								defaultValue={relevancyRankFields[field].boost || 1}
								style={{ marginLeft: 10, width: 100 }}
								min={0}
								step={0.1}
								onBlur={(val) => {
									handleBoostChange(field, val);
								}}
							/>
							<Select
								value={functionName}
								onChange={(fn) => handleFunctionChange(fieldPath, fn)}
								style={{ width: 150, marginLeft: 10 }}
							>
								<Select.Option value={FUNCTIONS.SATURATION}>
									Saturation
								</Select.Option>
								<Select.Option value={FUNCTIONS.LOG}>Log</Select.Option>
								<Select.Option value={FUNCTIONS.SIGMOID}>Sigmoid</Select.Option>
							</Select>
							{functionName === FUNCTIONS.SATURATION && (
								<NumberInput
									key={`${functionName}-pivot-${field}`}
									defaultValue={get(functionValue, 'pivot')}
									min={1}
									style={{
										marginLeft: 10,
										width: 100,
										marginRight: hasSigmoidField ? 110 : 0,
									}}
									placeholder="default"
									onBlur={(val) => {
										if (val) {
											handleParamChange(
												fieldPath,
												functionName,
												'pivot',
												val,
											);
										}
									}}
								/>
							)}
							{functionName === FUNCTIONS.LOG && (
								<NumberInput
									defaultValue={get(functionValue, 'scaling_factor')}
									min={1}
									key={`${functionName}-scaling_factor-${field}`}
									style={{
										marginLeft: 10,
										width: 100,
										marginRight: hasSigmoidField ? 110 : 0,
									}}
									onBlur={(val) => {
										handleParamChange(
											fieldPath,
											functionName,
											'scaling_factor',
											val,
										);
									}}
								/>
							)}
							{functionName === FUNCTIONS.SIGMOID && (
								<>
									<NumberInput
										defaultValue={get(functionValue, 'pivot')}
										style={{ marginLeft: 10, width: 100 }}
										min={1}
										key={`${functionName}-pivot-${field}`}
										placeholder="default"
										onBlur={(val) => {
											if (val) {
												handleParamChange(
													fieldPath,
													functionName,
													'pivot',
													val,
												);
											}
										}}
									/>
									<NumberInput
										defaultValue={get(functionValue, 'exponent')}
										style={{ marginLeft: 10, width: 100 }}
										min={0.5}
										max={1}
										key={`${functionName}-exponent-${field}`}
										step={0.1}
										onBlur={(val) => {
											handleParamChange(
												fieldPath,
												functionName,
												'exponent',
												val,
											);
										}}
									/>
								</>
							)}
						</Flex>
					)}
					onDelete={(deletePath) => handleRemoveRankField(deletePath)}
				/>
			);
		});
	};

	return (
		<>
			<div>
				Boosting search relevancy with rank feature{' '}
				<Tooltip title="Boosting search relevancy with rank feature">
					<InfoCircleOutlined />
				</Tooltip>
			</div>

			<div
				style={{
					boxSizing: 'border-box',
					backgroundColor: 'rgba(0, 0, 0, 0.02)',
					margin: '15px 0px',
					padding: '15px',
					border: '1px solid rgba(0, 0, 0, 0.05)',
				}}
			>
				<VersionController version="7.36.0">
					<>
						{rankFields.length > 0 ? (
							<>
								{relevancyRankFieldNames.length === 0 ? (
									<Card>
										<Empty
											image={Empty.PRESENTED_IMAGE_SIMPLE}
											description={
												<>
													You haven&apos;t set rank_feature fields, please
													select fields from the dropdown below to set
													rank_feature function.{' '}
													<a
														href="https://docs.reactivesearch.io/docs/search/relevancy/#relevance-tuning-with-rank-feature"
														target="_blank"
														rel="noreferrer"
													>
														Read the docs
													</a>{' '}
													on how to configure rank_feature and use it to
													boost your search relevancy.
												</>
											}
										/>
									</Card>
								) : (
									<Card>
										<Flex justifyContent="space-between" className={headerRow}>
											<p>
												Field Name{' '}
												<Tooltip title="Names of the fields with rank_feature/rank_features. Nested fields are represented with relative indentation.">
													<InfoCircleOutlined />
												</Tooltip>
											</p>
											<Flex>
												<p style={{ width: 100 }}>
													Boost
													<Tooltip title="Floating point number used to decrease or increase relevance scores.">
														<InfoCircleOutlined />
													</Tooltip>
												</p>
												<p style={{ width: 150, marginLeft: 10 }}>
													Function
													<Tooltip title="Ranking function to be used for query">
														<InfoCircleOutlined />
													</Tooltip>
												</p>
												<p style={{ width: 100, marginLeft: 10 }}>
													Pivot / Scaling Factor
													<Tooltip title="Pivot value is applicable for saturation and sigmoid functions. Scaling factor value is applicable for log function.">
														<InfoCircleOutlined />
													</Tooltip>
												</p>
												{hasSigmoidField && (
													<p style={{ width: 100, marginLeft: 10 }}>
														Exponent
														<Tooltip title="Configure the exponent value for sigmoid function">
															<InfoCircleOutlined />
														</Tooltip>
													</p>
												)}
											</Flex>
										</Flex>
										{renderFields()}
									</Card>
								)}
								<br />
								{rankFields.length > 0 && (
									<div style={{ position: 'relative', display: 'inline-block' }}>
										<Select
											showSearch
											style={{ width: 400 }}
											placeholder="Add rank_feature/rank_features fields from schema "
											value={undefined}
											onChange={handleFieldChange}
										>
											{rankFields.map((field) => (
												<Select.Option key={field} value={field}>
													{field}
												</Select.Option>
											))}
										</Select>
									</div>
								)}
							</>
						) : (
							<Card>
								<Empty
									image={Empty.PRESENTED_IMAGE_SIMPLE}
									description={
										<>
											You don&apos;t have rank_feature mappings set.{' '}
											<a
												href="https://docs.reactivesearch.io/docs/search/relevancy/#relevance-tuning-with-rank-feature"
												target="_blank"
												rel="noreferrer"
											>
												Read the docs
											</a>{' '}
											on how to configure rank_feature and use it to boost
											your search relevancy.
										</>
									}
								/>
							</Card>
						)}
					</>
				</VersionController>
				{}
			</div>
		</>
	);
};

RankFeature.propTypes = {
	mappingWrapperProps: PropTypes.object.isRequired,
	appName: PropTypes.string.isRequired,
	localRelevancy: PropTypes.object.isRequired,
	updateLocalRelevancy: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
	const appName = get(state, '$getCurrentApp.name');
	const localRelevancy = get(state, ['$getLocalRelevancy', appName], null);
	const localMapping = get(state, ['$getLocalMapping', appName], null);
	return {
		appName,
		localRelevancy,
		localMapping,
	};
};

const mapDispatchToProps = (dispatch) => ({
	updateLocalRelevancy: (name, data) => dispatch(setLocalRelevancyState(name, data)),
});
export default connect(mapStateToProps, mapDispatchToProps)(RankFeature);
