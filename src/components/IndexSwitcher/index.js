import { Icon, Popconfirm, Select, Tooltip } from 'antd';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import React from 'react';
import get from 'lodash/get';
import { css } from 'emotion';
import { connect } from 'react-redux';
import LabelTag from '../LabelTag';

const popOverClass = css`
	.ant-popover-buttons {
		display: none;
	}
	.ant-popover-inner-content {
		padding: 12px;
	}
`;

function IndexSwitcher({
	item = {},
	filteredApps = [],
	history,
	onSelect,
	renderItem,
	isAppsLoading,
}) {
	if (filteredApps.length === 1 && item.link)
		return (
			<Link to={`/app/${filteredApps[0]}/${item.link}`}>
				{renderItem ? renderItem() : <LabelTag item={item} />}
			</Link>
		);

	const userApps = filteredApps.filter((index) => index && !index.includes('metricbeat-'));
	const sortedApps = userApps.sort((a, b) => {
		if (a < b) {
			return -1;
		}
		if (a > b) {
			return 1;
		}
		return 0;
	});
	function getTitle() {
		if (isAppsLoading) return <div style={{ margin: 4 }}>Loading...</div>;
		if (userApps.length === 0)
			return <div style={{ margin: 4 }}>Please create an index to get started.</div>;
		return (
			<Select
				placeholder="Search for an index."
				style={{ minWidth: 180 }}
				onSelect={(value) => {
					// do not use updateCurrentApp here, since onSelect prop is used for `Test Search Relevancy` button
					if (onSelect) onSelect(value);
					else {
						history.push(`/app/${value}/${item.link}`);
					}
				}}
				showSearch
			>
				{sortedApps.map((app) => (
					<Select.Option key={app} value={app}>
						{app}
					</Select.Option>
				))}
			</Select>
		);
	}

	return (
		<Popconfirm
			overlayClassName={popOverClass}
			placement="right"
			icon={
				<Tooltip title="Select an index to navigate to.">
					<Icon
						style={{
							fontSize: 17,
							marginTop: 2,
							color: '#1890ff',
						}}
						type="info-circle"
					/>
				</Tooltip>
			}
			title={getTitle()}
		>
			{renderItem ? renderItem() : <LabelTag item={item} />}
		</Popconfirm>
	);
}

IndexSwitcher.propTypes = {
	item: PropTypes.object,
	filteredApps: PropTypes.array,
	history: PropTypes.object,
	onSelect: PropTypes.func,
	renderItem: PropTypes.func,
	isAppsLoading: PropTypes.bool,
};

IndexSwitcher.defaultProps = {
	item: {},
	filteredApps: [],
	onSelect: null,
	renderItem: null,
	history: null,
	isAppsLoading: false,
};

const mapStateToProps = (state) => ({
	isAppsLoading: get(state, 'apps.isFetching'),
});

export default connect(mapStateToProps)(IndexSwitcher);
