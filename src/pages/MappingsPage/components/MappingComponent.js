import React from 'react';
import { Card, Tooltip, Button, Icon, Skeleton, Row, Alert, Empty } from 'antd';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import get from 'lodash/get';
import omit from 'lodash/omit';
import MappingsWrapper from '../../../components/MappingsWrapper';
import NewField from './NewField';
import FieldRow from './FieldRow';
import ObjectField from './ObjectField';
import ReIndexWrapper from '../../../components/ReIndexWrapper';
import SearchPreviewModal from '../../../components/SearchPreviewModal';
import { footerStyles } from './styles';

import { getMappingsByPath, deleteMappingField, updateMapping } from './utils/mappings';
import { updateObjectNestedProperty } from './utils';
import { VIEWS } from '../../../constants/props';

class MappingComponent extends React.Component {
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

	setMapping = ({
		usecase,
		type,
		mappings,
		enableNgram,
		enableSynonyms,
		language,
		flattenUsecase,
		flattenType,
		updateState,
		path,
		fieldType,
		fieldUseCase,
	}) => {
		const updatedMappings = updateMapping({
			originalMapping: mappings,
			usecase: fieldUseCase,
			path,
			type: fieldType,
			settings: {
				enableNgram,
				enableSynonyms,
				language,
			},
		});
		const updatedUsecase = updateObjectNestedProperty({
			obj: usecase,
			fields: path.split('.'),
			value: fieldUseCase,
		});

		const updatedType = updateObjectNestedProperty({
			obj: type,
			fields: path.split('.'),
			value: fieldType,
		});

		const updatedFlattenUsecase = {
			...flattenUsecase,
			[path]: usecase,
		};

		const updatedFlattenType = {
			...flattenType,
			[path]: type,
		};

		updateState({
			mappings: updatedMappings,
			usecase: updatedUsecase,
			type: updatedType,
			flattenType: updatedFlattenType,
			flattenUsecase: updatedFlattenUsecase,
		});
	};

	renderMapping = ({
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
							this.handleDelete({
								usecase: initialUseCase,
								path: deletePath,
								type: initialType,
								...rest,
							})
						}
						view={VIEWS.SCHEMA}
					>
						{this.renderMapping({
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
						this.setMapping({
							fieldType,
							fieldUseCase,
							path: fieldPath,
							usecase: initialUseCase,
							type: initialType,
							mappings,
							...rest,
						})
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
				/>
			);
		});
	};

	render() {
		const { collapsed } = this.props;
		return (
			<MappingsWrapper>
				{({
					isFetchingMapping,
					isFetchingSetting,
					error,
					reloadMappings,
					hasMappingsChanged,
					cancelChanges,
					handleReindex,
					usecase,
					type,
					appName,
					...rest
				}) => (
					<div>
						{error ? (
							<Row>
								<Alert
									type="error"
									message={
										error.message || <pre>{JSON.stringify(error, null, 4)}</pre>
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
										<p>Add new fields or change the types of existing ones.</p>
									</div>
								}
								style={{ marginBottom: 30 }}
								extra={
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
										<NewField
											onAddField={({
												type: fieldType,
												path,
												usecase: fieldUseCase,
											}) =>
												this.setMapping({
													fieldType,
													fieldUseCase,
													path,
													usecase,
													type,
													...rest,
												})
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
											{this.renderMapping({
												initialUseCase: usecase,
												initialType: type,
												usecase,
												type,
												init: true,
												...rest,
											})}
										</>
									)}
								</>
							</Card>
						)}
						<ReIndexWrapper appName={appName}>
							{({ refetch }) => (
								<div
									style={{
										position: 'fixed',
										overflow: 'hidden',
										bottom: 0,
										left: collapsed ? 80 : 260,
										right: 0,
									}}
								>
									<div className={footerStyles}>
										<SearchPreviewModal app={appName} />
										<div>
											<Button
												type="primary"
												size="large"
												style={{ margin: '0 10px' }}
												onClick={() => handleReindex(refetch)}
												disabled={
													isFetchingMapping ||
													isFetchingSetting ||
													!hasMappingsChanged
												}
											>
												Confirm Mapping Changes
											</Button>
											<Button
												size="large"
												disabled={
													isFetchingMapping ||
													isFetchingSetting ||
													!hasMappingsChanged
												}
												onClick={cancelChanges}
											>
												Cancel
											</Button>
										</div>
									</div>
								</div>
							)}
						</ReIndexWrapper>
					</div>
				)}
			</MappingsWrapper>
		);
	}
}

MappingComponent.propTypes = {
	collapsed: PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => ({
	collapsed: get(state, 'sideBarCollapsed'),
});

export default connect(mapStateToProps)(MappingComponent);
