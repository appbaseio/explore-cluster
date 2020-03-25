import React from 'react';
import { Card, Table, Icon, Button, message } from 'antd';
import { css } from 'emotion';
import { connect } from 'react-redux';
import { get } from 'lodash';

import { container } from '../ResultsPage/styles';
import SynonymsModal from './components/SynonymsModal';
import { getSynonyms } from './api';

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

class Synonyms extends React.Component {
	state = {
		isFetching: false,
		synonyms: [],
	};

	componentDidMount() {
		const { appName, credentials } = this.props;
		this.setState({
			isFetching: true,
		});
		getSynonyms({
			appName,
			credentials,
		})
			.then(res => {
				this.setState({
					synonyms: res || [],
					isFetching: false,
				});
			})
			.catch(e => {
				message.error(e.message);
				this.setState({
					isFetching: false,
				});
			});
	}

	render() {
		const { synonyms, isFetching } = this.state;
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
								indexSynonyms={synonyms}
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
							<Button
								shape="circle-outline"
								size="small"
								type="danger"
								icon="delete"
							/>
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
							indexSynonyms={synonyms}
							isAddModal
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
						loading={isFetching}
						rowKey={row => {
							return row.id;
						}}
						bordered={false}
						dataSource={synonyms}
						columns={columns}
					/>
				</Card>
			</div>
		);
	}
}

const mapStateToProps = state => {
	const { username, password } = get(state, 'user.data', {});
	return {
		credentials: username ? `${username}:${password}` : null,
	};
};

export default connect(mapStateToProps, null)(Synonyms);
