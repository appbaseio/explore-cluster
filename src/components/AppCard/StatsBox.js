import React from 'react';
import {
 Row, Col, Card, Tag,
} from 'antd';
import { css } from 'react-emotion';

const titleStyles = css`
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

const blackList = ['index', 'uuid', 'docs.deleted', 'pri.store.size', 'health', 'status'];

const flex = {
	display: 'flex',
	flexDirection: 'row',
	justifyContent: 'space-between',
	alignItems: 'center',
};

export default function StatsBox({ data, title, style = {} }) {
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

	let cols = [];
	if (typeof data === 'object') {
		cols = Object.keys(data)
			.filter(item => !blackList.includes(item))
			.map(item => (
				<div>
					<div className={stats}>{data[item]}</div>
					<div className={titleStyles}>{renderItem(item)}</div>
				</div>
			));
	}

	const cardTitle = (
		<div css={flex}>
			<span css={flex}>
				{title} &nbsp;&nbsp;
				<Tag>{data.status}</Tag>
			</span>
			<span
				style={{
					backgroundColor: data.health === 'green' ? 'limegreen' : data.health,
				}}
				className={colorBar}
			/>
		</div>
	);

	return (
		<Card
			title={cardTitle}
			style={{
				overflow: 'hidden',
				...style,
			}}
		>
			<Row gutter={8}>
				{cols.length ? null : noData}
				{cols.map((col, index) => (
					<Col key={`stats-${index + 1}`} span={12}>
						{col}
					</Col>
				))}
			</Row>
		</Card>
	);
}
