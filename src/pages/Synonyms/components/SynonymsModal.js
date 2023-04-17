/* eslint-disable jsx-a11y/label-has-associated-control,jsx-a11y/label-has-for */
import React from 'react';
import PropTypes from 'prop-types';
import { InfoCircleOutlined } from '@ant-design/icons';
import { message, Modal, Select, Tooltip } from 'antd';
import get from 'lodash/get';
import { connect } from 'react-redux';
import { css } from 'emotion';

import SynonymInput from './SynonymInput';
import {
	getParsedSynonyms,
	getSynonymsState,
	optimizeSynonyms,
	parseSynonymsAnalyzer,
} from '../utils';
import { getURL } from '../../../constants/config';
import { updateSynonyms } from '../api';
import { children, synonymTypes } from '../../../utils/prop-types';
import ErrorToaster from '../../../batteries/components/shared/ErrorToaster';

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
			isLoading: false,
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
			updateSynonymsSettings,
		} = this.props;
		const { type, alternatives, synonyms, searchTerm } = this.state;

		let parsedSynonyms = getParsedSynonyms({ type, alternatives, synonyms, searchTerm });
		let docIdToUpdate = isAddModal ? null : id;

		// We need to consider already exisiting synonyms
		const indexSynonyms = docIdToUpdate
			? allSynonyms.filter((syn) => syn._id !== docIdToUpdate).map((item) => item.synonym)
			: allSynonyms.map((item) => item.synonym);

		for (let i = 0; i < allSynonyms.length; i += 1) {
			const { synonym, _id } = allSynonyms[i];
			const shouldMergeinAlreadyPresentSynonym = synonyms.some((_) =>
				synonym.includes(_.trim().toLowerCase()),
			);
			if (shouldMergeinAlreadyPresentSynonym) {
				docIdToUpdate = _id;
				parsedSynonyms = getParsedSynonyms({
					type,
					alternatives,
					synonyms: [...new Set([...synonyms, ...synonym.split(',')])],
					searchTerm,
				})
					.replace(/ ,/g, ',')
					.replace(/, /g, ',');
				break;
			}
		}

		const optimizedSynonyms = optimizeSynonyms([
			...indexSynonyms.map((item) => item.toLowerCase()),
			parsedSynonyms.toLowerCase(),
		]);

		const { mappings, hasSubfield, synonymsAnalyzerSettings } = await parseSynonymsAnalyzer({
			appName,
			credentials,
			url,
			synonyms: optimizedSynonyms,
		});

		try {
			await updateSynonymsSettings({
				needReindex: !hasSubfield,
				mappings,
				settings: synonymsAnalyzerSettings,
				credentials,
				appName,
			});
			const res = await updateSynonyms({
				appName,
				credentials,
				synonyms:
					!docIdToUpdate && isAddModal
						? [{ synonym: parsedSynonyms, type, index: appName }]
						: [{ _id: docIdToUpdate, synonym: parsedSynonyms, type, index: appName }],
			});
			this.toggleLoading();
			this.handleModal();
			const filteredSynonyms = docIdToUpdate
				? allSynonyms.filter((syn) => syn._id !== docIdToUpdate)
				: allSynonyms;
			handleSynonyms([...filteredSynonyms, ...res]);
			message.success('Synonyms updated Successfully');
		} catch (err) {
			this.toggleLoading();
			message.error(err.message || 'Failed to update synonyms');
		}
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
					open={showModal}
					onCancel={this.handleCloseModal}
					onOk={this.handleSave}
					okText={isAddModal ? 'Add' : 'Update'}
					okButtonProps={{
						loading: isLoading,
						disabled: this.getValidation(),
						'data-cy': 'confirm-synonyms',
					}}
				>
					<ErrorToaster>
						<div className={formStyle}>
							<label>
								Select Type{' '}
								<Tooltip title="Synonym type info">
									<InfoCircleOutlined />
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
					</ErrorToaster>
				</Modal>
			</React.Fragment>
		);
	}
}

SynonymsModal.propTypes = {
	appName: PropTypes.string.isRequired,
	credentials: PropTypes.string.isRequired,
	url: PropTypes.string.isRequired,
	indexSynonyms: PropTypes.array,
	id: PropTypes.string,
	isAddModal: PropTypes.bool,
	handleSynonyms: PropTypes.func.isRequired,
	renderButton: children,
	resetInputOnClose: PropTypes.bool,
	type: synonymTypes,
	synonyms: PropTypes.array,
	updateSynonymsSettings: PropTypes.func.isRequired,
};

SynonymsModal.defaultProps = {
	indexSynonyms: [],
	id: undefined,
	isAddModal: false,
	renderButton: null,
	resetInputOnClose: false,
	type: 'equivalent',
	synonyms: null,
};

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
