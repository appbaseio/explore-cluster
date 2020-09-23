import React from 'react';
import get from 'lodash/get';
import { connect } from 'react-redux';
import { InputNumber, Select } from 'antd';
import PropTypes from 'prop-types';
import HighLighter from '../../../components/HighLighter';
import Mappings from '../../MappingsPage/components/Mappings';
import { getSubFields } from '../../../utils';
import { getMappingsByPath } from '../../MappingsPage/components/utils/mappings';

const { Option } = Select;

class FieldsWeight extends React.PureComponent {
	state = {
		aggsFields: [],
	};

	mappingsRef = React.createRef();

	componentDidMount() {
		const { onInit } = this.props;
		onInit({ ref: this.mappingsRef });
	}

	handleFieldWeight = ({ field, weight, mapping }) => {
		const {
			enableNgram,
			hasLanguage,
			enableSynonyms,
			onFieldsUpdate,
			fieldWeights,
		} = this.props;
		const updatedFields = getSubFields({
			fields: get(mapping, 'fields'),
			weight,
			address: field,
			skipSearch: enableNgram,
			skipLang: !hasLanguage,
			skipSynonyms: !enableSynonyms,
		});

		onFieldsUpdate({
			...fieldWeights,
			...updatedFields,
		});
	};

	/**
	 * Traverse all mapping nested fields and updates the state with
	 * aggregation fields available and update the fields with weights
	 * and sub-fields.
	 *
	 * @memberof SearchSettings
	 */
	handleMappingChange = () => {
		const usecases = get(this, 'mappingsRef.current.wrappedInstance.flattenUsecase', {});
		const types = get(this, 'mappingsRef.current.wrappedInstance.flattenType', {});
		const mappings = get(this, 'mappingsRef.current.wrappedInstance.state.rawMappings', {});
		const {
			enableNgram,
			hasLanguage,
			enableSynonyms,
			fieldWeights,
			onFieldsUpdate,
		} = this.props;

		/**
		 * Only text and keyword type can be converted to search
		 */
		const aggsFields = Object.keys(usecases).filter(
			(field) =>
				types[field] === 'keyword' ||
				(types[field] === 'text' &&
					(usecases[field] === 'aggs' || usecases[field] === 'none')),
		);

		/**
		 * All fields with usecase search and search aggs
		 */
		const searchFields = Object.keys(usecases).filter((field) =>
			usecases[field].includes('search'),
		);

		/**
		 * Map over all searchable fields and make sure each field is assigned a field weight.
		 */
		const allFieldsWithWeights = searchFields.reduce((agg, field) => {
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
					weight: get(fieldWeights, field, 1),
					address: field,
					skipSearch: enableNgram,
					skipLang: !hasLanguage,
					skipSynonyms: !enableSynonyms,
				}),
			};
		}, {});

		this.setState({
			aggsFields,
		});

		onFieldsUpdate(allFieldsWithWeights);
	};

	updateToSearchField = (field) => {
		const updateMapping = get(this, 'mappingsRef.current.wrappedInstance.setMapping');
		updateMapping({
			usecase: 'searchaggs',
			path: field,
			type: 'text',
		});
	};

	render() {
		const { appName, fieldWeights, enableSynonyms, enableNgram, ...rest } = this.props;
		const { aggsFields } = this.state;
		return (
			<div>
				<Mappings
					{...rest}
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
								title: 'Field Weight',
								info:
									'Set the search weight to boost query matches against this field. Higher weight fields imply a higher boost.',
							},
						],
					}}
					hideAggsFields
					hideCardTitle
					hideFooter
					hideTypeColumn
					forceNgram={enableNgram}
					forceSynonyms={enableSynonyms}
					onChange={this.handleMappingChange}
					ref={this.mappingsRef}
					renderColumn={({ path, mapping }) => (
						<div style={{ width: 150 }}>
							<InputNumber
								value={fieldWeights[path]}
								min={0}
								onChange={(value) => {
									this.handleFieldWeight({
										weight: value,
										field: path,
										mapping,
									});
								}}
							/>
						</div>
					)}
				/>
				{aggsFields.length > 0 ? (
					<div style={{ position: 'relative', display: 'inline-block' }}>
						<Select
							key={aggsFields.length}
							style={{ width: 150 }}
							placeholder="Update to search field"
							onChange={this.updateToSearchField}
						>
							{aggsFields.map((field) => (
								<Option key={field} value={field}>
									{field}
								</Option>
							))}
						</Select>
						{Object.keys(fieldWeights).length === 0 ? (
							<HighLighter title="Update to search fields" />
						) : null}
					</div>
				) : null}
			</div>
		);
	}
}

FieldsWeight.propTypes = {
	appName: PropTypes.string.isRequired,
	enableNgram: PropTypes.bool.isRequired,
	enableSynonyms: PropTypes.bool.isRequired,
	fieldWeights: PropTypes.object.isRequired,
	hasLanguage: PropTypes.bool.isRequired,
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

export default connect(mapStateToProps, null)(FieldsWeight);
