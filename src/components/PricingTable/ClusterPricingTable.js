import React from 'react';
import { Table } from 'antd';
import styled, { css } from 'react-emotion';

const clusterTablePricing = css`
	.cluster-pricing-header {
		background: #fff !important;
	}
`;

const RowContent = styled.div`
	display: flex;
	justify-content: space-between;
`;

const StyledLink = styled.a`
	color: dodgerblue;
	cursor: pointer;
`;

const columns = [
	{
		title: <div style={{ fontWeight: '600' }}>Additional Features</div>,
		dataIndex: 'name',
	},
	{
		title: <div style={{ fontWeight: '600' }}>Available In</div>,
		dataIndex: 'desc',
		width: 400,
	},
];

const data = [
	{
		key: '0',
		name: (
			<RowContent>
				<div>Retain Analytics for greater than 30 days </div>
				<StyledLink href="https://docs.appbase.io/docs/analytics/Overview/" target="_blank">
					Read more
				</StyledLink>
			</RowContent>
		),
		desc: 'Starter tier and above.',
	},
	{
		key: '1',
		name: (
			<RowContent>
				<div>Analytics with custom Events and API access</div>
				<StyledLink href="https://docs.appbase.io/docs/analytics/Overview/" target="_blank">
					Read more
				</StyledLink>
			</RowContent>
		),
		desc: 'Production-I tier and above.',
	},
	{
		key: '2',
		name: (
			<RowContent>
				<div>Search Relevancy</div>
				<StyledLink href="https://docs.appbase.io/docs/search/relevancy/" target="_blank">
					Read more
				</StyledLink>
			</RowContent>
		),
		desc: 'Production-I tier and above.',
	},
	{
		key: '3',
		name: (
			<RowContent>
				<div>Query Suggestions</div>
				<StyledLink
					href="https://docs.appbase.io/docs/analytics/query-suggestions/"
					target="_blank"
				>
					Read more
				</StyledLink>
			</RowContent>
		),
		desc: 'Production-I tier and above.',
	},
	{
		key: '4',
		name: (
			<RowContent>
				<div>Query Rules</div>
				<StyledLink href="https://docs.appbase.io/docs/search/Rules/" target="_blank">
					Read more
				</StyledLink>
			</RowContent>
		),
		desc: 'Production-I tier and above.',
	},
	{
		key: '5',
		name: (
			<RowContent>
				<div>Functions</div>
				<StyledLink href="https://docs.appbase.io/docs/search/Functions" target="_blank">
					Read more
				</StyledLink>
			</RowContent>
		),
		desc: 'Production-II tier and above.',
	},
];

const ClusterPricingTable = () => {
	return (
		<Table
			css={clusterTablePricing}
			columns={columns}
			dataSource={data}
			bordered
			pagination={false}
			size="middle"
		/>
	);
};

export default ClusterPricingTable;
