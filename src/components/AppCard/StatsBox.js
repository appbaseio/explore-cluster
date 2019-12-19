import React from 'react';
import {
 Card, Col, Icon, Row, Tag,
} from 'antd';
import { css } from 'react-emotion';
import { withRouter } from 'react-router-dom';
import { cardActions } from './styles';
import AppActions from '../AppActions';

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

export const colorBar = css`
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

function StatsBox(props) {
	let cols = [];
	const {
		title, data, style, showDelete,
	} = props; // prettier-ignore
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
		<div
			onClick={() => {
				props.history.push(`/app/${data.index}/overview`);
			}}
			css={flex}
		>
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
				minHeight: '256px',
				...style,
			}}
			bodyStyle={{ paddingBottom: '40px' }}
			className={cardActions}
		>
			<Row
				onClick={() => {
					props.history.push(`/app/${data.index}/overview`);
				}}
				gutter={8}
			>
				{cols.length ? null : noData}
				{cols.map((col, index) => (
					<Col key={`stats-${index + 1}`} span={12}>
						{col}
					</Col>
				))}
			</Row>
			{showDelete ? (
				<React.Fragment>
					<div
						css={{
							color: '#aaa',
							position: 'absolute',
							bottom: 10,
							textAlign: 'center',
							width: 'calc(100% - 48px)',
						}}
					>
						<Icon type="ellipsis" theme="outlined" />
					</div>

					<AppActions
						onExploreClick={() => {
							props.history.push(`/app/${data.index}/overview`);
						}}
						title={title}
						data={data}
					/>
				</React.Fragment>
			) : null}
		</Card>
	);
}

export default withRouter(StatsBox);
