import React, { useEffect, useState } from 'react';
import {
 Row, Icon, Input, Checkbox, Tooltip, Radio,
} from 'antd';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { css } from 'emotion';
import styled from 'react-emotion';
import { updateAppScreenPreferences } from '../../actions';

const commonFlex = css`
	display: flex;
	justify-content: space-between;
	align-items: center;
`;

const searchClass = css`
	${commonFlex};
	width: 50%;
	@media (max-width: 600px) {
		display: -webkit-box;
		width: 77%;
	}
`;

const sysIndicesCheckbox = css`
	white-space: nowrap;
	margin-left: 5px;
	@media (max-width: 600px) {
		margin-left: 0;
	}
`;

function AppFilters({
 apps, children, preferences, updatePreferences,
}) {
	const [data, setData] = useState([]);
	const [systemIndices, setSystemIndices] = useState(preferences.showSystemIndices);
	const [searchTerm, setSearchTerm] = useState('');
	const [listView, setListView] = useState(preferences.showListView);

	const setFilteredData = () => {
		const dataToPonder = systemIndices
			? apps
			: apps.filter(dataItem => dataItem.index && dataItem.index[0] !== '.');
		setData(dataToPonder.filter(dataItem => dataItem.index.includes(searchTerm)));
	};
	const handleInputChange = (e) => {
		setSearchTerm(e.target.value);
	};
	const handleCheckboxChange = (e) => {
		setSystemIndices(e.target.checked);
		updatePreferences({ showSystemIndices: e.target.checked });
	};
	const handleListToggle = (checked) => {
		setListView(checked);
		updatePreferences({ showListView: checked });
	};
	useEffect(() => {
		setFilteredData();
	}, [searchTerm, systemIndices]);

	return (
		<>
			<div gutter={22} className={commonFlex} style={{ padding: '10px' }}>
				<div className={searchClass}>
					<Input
						placeholder="Filter by index name"
						onChange={handleInputChange}
						style={{ width: '69%' }}
					/>
					<Checkbox
						className={sysIndicesCheckbox}
						defaultChecked={systemIndices}
						onChange={handleCheckboxChange}
					>
						Show system indices
					</Checkbox>
				</div>
				<div>
					<Radio.Group
						defaultValue={preferences.showListView ? 'list' : 'card'}
						buttonStyle="solid"
						onChange={e => handleListToggle(e.target.value === 'list')}
					>
						<Tooltip title="Show as grid view" placement="topRight">
							<Radio.Button value="card">
								<Icon type="appstore" />
							</Radio.Button>
						</Tooltip>
						<Tooltip title="Show as list view">
							<Radio.Button value="list">
								<Icon type="unordered-list" />
							</Radio.Button>
						</Tooltip>
					</Radio.Group>
				</div>
			</div>
			<Row>{children(data, listView)}</Row>
		</>
	);
}

AppFilters.propTypes = {
	apps: PropTypes.array,
};

AppFilters.defaultProps = {
	apps: [],
};

const mapStateToProps = state => ({
	preferences: state.appsScreenPreferences,
});

const mapDispatchToProps = dispatch => ({
	updatePreferences: payload => dispatch(updateAppScreenPreferences(payload)),
});

export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(AppFilters);
