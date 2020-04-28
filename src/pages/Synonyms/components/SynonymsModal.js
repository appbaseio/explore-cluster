import React from 'react';
import { Modal, Select, Tooltip, Icon, message } from 'antd';
import { get } from 'lodash';
import { connect } from 'react-redux';
import { css } from 'emotion';

import SynonymInput from './SynonymInput';
import {
	getSynonymsState,
	hasSynonymsAnalyzer,
	hasSynonymsSubFields,
	getSynonymsAnalyzerSettings,
	getParsedSynonyms,
	getUpdatedSynonymsSubfields,
	updateSynonymsSettings,
} from '../utils';
import { getURL } from '../../../constants/config';
import { getSettings, getMappings } from '../../../batteries/utils/mappings';
import { updateSynonyms } from '../api';

const { Option } = Select;

const formStyle = css`
	label {
		font-weight: bold;
		display: inline-block;
		color: rgba(0, 0, 0, 0.65);
		margin: 15px 0 4px;
	}

	label:first-child {
		margin-top: 0;
	}
`;

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
		this.setState((prevState) => ({
			isLoading: !prevState.isLoading,
		}));
	};

	handleModal = () => {
		this.setState(
			(state) => ({
				showModal: !state.showModal,
			}),
			() => {
				const { showModal } = this.state;
				if (!showModal) {
					const { resetInputOnClose } = this.props;
					if (resetInputOnClose) {
						this.resetInput();
					}
				}
			},
		);
	};

	handleCloseModal = () => {
		this.setState({
			showModal: false,
		});
		const { resetInputOnClose } = this.props;

		if (resetInputOnClose) {
			this.resetInput();
		}
	};

	resetInput = () => {
		this.setState({
			alternatives: [],
			searchTerm: '',
			synonyms: [],
			type: 'equivalent',
		});
	};

	handleType = (type) => {
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
		const {
			appName,
			credentials,
			url,
			indexSynonyms: allSynonyms,
			id,
			isAddModal,
			handleSynonyms,
		} = this.props;
		const { type, alternatives, synonyms, searchTerm } = this.state;

		// TODO: We need to consider already exisiting synonyms
		const indexSynonyms = id
			? allSynonyms.filter((syn) => syn._id !== id).map((item) => item.synonym)
			: allSynonyms.map((item) => item.synonym);

		const parsedSynonyms = getParsedSynonyms({ type, alternatives, synonyms, searchTerm });
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
				parsedSynonyms.toLowerCase(),
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
				synonyms: isAddModal
					? [{ synonym: parsedSynonyms, type, index: appName }]
					: [{ _id: id, synonym: parsedSynonyms, type, index: appName }],
			})
				.then((res) => {
					this.toggleLoading();
					this.handleModal();
					const filteredSynonyms = id
						? allSynonyms.filter((syn) => syn._id !== id)
						: allSynonyms;
					handleSynonyms([...filteredSynonyms, ...res]);
					message.success('Synonyms updated Successfully');
				})
				.catch((e) => {
					this.toggleLoading();
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
				this.toggleLoading();
				message.error(e.message || 'Failed to update synonyms');
			});
	};

	getValidation = () => {
		const { synonyms, type, alternatives, searchTerm } = this.state;

		switch (type) {
			case 'equivalent': {
				return !(synonyms.length >= 2);
			}
			case 'one-way': {
				return !(searchTerm && alternatives.length > 0);
			}
			default:
				return false;
		}
	};

	render() {
		const { showModal, type, alternatives, synonyms, searchTerm, isLoading } = this.state;
		const { renderButton, isAddModal } = this.props;
		return (
			<React.Fragment>
				{renderButton &&
					renderButton({
						handleModal: this.handleModal,
					})}
				<Modal
					title={isAddModal ? 'Add new Synonym' : 'Update Synonym'}
					visible={showModal}
					onCancel={this.handleCloseModal}
					onOk={this.handleSave}
					okText={isAddModal ? 'Add' : 'Update'}
					okButtonProps={{
						loading: isLoading,
						disabled: this.getValidation(),
					}}
				>
					<div className={formStyle}>
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
							<Option value="equivalent">Equivalent Synonym</Option>
						</Select>
						<SynonymInput
							type={type}
							synonyms={synonyms}
							searchTerm={searchTerm}
							alternatives={alternatives}
							onChange={this.handleChange}
						/>
					</div>
				</Modal>
			</React.Fragment>
		);
	}
}

const mapStateToProps = (state) => {
	const { username, password } = get(state, 'user.data', {});
	const url = getURL();
	return {
		appName: get(state, '$getCurrentApp.name'),
		credentials: username ? `${username}:${password}` : null,
		url,
	};
};

export default connect(mapStateToProps, null)(SynonymsModal);
