import React from 'react';
import get from 'lodash/get';
import { Select } from 'antd';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Mappings from '../../MappingsPage/components/Mappings';
import { hasKeyword } from '../utils';
import { getSubFields } from '../../../utils';
import { getMappingsByPath } from '../../MappingsPage/components/utils/mappings';

const { Option } = Select;

class FieldsType extends React.Component {
	state = {
		searchFields: [],
	};

	mappingsRef = React.createRef();

	componentDidMount() {
		const { onInit } = this.props;
		if (onInit) {
			onInit({ ref: this.mappingsRef });
		}
	}

	handleMappingChange = () => {
		const { setSearchFields } = this.props;
		const usecases = get(this, 'mappingsRef.current.wrappedInstance.flattenUsecase', {});
		const mappings = get(this, 'mappingsRef.current.wrappedInstance.state.rawMappings', {});

		const onlySearchFields = Object.keys(usecases).filter(
			(field) => usecases[field] === 'search',
		);
		const searchFields = Object.keys(usecases).filter((field) =>
			usecases[field].includes('search'),
		);

		const allSearchableFields = searchFields.reduce((agg, field) => {
			return {
				...agg,
				...getSubFields({
					fields: get(
						getMappingsByPath({
							mappings,
							path: field,
						}),
						'fields',
						{},
					),
					weight: 1,
					address: field,
				}),
			};
		}, {});

		setSearchFields(allSearchableFields);

		this.setState({
			searchFields: onlySearchFields,
		});
	};

	handleFieldType = ({ path, type }) => {
		const { onFieldsUpdate, fieldTypes } = this.props;
		if (type) {
			onFieldsUpdate({
				...fieldTypes,
				[path]: type,
			});
		} else {
			const savedTypes = Object.keys(fieldTypes)
				.filter((field) => field !== path)
				.reduce(
					(agg, field) => ({
						...agg,
						[field]: get(fieldTypes, field),
					}),
					{},
				);
			onFieldsUpdate(savedTypes);
		}
	};

	updateToAggsField = (field) => {
		const updateMapping = get(this, 'mappingsRef.current.wrappedInstance.setMapping');
		updateMapping({
			usecase: 'searchaggs',
			path: field,
			type: 'text',
		});
	};

	render() {
		const { appName, fieldTypes } = this.props;
		const { searchFields } = this.state;

		return (
			<React.Fragment>
				<Mappings
					appName={appName}
					cardProps={{
						bodyStyle: {
							padding: 0,
						},
						headStyle: {
							padding: 0,
							border: 0,
							display: 'flex',
						},
						style: {
							padding: 0,
						},
						bordered: false,
					}}
					headerRowProps={{
						rightItems: [
							{
								title: 'Use case',
								info:
									'We detect the appropriate analyzers and mappings here representing the usecase - search or aggregations.',
							},
							{
								title: 'Aggregation Type',
								info:
									'Set the aggregation type for the fields. Only fields with their type set appear in the "Test Search Relevancy" UI view.',
							},
						],
					}}
					hideSearchFields
					hideCardTitle
					hideFooter
					hideTypeColumn
					onChange={this.handleMappingChange}
					ref={this.mappingsRef}
					renderColumn={({ path, mapping }) => (
						<Select
							allowClear
							value={get(
								fieldTypes,
								`${path}${hasKeyword(mapping) ? '.keyword' : ''}`,
							)}
							placeholder="Select Type"
							style={{ width: 150 }}
							onChange={(selected) =>
								this.handleFieldType({
									path: `${path}${hasKeyword(mapping) ? '.keyword' : ''}`,
									type: selected,
								})
							}
						>
							<Option value="term">Term</Option>
							{hasKeyword(mapping) ? null : <Option value="range">Range</Option>}
						</Select>
					)}
				/>
				{searchFields.length > 0 ? (
					<div style={{ position: 'relative', display: 'inline-block' }}>
						<Select
							key={searchFields.length}
							style={{ width: 150 }}
							placeholder="Update to search field"
							onChange={this.updateToAggsField}
						>
							{searchFields.map((field) => (
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

FieldsType.propTypes = {
	appName: PropTypes.string.isRequired,
	fieldTypes: PropTypes.object.isRequired,
	onFieldsUpdate: PropTypes.func.isRequired,
	setSearchFields: PropTypes.func.isRequired,
	onInit: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
	const appName = get(state, '$getCurrentApp.name');
	return {
		isLoading: get(state, '$getAppSettings.isFetching'),
		appName,
	};
};

export default connect(mapStateToProps, null)(FieldsType);
