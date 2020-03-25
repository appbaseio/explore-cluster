import React from 'react';
import { Card, Table, Icon, Button, message } from 'antd';
import { css } from 'emotion';
import { connect } from 'react-redux';
import { get } from 'lodash';

import { container } from '../ResultsPage/styles';
import SynonymsModal from './components/SynonymsModal';
import { getSynonyms, deleteSynonym } from './api';
import { getURL } from '../../constants/config';
import { getSettings, getMappings } from '../../batteries/utils/mappings';
import { getSynonymsAnalyzerSettings, updateSynonymsSettings } from './utils';

const expression = css`
	.light {
		font-size: 12px;
		color: #8c8c8c;
		margin: 0 5px;
	}
`;

class Synonyms extends React.Component {
	state = {
		isFetching: false,
		synonyms: [],
	};

	componentDidMount() {
		this.fetchSynonym();
	}

	fetchSynonym = () => {
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
	};

	handleDelete = async id => {
		const { credentials, appName } = this.props;
		const { synonyms } = this.state;
		const url = getURL();
		this.setState({
			isDeleting: id,
		});
		const settings = await getSettings(appName, credentials, url).then(
			data => data[appName].settings,
		);

		const mappings = await getMappings(appName, credentials, url);
		const syonymsToBeSaved = synonyms.filter(syn => syn._id !== id).map(item => item.synonym);
		const synonymsAnalyzerSettings = getSynonymsAnalyzerSettings({
			settings,
			isSynonymsAnalyzerPresent: true,
			synonyms: syonymsToBeSaved,
		});

		const updateBackend = () => {
			deleteSynonym({
				credentials,
				id,
			})
				.then(() => {
					this.setState({
						isDeleting: null,
					});
					message.success('Successfully deleted synonym');
				})
				.catch(e => {
					this.setState({
						isDeleting: null,
					});
					message.error(e.message || 'Failed while deleting synonym');
				});
		};

		updateSynonymsSettings({
			needReindex: false,
			mappings,
			settings: {
				analysis: synonymsAnalyzerSettings,
			},
			credentials,
			appName,
		})
			.then(updateBackend)
			.catch(e => {
				this.toggleLoading();
				message.error(e.message || 'Failed to delete synonyms');
			});
	};

	render() {
		const { synonyms, isFetching, isDeleting } = this.state;
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
				dataIndex: '_id',
				key: 'id',
				render: (value, record) => {
					return (
						<div>
							<SynonymsModal
								type={record.type}
								indexSynonyms={synonyms}
								id={record._id}
								refetch={this.fetchSynonym}
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
								loading={isDeleting === value}
								type="danger"
								onClick={() => this.handleDelete(value)}
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
							refetch={this.fetchSynonym}
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
							return row._id;
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
