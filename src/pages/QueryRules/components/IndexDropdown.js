import React from 'react';
import { Select } from 'antd';
import { connect } from 'react-redux';
import { get } from 'lodash';

import { loadApps } from '../../../actions';
import { getErrorClass } from '../error';

const { Option } = Select;

class IndexDropdown extends React.Component {
	state = {
		selectedIndexes: ['*'],
	};

	componentDidMount() {
		const { apps, fetchApps } = this.props;

		if (!apps) {
			fetchApps();
		}
	}

	handleChange = values => {
		const { onChange } = this.props;
		this.setState(
			prevState => {
				const isAllIndex = prevState.selectedIndexes.includes('*');
				const isSelectingAllIndex = values.includes('*');

				if (isAllIndex) {
					return {
						selectedIndexes: values.filter(index => index !== '*'),
					};
				}
				if (isSelectingAllIndex) {
					return {
						selectedIndexes: ['*'],
					};
				}

				return {
					selectedIndexes: values,
				};
			},
			() => {
				const { selectedIndexes } = this.state;
				onChange(selectedIndexes);
			},
		);
	};

	render() {
		const { apps, error } = this.props;
		const { selectedIndexes } = this.state;

		if (!apps) {
			return null;
		}

		const filteredApps = Object.keys(apps).filter(app => !app.startsWith('.'));
		return (
			<Select
				mode="multiple"
				style={{ width: '100%' }}
				placeholder="Select Indexes"
				className={getErrorClass(error)}
				value={selectedIndexes}
				onChange={this.handleChange}
			>
				<Option key="*">* (Include all index)</Option>
				{filteredApps.map(app => (
					<Option key={app}>{app}</Option>
				))}
			</Select>
		);
	}
}

const mapStateToProps = state => ({
	apps: get(state, 'apps.data'),
});

const mapDispatchToProps = dispatch => ({
	fetchApps: () => dispatch(loadApps()),
});

export default connect(mapStateToProps, mapDispatchToProps)(IndexDropdown);
