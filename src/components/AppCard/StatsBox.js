import React from 'react';
import { Row, Col } from 'antd';
import { css } from 'react-emotion';

const title = css`
	font-weight: bold;
	font-size: 13px;
	text-transform: uppercase;
	color: #aaa;
	margin-top: 2px;
	margin-bottom: 18px;
`;

const stats = css`
	font-size: 16px;
	text-transform: capitalize;
`;

const colorBar = css`
	background-color: yellow;
	width: 14px;
	height: 14px;
	border-radius: 50%;
	display: block;
	margin: 6px 0;
`;

const renderItem = (item) => {
	switch (item) {
		case 'pri':
			return 'shards';
		case 'rep':
			return 'replicas';
		case 'docs.count':
			return 'total records';
		case 'store.size':
			return 'size';
		default:
			return item;
	}
};

const blackList = ['index', 'uuid', 'docs.deleted', 'pri.store.size'];

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
				<div className={stats}>
					{item === 'health' ? (
						<span css={{ backgroundColor: data[item] }} className={colorBar} />
					) : (
						data[item]
					)}
				</div>
				<div className={title}>{renderItem(item)}</div>
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
