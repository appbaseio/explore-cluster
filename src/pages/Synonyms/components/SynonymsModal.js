import React from 'react';
import { Modal, Select, Tooltip, Icon, message } from 'antd';
import { get } from 'lodash';
import { connect } from 'react-redux';

import SynonymInput from './SynonymInput';
import {
	getSynonymsState,
	hasSynonymsAnalyzer,
	hasSynonymsSubFields,
	getSynonymsAnalyzerSettings,
	getParsedSynonyms,
	getUpdatedSynonymsSubfields,
	applySynonyms,
} from '../utils';
import { getURL, getVersion } from '../../../constants/config';
import { getSettings, getMappings, reIndex } from '../../../batteries/utils/mappings';

const { Option } = Select;

class SynonymsModal extends React.Component {
	constructor(props) {
		super(props);
		const { synonyms, type } = props;
		const synonymsState = getSynonymsState({ synonyms, type });
		this.state = {
			isLoading: false,
			showModal: false,
			type: type || 'equivalent',

			synonyms: [],

			// for one-way
			alternatives: [],
			searchTerm: '',

			...synonymsState,
		};
	}

	toggleLoading = () => {
		this.setState(prevState => ({
			isLoading: !prevState.isLoading,
		}));
	};

	handleModal = () => {
		this.setState(state => ({
			showModal: !state.showModal,
		}));
	};

	handleType = type => {
		this.setState({
			type,
		});
	};

	handleChange = (name, value) => {
		this.setState({
			[name]: value,
		});
	};

	handleSave = async () => {
		this.toggleLoading();
		const { appName, credentials, url, indexSynonyms: allSynonyms, id } = this.props;
		const { type, alternatives, synonyms, searchTerm } = this.state;

		// TODO: We need to consider already exisiting synonyms
		const indexSynonyms = id
			? allSynonyms.filter(syn => syn._id !== id).map(item => item.synonym)
			: allSynonyms.map(item => item.synonym);

		const parsedSynonyms = getParsedSynonyms({ type, alternatives, synonyms, searchTerm });
		const settings = await getSettings(appName, credentials, url).then(
			data => data[appName].settings,
		);

		const version = getVersion();
		const isSynonymsAnalyzerPresent = hasSynonymsAnalyzer(settings);
		let mappings = await getMappings(appName, credentials, url);

		// // check if all search field has the synonyms analyzer added
		const hasSubfield = hasSynonymsSubFields(mappings);

		// get the settings request body will add analyzer if not already present
		const synonymsAnalyzerSettings = getSynonymsAnalyzerSettings({
			settings,
			isSynonymsAnalyzerPresent,
			synonyms: [...indexSynonyms, parsedSynonyms],
		});
		if (!hasSubfield) {
			// update all subfields for search
			mappings = getUpdatedSynonymsSubfields(mappings);
		}

		const handleReindex = () => {
			reIndex({
				mappings,
				settings: synonymsAnalyzerSettings,
				appId: appName,
				version,
				credentials,
			})
				.then(res => {
					this.toggleLoading();
					message.success('Successfully updated synonyms');
				})
				.catch(e => {
					this.toggleLoading();
					message.success('Failed while updating synonyms');
				});
		};

		if (!hasSubfield) {
			// we need to update mappings that's why reindex is required
			handleReindex();
		} else {
			applySynonyms({
				appName,
				credentials,
				settings: {
					analysis: synonymsAnalyzerSettings,
				},
				url,
			})
				.then(() => {
					this.toggleLoading();
					message.success('Synonyms updated Successfully');
				})
				.catch(e => {
					if (e.message === 'AWS') {
						handleReindex();
					} else {
						this.toggleLoading();
						message.success('Failed while updating synonyms');
						console.error('Error');
					}
				});
		}
	};

	render() {
		const { showModal, type, alternatives, synonyms, searchTerm, isLoading } = this.state;
		const { renderButton } = this.props;
		return (
			<React.Fragment>
				{renderButton &&
					renderButton({
						handleModal: this.handleModal,
					})}
				<Modal
					title="Add new Synonym"
					visible={showModal}
					onCancel={this.handleModal}
					onOk={this.handleSave}
					okText="Update"
					okButtonProps={{
						loading: isLoading,
					}}
				>
					<label>
						Select Type{' '}
						<Tooltip title="Synonym type info">
							<Icon type="info-circle" />
						</Tooltip>
					</label>
					<Select
						placeholder="Select synonym type"
						style={{ width: '100%' }}
						onChange={this.handleType}
						value={type}
					>
						<Option value="one-way">One Way Synonym</Option>
						<Option value="equivalent">Euivalent Synonym</Option>
					</Select>
					<SynonymInput
						type={type}
						synonyms={synonyms}
						searchTerm={searchTerm}
						alternatives={alternatives}
						onChange={this.handleChange}
					/>
				</Modal>
			</React.Fragment>
		);
	}
}

const mapStateToProps = state => {
	const { username, password } = get(state, 'user.data', {});
	const url = getURL();
	return {
		appName: get(state, '$getCurrentApp.name'),
		credentials: username ? `${username}:${password}` : null,
		url,
	};
};

export default connect(mapStateToProps, null)(SynonymsModal);
