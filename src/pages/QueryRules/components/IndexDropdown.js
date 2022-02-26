import React from 'react';
import PropTypes from 'prop-types';
import { Select } from 'antd';
import { connect } from 'react-redux';
import get from 'lodash/get';

import { loadApps } from '../../../actions';
import { getErrorClass } from '../utils/error';
import { hasValuesChanged } from '../utils';

const { Option } = Select;

class IndexDropdown extends React.Component {
	componentDidMount() {
		const { apps, fetchApps } = this.props;

		if (!apps) {
			fetchApps();
		}
	}

	shouldComponentUpdate(nextProps) {
		return hasValuesChanged(this.props, nextProps, ['apps', 'error', 'selectedIndexes']);
	}

	handleChange = (values) => {
		const { onChange, selectedIndexes } = this.props;
		const isAllIndex = selectedIndexes.includes('*');
		const isSelectingAllIndex = values.includes('*');

		if (isAllIndex) {
			onChange(values.filter((index) => index !== '*'));
		} else if (isSelectingAllIndex) {
			onChange(['*']);
		} else {
			onChange(values);
		}
	};

	render() {
		const { apps, error, selectedIndexes } = this.props;

		if (!apps) {
			return null;
		}

		const filteredApps = Object.keys(apps).filter(
			(app) => !app.startsWith('.') && !app.startsWith('metricbeat'),
		);
		return (
			<Select
				mode="multiple"
				style={{ width: '100%' }}
				placeholder="Select Indexes"
				className={getErrorClass(error)}
				value={selectedIndexes}
				onChange={this.handleChange}
				data-cy="index-dropdown"
			>
				<Option key="*">* (Include all index)</Option>
				{filteredApps.map((app) => (
					<Option key={app} data-cy={app}>
						{app}
					</Option>
				))}
			</Select>
		);
	}
}

IndexDropdown.propTypes = {
	apps: PropTypes.object,
	fetchApps: PropTypes.func.isRequired,
	selectedIndexes: PropTypes.array,
	onChange: PropTypes.func.isRequired,
	error: PropTypes.object,
};

IndexDropdown.defaultProps = {
	apps: null,
	selectedIndexes: [],
	error: {},
};

const mapStateToProps = (state) => ({
	apps: get(state, 'apps.data'),
});

const mapDispatchToProps = (dispatch) => ({
	fetchApps: () => dispatch(loadApps()),
});

export default connect(mapStateToProps, mapDispatchToProps)(IndexDropdown);
