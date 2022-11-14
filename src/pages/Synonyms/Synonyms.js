import React from 'react';
import PropTypes from 'prop-types';
import { Button, Card, Icon, message, Popconfirm, Table } from 'antd';
import { css } from 'emotion';
import { connect } from 'react-redux';
import chunk from 'lodash/chunk';
import get from 'lodash/get';
import flatten from 'lodash/flatten';
import {
	DataSearch,
	ReactiveBase,
	ReactiveList,
	SingleDropdownList,
} from '@appbaseio/reactivesearch';

import Loadable from 'react-loadable';
import { container } from '../ResultsPage/styles';
import SynonymsModal from './components/SynonymsModal';
import { deleteSynonym, getSynonyms, updateSynonyms } from './api';
import { getURL, getVersion } from '../../constants/config';
import { getMappings, getSettings, reIndex } from '../../batteries/utils/mappings';
import { getSynonymsAnalyzerSettings, parseSynonymsAnalyzer, applySynonymsSettings } from './utils';
import Banner from '../../batteries/components/shared/UpgradePlan/Banner';
import SettingsFooter from '../../components/SettingsFooter';
import Loader from '../../components/Loader';
import ErrorToaster from '../../batteries/components/shared/ErrorToaster';
import { addReIndexingTasks } from '../../batteries/modules/actions';
import { event, timingEvent } from '../../utils/gtag';
import moment from '../../utils/moment';

const UploadSynonymsModal = Loadable({
	loader: () =>
		import(/* webpackChunkName: "UploadSynonymsModal" */ './components/UploadSynonymsModal'),
	loading: Loader,
});

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
			border-radius: 4px;
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

const chunkSize = 100000;

class Synonyms extends React.Component {
	constructor(props) {
		super(props);
		this.startTime = moment();
		this.state = {
			synonyms: [],
			key: Date.now(),
			uploadVisible: false,
		};
	}

	componentDidMount() {
		// triggering custom event for google analytics
		event({
			action: 'Synonyms Settings',
			category: 'Search Relevancy',
			label: 'visit',
			value: null,
		});
		this.fetchSynonym();
	}

	componentWillUnmount() {
		// Sends the timing event to Google Analytics.
		timingEvent({
			action: 'timing_complete',
			category: 'Search Relevancy',
			label: 'synonyms-settings-time',
			name: 'time',
			value: this.startTime.fromNow(),
		});
	}

	fetchSynonym = () => {
		const { appName, credentials } = this.props;
		getSynonyms({
			appName,
			credentials,
		})
			.then((res) => {
				this.setState({
					synonyms: res || [],
				});
			})
			.catch((e) => {
				message.error(e.message);
			});
	};

	handleDelete = async (id) => {
		const { credentials, appName } = this.props;
		const { synonyms } = this.state;
		const url = getURL();
		this.setState({
			isDeleting: id,
		});
		try {
			const settings = await getSettings(appName, credentials, url).then(
				(data) => data[appName].settings,
			);

			const mappings = await getMappings(appName, credentials, url);
			const syonymsToBeSaved = synonyms
				.filter((syn) => syn._id !== id)
				.map((item) => item.synonym);
			const synonymsAnalyzerSettings = getSynonymsAnalyzerSettings({
				settings,
				isSynonymsAnalyzerPresent: true,
				synonyms: syonymsToBeSaved,
			});

			await this.updateSynonymsSettings({
				needReindex: false,
				mappings,
				settings: synonymsAnalyzerSettings,
				credentials,
				appName,
			});

			await deleteSynonym({
				credentials,
				id,
			});

			this.setState({
				isDeleting: null,
			});
			message.success('Successfully deleted synonym');
			const filteredSynonyms = synonyms.filter((syn) => syn._id !== id);
			this.handleUpdate(filteredSynonyms);
		} catch (err) {
			this.setState({
				isDeleting: null,
			});
			message.error(err.message || 'Failed while deleting synonym');
		}
	};

	updateSynonymsSettings = async ({ appName, settings, credentials, mappings, needReindex }) => {
		const { updateReIndexingTasks } = this.props;
		const version = getVersion()[0];
		const url = getURL();

		const handleReindex = () => {
			const reIndexPromise = reIndex({
				mappings,
				settings,
				appId: appName,
				version,
				credentials,
			});

			reIndexPromise
				.then((res) => {
					if (get(res, 'failures', []).length) {
						get(res, 'failures', []).forEach((fail) => {
							message.error(`Failed while updating synonyms: ${fail.cause.reason}`);
						});
						return;
					}
					if (res.task) {
						updateReIndexingTasks(res.task);
					} else {
						message.success(`Re-indexing completed successfully`);
					}
				})
				.catch((e) => {
					message.error(e.message || `Failed while updating synonyms`);
				});
		};

		try {
			if (needReindex) {
				// we need to update mappings that's why reindex is required
				await handleReindex();
			} else {
				await applySynonymsSettings({
					appName,
					credentials,
					settings,
					url,
				});
			}
		} catch (err) {
			message.error(err.message || `Failed while updating synonyms`);
		}
	};

	handleSave = async (newSynonyms) => {
		this.setState({ uploading: true });
		const { appName, credentials, url } = this.props;
		const { synonyms: allSynonyms } = this.state;

		const indexSynonyms = allSynonyms.map((item) => item.synonym);

		const { mappings, hasSubfield, synonymsAnalyzerSettings } = await parseSynonymsAnalyzer({
			appName,
			credentials,
			url,
			synonyms: [
				...indexSynonyms.map((item) => item.toLowerCase()),
				...newSynonyms.map((item) => (item.synonym || '').toLowerCase()),
			],
		});

		try {
			await this.updateSynonymsSettings({
				needReindex: !hasSubfield,
				mappings,
				settings: synonymsAnalyzerSettings,
				credentials,
				appName,
			});
			const chunkedData = chunk(newSynonyms, chunkSize);
			Promise.all(
				chunkedData.map((chunkSynonyms) =>
					updateSynonyms({
						appName,
						credentials,
						synonyms: chunkSynonyms.map((synonym) => ({
							...synonym,
							index: appName,
						})),
					}),
				),
			)
				.then((res) => {
					this.setState({ uploading: false, file: null, fileList: null });
					this.toggleUploadVisibility();
					this.handleUpdate([...allSynonyms, ...flatten(res)]);
					message.success('Synonyms uploaded successfully');
				})
				.catch((e) => {
					this.setState({ uploading: false });
					message.error(e.message || 'Failed while updating synonyms');
				});
		} catch (e) {
			this.setState({ uploading: false });
			message.error(e.message || 'Failed to update synonyms');
		}
	};

	handleUpdate = (synonyms) => {
		this.setState({
			key: Date.now(),
			synonyms,
		});
	};

	toggleUploadVisibility = () => {
		this.setState((prevState) => ({
			uploadVisible: !prevState.uploadVisible,
		}));
	};

	beforeUpload = (file, fileList) => {
		const isCsvOrJson = file.type === 'text/csv' || file.type === 'application/json';
		if (!isCsvOrJson) {
			message.error('You can only upload CSV/JSON file!');
		}
		const isLt10M = file.size / 1024 / 1024 < 10;
		if (!isLt10M) {
			message.error('Max file size allowed is 10MB');
		}
		const fileValid = isCsvOrJson && isLt10M;
		if (fileValid) {
			this.setState({ file, fileList });
			return true;
		}
		return false;
	};

	handleUpload = (refetchReIndexingInfo) => {
		const { file } = this.state;
		if (!file) return;
		const reader = new FileReader();
		reader.readAsBinaryString(file);
		reader.onloadend = (res) => {
			const out = get(res, 'target.result');
			if (file.type === 'application/json') {
				const synonymsPayload = JSON.parse(out || '{}');
				this.handleSave(synonymsPayload, refetchReIndexingInfo);
			} else {
				let synonymsPayload = (out || '').split('\n').filter(Boolean);
				synonymsPayload = synonymsPayload.map((synonym) => {
					if ((synonym || '').includes('=>'))
						return {
							type: 'one-way',
							synonym,
						};
					return { type: 'equivalent', synonym };
				});
				this.handleSave(synonymsPayload, refetchReIndexingInfo);
			}
		};
	};

	onRemove = (file) => {
		this.setState((prevState) => {
			const index = prevState.fileList.indexOf(file);
			const newFileList = prevState.fileList.slice();
			newFileList.splice(index, 1);
			return {
				fileList: newFileList,
				file: null,
			};
		});
	};

	render() {
		const { synonyms, isDeleting, key, uploadVisible, fileList, file, uploading } = this.state;
		const { credentials, appName } = this.props;
		const url = getURL();

		const bannerMessage = {
			title: 'Manage Synonyms',
			buttonText: 'Read Docs',
			videoLink: 'https://youtu.be/FA6knNSaChA',
			href: 'https://docs.reactivesearch.io/docs/search/relevancy/#synonyms',
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
								<div>
									<Button
										onClick={this.toggleUploadVisibility}
										style={{ marginRight: 5 }}
									>
										Upload Synonyms
									</Button>
									<SynonymsModal
										indexSynonyms={synonyms || []}
										refetch={this.fetchSynonym}
										isAddModal
										handleSynonyms={this.handleUpdate}
										resetInputOnClose
										updateSynonymsSettings={this.updateSynonymsSettings}
										renderButton={({ handleModal }) => {
											return (
												<Button
													onClick={handleModal}
													type="primary"
													data-cy="add-synonyms"
												>
													Add Synonyms
												</Button>
											);
										}}
									/>
								</div>
							</div>
							<ReactiveList
								componentId={`result-${key}`}
								renderResultStats={() => null}
								key={key}
								loader={<div />}
								pagination
								dataField="_score"
								react={{
									and: ['search', 'type', 'index'],
								}}
								rowKey="_id"
								renderNoResults={() => null}
								render={({ loading, data }) => (
									<Table
										loading={loading}
										rowKey={(row) => {
											return row._id;
										}}
										pagination={false}
										bordered={false}
										dataSource={data}
										columns={[
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
																<span>( </span>
																{value
																	.split('=>')[0]
																	.split(',')
																	.map((item, index) => {
																		if (
																			index ===
																			value
																				.split('=>')[0]
																				.split(',').length -
																				1
																		) {
																			return item;
																		}
																		return (
																			<React.Fragment>
																				{item}
																				<span className="light">
																					OR
																				</span>
																			</React.Fragment>
																		);
																	})}
																<span> )</span>
																<Icon
																	className="light"
																	type="arrow-right"
																/>
																{value.split('=>')[1]}
															</span>
														);
													}

													return (
														<span className={expression}>
															{value.split(',').map((item, index) => {
																if (
																	index ===
																	value.split(',').length - 1
																) {
																	return item;
																}
																return (
																	<React.Fragment>
																		{item}
																		<Icon
																			type="swap"
																			className="light"
																		/>
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
																synonyms={record.synonym || []}
																handleSynonyms={this.handleUpdate}
																updateSynonymsSettings={
																	this.updateSynonymsSettings
																}
																renderButton={({ handleModal }) => {
																	return (
																		<Button
																			shape="circle-outline"
																			size="small"
																			icon="edit"
																			onClick={handleModal}
																			style={{
																				marginRight: 5,
																			}}
																		/>
																	);
																}}
															/>

															<Popconfirm
																title="Are you sure you want to delete synonym？"
																okText="Yes"
																cancelText="No"
																onConfirm={() =>
																	this.handleDelete(value)
																}
															>
																<Button
																	shape="circle-outline"
																	size="small"
																	loading={isDeleting === value}
																	type="danger"
																	icon="delete"
																/>
															</Popconfirm>
														</div>
													);
												},
												width: 100,
											},
										]}
									/>
								)}
							/>
						</ReactiveBase>
					</Card>
					{synonyms.length > 0 ? (
						<SettingsFooter
							showCopySettings
							app={appName}
							showReset={false}
							showSearchPreview
						/>
					) : null}
				</div>
				{uploadVisible && (
					<ErrorToaster>
						<UploadSynonymsModal
							onCancel={this.toggleUploadVisibility}
							appName={appName}
							onOk={() => this.handleUpload()}
							confirmLoading={uploading}
							file={file}
							fileList={fileList}
							beforeUpload={this.beforeUpload}
							onRemove={this.onRemove}
						/>
					</ErrorToaster>
				)}
			</React.Fragment>
		);
	}
}

Synonyms.propTypes = {
	appName: PropTypes.string.isRequired,
	credentials: PropTypes.string.isRequired,
	url: PropTypes.string.isRequired,
	updateReIndexingTasks: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
	const { username, password } = get(state, 'user.data', {});
	const url = getURL();
	return {
		appName: get(state, '$getCurrentApp.name'),
		url,
		credentials: username ? `${username}:${password}` : null,
	};
};

const mapDispatchToProps = (dispatch) => ({
	updateReIndexingTasks: (data) => dispatch(addReIndexingTasks(data)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Synonyms);
