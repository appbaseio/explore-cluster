import React from 'react';
import get from 'lodash/get';
import isEqual from 'lodash/isEqual';
import { Select } from 'antd';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Mappings from '../../MappingsPage/components/MappingComponent';
import conversionMap from '../../MappingsPage/components/utils/conversionMap';
import { hasKeyword } from '../utils';
import { VIEWS } from '../../../constants/props';

const { Option } = Select;

class FieldsType extends React.Component {
	state = {
		// this are fields for which aggs type (Term / Range) is not yet set
		aggsFields: [],
	};

	mappingsRef = React.createRef();

	componentDidMount() {
		const { onInit } = this.props;
		if (onInit) {
			onInit({ ref: this.mappingsRef });
		}
		this.setPossibleAggsField();
	}

	componentDidUpdate() {
		this.setPossibleAggsField();
	}

	setPossibleAggsField = () => {
		const { fieldTypes } = this.props;
		const usecases = get(this, 'mappingsRef.current.wrappedInstance.flattenUsecase', null);
		const types = get(this, 'mappingsRef.current.wrappedInstance.flattenType', null);
		console.log(types);
		if (usecases && types) {
			const newAggsFields = Object.keys(types).reduce((agg, field) => {
				if (types[field] === 'text') {
					console.log(field, usecases[field], fieldTypes);
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
			const { aggsFields } = this.state;
			console.log('aggsFields', aggsFields);
			console.log('newAggsFields', newAggsFields);
			if (!isEqual(newAggsFields.sort(), aggsFields)) {
				this.setState({ aggsFields: newAggsFields });
			}
		}
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
		const { onFieldsUpdate, fieldTypes } = this.props;
		const types = get(this, 'mappingsRef.current.wrappedInstance.flattenType', null);
		const aggType = 'term';
		let path = `${field}`;
		if (get(types, field) === 'text') {
			path = `${path}.keyword`;
		}

		onFieldsUpdate({
			...fieldTypes,
			[path]: aggType,
		});
	};

	handleRemoveFromAggs = (field) => {
		const { onFieldsUpdate, fieldTypes } = this.props;
		const types = get(this, 'mappingsRef.current.wrappedInstance.flattenType', null);
		let path = `${field}`;
		if (get(types, field) === 'text') {
			path = `${path}.keyword`;
		}

		const newFieldTypes = { ...fieldTypes };
		delete newFieldTypes[path];

		onFieldsUpdate({
			...newFieldTypes,
		});
	};

	render() {
		const { appName, fieldTypes } = this.props;
		const { aggsFields } = this.state;
		return (
			<React.Fragment>
				<Mappings
					appName={appName}
					view={VIEWS.AGGREGATION}
					fieldTypes={fieldTypes}
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
								title: 'Aggregation Type',
								info:
									'Set the aggregation type for the fields. Only fields with their type set appear in the "Test Search Relevancy" UI view.',
							},
						],
					}}
					onChange={() => {}}
					ref={this.mappingsRef}
					renderColumn={({ path, mapping }) => (
						<Select
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
					onRemove={this.handleRemoveFromAggs}
				/>
				{aggsFields.length > 0 ? (
					<div style={{ position: 'relative', display: 'inline-block' }}>
						<Select
							showSearch
							key={aggsFields.length}
							style={{ width: 300 }}
							placeholder="Add aggregation fields from schema"
							onChange={this.updateToAggsField}
						>
							{aggsFields.map((field) => (
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
