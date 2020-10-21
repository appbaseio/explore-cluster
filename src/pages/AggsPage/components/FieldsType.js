import React from 'react';
import get from 'lodash/get';
import PropTypes from 'prop-types';
import { css } from 'react-emotion';
import { Skeleton, Button, Icon, Tooltip, Empty, Row, Col, Select } from 'antd';
import MappingWrapper from '../../../components/MappingsWrapper';
import FieldRow from '../../MappingsPage/components/FieldRow';
import ObjectField from '../../MappingsPage/components/ObjectField';
import { VIEWS } from '../../../constants/props';
import { getMappingsByPath, hasKeyword } from '../../../utils/mappings';
import conversionMap from '../../../utils/conversionMap';

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
		title: 'Aggregation Type',
		info:
			'Set the aggregation type for the fields. Only fields with their type set appear in the "Test Search Relevancy" UI view.',
	},
];

const { Option } = Select;

const FieldType = ({ handleFieldType, handleDelete, fieldTypes, updateToAggsField }) => {
	const renderMapping = ({
		// initialUseCase & initialType are passed to handle the delete field, otherwise usecase/type value can change with recursive iteration
		usecase,
		type,
		initialUseCase,
		initialType,
		mappings,
		path = '',
		init = false,
		flattenType,
		...rest
	}) => {
		if (init && (!usecase || Object.keys(usecase).length === 0)) {
			return (
				<Empty
					image={Empty.PRESENTED_IMAGE_SIMPLE}
					description={<span>No Mappings Present</span>}
				/>
			);
		}

		if (!Object.keys(fieldTypes).length) {
			return (
				<Empty
					image={Empty.PRESENTED_IMAGE_SIMPLE}
					description={<span>Please add aggregation fields from the dropdown below</span>}
				/>
			);
		}

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
								...rest,
							})
						}
						view={VIEWS.SEARCH}
					>
						{renderMapping({
							usecase: usecaseVal,
							type: typeVal,
							path: `${path}${field}.`,
							mappings,
							initialUseCase,
							initialType,
							...rest,
						})}
					</ObjectField>
				);
			}

			if (!conversionMap[typeVal]) {
				return null;
			}
			if (
				usecaseVal === 'none' ||
				usecaseVal === 'search' ||
				!get(fieldTypes, `${path}${field}${typeVal === 'text' ? '.keyword' : ''}`, null)
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
						<Select
							value={get(
								fieldTypes,
								`${fieldPath}${hasKeyword(mapping) ? '.keyword' : ''}`,
							)}
							placeholder="Select Type"
							style={{ width: 150 }}
							onChange={(selected) =>
								handleFieldType({
									path: `${fieldPath}${hasKeyword(mapping) ? '.keyword' : ''}`,
									type: selected,
									flattenType,
								})
							}
						>
							<Option value="term">Term</Option>
							{hasKeyword(mapping) ? null : <Option value="range">Range</Option>}
						</Select>
					)}
					onDelete={(deletePath) =>
						handleDelete({
							path: deletePath,
							flattenType,
							...rest,
						})
					}
				/>
			);
		});
	};

	const getAggsField = ({ flattenUsecase: usecases, flattenType: types }) => {
		if (usecases && types) {
			const newAggsFields = Object.keys(types).reduce((agg, field) => {
				if (types[field] === 'text') {
					if (
						usecases[field] !== 'search' &&
						usecases[field] !== 'none' &&
						!get(fieldTypes, `${field}.keyword`, null)
					) {
						return [...agg, field];
					}

					return [...agg];
				}

				if (!get(fieldTypes, `${field}`, null) && conversionMap[types[field]]) {
					return [...agg, field];
				}
				return [...agg];
			}, []);

			return newAggsFields;
		}

		return [];
	};

	return (
		<MappingWrapper>
			{({
				flattenUsecase,
				flattenType,
				usecase,
				type,
				reloadMappings,
				isFetchingMapping,
				isFetchingSetting,
				...rest
			}) => (
				<React.Fragment>
					<Tooltip title="Fetch latest Mappings">
						<Button
							style={{ marginRight: 8, color: '#1890ff' }}
							onClick={reloadMappings}
						>
							<Icon type="reload" />
							Reload Mappings
						</Button>
					</Tooltip>
					<div style={{ marginTop: 20 }}>
						{isFetchingSetting || isFetchingMapping ? (
							<Skeleton />
						) : (
							<>
								<Row type="flex" className={headerRow} justify="space-between">
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
								{renderMapping({
									initialUseCase: usecase,
									initialType: type,
									usecase,
									type,
									flattenType,
									flattenUsecase,
									init: true,
									...rest,
								})}
							</>
						)}
					</div>
					<br />
					{getAggsField({ flattenUsecase, flattenType }).length > 0 ? (
						<div style={{ position: 'relative', display: 'inline-block' }}>
							<Select
								showSearch
								style={{ width: 300 }}
								placeholder="Add aggregation fields from schema"
								value={undefined}
								onChange={(field) =>
									updateToAggsField({ path: field, flattenType })
								}
							>
								{getAggsField({ flattenUsecase, flattenType }).map((field) => (
									<Option key={field} value={field}>
										{field}
									</Option>
								))}
							</Select>
						</div>
					) : null}
				</React.Fragment>
			)}
		</MappingWrapper>
	);
};

FieldType.propTypes = {
	handleFieldType: PropTypes.func.isRequired,
	handleDelete: PropTypes.func.isRequired,
	updateToAggsField: PropTypes.func.isRequired,
	fieldTypes: PropTypes.oneOfType([PropTypes.object, PropTypes.array]).isRequired,
};

export default FieldType;
