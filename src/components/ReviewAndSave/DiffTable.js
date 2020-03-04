import { Col, Icon, Row, Table } from 'antd';
import { get, keys } from 'lodash';
import React from 'react';

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
