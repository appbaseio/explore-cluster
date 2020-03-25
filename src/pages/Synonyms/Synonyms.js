import React from 'react';
import { Card, Table, Icon, Button, Input } from 'antd';
import { css } from 'emotion';

import { container } from '../ResultsPage/styles';
import SynonymsModal from './components/SynonymsModal';

const expression = css`
	.light {
		font-size: 12px;
		color: #8c8c8c;
		margin: 0 5px;
	}
`;

const data = [
	{
		type: 'equivalent',
		synonym: 'a, b',
		id: '1',
	},
	{
		type: 'one-way',
		synonym: 'a, b => c',
		id: '2',
	},
	{
		type: 'equivalent',
		synonym: 'a, d,e,g',
		id: '3',
	},
	{
		type: 'one-way',
		synonym: 'a, b => z',
		id: '4',
	},
];

const Synonyms = () => {
	const columns = [
		{
			title: 'Type',
			dataIndex: 'type',
			key: 'type',
		},
		{
			title: 'Synonyms',
			dataIndex: 'synonym',
			key: 'synonym',
			render: (value, record) => {
				if (record.type === 'one-way') {
					return (
						<span className={expression}>
							{value.split('=>')[1]}
							<Icon className="light" type="arrow-right" />
							{value.split('=>')[0]}
						</span>
					);
				}

				return value;
			},
		},
		{
			title: 'Action',
			dataIndex: 'id',
			key: 'id',
			render: (value, record) => {
				return (
					<div>
						<SynonymsModal
							type={record.type}
							id={record.id}
							synonyms={record.synonym}
							renderButton={({ handleModal }) => {
								return (
									<Button
										shape="circle-outline"
										size="small"
										icon="edit"
										onClick={handleModal}
										style={{ marginRight: 5 }}
									/>
								);
							}}
						/>
						<Button shape="circle-outline" size="small" type="danger" icon="delete" />
					</div>
				);
			},
			width: 100,
		},
	];
	return (
		<div className={container}>
			<Card>
				<div>
					{/* Datasearch would come here for filtering */}
					<SynonymsModal
						renderButton={({ handleModal }) => {
							return (
								<Button onClick={handleModal} type="primary">
									Add Synonyms
								</Button>
							);
						}}
					/>
				</div>
				<Table
					rowKey={row => {
						return row.id;
					}}
					bordered={false}
					dataSource={data}
					columns={columns}
				/>
			</Card>
		</div>
	);
};

export default Synonyms;
