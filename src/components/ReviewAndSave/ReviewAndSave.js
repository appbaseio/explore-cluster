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
import { Button, Modal, notification, message, Alert } from 'antd';
import get from 'lodash/get';
import omit from 'lodash/omit';
import omitBy from 'lodash/omitBy';
import { diff } from 'jsondiffpatch';
import styled from 'react-emotion';

import DiffList from './DiffList';
import { getAnalyticsAction, event } from '../../utils/gtag';

// import { getPossibleSubFields } from '../../utils';
import {
	applyNgramMapping,
	applyLanguageMapping,
	applyNgramDataFields,
	applyAutosuggestionMapping,
	applyAutosuggestionDataFields,
} from '../../utils/mappings';
import {
	putSettings,
	getAppMappings,
	setLocalMappingState,
	setLocalRelevancyState,
	addReIndexingTasks,
} from '../../batteries/modules/actions';
import { getRawMappingsByAppName } from '../../batteries/modules/selectors';
import { buildLanguageAnalysis, getLanguageFallback } from '../../utils/language';
import {
	getESVersion,
	getSettings as getAppSettings,
	reIndex,
} from '../../batteries/utils/mappings';
import { getURL, getVersion } from '../../constants/config';

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

const getDiffData = (oldObj, newObj, analyzerSettings) => {
	let diffData = diff({ ...oldObj }, { ...newObj });
	if (!diffData) {
		return [0, {}];
	}
	if (get(diffData, 'search.fieldWeights', null) && !get(diffData, 'search.dataField', null)) {
		// handle only field weight change

		const { dataField, fieldWeights } = get(newObj, 'search');
		const { fieldWeights: olderWeight } = get(oldObj, 'search');
		const newFieldWeights = dataField.reduce((agg, item, index) => {
			// const hasSubfield = subFields.some((s) => item.includes(s));
			let dataToReturn = [...agg];
			if (olderWeight[index] !== fieldWeights[index]) {
				dataToReturn = [
					...dataToReturn,
					{ field: item, oldWeight: olderWeight[index], newWeight: fieldWeights[index] },
				];
			}

			return dataToReturn;
		}, []);
		diffData = {
			...diffData,
			search: {
				...diffData.search,
				fieldWeights: newFieldWeights,
			},
		};
	}

	if (!get(diffData, 'search.fieldWeights', null) && get(diffData, 'search.dataField', null)) {
		// handle adding | removing of new field

		// get the fields to be removed
		// key with _[indexNumber] means removed field
		// key with [indexNumber] means added field
		const { dataField, fieldWeights } = get(newObj, 'search');
		const { dataField: olderDataFields, fieldWeights: olderWeights } = get(oldObj, 'search');

		const newDataFields = Object.keys(diffData.search.dataField).reduce((agg, i) => {
			const fieldName = get(diffData, `search.dataField`)[i][0];
			const olderDataFieldIndex = olderDataFields.findIndex((f) => f === fieldName);
			const newDataFieldIndex = dataField.findIndex((f) => f === fieldName);

			// const hasSubfield = subFields.some((s) => !fieldName || fieldName.includes(s));
			let newData = [...agg];

			if (fieldName && i !== '_t') {
				// removed field
				const isDeleted = i[0] === '_';

				newData = [
					...newData,
					{
						field: fieldName,
						index: isDeleted ? olderDataFieldIndex : newDataFieldIndex,
						isDeleted,
						oldWeight: isDeleted ? olderWeights[olderDataFieldIndex] || 'N/A' : 'N/A',
						newWeight: isDeleted ? 'N/A' : fieldWeights[newDataFieldIndex] || 'N/A', // always first index holds the value
					},
				];
			}
			return newData;
		}, []);

		// handle only field weight change along with dataField add/remove
		const newFieldWeights = dataField.reduce((agg, item, index) => {
			// const hasSubfield = subFields.some((s) => item.includes(s));
			const isPartOfDataField = newDataFields.some((i) => i.field === item);
			const oldWeight = olderWeights[olderDataFields.findIndex((x) => x === item)];
			const newWeight = fieldWeights[index];
			let dataToReturn = [...agg];
			if (oldWeight !== newWeight && !isPartOfDataField) {
				dataToReturn = [
					...dataToReturn,
					{
						field: item,
						oldWeight,
						newWeight,
					},
				];
			}

			return dataToReturn;
		}, []);
		diffData = {
			...diffData,
			search: {
				...diffData.search,
				fieldWeights: newFieldWeights,
				dataField: newDataFields,
			},
		};

		if (!newDataFields.length) {
			delete diffData.search.dataField;
		}
		if (!newFieldWeights.length) {
			delete diffData.search.fieldWeights;
		}
	}

	if (get(diffData, 'search.dataField', null) && get(diffData, 'search.fieldWeights', null)) {
		// handle adding | removing of new field

		// get the fields to be removed
		// key with _[indexNumber] means removed field
		// key with [indexNumber] means added field
		const { dataField, fieldWeights } = get(newObj, 'search');
		const { dataField: olderDataFields, fieldWeights: olderWeights } = get(oldObj, 'search');

		const newDataFields = Object.keys(diffData.search.dataField).reduce((agg, i) => {
			const fieldName = get(diffData, `search.dataField`)[i][0];
			const olderDataFieldIndex = olderDataFields.findIndex((f) => f === fieldName);
			const newDataFieldIndex = dataField.findIndex((f) => f === fieldName);

			// const hasSubfield = subFields.some((s) => !fieldName || fieldName.includes(s));
			let newData = [...agg];

			if (fieldName && i !== '_t') {
				// removed field
				const isDeleted = i[0] === '_';

				newData = [
					...newData,
					{
						field: fieldName,
						index: isDeleted ? olderDataFieldIndex : newDataFieldIndex,
						isDeleted,
						oldWeight: isDeleted ? olderWeights[olderDataFieldIndex] || 'N/A' : 'N/A',
						newWeight: isDeleted ? 'N/A' : fieldWeights[newDataFieldIndex] || 'N/A', // always first index holds the value
					},
				];
			}
			return newData;
		}, []);

		// handle only field weight change along with dataField add/remove
		const newFieldWeights = dataField.reduce((agg, item, index) => {
			// const hasSubfield = subFields.some((s) => item.includes(s));
			const isPartOfDataField = newDataFields.some((i) => i.field === item);
			const oldWeight = olderWeights[olderDataFields.findIndex((x) => x === item)];
			const newWeight = fieldWeights[index];
			let dataToReturn = [...agg];
			if (oldWeight !== newWeight && !isPartOfDataField) {
				dataToReturn = [
					...dataToReturn,
					{
						field: item,
						oldWeight,
						newWeight,
					},
				];
			}

			return dataToReturn;
		}, []);
		diffData = {
			...diffData,
			search: {
				...diffData.search,
				fieldWeights: newFieldWeights,
				dataField: newDataFields,
			},
		};

		if (!newDataFields.length) {
			delete diffData.search.dataField;
		}
		if (!newFieldWeights.length) {
			delete diffData.search.fieldWeights;
		}
	}

	if (get(diffData, 'search.rankFeature', null)) {
		const newRankFeatures = get(newObj, 'search.rankFeature', {});
		const oldRankFeatures = get(oldObj, 'search.rankFeature', {});

		const updatedRankFeature = Object.keys(
			get(diffData, 'search.rankFeature.0', get(diffData, 'search.rankFeature', {})),
		).reduce((agg, key) => {
			const isDeleted = Boolean(oldRankFeatures[key]) && !newRankFeatures[key];
			const isNew = !oldRankFeatures[key] && Boolean(newRankFeatures[key]);
			const oldFunction = isNew
				? ''
				: Object.keys(oldRankFeatures[key]).find((x) => x !== 'boost');
			const oldFunctionValue = isNew
				? ''
				: Object.keys(oldRankFeatures[key][oldFunction]).reduce(
						(cum, k) => [...cum, `${k} : ${oldRankFeatures[key][oldFunction][k]}`],
						[],
				  );

			const newFunction = isDeleted
				? ''
				: Object.keys(newRankFeatures[key]).find((x) => x !== 'boost');
			const newFunctionValue = isDeleted
				? ''
				: Object.keys(newRankFeatures[key][newFunction]).reduce((cum, k) => {
						return [...cum, `${k} : ${newRankFeatures[key][newFunction][k]}`];
				  }, []);
			return [
				...agg,
				{
					field: key,
					isDeleted,
					oldValue: isNew
						? 'N/A'
						: `${oldFunction} (${
								oldFunctionValue.join(', ').trim() || 'default'
						  }), boost(${oldRankFeatures[key].boost})`,
					newValue: isDeleted
						? 'N/A'
						: `${newFunction} (${
								newFunctionValue.join(', ').trim() || 'default'
						  }), boost(${newRankFeatures[key].boost})`,
				},
			];
		}, []);
		diffData = {
			...diffData,
			search: {
				...diffData.search,
				rankFeature: updatedRankFeature,
			},
		};
	}

	if (get(diffData, 'search.distinctField', null)) {
		const newDistinctField = get(newObj, 'search.distinctField', '');
		const oldDistinctField = get(oldObj, 'search.distinctField', '');
		diffData = {
			...diffData,
			search: {
				...diffData.search,
				distinctField: [
					oldDistinctField.split('.keyword')[0],
					newDistinctField.split('.keyword')[0],
				],
			},
		};
	}

	if ('enableNgram' in get(diffData, 'indexSettings', {})) {
		const newEnableNgram = get(newObj, 'indexSettings.enableNgram', false);
		const oldEnableNgram = get(oldObj, 'indexSettings.enableNgram', false);

		if (newEnableNgram !== oldEnableNgram) {
			diffData = {
				...diffData,
				search: {
					...get(diffData, 'search'),
					enableNgram: [oldEnableNgram, newEnableNgram],
				},
			};
		}
	}

	if ('enableAutoSuggestion' in get(diffData, 'indexSettings', {})) {
		const newEnableAutoSuggestion = get(newObj, 'indexSettings.enableAutoSuggestion', false);
		const oldEnableAutoSuggestion = get(oldObj, 'indexSettings.enableAutoSuggestion', false);

		if (newEnableAutoSuggestion !== oldEnableAutoSuggestion) {
			diffData = {
				...diffData,
				search: {
					...get(diffData, 'search'),
					enableAutoSuggestion: [oldEnableAutoSuggestion, newEnableAutoSuggestion],
				},
			};
		}
	}

	if (get(diffData, 'indexSettings.ngramSettings', {})) {
		const defaultSettings = get(analyzerSettings, 'index.analysis.filter.ngram_filter', {
			min_gram: 3,
			max_gram: 7,
		});
		const newNgramSettings = get(newObj, 'indexSettings.ngramSettings', {});
		let oldNgramSettings = {};
		if (
			get(oldObj, 'indexSettings.ngramSettings.min_gram') &&
			get(oldObj, 'indexSettings.ngramSettings.max_gram')
		) {
			oldNgramSettings = get(oldObj, 'indexSettings.ngramSettings', defaultSettings);
		} else {
			oldNgramSettings = defaultSettings;
		}

		if (
			newNgramSettings &&
			Object.keys(newNgramSettings).length &&
			JSON.stringify(oldNgramSettings) !== JSON.stringify(newNgramSettings) &&
			get(newObj, 'indexSettings.enableNgram', false) &&
			(parseInt(newNgramSettings.min_gram, 10) !== parseInt(oldNgramSettings.min_gram, 10) ||
				parseInt(newNgramSettings.max_gram, 10) !== parseInt(oldNgramSettings.max_gram, 10))
		) {
			diffData = {
				...diffData,
				search: {
					...get(diffData, 'search'),
					ngramSettings: [
						{
							field: 'min_chars',
							newValue: newNgramSettings.min_gram,
							oldValue: oldNgramSettings.min_gram,
						},
						{
							field: 'max_chars',
							newValue: newNgramSettings.max_gram,
							oldValue: oldNgramSettings.max_gram,
						},
					],
				},
			};
		}
	}

	if (get(diffData, 'indexSettings.autosuggestionSettings', {})) {
		const defaultSettings = get(
			analyzerSettings,
			'index.analysis.tokenizer.autosuggest_tokenizer',
			{ min_gram: 3, max_gram: 7 },
		);
		const newSuggestionSettings = get(newObj, 'indexSettings.autosuggestionSettings', {});
		let oldSuggestionSettings = {};
		if (
			get(oldObj, 'indexSettings.autosuggestionSettings.min_gram') &&
			get(oldObj, 'indexSettings.autosuggestionSettings.max_gram')
		) {
			oldSuggestionSettings = get(
				oldObj,
				'indexSettings.autosuggestionSettings',
				defaultSettings,
			);
		} else {
			oldSuggestionSettings = defaultSettings;
		}

		if (
			newSuggestionSettings &&
			Object.keys(newSuggestionSettings).length &&
			JSON.stringify(oldSuggestionSettings) !== JSON.stringify(newSuggestionSettings) &&
			get(newObj, 'indexSettings.enableAutoSuggestion', false) &&
			(parseInt(newSuggestionSettings.min_gram, 10) !==
				parseInt(oldSuggestionSettings.min_gram, 10) ||
				parseInt(newSuggestionSettings.max_gram, 10) !==
					parseInt(oldSuggestionSettings.max_gram, 10))
		) {
			diffData = {
				...diffData,
				search: {
					...get(diffData, 'search'),
					autosuggestionSettings: [
						{
							field: 'min_chars',
							newValue: newSuggestionSettings.min_gram,
							oldValue: oldSuggestionSettings.min_gram,
						},
						{
							field: 'max_chars',
							newValue: newSuggestionSettings.max_gram,
							oldValue: oldSuggestionSettings.max_gram,
						},
					],
				},
			};
		}
	}

	if (get(diffData, 'aggregations.dataField', null)) {
		const newDataFields = Object.keys(diffData.aggregations.dataField).reduce((agg, i) => {
			// deleted field is of pattern [fieldName, number, number]
			const fieldVal = get(diffData, `aggregations.dataField`, {})[i];
			const isDeleted = fieldVal.length === 3;
			const isOlderField = fieldVal.length === 2;
			const newData = [
				...agg,
				{
					field: i.split('.keyword')[0], // just to ignore `.keyword` in field name
					isDeleted,
					oldAgg: isDeleted || isOlderField ? get(fieldVal, 0, 'N/A') : 'N/A',
					newAgg: isDeleted ? 'N/A' : get(fieldVal, 1, get(fieldVal, 0, 'N/A')),
				},
			];

			return newData;
		}, []);
		diffData = {
			...diffData,
			aggregations: {
				...diffData.aggregations,
				dataField: newDataFields,
			},
		};
	}

	if (get(diffData, 'results.highlightFields', null)) {
		const newVal = get(newObj, 'results.highlightFields', []);
		const oldVal = get(oldObj, 'results.highlightFields', []);

		diffData = {
			...diffData,
			results: {
				...diffData.results,
				highlightFields: [oldVal.join(', '), newVal.join(', ')],
			},
		};
	}

	if (get(diffData, 'results.includeFields', null)) {
		const newVal = get(newObj, 'results.includeFields', []);
		const oldVal = get(oldObj, 'results.includeFields', []);
		diffData = {
			...diffData,
			results: {
				...diffData.results,
				includeFields: [oldVal.join(', '), newVal.join(', ')],
			},
		};
	}

	if (get(diffData, 'results.excludeFields', null)) {
		const newVal = get(newObj, 'results.excludeFields', []);
		const oldVal = get(oldObj, 'results.excludeFields', []);

		diffData = {
			...diffData,
			results: {
				...diffData.results,
				excludeFields: [oldVal.join(', '), newVal.join(', ')],
			},
		};
	}

	if (get(diffData, 'results.highlightOptions', null)) {
		diffData = {
			...diffData,
			results: {
				...get(diffData, 'results'),
				...get(diffData, 'results.highlightOptions'),
			},
		};
		delete diffData.results.highlightOptions;
	}

	if (get(diffData, 'results.sortOptions', null)) {
		const newVal = get(newObj, 'results.sortOptions', []);
		const oldVal = get(oldObj, 'results.sortOptions', []);

		diffData = {
			...diffData,
			results: {
				...diffData.results,
				sortOptions: [JSON.stringify(oldVal), JSON.stringify(newVal)],
			},
		};
	}

	if (get(diffData, 'results.pre_tags', null) && get(diffData, 'results.post_tags', null)) {
		const newHighlightTags = [
			get(diffData, 'results.pre_tags._0[0]'),
			get(diffData, 'results.pre_tags.0[0]'),
		];
		delete diffData.results.post_tags;
		delete diffData.results.pre_tags;
		diffData = {
			...diffData,
			results: {
				...diffData.results,
				highlightTags: newHighlightTags,
			},
		};
	}

	if (get(diffData, 'synonyms', null)) {
		// there is only one key if synonym config i.e. enabled: true/false
		// putting it as part of search settings because we render it search settings
		diffData = {
			...diffData,
			search: {
				...get(diffData, 'search', {}),
				enableSynonyms: diffData.synonyms.enabled,
			},
		};

		delete diffData.synonyms;
	}

	if (get(diffData, 'language.stemmingExceptions', null)) {
		const newVal = get(newObj, 'language.stemmingExceptions', []);
		const oldVal = get(oldObj, 'language.stemmingExceptions', []);

		diffData = {
			...diffData,
			language: {
				...diffData.language,
				stemmingExceptions: [oldVal.join(', '), newVal.join(', ')],
			},
		};
	}

	if (get(diffData, 'language.customStopwords', null)) {
		const newVal = get(newObj, 'language.customStopwords', []);
		const oldVal = get(oldObj, 'language.customStopwords', []);

		diffData = {
			...diffData,
			language: {
				...diffData.language,
				customStopwords: [oldVal.join(', '), newVal.join(', ')],
			},
		};
	}

	diffData = {
		language: get(diffData, 'language', {}),
		search: get(diffData, 'search', {}),
		aggregations: get(diffData, 'aggregations', {}),
		results: get(diffData, 'results', {}),
	};

	// filter empty fields
	diffData = Object.keys(diffData).reduce((agg, item) => {
		if (Object.keys(diffData[item]).length) {
			return {
				...agg,
				[item]: {
					...diffData[item],
				},
			};
		}
		return agg;
	}, {});

	const topLevelFields = Object.keys(diffData);
	const diffCount = topLevelFields.reduce((agg, item) => {
		const data = diffData[item];
		const count =
			agg +
			Object.keys(data || {}).reduce((sum) => {
				return sum + 1;
			}, 0);

		return count;
	}, 0);

	return [diffCount, diffData];
};

const shouldReIndex = (localMapping, oldSettings, newSettings) => {
	if (localMapping) {
		return true;
	}

	if (
		get(newSettings, 'indexSettings.enableNgram') !==
		get(oldSettings, 'indexSettings.enableNgram')
	) {
		return true;
	}

	if (
		get(newSettings, 'indexSettings.enableAutoSuggestion') !==
		get(oldSettings, 'indexSettings.enableAutoSuggestion')
	) {
		return true;
	}

	if (
		get(newSettings, 'indexSettings.ngramSettings') !==
		get(oldSettings, 'indexSettings.ngramSettings')
	) {
		return true;
	}

	if (
		get(newSettings, 'indexSettings.autosuggestionSettings') !==
		get(oldSettings, 'indexSettings.autosuggestionSettings')
	) {
		return true;
	}

	if (
		JSON.stringify(get(newSettings, 'language')) !==
		JSON.stringify(get(oldSettings, 'language'))
	) {
		return true;
	}
	return false;
};

class ReviewAndSave extends React.Component {
	state = {
		isOpen: false,
		isResetting: false,
		isSaving: false,
	};

	analyzerSettings = {};

	componentDidMount = async () => {
		const { appName, credentials } = this.props;
		this.analyzerSettings = await getAppSettings(appName, credentials).then(
			(data) => data[appName].settings,
		);
	};

	showModal = () => {
		this.setState({
			isOpen: true,
		});
	};

	handleCancel = () => {
		this.setState({
			isOpen: false,
			isResetting: false,
		});
	};

	onResetToDefault = () => {
		this.setState({ isResetting: true }, () => {
			this.setState({
				isOpen: true,
			});
		});
	};

	handleSave = async () => {
		this.setState({
			isSaving: true,
		});
		const { isResetting } = this.state;
		const {
			updateSettingsAction,
			localRelevancy: currentSettings,
			appName,
			settings: oldSettings,
			localMapping,
			mappings,
			credentials,
			updateLocalMappingState,
			fetchMappings,
			defaultSettings,
			updateLocalRelevancyState,
			updateReIndexingTasks,
		} = this.props;

		// triggering custom event for google analytics
		event({
			action: getAnalyticsAction(),
			category: 'Search Relevancy',
			label: 'review&save',
			value: null,
		});

		let newSettings = isResetting ? defaultSettings : currentSettings;

		let updatedMappings = {
			...(localMapping || mappings),
		};

		if (!updatedMappings || !Object.keys(updatedMappings).length) {
			const mappingRes = await fetchMappings(appName, credentials, getURL());
			updatedMappings = get(mappingRes, 'payload');
		}

		let updatedSettings = {};
		let shouldUpdateSettings = false;
		const hasToReIndex = shouldReIndex(localMapping, oldSettings, newSettings);

		// decide if re-indexing is required based on language, index and search settings
		/**
		 * 1. If localMapping exists then data should be re-indexed as it indicated change in subfields for a some of the fields
		 * 2. Enable/disable ngrams should add/remove .search fields from the mapping
		 * 3. Language change should trigger setting (analyzer) change + mapping change
		 */

		if (
			get(newSettings, 'indexSettings.enableNgram') !==
			get(oldSettings, 'indexSettings.enableNgram')
		) {
			const newNgramSettings = get(newSettings, 'indexSettings.ngramSettings', {});
			shouldUpdateSettings = true;
			const isNgramEnabled = get(newSettings, 'indexSettings.enableNgram');

			updatedSettings = await getAppSettings(appName, credentials).then(
				(data) => data[appName].settings,
			);

			updatedMappings = {
				properties: applyNgramMapping(get(updatedMappings, 'properties'), isNgramEnabled),
			};

			// if ngram is enabled .search field should be added before saving as it requires re-indexing of data
			if (get(newSettings, 'indexSettings.enableNgram')) {
				const currentDataFields = get(newSettings, 'search.dataField');
				// eslint-disable-next-line
				const [ngramDataFields, ngramFieldWeights] =
					applyNgramDataFields(currentDataFields);
				newSettings = {
					...newSettings,
					search: {
						...get(newSettings, 'search'),
						dataField: [
							...currentDataFields,
							// ...ngramDataFields
						],
						fieldWeights: [
							...get(newSettings, 'search.fieldWeights'),
							// ...ngramFieldWeights,
						],
					},
				};
			}
			updatedSettings = {
				index: {
					...get(updatedSettings, 'index', {}),
					analysis: {
						...get(updatedSettings, 'index.analysis', {}),
						filter: {
							...get(updatedSettings, 'index.analysis.filter', {}),
							ngram_filter: {
								...get(updatedSettings, 'index.analysis.filter.ngram_filter', {}),
								...newNgramSettings,
							},
						},
					},
				},
			};
			delete updatedSettings.index.creation_date;
		}

		if (
			get(newSettings, 'indexSettings.enableAutoSuggestion', false) !==
			get(oldSettings, 'indexSettings.enableAutoSuggestion', false)
		) {
			const newSuggestionSettings = get(
				newSettings,
				'indexSettings.autosuggestionSettings',
				{},
			);
			const isAutosuggestionEnabled = get(
				newSettings,
				'indexSettings.enableAutoSuggestion',
				false,
			);
			shouldUpdateSettings = true;
			updatedSettings = await getAppSettings(appName, credentials).then(
				(data) => data[appName].settings,
			);

			updatedMappings = {
				properties: applyAutosuggestionMapping(
					get(updatedMappings, 'properties'),
					isAutosuggestionEnabled,
				),
			};

			// if autosuggestion is enabled .autosuggest field should be added before saving as it requires re-indexing of data
			if (get(newSettings, 'indexSettings.enableAutoSuggestion')) {
				const currentDataFields = get(newSettings, 'search.dataField');
				// eslint-disable-next-line
				const [autosuggestDataFields, autosuggestFieldsWeights] =
					applyAutosuggestionDataFields(currentDataFields);

				newSettings = {
					...newSettings,
					search: {
						...get(newSettings, 'search'),
						dataField: [
							...currentDataFields,
							// ...autosuggestDataFields
						],
						fieldWeights: [
							...get(newSettings, 'search.fieldWeights'),
							// ...autosuggestFieldsWeights,
						],
					},
				};
			}
			updatedSettings = {
				index: {
					...get(updatedSettings, 'index', {}),
					analysis: {
						...get(updatedSettings, 'index.analysis', {}),
						tokenizer: {
							...get(updatedSettings, 'index.analysis.tokenizer', {}),
							autosuggest_tokenizer: {
								...get(
									updatedSettings,
									'index.analysis.tokenizer.autosuggest_tokenizer',
									{},
								),
								...newSuggestionSettings,
							},
						},
					},
				},
			};

			delete updatedSettings.index.creation_date;
		}

		if (
			JSON.stringify(get(newSettings, 'language')) !==
			JSON.stringify(get(oldSettings, 'language'))
		) {
			shouldUpdateSettings = true;
			updatedSettings = await getAppSettings(appName, credentials).then(
				(data) => data[appName].settings,
			);
			const newLangSettings = get(newSettings, 'language');
			const language = getLanguageFallback(get(newLangSettings, 'language'));
			const analysis = buildLanguageAnalysis(language, newLangSettings);

			const { analyzer, filter } = get(updatedSettings, 'index.analysis', {});
			const { analyzer: analyzerNew, filter: filterNew } = analysis || {};

			let updatedAnalyzer = {
				...omit(analyzer, [newLangSettings, 'standard_asciifolding']),
				...analyzerNew,
			};

			if (newLangSettings.normalizeDiacritics) {
				updatedAnalyzer = Object.keys(updatedAnalyzer).reduce((obj, a) => {
					const { filter: analyzerFilter } = updatedAnalyzer[a];
					// asciifolding should appear before [x]_stop word filter
					// inorder to do that find that index and splice before it
					if (analyzerFilter) {
						let stopIndex = analyzerFilter.findIndex((f) => f.includes('_stop'));
						if (stopIndex === -1) stopIndex = 0;
						analyzerFilter.splice(stopIndex, 0, 'asciifolding');
					}
					return {
						...obj,
						[a]: {
							...updatedAnalyzer[a],
							// save the unique values of filter
							filter: analyzerFilter.filter((v, i, x) => x.indexOf(v) === i),
						},
					};
				}, {});
			} else {
				updatedAnalyzer = Object.keys(updatedAnalyzer).reduce((obj, a) => {
					const { filter: analyzerFilter } = updatedAnalyzer[a];
					return {
						...obj,
						[a]: {
							...updatedAnalyzer[a],
							filter: analyzerFilter.filter((i) => i !== 'asciifolding'),
						},
					};
				}, {});
			}

			updatedMappings = {
				properties: applyLanguageMapping(get(updatedMappings, 'properties'), language),
			};

			updatedSettings = {
				analysis: {
					analyzer: updatedAnalyzer,
					filter: {
						...omitBy(filter, (key, value) =>
							(value || '').startsWith(get(newSettings, 'language.language')),
						),
						...filterNew,
					},
				},
			};
		}

		try {
			// convert field weights to float otherwise it can fail indexing data in ES
			const settingsData = {
				...newSettings,
				search: {
					...newSettings.search,
					fieldWeights: newSettings.search.fieldWeights.map((i) =>
						parseFloat(i).toFixed(1),
					),
				},
			};

			// console.log(settingsData);
			const savedSettings = await updateSettingsAction(appName, settingsData);
			if (isResetting) {
				updateLocalRelevancyState(appName, defaultSettings);
			}
			if (savedSettings && savedSettings.error) {
				notification.error({
					message: 'Failed to save Search Settings',
					description: get(savedSettings, 'error.message'),
				});
			} else {
				notification.success({
					message: `Search relevancy for ${appName} saved successfully`,
					description: ``,
				});
			}

			this.setState({
				isSaving: false,
				isOpen: false,
				isResetting: false,
			});

			if (hasToReIndex) {
				const esVersion = getVersion() || (await getESVersion(appName, credentials));

				const reIndexingData = {
					mappings:
						parseInt(esVersion[0], 10) === 6
							? { _doc: updatedMappings }
							: updatedMappings,
					appId: appName,
					version: esVersion,
					credentials,
				};

				if (shouldUpdateSettings) {
					reIndexingData.settings = updatedSettings;
				}

				const reIndexPromise = reIndex(reIndexingData);

				reIndexPromise
					.then((res) => {
						if (get(res, 'failures', []).length) {
							get(res, 'failures', []).forEach((fail) => {
								message.error(`Re-indexing failed: ${fail.cause.reason}`);
							});
							return;
						}
						if (res.task) {
							updateReIndexingTasks(res.task);
						} else if (credentials && appName) {
							message.success(`Re-indexing completed successfully`);
							updateLocalMappingState(appName, null);
							fetchMappings(appName, credentials, this.URL);
						}
					})
					.catch((reIndexErr) => {
						// eslint-disable-next-line no-console
						console.error('Re-indexing error = ', reIndexErr);
						this.setState({ isSaving: false });

						notification.error({
							message: 'Reindexing Failed',
							description:
								reIndexErr.message ||
								'Reindexing might be in progress, please wait till the current process is completed!',
						});
					});
			}
		} catch (err) {
			this.setState({
				isSaving: false,
			});
			notification.error({
				message: 'Failed to save Search Settings',
				description: err.message,
			});
		}
	};

	render() {
		const { isOpen, isResetting, isSaving } = this.state;
		const { defaultSettings, settings, localRelevancy, localMapping } = this.props;
		const [diffCount, diffData] = isResetting
			? getDiffData(settings, defaultSettings, this.analyzerSettings)
			: getDiffData(settings, localRelevancy, this.analyzerSettings);
		const renderShouldReIndex =
			isOpen &&
			shouldReIndex(localMapping, settings, isResetting ? defaultSettings : localRelevancy);
		return (
			<>
				<div style={{ display: 'flex', alignItems: 'center' }}>
					<Button
						style={{ marginRight: 10 }}
						size="large"
						onClick={this.onResetToDefault}
						disabled={isResetting && !diffCount}
						data-cy="reset-default-button"
					>
						Reset To Default Settings
					</Button>
					<div style={{ position: 'relative' }}>
						{diffCount > 0 && !isResetting && localRelevancy && (
							<Badge>{diffCount}</Badge>
						)}
						<Button
							style={{ marginRight: 10 }}
							size="large"
							type="primary"
							disabled={!diffCount || isResetting || !localRelevancy}
							onClick={this.showModal}
							data-cy="review-deploy-button"
						>
							Review and Deploy
						</Button>
					</div>
				</div>
				<Modal
					visible={isOpen}
					title={
						isResetting
							? 'Reset To Default Settings'
							: 'Review Settings Before Deploying'
					}
					onOk={this.handleSave}
					width={1000}
					style={{
						top: 20,
					}}
					destroyOnClose
					okText="Review and Deploy"
					confirmLoading={isSaving}
					onCancel={this.handleCancel}
					cancelButtonProps={{ 'data-cy': 'cancel-modal-button' }}
					okButtonProps={{
						'data-cy': 'review-save-button',
					}}
				>
					<>
						{renderShouldReIndex && (
							<Alert
								type="warning"
								showIcon
								message="Re-indexing is required for applying below changes."
								style={{
									marginBottom: 10,
								}}
							/>
						)}
						{isOpen && <DiffList diff={diffData} />}
					</>
				</Modal>
			</>
		);
	}
}

ReviewAndSave.propTypes = {
	localRelevancy: PropTypes.object,
	settings: PropTypes.object,
	defaultSettings: PropTypes.object,
	appName: PropTypes.string.isRequired,
	updateSettingsAction: PropTypes.func.isRequired,
	localMapping: PropTypes.object,
	mappings: PropTypes.object,
	credentials: PropTypes.string.isRequired,
	fetchMappings: PropTypes.func.isRequired,
	updateLocalMappingState: PropTypes.func.isRequired,
	updateLocalRelevancyState: PropTypes.func.isRequired,
	updateReIndexingTasks: PropTypes.func.isRequired,
};

ReviewAndSave.defaultProps = {
	defaultSettings: {},
	localMapping: null,
	localRelevancy: null,
	mappings: null,
	settings: null,
};

const mapStateToProps = (state) => {
	const appName = get(state, '$getCurrentApp.name');
	const localRelevancy = get(state, ['$getLocalRelevancy', appName], null);
	const localMapping = get(state, ['$getLocalMapping', appName], null);
	const defaultSettings = get(state, `$getAppSettings.defaultSettings`);
	const settings = get(state, ['$getAppSettings', 'settings', appName], defaultSettings);
	const { username, password } = get(state, 'user.data', {});
	return {
		appName,
		localRelevancy,
		settings,
		defaultSettings,
		localMapping,
		mappings: getRawMappingsByAppName(state) || null,
		credentials: username ? `${username}:${password}` : null,
	};
};

const mapDispatchToProps = (dispatch) => ({
	updateSettingsAction: (appName, payload) => dispatch(putSettings(appName, payload)),
	fetchMappings: (appName, credentials, url) =>
		dispatch(getAppMappings(appName, credentials, url)),
	updateLocalMappingState: (appName, data) => dispatch(setLocalMappingState(appName, data)),
	updateLocalRelevancyState: (appName, data) => dispatch(setLocalRelevancyState(appName, data)),
	updateReIndexingTasks: (data) => dispatch(addReIndexingTasks(data)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ReviewAndSave);
