import React from 'react';
import get from 'lodash/get';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { css } from 'react-emotion';
import { Icon, Tooltip, Empty, Row, Col, InputNumber, Select } from 'antd';
import { getSubFields } from '../../../utils';
import FieldRow from '../../MappingsPage/components/FieldRow';
import ObjectField from '../../MappingsPage/components/ObjectField';
import { VIEWS } from '../../../constants/props';
import { getMappingsByPath } from '../../../utils/mappings';
import { setLocalRelevancyState } from '../../../batteries/modules/actions';

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
		aggs: [],
	};

	componentDidMount() {
		// updateWeights for searchable fields initially
		// this will show fields in the UI with weight 1 if the no data fields are set!
		this.updateFieldWeights();

		// get aggsFields
		this.getAggsField();
	}

	componentDidUpdate() {
		this.updateFieldWeights();
	}

	updateFieldWeights = () => {
		const { mappingWrapperProps, appName, localRelevancy, updateLocalRelevancy } = this.props;
		const {
			flattenUsecase,
			mappings,
			isFetchingMapping,
			isFetchingSetting,
		} = mappingWrapperProps;
		const { dataField, fieldWeights } = get(localRelevancy, `${appName}.search`);
		if (
			(!fieldWeights.length || !dataField.length) &&
			!isFetchingMapping &&
			!isFetchingSetting &&
			flattenUsecase
		) {
			const fieldDataTuple = Object.keys(flattenUsecase).reduce(
				(agg, item) => {
					if (
						flattenUsecase[item] === 'search' ||
						flattenUsecase[item] === 'searchaggs'
					) {
						const { enableNgram } = get(localRelevancy, `${appName}.indexSettings`);
						const { enabled: enableSynonyms } = get(
							localRelevancy,
							`${appName}.synonyms`,
						);
						const { language } = get(localRelevancy, `${appName}.language`);

						const fields = getSubFields({
							fields: get(getMappingsByPath({ mappings, path: item }), 'fields'),
							weight: 1,
							address: item,
							skipSearch: !enableNgram,
							skipLang: !language,
							skipSynonyms: !enableSynonyms,
						});

						return [
							[...agg[0], ...Object.keys(fields)],
							[...agg[1], ...Object.values(fields)],
						];
					}

					return agg;
				},
				[[], []],
			);

			updateLocalRelevancy(appName, {
				...get(localRelevancy, appName),
				search: {
					...get(localRelevancy, `${appName}.search`, {}),
					dataField: fieldDataTuple[0],
					fieldWeights: fieldDataTuple[1],
				},
			});
		}
	};

	getAggsField = () => {
		const { mappingWrapperProps } = this.props;
		const { flattenUsecase: usecases, flattenType: types } = mappingWrapperProps;
		if (usecases && types) {
			const newAggsFields = Object.keys(types).reduce((agg, field) => {
				if (usecases[field] === 'aggs' || usecases[field] === 'none') {
					return [...agg, field];
				}
				return [...agg];
			}, []);

			this.setState({ aggs: newAggsFields });
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
		const { mappingWrapperProps, handleDelete, handleFieldWeights } = this.props;
		const { flattenUsecase, setMapping } = mappingWrapperProps;

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
		const { aggs } = this.state;
		const { mappingWrapperProps, handleAddSearchField, appName, localRelevancy } = this.props;
		const { usecase, type, mappings, setMapping } = mappingWrapperProps;
		const { dataField, fieldWeights } = get(localRelevancy, `${appName}.search`);
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
				{aggs.length > 0 ? (
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
							{aggs.map((field) => (
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
	appName: PropTypes.string.isRequired,
	localRelevancy: PropTypes.object.isRequired,
	updateLocalRelevancy: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
	const appName = get(state, '$getCurrentApp.name');
	const localRelevancy = get(state, `$getLocalRelevancy`);
	return {
		appName,
		localRelevancy,
	};
};

const mapDispatchToProps = (dispatch) => ({
	updateLocalRelevancy: (name, data) => dispatch(setLocalRelevancyState(name, data)),
});

export default connect(mapStateToProps, mapDispatchToProps)(FieldWeights);
