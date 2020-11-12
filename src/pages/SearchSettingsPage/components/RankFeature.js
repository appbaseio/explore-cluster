import React from 'react';
import PropTypes from 'prop-types';
import { Tooltip, Icon, Card, Empty, Select, InputNumber } from 'antd';
import get from 'lodash/get';
import { connect } from 'react-redux';
import { css } from 'emotion';

import VersionController from '../../../batteries/components/shared/VersionController';
import { getVersion } from '../../../constants/config';
import { setLocalRelevancyState } from '../../../batteries/modules/actions';
import FieldRow from '../../MappingsPage/components/FieldRow';
import ObjectField from '../../MappingsPage/components/ObjectField';
import { VIEWS } from '../../../constants/props';
import { unflattenObject } from '../../../utils';
import Flex from '../../../batteries/components/shared/Flex';

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
		(key) => flattenType[key] === `rank_feature` || flattenType[key] === `rank_features`,
	);

	const relevancyRankFields = get(localRelevancy, `search.rank_feature`, {});
	const relevancyRankFieldNames = Object.keys(relevancyRankFields);
	const fieldsToShowInDropDown = rankFields.filter(
		(field) => !relevancyRankFieldNames.includes(field),
	);

	const hasSigmoidField = Object.keys(relevancyRankFields).some((field) =>
		Boolean(relevancyRankFields[field].sigmoid),
	);

	const handleFieldChange = (field) => {
		updateLocalRelevancy(appName, {
			...localRelevancy,
			search: {
				...get(localRelevancy, 'search', {}),
				rank_feature: {
					...get(localRelevancy, 'search.rank_feature', {}),
					[field]: {
						saturation: { pivot: 1 },
					},
				},
			},
		});
	};

	const handleRemoveRankField = (fieldPath) => {
		const nestedFields = rankFields.filter((field) => field.indexOf(`${fieldPath}.`) > -1);
		const rankFeatures = { ...get(localRelevancy, 'search.rank_feature', {}) };
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
				rank_feature: {
					...rankFeatures,
				},
			},
		});
	};

	const handleFunctionChange = (field, functionName) => {
		let functionDefaultValue = {
			pivot: 1,
		};

		if (functionName === FUNCTIONS.LOG) {
			functionDefaultValue = {
				scaling_factor: 1,
			};
		}

		if (functionName === FUNCTIONS.SIGMOID) {
			functionDefaultValue = {
				pivot: 1,
				exponent: 0.5,
			};
		}
		updateLocalRelevancy(appName, {
			...localRelevancy,
			search: {
				...get(localRelevancy, 'search', {}),
				rank_feature: {
					...get(localRelevancy, 'search.rank_feature', {}),
					[field]: {
						[functionName]: functionDefaultValue,
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
				rank_feature: {
					...get(localRelevancy, 'search.rank_feature', {}),
					[field]: {
						[functionName]: {
							...get(localRelevancy, `search.rank_feature`)[field][functionName],
							[param]: val,
						},
					},
				},
			},
		});
	};

	const unflattenRelevancyFields = unflattenObject(relevancyRankFields);

	const renderFields = (unflattenRankFields = unflattenRelevancyFields, path = '') => {
		return Object.keys(unflattenRankFields).map((field) => {
			const isObject = Object.keys(unflattenRankFields[field]).some(
				(i) => !Object.values(FUNCTIONS).includes(i),
			);

			if (isObject) {
				return (
					<ObjectField
						key={field}
						path={`${path}${field}`}
						field={field}
						onDelete={(deletePath) => handleRemoveRankField(deletePath)}
						view={VIEWS.RANK_FEATURE}
					>
						{renderFields(unflattenRankFields[field], `${path}${field}.`)}
					</ObjectField>
				);
			}

			const functionName = Object.keys(unflattenRankFields[field])[0];
			const functionValue = get(unflattenRankFields, `${field}.${functionName}`);

			return (
				<FieldRow
					key={`${path}${field}`}
					field={field}
					usecase="none"
					view={VIEWS.RANK_FEATURE}
					type={flattenType[`${path}${field}`]}
					mapping={{ type: flattenType[`${path}${field}`] }}
					path={`${path}${field}`}
					setMapping={() => {}}
					renderColumn={({ path: fieldPath }) => (
						<Flex key={fieldPath}>
							<Select
								value={functionName}
								onChange={(fn) => handleFunctionChange(fieldPath, fn)}
								style={{ width: 150 }}
							>
								<Select.Option value={FUNCTIONS.SATURATION}>
									Saturation
								</Select.Option>
								<Select.Option value={FUNCTIONS.LOG}>Log</Select.Option>
								<Select.Option value={FUNCTIONS.SIGMOID}>Sigmoid</Select.Option>
							</Select>
							{functionName === FUNCTIONS.SATURATION && (
								<InputNumber
									value={get(functionValue, 'pivot')}
									min={1}
									style={{
										marginLeft: 10,
										width: 170,
										marginRight: hasSigmoidField ? 110 : 0,
									}}
									onChange={(val) =>
										handleParamChange(fieldPath, functionName, 'pivot', val)
									}
								/>
							)}
							{functionName === FUNCTIONS.LOG && (
								<InputNumber
									value={get(functionValue, 'scaling_factor')}
									min={1}
									style={{
										marginLeft: 10,
										width: 170,
										marginRight: hasSigmoidField ? 110 : 0,
									}}
									onChange={(val) =>
										handleParamChange(
											fieldPath,
											functionName,
											'scaling_factor',
											val,
										)
									}
								/>
							)}
							{functionName === FUNCTIONS.SIGMOID && (
								<>
									<InputNumber
										value={get(functionValue, 'pivot')}
										style={{ marginLeft: 10, width: 170 }}
										min={1}
										onChange={(val) =>
											handleParamChange(fieldPath, functionName, 'pivot', val)
										}
									/>
									<InputNumber
										value={get(functionValue, 'exponent')}
										style={{ marginLeft: 10, width: 100 }}
										min={0.5}
										max={1}
										step={0.1}
										onChange={(val) =>
											handleParamChange(
												fieldPath,
												functionName,
												'exponent',
												val,
											)
										}
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
					<Icon type="info-circle" />
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
														href="https://docs.appbase.io"
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
												Field Name
												<Tooltip title="Names of the fields with rank_feature/rank_features. Nested fields are represented with relative indentation.">
													<Icon type="info-circle" />
												</Tooltip>
											</p>
											<Flex>
												<p style={{ width: 150 }}>
													Function
													<Tooltip title="Ranking function to be used for query">
														<Icon type="info-circle" />
													</Tooltip>
												</p>
												<p style={{ width: 170, marginLeft: 10 }}>
													Pivot / Scaling Factor
													<Tooltip title="You can set pivot value for saturation / sigmoid function. For log function you can set scaling factor value">
														<Icon type="info-circle" />
													</Tooltip>
												</p>
												{hasSigmoidField && (
													<p style={{ width: 100, marginLeft: 10 }}>
														Exponent
														<Tooltip title="Configure the exponent value for sigmoid function">
															<Icon type="info-circle" />
														</Tooltip>
													</p>
												)}
											</Flex>
										</Flex>
										{renderFields()}
									</Card>
								)}
								<br />
								{fieldsToShowInDropDown.length > 0 && (
									<div style={{ position: 'relative', display: 'inline-block' }}>
										<Select
											showSearch
											style={{ width: 400 }}
											placeholder="Add rank_feature/rank_features fields from schema "
											value={undefined}
											onChange={handleFieldChange}
										>
											{fieldsToShowInDropDown.map((field) => (
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
												href="https://docs.appbase.io"
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
	const localRelevancy = get(state, `$getLocalRelevancy.${appName}`);
	const localMapping = get(state, `$getLocalMapping.${appName}`);
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
