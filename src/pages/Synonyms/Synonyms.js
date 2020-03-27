import React from 'react';
import { Card, Table, Icon, Button, message } from 'antd';
import { css } from 'emotion';
import { connect } from 'react-redux';
import { get } from 'lodash';
import {
	ReactiveBase,
	ReactiveList,
	SingleDropdownList,
	DataSearch,
} from '@appbaseio/reactivesearch';

import { container } from '../ResultsPage/styles';
import SynonymsModal from './components/SynonymsModal';
import { getSynonyms, deleteSynonym } from './api';
import { getURL } from '../../constants/config';
import { getSettings, getMappings } from '../../batteries/utils/mappings';
import { getSynonymsAnalyzerSettings, updateSynonymsSettings } from './utils';
import DeleteModal from '../../components/DeleteModal/DeleteModal';
import Banner from '../../batteries/components/shared/UpgradePlan/Banner';
import { SettingsFooter } from '../../components/SettingsFooter';

const expression = css`
	font-weight: 15px;
	.light {
		font-size: 13px;
		color: #8c8c8c;
		margin: 0 5px;
	}
`;

const search = css`
	display: flex;
	justify-content: space-between;
	margin: 10px 0;
	align-items: center;

	> div {
		display: flex;
	}

	.hide {
		display: none;
	}

	.filter,
	.search {
		min-width: 200px;
	}

	.filter button {
		border-radius: 4px 0px 0px 4px;
	}

	.search {
		border-radius: 0;

		input {
			border-radius: 0 4px 4px 0;
		}

		> div > div > div {
			top: 11px;
		}
	}

	@media (max-width: 768px) {
		flex-direction: column;
		align-items: flex-start;
		> div {
			width: 100%;
		}
		.filter,
		.search {
			width: 100%;
			margin-bottom: 10px;
		}
	}

	@media (max-width: 576px) {
		> div {
			flex-direction: column;
			align-items: flex-start;
		}
	}
`;

class Synonyms extends React.Component {
	state = {
		synonyms: [],
		key: Date.now(),
	};

	componentDidMount() {
		this.fetchSynonym();
	}

	fetchSynonym = () => {
		const { appName, credentials } = this.props;
		getSynonyms({
			appName,
			credentials,
		})
			.then(res => {
				this.setState({
					synonyms: res || [],
				});
			})
			.catch(e => {
				message.error(e.message);
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
					const filteredSynonyms = synonyms.filter(syn => syn._id !== id);
					this.handleUpdate(filteredSynonyms);
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
			settings: synonymsAnalyzerSettings,
			credentials,
			appName,
		})
			.then(updateBackend)
			.catch(e => {
				this.toggleLoading();
				message.error(e.message || 'Failed to delete synonyms');
			});
	};

	handleUpdate = synonyms => {
		this.setState({
			key: Date.now(),
			synonyms,
		});
	};

	render() {
		const { synonyms, isDeleting, key } = this.state;
		const { credentials, appName } = this.props;
		const url = getURL();
		const columns = [
			{
				title: 'Type',
				dataIndex: 'type',
				key: 'type',
			},
			{
				title: 'Synonym',
				dataIndex: 'synonym',
				key: 'synonym',
				render: (value, record) => {
					if (record.type === 'one-way') {
						return (
							<span className={expression}>
								{value.split('=>')[1]}
								<Icon className="light" type="arrow-right" />
								<span>( </span>
								{value
									.split('=>')[0]
									.split(',')
									.map((item, index) => {
										if (index === value.split('=>')[0].split(',').length - 1) {
											return item;
										}
										return (
											<React.Fragment>
												{item}
												<span className="light">OR</span>
											</React.Fragment>
										);
									})}
								<span> )</span>
							</span>
						);
					}

					return (
						<span className={expression}>
							{value.split(',').map((item, index) => {
								if (index === value.split(',').length - 1) {
									return item;
								}
								return (
									<React.Fragment>
										{item}
										<Icon type="swap" className="light" />
									</React.Fragment>
								);
							})}
						</span>
					);
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
								handleSynonyms={this.handleUpdate}
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
							<DeleteModal
								text={
									<React.Fragment>
										Type <strong>SYNONYM</strong> to confirm deletion.
									</React.Fragment>
								}
								title="Delete Synonym"
								value="SYNONYM"
								name="SYNONYM"
								onDelete={() => this.handleDelete(value)}
							>
								{({ handleModal }) => (
									<Button
										shape="circle-outline"
										size="small"
										loading={isDeleting === value}
										type="danger"
										onClick={handleModal}
										icon="delete"
									/>
								)}
							</DeleteModal>
						</div>
					);
				},
				width: 100,
			},
		];
		const bannerMessage = {
			title: 'Manage Synonyms',
			buttonText: 'Read Docs',
		};

		return (
			<React.Fragment>
				<Banner {...bannerMessage} />
				<div className={container}>
					<Card>
						<ReactiveBase
							theme={{
								colors: {
									primaryColor: '#1890ff',
									textColor: 'rgba(0,0,0,.65)',
								},
							}}
							app=".synonyms"
							credentials={credentials}
							url={url}
						>
							<div className={search}>
								<div>
									<SingleDropdownList
										className="hide"
										componentId="index"
										defaultValue={appName}
										dataField="index.keyword"
									/>
									<SingleDropdownList
										className="filter"
										componentId="type"
										dataField="type.keyword"
										selectAllLabel="All Synonyms"
										placeholder="Select a Type"
										react={{ and: ['index'] }}
									/>
									<DataSearch
										innerClass={{
											input: 'ant-input',
										}}
										placeholder="Search synonym"
										className="search"
										icon={<Icon type="search" />}
										dataField={[
											'synonym',
											'synonym.autosuggest',
											'synonym.keyword',
											'synonym.lang',
											'synonym.search',
										]}
										react={{ and: ['index'] }}
										componentId="search"
									/>
								</div>
								<SynonymsModal
									indexSynonyms={synonyms}
									refetch={this.fetchSynonym}
									isAddModal
									handleSynonyms={this.handleUpdate}
									renderButton={({ handleModal }) => {
										return (
											<Button onClick={handleModal} type="primary">
												Add Synonyms
											</Button>
										);
									}}
								/>
							</div>
							<ReactiveList
								componentId="result"
								renderResultStats={() => null}
								key={key}
								loader={<div />}
								pagination
								dataField="_score"
								react={{
									and: ['search', 'type', 'index'],
								}}
								renderNoResults={() => null}
								render={({ loading, data }) => (
									<Table
										loading={loading}
										rowKey={row => {
											return row._id;
										}}
										pagination={false}
										bordered={false}
										dataSource={data}
										columns={columns}
									/>
								)}
							/>
						</ReactiveBase>
					</Card>
					{synonyms.length > 0 ? (
						<SettingsFooter app={appName} showReset={false} showSearchPreview />
					) : null}
				</div>
			</React.Fragment>
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
