/**
 * conditions in which mapping change should be called
 * 1. enable / disable ngrams should re-index with/without .search field
 * 2. change in number of searchable fields, because this could change the mapping
 * 3. language change
 *
 * conditions in which setting change should be called
 * 1. enable / disable diacricts should add / remove `asciifolding` filter from analyzer filters
 * 2. language change with stop words / stemming exceptions
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Modal, notification } from 'antd';
import get from 'lodash/get';
import { diff } from 'jsondiffpatch';
import styled from 'react-emotion';

import DiffList from './DiffList';

import { getPossibleSubFields } from '../../utils';
import { putSettings } from '../../batteries/modules/actions';
import { getRawMappingsByAppName } from '../../batteries/modules/selectors';

const Badge = styled.span`
	background: #f5222d;
	color: #fff;
	display: flex;
	justify-content: center;
	align-items: center;
	position: absolute;
	top: -10px;
	right: 0px;
	height: 25px;
	width: 25px;
	border-radius: 50%;
	z-index: 100;
`;

const getDiffData = (oldObj, newObj) => {
	const diffData = diff(oldObj, newObj);
	if (!diffData) {
		return [0, {}];
	}

	const subFields = getPossibleSubFields();
	if (get(diffData, 'search.fieldWeights', null) && !get(diffData, 'search.dataField', null)) {
		// handle only field weight change
		const { dataField, fieldWeights } = get(newObj, 'search');
		const { fieldWeights: olderWeight } = get(oldObj, 'search');
		const newFieldWeights = dataField.reduce((agg, item, index) => {
			const hasSubfield = subFields.some((s) => item.includes(s));
			let dataToReturn = [...agg];
			if (!hasSubfield && olderWeight[index] !== fieldWeights[index]) {
				dataToReturn = [
					...dataToReturn,
					{ field: item, oldWeight: olderWeight[index], newWeight: fieldWeights[index] },
				];
			}

			return dataToReturn;
		}, []);
		diffData.search.fieldWeights = newFieldWeights;
	}

	if (get(diffData, 'search.dataField', null) && get(diffData, 'search.fieldWeights', null)) {
		// handle adding | removing of new field

		// get the fields to be removed
		// key with _[indexNumber] means removed field
		// key with [indexNumber] means added field
		const { dataField, fieldWeights } = get(newObj, 'search');
		const { fieldWeights: olderWeight } = get(oldObj, 'search');
		const newDataFields = Object.keys(diffData.search.dataField).reduce((agg, i) => {
			const fieldName = get(diffData, `search.dataField[${i}][0]`);
			const hasSubfield = subFields.some((s) => fieldName.includes(s));
			let newData = [...agg];
			if (!hasSubfield && i !== '_t') {
				// removed field
				const isDeleted = i[0] === '_';
				const index = isDeleted ? Number(i.split('_')[1]) : Number(i);

				newData = [
					...newData,
					{
						field: fieldName,
						index: Number(i),
						isDeleted: false,
						oldWeight: isDeleted ? olderWeight[index] : 'NA',
						newWeight: isDeleted
							? 'NA'
							: get(diffData, `search.fieldWeights[${i}][0]`, 1), // always first index holds the value
					},
				];
			}
			return newData;
		}, []);

		// handle only field weight change along with dataField add/remove
		const newFieldWeights = dataField.reduce((agg, item, index) => {
			const hasSubfield = subFields.some((s) => item.includes(s));
			const isPartOfDataField = newDataFields.find((i) => i.index === index);
			let dataToReturn = [...agg];
			if (!hasSubfield && olderWeight[index] !== fieldWeights[index] && !isPartOfDataField) {
				dataToReturn = [
					...dataToReturn,
					{ field: item, oldWeight: olderWeight[index], newWeight: fieldWeights[index] },
				];
			}

			return dataToReturn;
		}, []);

		diffData.search.dataField = [...newDataFields];
		if (newFieldWeights.length) {
			diffData.search.fieldWeights = [...newFieldWeights];
		} else {
			delete diffData.search.fieldWeights;
		}
	}

	if (get(diffData, 'aggregations.dataField', null)) {
		const newDataFields = Object.keys(diffData.aggregations.dataField).reduce((agg, i) => {
			// deleted field is of pattern [fieldName, number, number]
			const fieldVal = get(diffData, `aggregations.dataField`)[i];
			const isDeleted = fieldVal.length === 3;
			const isOlderField = fieldVal.length === 2;
			const newData = [
				...agg,
				{
					field: i.split('.keyword')[0], // just to ignore `.keyword` in field name
					isDeleted,
					oldAgg: isDeleted || isOlderField ? get(fieldVal, 0, 'NA') : `NA`,
					newAgg: isDeleted ? 'NA' : get(fieldVal, 1, get(fieldVal, 0, 'NA')),
				},
			];

			return newData;
		}, []);
		diffData.aggregations.dataField = newDataFields;
	}

	if (get(diffData, 'results.highlightFields')) {
		diffData.results.highlightFields = Object.keys(
			get(diffData, 'results.highlightFields'),
		).reduce(
			(agg, key) => {
				let [deletedFields, addedFields] = agg;
				deletedFields = deletedFields.split(', ').filter((i) => i.trim());
				addedFields = addedFields.split(', ').filter((i) => i.trim());
				if (key !== '_t') {
					// key name starting with _ indicates it is deleted key
					if (key[0] === '_') {
						deletedFields = [
							...deletedFields,
							get(diffData, `results.highlightFields`)[key][0],
						];
					} else {
						addedFields = [
							...addedFields,
							get(diffData, `results.highlightFields`)[key][0],
						];
					}
				}

				return [deletedFields.join(', '), addedFields.join(', ')];
			},
			['', ''],
		);
	}

	if (get(diffData, 'results.includeFields')) {
		diffData.results.includeFields = Object.keys(get(diffData, 'results.includeFields')).reduce(
			(agg, key) => {
				let [deletedFields, addedFields] = agg;
				deletedFields = deletedFields.split(', ').filter((i) => i.trim());
				addedFields = addedFields.split(', ').filter((i) => i.trim());
				if (key !== '_t') {
					// key name starting with _ indicates it is deleted key
					if (key[0] === '_') {
						deletedFields = [
							...deletedFields,
							get(diffData, `results.includeFields`)[key][0],
						];
					} else {
						addedFields = [
							...addedFields,
							get(diffData, `results.includeFields`)[key][0],
						];
					}
				}

				return [deletedFields.join(', '), addedFields.join(', ')];
			},
			['', ''],
		);
	}

	if (get(diffData, 'results.excludeFields')) {
		diffData.results.excludeFields = Object.keys(get(diffData, 'results.excludeFields')).reduce(
			(agg, key) => {
				let [deletedFields, addedFields] = agg;
				deletedFields = deletedFields.split(', ').filter((i) => i.trim());
				addedFields = addedFields.split(', ').filter((i) => i.trim());
				if (key !== '_t') {
					// key name starting with _ indicates it is deleted key
					if (key[0] === '_') {
						deletedFields = [
							...deletedFields,
							get(diffData, `results.excludeFields`)[key][0],
						];
					} else {
						addedFields = [
							...addedFields,
							get(diffData, `results.excludeFields`)[key][0],
						];
					}
				}

				return [deletedFields.join(', '), addedFields.join(', ')];
			},
			['', ''],
		);
	}

	if (get(diffData, 'results.highlightOptions')) {
		diffData.results = {
			...get(diffData, 'results'),
			...get(diffData, 'results.highlightOptions'),
		};
		delete diffData.results.highlightOptions;
	}

	if (get(diffData, 'results.pre_tags') && get(diffData, 'results.post_tags')) {
		diffData.results.highlight_tag = [
			get(diffData, 'results.pre_tags._0[0]'),
			get(diffData, 'results.pre_tags.0[0]'),
		];
		delete diffData.results.post_tags;
		delete diffData.results.pre_tags;
	}

	if (diffData.synonyms) {
		// there is only one key if synonym config i.e. enabled or disabled
		diffData.synonyms = diffData.synonyms.enabled;
	}

	if (get(diffData, 'language.stemmingExceptions')) {
		diffData.language.stemmingExceptions = Object.keys(
			get(diffData, 'language.stemmingExceptions'),
		).reduce(
			(agg, key) => {
				let [deletedFields, addedFields] = agg;
				deletedFields = deletedFields.split(', ').filter((i) => i.trim());
				addedFields = addedFields.split(', ').filter((i) => i.trim());
				if (key !== '_t') {
					// key name starting with _ indicates it is deleted key
					if (key[0] === '_') {
						deletedFields = [
							...deletedFields,
							get(diffData, `language.stemmingExceptions`)[key][0],
						];
					} else {
						addedFields = [
							...addedFields,
							get(diffData, `language.stemmingExceptions`)[key][0],
						];
					}
				}

				return [deletedFields.join(', '), addedFields.join(', ')];
			},
			['', ''],
		);
	}

	if (get(diffData, 'language.customStopwords')) {
		diffData.language.customStopwords = Object.keys(
			get(diffData, 'language.customStopwords'),
		).reduce(
			(agg, key) => {
				let [deletedFields, addedFields] = agg;
				deletedFields = deletedFields.split(', ').filter((i) => i.trim());
				addedFields = addedFields.split(', ').filter((i) => i.trim());
				if (key !== '_t') {
					// key name starting with _ indicates it is deleted key
					if (key[0] === '_') {
						deletedFields = [
							...deletedFields,
							get(diffData, `language.customStopwords`)[key][0],
						];
					} else {
						addedFields = [
							...addedFields,
							get(diffData, `language.customStopwords`)[key][0],
						];
					}
				}

				return [deletedFields.join(', '), addedFields.join(', ')];
			},
			['', ''],
		);
	}

	const topLevelFields = Object.keys(diffData);

	const diffCount = topLevelFields.reduce((agg, item) => {
		const data = diffData[item];
		const count =
			agg +
			Object.keys(data).reduce((sum, i) => {
				return i === 'highlightOptions' ? sum + Object.keys(data[i]).length : sum + 1;
			}, 0);

		return count;
	}, 0);

	return [diffCount, diffData];
};

class ReviewAndSave extends React.Component {
	state = {
		isOpen: false,
		isResetting: false,
		isSaving: false,
	};

	showModal = () => {
		this.setState({
			isOpen: true,
		});
	};

	handleCancel = () => {
		this.setState(
			{
				isOpen: false,
			},
			() => {
				this.setState({ isResetting: false });
			},
		);
	};

	onResetToDefault = () => {
		this.setState({ isResetting: true }, () => {
			this.setState({
				isOpen: true,
			});
		});
	};

	handleSave = () => {
		this.setState({
			isSaving: true,
		});

		const {
			updateSettingsAction,
			localRelevancy: newSettings,
			appName,
			settings: oldSettings,
			localMapping,
			mappings,
		} = this.props;

		console.log('old settings', oldSettings, localMapping, mappings);

		updateSettingsAction(appName, newSettings)
			.then(async (res) => {
				if (res && res.error) {
					notification.error({
						message: 'Failed to save Search Settings',
						description: get(res, 'error.message'),
					});
				} else {
					// decide if re-indexing is required based on language, index and search settings
					/**
					 * 1. Enable/disable ngrams should remove .search fields from the mapping
					 * 2. Language change should trigger setting change + mapping change
					 * 3. Remove of search field / add of new search field should trigger mapping change
					 */
					notification.success(`Search settings for ${appName} saved successfully`);
				}
			})
			.catch((e) => {
				notification.error({
					message: 'Failed to save Search Settings',
					description: e.message,
				});
			});
	};

	render() {
		const { isOpen, isResetting, isSaving } = this.state;
		const { defaultSettings, settings, localRelevancy } = this.props;
		const [diffCount, diffData] = isResetting
			? getDiffData(settings, defaultSettings)
			: getDiffData(settings, localRelevancy);

		return (
			<>
				<div style={{ display: 'flex', alignItems: 'center' }}>
					<div style={{ position: 'relative' }}>
						{diffCount > 0 && <Badge>{diffCount}</Badge>}
						<Button
							style={{ marginRight: 10 }}
							size="large"
							type="primary"
							disabled={!diffCount}
							onClick={this.showModal}
						>
							Reive and Deploy
						</Button>
					</div>
					<Button
						style={{ marginRight: 10 }}
						size="large"
						onClick={this.onResetToDefault}
						disabled={isResetting && !diffCount}
					>
						Reset To Default Settings
					</Button>
				</div>
				<Modal
					visible={isOpen}
					title={
						isResetting
							? 'Reset To Default Settings'
							: 'Review Settings Before Deploying'
					}
					onOk={() => {}}
					width={1000}
					style={{
						top: 20,
					}}
					okText="Review and Save"
					confirmLoading={isSaving}
					onCancel={this.handleCancel}
				>
					{isOpen && <DiffList diff={diffData} />}
				</Modal>
			</>
		);
	}
}

ReviewAndSave.propTypes = {
	localRelevancy: PropTypes.object.isRequired,
	settings: PropTypes.object.isRequired,
	defaultSettings: PropTypes.object,
	appName: PropTypes.string.isRequired,
	updateSettingsAction: PropTypes.func.isRequired,
	localMapping: PropTypes.object,
	mappings: PropTypes.object,
};

ReviewAndSave.defaultProps = {
	defaultSettings: {},
	localMapping: null,
	mappings: null,
};

const mapStateToProps = (state) => {
	const appName = get(state, '$getCurrentApp.name');
	const localRelevancy = get(state, `$getLocalRelevancy.${appName}`);
	const localMapping = get(state, `$getLocalMapping.${appName}`);
	const defaultSettings = get(state, `$getAppSettings.defaultSettings`);
	const settings = get(state, ['$getAppSettings', 'settings', appName], defaultSettings);
	return {
		appName,
		localRelevancy,
		settings,
		defaultSettings,
		localMapping,
		mappings: getRawMappingsByAppName(state) || null,
	};
};

const mapDispatchToProps = (dispatch) => ({
	updateSettingsAction: (appName, payload) => dispatch(putSettings(appName, payload)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ReviewAndSave);
