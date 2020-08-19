import React from 'react';
import get from 'lodash/get';
import { connect } from 'react-redux';
import Mappings from '../../MappingsPage/components/Mappings';

class FieldsType extends React.Component {
	render() {
		const { appName } = this.props;

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
						<div style={{ width: 150 }}>Field Type</div>
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
