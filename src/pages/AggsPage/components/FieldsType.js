import React from 'react';
import get from 'lodash/get';
import PropTypes from 'prop-types';
import { css } from 'react-emotion';
import { Skeleton, Button, Icon, Tooltip, Empty, Row, Col, InputNumber } from 'antd';
import MappingWrapper from '../../../components/MappingsWrapper';
import FieldRow from '../../MappingsPage/components/FieldRow';
import ObjectField from '../../MappingsPage/components/ObjectField';
import { VIEWS } from '../../../constants/props';
import { getMappingsByPath } from '../../../utils/mappings';

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

const FieldType = ({ handleFieldWeights, handleDelete, fieldWeights }) => {
	const renderMapping = ({
		// initialUseCase & initialType are passed to handle the delete field, otherwise usecase/type value can change with recursive iteration
		usecase,
		type,
		initialUseCase,
		initialType,
		mappings,
		path = '',
		init = false,
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

			if (usecaseVal === 'none' || usecaseVal === 'aggs' || typeVal !== 'text') {
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
								value={fieldWeights[fieldPath] || 1}
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
							...rest,
						})
					}
				/>
			);
		});
	};
	return (
		<MappingWrapper>
			{({ usecase, type, reloadMappings, isFetchingMapping, isFetchingSetting, ...rest }) => (
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
									init: true,
									...rest,
								})}
							</>
						)}
					</div>
				</React.Fragment>
			)}
		</MappingWrapper>
	);
};

FieldType.propTypes = {
	handleFieldWeights: PropTypes.func.isRequired,
	handleDelete: PropTypes.func.isRequired,
	fieldWeights: PropTypes.oneOfType([PropTypes.object, PropTypes.array]).isRequired,
};

export default FieldType;
