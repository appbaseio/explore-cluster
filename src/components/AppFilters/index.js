import React, { useEffect, useState } from 'react';
import { Button, Checkbox, Icon, Input, Radio, Row, Tooltip } from 'antd';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { css } from 'emotion';
import { loadApps, updateAppScreenPreferences } from '../../actions';
import { children as childrenProp } from '../../utils/prop-types';

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

function AppFilters({ apps, children, preferences, updatePreferences, fetchApps }) {
	const [data, setData] = useState([]);
	const [systemIndices, setSystemIndices] = useState(preferences.showSystemIndices);
	const [searchTerm, setSearchTerm] = useState('');
	const [listView, setListView] = useState(preferences.showListView);

	const setFilteredData = () => {
		const dataToPonder = systemIndices
			? apps
			: apps.filter(
					(dataItem) =>
						dataItem.index &&
						dataItem.index[0] !== '.' &&
						!dataItem.index.includes('metricbeat-'),
			  );
		setData(dataToPonder.filter((dataItem) => (dataItem.index || '').includes(searchTerm)));
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
	}, [searchTerm, systemIndices, apps]);

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
					<Tooltip title="Reload Indices">
						<Button style={{ marginRight: 10 }} icon="redo" onClick={fetchApps} />
					</Tooltip>
					<Radio.Group
						defaultValue={preferences.showListView ? 'list' : 'card'}
						buttonStyle="solid"
						onChange={(e) => handleListToggle(e.target.value === 'list')}
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
	children: childrenProp,
	preferences: PropTypes.object,
	updatePreferences: PropTypes.func.isRequired,
	fetchApps: PropTypes.func.isRequired,
};

AppFilters.defaultProps = {
	apps: [],
	children: null,
	preferences: {},
};

const mapStateToProps = (state) => ({
	preferences: state.appsScreenPreferences,
});

const mapDispatchToProps = (dispatch) => ({
	updatePreferences: (payload) => dispatch(updateAppScreenPreferences(payload)),
	fetchApps: () => dispatch(loadApps()),
});

export default connect(mapStateToProps, mapDispatchToProps)(AppFilters);
