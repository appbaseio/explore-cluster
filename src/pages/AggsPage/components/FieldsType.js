import React from 'react';
import get from 'lodash/get';
import { Select } from 'antd';
import { connect } from 'react-redux';
import Mappings from '../../MappingsPage/components/Mappings';
import { hasKeyword } from '../utils';
import { getMappingsByPath } from '../../MappingsPage/components/utils/mappings';

const { Option } = Select;

class FieldsType extends React.Component {
	mappingsRef = React.createRef();

	componentDidMount() {
		const { onInit } = this.props;
		if (onInit) {
			onInit({ ref: this.mappingsRef });
		}
	}

	handleMappingChange = () => {
		const usecases = get(this, 'mappingsRef.current.wrappedInstance.flattenUsecase', {});
		const mappings = get(this, 'mappingsRef.current.wrappedInstance.state.rawMappings', {});

		const { fieldTypes, onFieldsUpdate } = this.props;

		const aggsFields = Object.keys(usecases).filter((field) => usecases[field] !== 'search');

		const searchFields = Object.keys(usecases).filter((field) =>
			usecases[field].includes('search'),
		);

		const allFieldTypes = aggsFields.map((field) => {
			return hasKeyword(
				getMappingsByPath({
					mappings,
					path: field,
				}),
			)
				? `${field}.keyword`
				: field;
		});

		/**
		 * Check the saved fieldTypes coming from props and remove the deleted aggs mappings.
		 */
		console.log(allFieldTypes);


		this.setState({
			searchFields,
		});

		if (onFieldsUpdate) {
			onFieldsUpdate();
		}
	};

	render() {
		const { appName, fieldTypes } = this.props;

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
								title: 'Field Weight',
								info:
									'Set the search weight to boost query matches against this field. Higher weight fields imply a higher boost.',
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
							style={{ width: 150 }}
							onChange={(selected) => console.log(selected)}
						>
							<Option value="term">Term</Option>
							{hasKeyword(mapping) ? null : <Option value="range">Range</Option>}
						</Select>
					)}
				/>
			</React.Fragment>
		);
	}
}

const mapStateToProps = (state) => {
	const appName = get(state, '$getCurrentApp.name');
	return {
		isLoading: get(state, '$getAppSettings.isFetching'),
		appName,
	};
};

export default connect(mapStateToProps, null)(FieldsType);
