import React from 'react';
import { Table } from 'antd';
import { Link, withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { css } from 'emotion';
import { colorBar } from '../AppCard/StatsBox';
import AppActions from '../AppActions';

const tableStyle = css`
	background-color: white;
	margin-left: 10px;
	margin-right: 10px;
	padding: 10px;
`;

const getFileSizeInBytes = (size) => {
	if (typeof size !== 'string') return size;
	const sizeInt = size.match(/\d+/)[0];
	if (size.includes('gb')) {
		return sizeInt * 1024 * 1024 * 1024;
	}
	if (size.includes('mb')) {
		return sizeInt * 1024 * 1024;
	}
	if (size.includes('kb')) {
		return sizeInt * 1024;
	}
	return sizeInt;
};

const columns = [
	{
		title: 'Name',
		dataIndex: 'index',
		render: text => <Link to={`/app/${text}/overview`}>{text}</Link>,
		sorter: (a, b) => {
			if (a.index < b.index) return -1;
			if (a.index > b.index) return 1;
			return 0;
		},
		defaultSortOrder: 'ascend',
		width: '15vw',
	},
	{
		title: 'Status',
		dataIndex: 'status',
	},
	{
		title: 'Shards',
		dataIndex: 'pri',
		sorter: (a, b) => a.pri - b.pri,
	},
	{
		title: 'Replicas',
		dataIndex: 'rep',
		sorter: (a, b) => a.rep - b.rep,
	},
	{
		title: 'Total Records',
		dataIndex: 'docs.count',
		sorter: (a, b) => a['docs.count'] - b['docs.count'],
	},
	{
		title: 'Size',
		dataIndex: 'store.size',
		sorter: (a, b) => getFileSizeInBytes(a['store.size']) - getFileSizeInBytes(b['store.size']),
	},
	{
		title: 'Health',
		dataIndex: 'health',
		render: text => (
			<span
				style={{
					backgroundColor: text === 'green' ? 'limegreen' : text,
				}}
				className={colorBar}
			/>
		),
	},
];

function AppTable({ apps, history }) {
	return (
		<Table
			className={tableStyle}
			rowKey={record => record.index}
			dataSource={apps}
			columns={columns}
			scroll={{ x: '74vw' }}
			expandedRowRender={record => (
				<AppActions
					onExploreClick={() => {
						history.push(`/app/${record.index}/overview`);
					}}
					data={record}
				/>
			)}
		/>
	);
}

AppTable.propTypes = {
	apps: PropTypes.array,
	history: PropTypes.object.isRequired,
};

AppTable.defaultProps = {
	apps: [],
};

export default withRouter(AppTable);
