import React from 'react';
import PropTypes from 'prop-types';
import { Button, Card, Icon, message, Modal, Popconfirm, Table, Upload } from 'antd';
import { css } from 'emotion';
import { connect } from 'react-redux';
import { get } from 'lodash';
import {
	DataSearch,
	ReactiveBase,
	ReactiveList,
	SingleDropdownList,
} from '@appbaseio/reactivesearch';

import { container } from '../ResultsPage/styles';
import SynonymsModal from './components/SynonymsModal';
import { deleteSynonym, getSynonyms, updateSynonyms } from './api';
import { getURL } from '../../constants/config';
import { getMappings, getSettings } from '../../batteries/utils/mappings';
import {
	getSynonymsAnalyzerSettings,
	getUpdatedSynonymsSubfields,
	hasSynonymsAnalyzer,
	hasSynonymsSubFields,
	updateSynonymsSettings,
} from './utils';
import Banner from '../../batteries/components/shared/UpgradePlan/Banner';
import SettingsFooter from '../../components/SettingsFooter';
import { isValidPlan } from '../../batteries/utils';
import Overlay from '../../components/Overlay';
import { allowedTiers } from '../../utils/prop-types';

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

const uploadClass = css`
	.avatar-uploader > .ant-upload {
		width: 100%;
		height: 128px;
	}
`;

class Synonyms extends React.Component {
	state = {
		synonyms: [],
		key: Date.now(),
		uploadVisible: false,
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
					const filteredSynonyms = synonyms.filter((syn) => syn._id !== id);
					this.handleUpdate(filteredSynonyms);
				})
				.catch((e) => {
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
			.catch((e) => {
				this.toggleLoading();
				message.error(e.message || 'Failed to delete synonyms');
			});
	};

	handleSave = async (newSynonyms) => {
		this.setState({ uploading: true });
		const { appName, credentials, url } = this.props;
		const { synonyms: allSynonyms } = this.state;

		const indexSynonyms = allSynonyms.map((item) => item.synonym);

		const settings = await getSettings(appName, credentials, url).then((data) =>
			get(data, `${appName}.settings`, {}),
		);

		const isSynonymsAnalyzerPresent = hasSynonymsAnalyzer(settings);
		let mappings = await getMappings(appName, credentials, url);

		// // check if all search field has the synonyms analyzer added
		const hasSubfield = hasSynonymsSubFields(mappings);
		// get the settings request body will add analyzer if not already present
		const synonymsAnalyzerSettings = getSynonymsAnalyzerSettings({
			settings,
			isSynonymsAnalyzerPresent,
			synonyms: [
				...indexSynonyms.map((item) => item.toLowerCase()),
				...newSynonyms.map((item) => (item.synonym || '').toLowerCase()),
			],
		});
		if (!hasSubfield) {
			// update all subfields for search
			mappings = getUpdatedSynonymsSubfields(mappings);
		}

		const handleSaveData = () => {
			updateSynonyms({
				appName,
				credentials,
				synonyms: newSynonyms.map((synonym) => ({ ...synonym, index: appName })),
			})
				.then((res) => {
					this.setState({ uploading: false, file: null, fileList: null });
					this.toggleUploadVisibility();
					this.handleUpdate([...allSynonyms, ...res]);
					message.success('Synonyms uploaded successfully');
				})
				.catch((e) => {
					this.setState({ uploading: false });
					message.error(e.message || 'Failed while updating synonyms');
				});
		};

		updateSynonymsSettings({
			needReindex: !hasSubfield,
			mappings,
			settings: synonymsAnalyzerSettings,
			credentials,
			appName,
		})
			.then(handleSaveData)
			.catch((e) => {
				this.setState({ uploading: false });
				message.error(e.message || 'Failed to update synonyms');
			});
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
		console.log('file type', file);
		const isCsvOrJson = file.type === 'text/csv' || file.type === 'application/json';
		if (!isCsvOrJson) {
			message.error('You can only upload CSV/JSON file!');
		}
		const isLt5M = file.size / 1024 / 1024 < 5;
		if (!isLt5M) {
			message.error('File must smaller than 5MB!');
		}
		const fileValid = isCsvOrJson && isLt5M;
		if (fileValid) {
			this.setState({ file, fileList });
			return true;
		}
		return false;
	};

	handleUpload = () => {
		const { file } = this.state;
		if (!file) return;
		const reader = new FileReader();
		reader.readAsBinaryString(file);
		reader.onloadend = (res) => {
			const out = get(res, 'target.result');
			console.log('output', out);
			if (file.type === 'application/json') {
				const synonymsPayload = JSON.parse(out || '{}');
				this.handleSave(synonymsPayload);
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
		const { credentials, appName, tier, featureSynonyms } = this.props;
		const url = getURL();

		const bannerMessage = {
			title: 'Manage Synonyms',
			buttonText: 'Read Docs',
			href: 'https://docs.appbase.io/docs/search/relevancy/#synonyms',
		};

		if (!isValidPlan(tier, featureSynonyms)) {
			return (
				<React.Fragment>
					<Banner {...bannerMessage} />
					<Overlay
						style={{
							maxWidth: '70%',
						}}
						src="https://i.imgur.com/fO0Zomn.png"
						alt="Synonyms"
					/>
				</React.Fragment>
			);
		}

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
								<Icon className="light" type="arrow-right" />
								{value.split('=>')[1]}
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
								synonyms={record.synonym || []}
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

							<Popconfirm
								title="Are you sure you want to delete synonym？"
								okText="Yes"
								cancelText="No"
								onConfirm={() => this.handleDelete(value)}
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
		];

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
										renderButton={({ handleModal }) => {
											return (
												<Button onClick={handleModal} type="primary">
													Add Synonyms
												</Button>
											);
										}}
									/>
								</div>
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
										rowKey={(row) => {
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
				{uploadVisible && (
					<Modal
						onCancel={this.toggleUploadVisibility}
						title={`Upload synonyms to index "${appName}"`}
						visible
						className={uploadClass}
						onOk={this.handleUpload}
						confirmLoading={uploading}
						okText="Upload Synonyms"
					>
						<Upload
							listType={file ? 'text' : 'picture-card'}
							className="avatar-uploader"
							fileList={fileList}
							beforeUpload={this.beforeUpload}
							onRemove={this.onRemove}
						>
							{!file ? (
								<div>
									<Icon type="plus" />
									<div className="ant-upload-text">Choose File</div>
								</div>
							) : null}
						</Upload>
					</Modal>
				)}
			</React.Fragment>
		);
	}
}

Synonyms.propTypes = {
	appName: PropTypes.string.isRequired,
	credentials: PropTypes.string.isRequired,
	tier: allowedTiers,
	featureSynonyms: PropTypes.bool,
	url: PropTypes.string.isRequired,
};

Synonyms.defaultProps = {
	tier: undefined,
	featureSynonyms: false,
};

const mapStateToProps = (state) => {
	const { username, password } = get(state, 'user.data', {});
	const url = getURL();
	return {
		appName: get(state, '$getCurrentApp.name'),
		url,
		credentials: username ? `${username}:${password}` : null,
		tier: get(state, '$getAppPlan.results.tier'),
		featureSynonyms: get(state, '$getAppPlan.results.feature_search_relevancy', false),
	};
};

export default connect(mapStateToProps, null)(Synonyms);
