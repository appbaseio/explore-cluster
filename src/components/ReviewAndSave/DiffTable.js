import { Col, Icon, Row, Table } from 'antd';
import { get, keys } from 'lodash';
import React from 'react';

const settingsMap = {
	size: { title: 'Page Size', description: 'No. of results shown in a page.' },
	fieldWeights: {
		title: 'Field Weights',
		description: 'Search weight for the database fields.',
	},
	dataField: {
		title: 'DataField',
		description: 'Database field(s) to be queried against.',
	},
	searchOperators: {
		title: 'Search Operators',
		description:
			'Enable use of special characters in the search query to enable an advanced search behavior.',
	},
	includeNullValues: {
		title: 'Include Null Values',
		description:
			'Enable to show sparse data or document or items not having the value in the specified field or mapping',
	},
	fuzziness: {
		title: 'Typo Tolerance',
		description: 'Sets a maximum edit distance on the search parameters.',
	},
	sortBy: {
		title: 'Sort By',
		description: 'Sort the results by either Count, Ascending or Descending order.',
	}
};

// eslint-disable-next-line import/prefer-default-export
export function DiffTable({ object, parseDiff }) {
	return (
		<Table
			rowKey="setting"
			pagination={false}
			columns={[
				{
					title: 'Setting',
					dataIndex: 'setting',
					render: text => (
						<>
							<div style={{ fontSize: 16, fontWeight: 600 }}>
								{get(settingsMap, [text, 'title'], text)}
							</div>
							<div>{get(settingsMap, [text, 'description'], null)}</div>
						</>
					),
				},
				{
					title: 'Value',
					dataIndex: 'value',
					align: 'center',
					render: (text, record) => {
						const { value } = record;
						return (
							<Row gutter={22}>
								<Col span={11}>{JSON.stringify(get(value, 'old'), null, 2)}</Col>
								<Col span={2}>
									<Icon type="arrow-right" />
								</Col>
								<Col span={11}>{JSON.stringify(get(value, 'new'), null, 2)}</Col>
							</Row>
						);
					},
				},
			]}
			dataSource={keys(object).map(parseDiff)}
		/>
	);
}
