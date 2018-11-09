import React from 'react';
import { Row, Col } from 'antd';
import { css } from 'react-emotion';

const title = css`
	font-weight: bold;
	font-size: 14px;
	text-transform: uppercase;
	color: #888;
`;

const stats = css`
	font-size: 14px;
	text-transform: capitalize;
	margin-bottom: 16px;
`;

const blackList = ['index', 'uuid'];

export default function StatsBox({ data }) {
	const noData = (
		<div
			css={{
				padding: 60,
				textAlign: 'center',
				color: 'rgba(0,0,0,0.45)',
			}}
		>
			No data
		</div>
	);

	if (typeof data !== 'object') return noData;

	const cols = Object.keys(data)
		.filter(item => !blackList.includes(item))
		.map(item => (
			<div>
				<div className={title}>{item.split('.').join(' ')}</div>
				<div className={stats}>{data[item]}</div>
			</div>
		));

	if (!cols.length) return noData;

	return (
		<Row gutter={8}>
			{cols.map((col, index) => (
				<Col key={`stats-${index + 1}`} span={12}>
					{col}
				</Col>
			))}
		</Row>
	);
}
