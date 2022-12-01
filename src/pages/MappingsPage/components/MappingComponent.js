import React from 'react';
import { InfoCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { Card, Tooltip, Button, Skeleton, Row, Alert, Empty, Col } from 'antd';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import get from 'lodash/get';
import omit from 'lodash/omit';
import MappingsWrapper from '../../../components/MappingsWrapper';
import NewField from './NewField';
import FieldRow from './FieldRow';
import ObjectField from './ObjectField';
import SearchPreviewModal from '../../../components/SearchPreviewModal';
import { footerStyles, headerRow } from './styles';

import { getMappingsByPath, deleteMappingField } from '../../../utils/mappings';
import { VIEWS } from '../../../constants/props';
import CopyField from './CopyField';

const mappingHeaderLeft = [
	{
		title: 'Field Name',
		info: 'Names of the fields and nested-fields are represented with relative indentation.',
	},
];

const mappingHeaderRight = [
	{
		title: 'Use case',
		info: 'We detect the appropriate analyzers and mappings here representing the usecase - search or aggregations.',
	},
	{
		title: 'Data Type',
		info: 'Type of data in the corresponding field.',
	},
];

class MappingComponent extends React.Component {
	state = {
		showCopyModal: false,
		copiedFieldItem: null,
	};

	handleDelete = ({
		path,
		usecase,
		type,
		mappings,
		updateState,
		deletedPaths,
		flattenUsecase,
		flattenType,
	}) => {
		const newflattenType = omit(flattenType, path);
		const newflattenUsecase = omit(flattenUsecase, path);
		const updatedUsecase = omit(usecase, path);
		const updatedType = omit(type, path);
		const { deletedPath, mappings: updatedMappings } = deleteMappingField({
			originalMapping: mappings,
			path,
		});

		updateState({
			usecase: updatedUsecase,
			type: updatedType,
			mappings: updatedMappings,
			deletedPaths: [...deletedPaths, deletedPath],
			flattenType: newflattenType,
			flattenUsecase: newflattenUsecase,
		});
	};

	renderMapping = ({
		// initialUseCase & initialType are passed to handle the delete field, otherwise usecase/type value can change with recursive iteration
		usecase, // field usecase map
		type, // field type map
		initialUseCase,
		initialType,
		mappings,
		path = '',
		init = false,
		setMapping,
		...rest
	}) => {
		if (init && (!usecase || Object.keys(usecase).length === 0)) {
			return (
				<Empty
					image={Empty.PRESENTED_IMAGE_SIMPLE}
					description={<span data-cy="mappings-empty-field">No Mappings Present</span>}
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
							this.handleDelete({
								usecase: initialUseCase,
								path: deletePath,
								type: initialType,
								mappings,
								...rest,
							})
						}
						view={VIEWS.SCHEMA}
						type={type?.[field]?.isNestedField ? 'nested' : 'object'}
						usecase=""
						setMapping={({
							type: fieldType,
							path: fieldPath,
							usecase: fieldUseCase,
						}) => {
							setMapping([
								{
									type: fieldType,
									usecase: fieldUseCase,
									path: fieldPath,
									properties: mappings.properties?.[field]?.properties,
									shouldEnableConfirmMappingsCTA: true,
								},
							]);
						}}
					>
						{this.renderMapping({
							usecase: usecaseVal,
							type: typeVal,
							path: `${path}${field}.`,
							mappings,
							initialUseCase,
							initialType,
							setMapping,
							...rest,
						})}
					</ObjectField>
				);
			}
			return (
				<FieldRow
					view={VIEWS.SCHEMA}
					key={`${path}${field}`}
					field={field}
					usecase={usecaseVal}
					type={typeVal}
					mapping={getMappingsByPath({ mappings, path: `${path}${field}` })}
					path={`${path}${field}`}
					setMapping={({ type: fieldType, path: fieldPath, usecase: fieldUseCase }) =>
						setMapping([
							{
								type: fieldType,
								usecase: fieldUseCase,
								path: fieldPath,
							},
						])
					}
					onDelete={(deletePath) =>
						this.handleDelete({
							usecase: initialUseCase,
							path: deletePath,
							mappings,
							type: initialType,
							...rest,
						})
					}
					triggerCopyField={() => {
						this.setState({
							showCopyModal: true,
							copiedFieldItem: {
								fieldName: `${path}${field}`,
								fieldUsecase: usecaseVal,
								fieldType: typeVal,
							},
						});
					}}
				/>
			);
		});
	};

	render() {
		const { collapsed, appName } = this.props;
		const { showCopyModal, copiedFieldItem } = this.state;
		return (
			<>
				<>
					<MappingsWrapper>
						{({
							isFetchingMapping,
							isFetchingSetting,
							isReindexing,
							error,
							reloadMappings,
							hasMappingsChanged,
							cancelChanges,
							handleReindex,
							usecase,
							type,
							setMapping,
							...rest
						}) => (
							<div>
								{error ? (
									<Row>
										<Alert
											type="error"
											message={
												error.message || (
													<pre>{JSON.stringify(error, null, 4)}</pre>
												)
											}
										/>
									</Row>
								) : (
									<Card
										title={
											<div>
												<h4>
													<b>Manage Mappings</b>
												</h4>
												<p>
													Add new fields or change the types of existing
													ones.
												</p>
											</div>
										}
										style={{ marginBottom: 30 }}
										extra={
											<React.Fragment>
												<Tooltip title="Fetch latest Mappings">
													<Button
														style={{
															marginRight: 8,
															color: '#1890ff',
														}}
														onClick={reloadMappings}
													>
														<ReloadOutlined
															style={{ margin: '0.25rem' }}
														/>
														Reload Mappings
													</Button>
												</Tooltip>
												<NewField
													onAddField={({
														type: fieldType,
														path,
														usecase: fieldUseCase,
													}) =>
														setMapping([
															{
																type: fieldType,
																usecase: fieldUseCase,
																path,
															},
														])
													}
													fields={Object.keys(usecase || {})}
												/>
											</React.Fragment>
										}
									>
										<>
											{isFetchingSetting || isFetchingMapping ? (
												<Skeleton />
											) : (
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
																	{item.title}{' '}
																	<Tooltip title={item.info}>
																		<InfoCircleOutlined />
																	</Tooltip>
																</p>
															))}
														</Col>
														<Col>
															<Row gutter={8}>
																{mappingHeaderRight.map((item) => (
																	<Col key={item.title} xs={12}>
																		<p
																			style={{
																				width: 155,
																			}}
																		>
																			{item.title}{' '}
																			<Tooltip
																				title={item.info}
																			>
																				<InfoCircleOutlined />
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
															initialUseCase: usecase,
															initialType: type,
															usecase,
															type,
															init: true,
															setMapping,
															...rest,
														})}
													</div>
												</>
											)}
										</>
									</Card>
								)}
								<div
									style={{
										position: 'fixed',
										overflow: 'hidden',
										bottom: 0,
										left: collapsed ? 80 : 260,
										right: 0,
									}}
								>
									<div
										className={footerStyles}
										style={{ flexDirection: 'row-reverse' }}
									>
										<div>
											<Button
												type="primary"
												size="large"
												style={{ margin: '0 10px' }}
												onClick={handleReindex}
												disabled={
													isFetchingMapping ||
													isFetchingSetting ||
													isReindexing ||
													!hasMappingsChanged
												}
												data-cy="confirm-mapping-button"
											>
												Confirm Mapping Changes
											</Button>
											<Button
												size="large"
												disabled={
													isFetchingMapping ||
													isFetchingSetting ||
													isReindexing ||
													!hasMappingsChanged
												}
												onClick={cancelChanges}
											>
												Cancel
											</Button>
										</div>
									</div>
								</div>
								<CopyField
									useAsModal
									visible={showCopyModal}
									copiedFieldItem={copiedFieldItem}
									fields={Object.keys(usecase || {})}
									onCopyField={({
										type: fieldType,
										path,
										usecase: fieldUseCase,
										script,
									}) =>
										setMapping([
											{
												type: fieldType,
												usecase: fieldUseCase,
												path,
												script,
											},
										])
									}
									onCloseModal={() => {
										this.setState({ showCopyModal: false });
									}}
								/>
							</div>
						)}
					</MappingsWrapper>
					<div style={{ position: 'fixed', bottom: 15, left: collapsed ? 120 : 310 }}>
						<SearchPreviewModal app={appName} />
					</div>
				</>
			</>
		);
	}
}

MappingComponent.propTypes = {
	collapsed: PropTypes.bool.isRequired,
	appName: PropTypes.string.isRequired,
};

const mapStateToProps = (state) => ({
	appName: get(state, '$getCurrentApp.name'),
	collapsed: get(state, 'sideBarCollapsed'),
});

export default connect(mapStateToProps)(MappingComponent);
