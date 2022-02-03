import React, { useState, useEffect } from 'react';
import { Button, Modal, Alert } from 'antd';
import styled from 'react-emotion';
import get from 'lodash/get';
import { connect } from 'react-redux';
import { func, object, bool, string } from 'prop-types';
import { diff } from 'jsondiffpatch';
import DiffList from './DiffList';
import {
	saveSearchPreferenceN,
	saveRecommendationPreferenceN,
} from '../../batteries/modules/actions';

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

const staticFacetsFields = [
	'productTypeFilter',
	'collectionsFilter',
	'colorFilter',
	'sizeFilter',
	'priceFilter',
];

const ReviewAndSave = ({
	oldData,
	newData,
	isRecommLoading,
	isSearchLoading,
	label,
	buttonProps,
	updateSearchPreferences,
	updateRecommendationsPreferences,
	getPreferencesPayload,
	setHasChanged,
	hasEdited,
	form,
	isRecommendation,
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const [isResetting, setIsResetting] = useState(false);

	useEffect(() => {
		if (oldData && oldData.resultSettings && !oldData.resultSettings.resultHighlight) {
			// eslint-disable-next-line
			oldData.resultSettings.resultHighlight = false;
		}
	}, []);

	useEffect(() => {
		setIsOpen(isResetting);
	}, [isResetting]);

	useEffect(() => {
		if (!isRecommLoading || isSearchLoading) {
			setIsOpen(false);
		}
	}, [isRecommLoading, isSearchLoading]);

	const showModal = () => {
		setIsOpen(true);
	};

	const handleCancel = () => {
		setIsOpen(false);
		setIsResetting(false);
	};

	const handleSave = () => {
		if (isRecommendation) {
			updateRecommendationsPreferences(getPreferencesPayload()).then((action) => {
				if (!(action && action.error)) {
					setHasChanged();
				}
			});
		} else {
			if (
				form.get('csbID') &&
				form.get('csbID').value &&
				(diffData?.facetSettings ||
					diffData?.themeSettings ||
					diffData?.resultSettings ||
					diffData?.searchSettings ||
					diffData?.pipeline)
			) {
				form.get('csbID').setValue('');
				form.get('hasEdited').setValue(false);
			}
			updateSearchPreferences(getPreferencesPayload()).then((action) => {
				if (!(action && action.error)) {
					setHasChanged();
				}
			});
		}
	};

	const getDiffData = (oldObj, newObj) => {
		let diffData = diff({ ...oldObj }, { ...newObj });
		if (!diffData) {
			return [0, {}];
		}
		if (get(diffData, 'name', null)) {
			const newVal = get(newObj, 'name', '');
			const oldVal = get(oldObj, 'name', '');
			diffData = {
				...diffData,
				generalSettings: {
					...diffData.generalSettings,
					name: [oldVal, newVal],
				},
			};
		}

		if (get(diffData, 'pipeline', null)) {
			const newVal = get(newObj, 'pipeline', '');
			const oldVal = get(oldObj, 'pipeline', '');
			diffData = {
				...diffData,
				generalSettings: {
					...diffData.generalSettings,
					pipeline: [oldVal, newVal],
				},
			};
		}

		if (get(diffData, 'description', null)) {
			const newVal = get(newObj, 'description', '');
			const oldVal = get(oldObj, 'description', '');
			diffData = {
				...diffData,
				generalSettings: {
					...diffData.generalSettings,
					description: [oldVal, newVal],
				},
			};
		}

		if (
			form.get('csbID') &&
			form.get('csbID').value &&
			(diffData?.facetSettings ||
				diffData?.themeSettings ||
				diffData?.resultSettings ||
				diffData?.searchSettings ||
				diffData?.pipeline)
		) {
			diffData = {
				...diffData,
				codeSettings: {
					...diffData.codeSettings,
					csbID: [form.get('csbID').value, ''],
				},
			};
		}

		if (get(diffData, 'exportSettings.type', null)) {
			const newVal = get(newObj, 'exportSettings.type', '');
			const oldVal = get(oldObj, 'exportSettings.type', '');
			diffData = {
				...diffData,
				ecommercePlatform: {
					...diffData.ecommercePlatform,
					exportType: [oldVal, newVal],
				},
			};
			delete diffData.exportSettings.type;
		}

		if (get(diffData, 'exportSettings.credentials', null)) {
			const newVal = get(newObj, 'exportSettings.credentials', '');
			const oldVal = get(oldObj, 'exportSettings.credentials', '');
			diffData = {
				...diffData,
				generalSettings: {
					...diffData.generalSettings,
					credentials: [oldVal, newVal],
				},
			};
			delete diffData.exportSettings.credentials;
		}

		if (get(diffData, 'syncSettings', null)) {
			const newVal = get(newObj, 'syncSettings', '');
			const oldVal = get(oldObj, 'syncSettings', '');
			diffData = {
				...diffData,
				ecommercePlatform: {
					...diffData.ecommercePlatform,
					syncSettings: [oldVal, newVal],
				},
			};
		}

		if (get(diffData, 'globalSettings.currency', null)) {
			const newVal = get(newObj, 'globalSettings.currency', '');
			const oldVal = get(oldObj, 'globalSettings.currency', '');
			diffData = {
				...diffData,
				ecommercePlatform: {
					...diffData.ecommercePlatform,
					storeInfo: [oldVal, newVal],
				},
			};
		}

		if (get(diffData, 'themeSettings.type', null)) {
			const newVal = get(newObj, 'themeSettings.type', '');
			const oldVal = get(oldObj, 'themeSettings.type', '');
			diffData = {
				...diffData,
				layoutAndDesign: {
					...diffData.layoutAndDesign,
					searchLayout: [oldVal, newVal],
				},
			};
		}

		if (get(diffData, 'globalSettings.meta.branding', null)) {
			const newVal = get(newObj, 'globalSettings.meta.branding', '');
			const oldVal = get(oldObj, 'globalSettings.meta.branding', '');
			diffData = {
				...diffData,
				layoutAndDesign: {
					...diffData.layoutAndDesign,
					branding: [oldVal, newVal],
				},
			};
		}

		if (get(diffData, 'themeSettings.rsConfig', null)) {
			const newVal = get(newObj, 'themeSettings.rsConfig', '');
			const oldVal = get(oldObj, 'themeSettings.rsConfig', '');
			diffData = {
				...diffData,
				layoutAndDesign: {
					...diffData.layoutAndDesign,
					stylePresets: [oldVal, newVal],
				},
			};
		}

		if (get(diffData, 'themeSettings.customCss', null)) {
			const newVal = get(newObj, 'themeSettings.customCss', '');
			const oldVal = get(oldObj, 'themeSettings.customCss', '');
			diffData = {
				...diffData,
				layoutAndDesign: {
					...diffData.layoutAndDesign,
					customCSS: [oldVal, newVal],
				},
			};
		}

		if (get(diffData, 'searchSettings.rsConfig', null)) {
			const searchSettings = get(diffData, 'searchSettings.rsConfig', {});
			Object.keys(searchSettings).forEach((field) => {
				if (searchSettings[field].length !== 2) {
					if (searchSettings[field][0] && !searchSettings[field][1]) {
						searchSettings[field] = [searchSettings[field][0], false];
					} else {
						delete searchSettings[field];
					}
				}
			});
			diffData = {
				...diffData,
				searchSettings: {
					...diffData.searchSettings,
					...searchSettings,
				},
			};
			delete diffData.searchSettings.rsConfig;
		}

		if (get(diffData, 'searchSettings.searchButton', null)) {
			const customMessagesObj = {};
			if (get(diffData, 'searchSettings.searchButton.text', null)) {
				const newVal = get(newObj, 'searchSettings.searchButton.text', '');
				const oldVal = get(oldObj, 'searchSettings.searchButton.text', '');
				customMessagesObj.searchButton = [oldVal, newVal];
			}
			if (get(diffData, 'searchSettings.searchButton.icon', null)) {
				const newVal = get(newObj, 'searchSettings.searchButton.icon', '');
				const oldVal = get(oldObj, 'searchSettings.searchButton.icon', '');
				customMessagesObj.searchIcon = [oldVal, newVal];
			}
			diffData = {
				...diffData,
				searchSettings: {
					...diffData.searchSettings,
					...customMessagesObj,
				},
			};
		}

		if (get(diffData, 'facetSettings.staticFacets', null)) {
			const newVal = get(newObj, 'facetSettings.staticFacets', []);
			const oldVal = get(oldObj, 'facetSettings.staticFacets', []);
			let facetSettings = {};
			// eslint-disable-next-line
			for (let i = 0; i < 5; i++) {
				if (diff(oldVal[i], newVal[i])) {
					facetSettings = {
						...facetSettings,
						[staticFacetsFields[i]]: [oldVal[i], newVal[i]],
					};
				}
			}
			diffData = {
				...diffData,
				searchSettings: {
					...diffData.searchSettings,
					...facetSettings,
				},
			};
		}

		if (get(diffData, 'facetSettings.dynamicFacets', null)) {
			const newVal = get(newObj, 'facetSettings.dynamicFacets', '');
			const oldVal = get(oldObj, 'facetSettings.dynamicFacets', '');
			diffData = {
				...diffData,
				searchSettings: {
					...diffData.searchSettings,
					dynamicFacets: [oldVal, newVal],
				},
			};
		}

		if (get(diffData, 'globalSettings.showSelectedFilters', null)) {
			const newVal = get(newObj, 'globalSettings.showSelectedFilters', '');
			const oldVal = get(oldObj, 'globalSettings.showSelectedFilters', '');
			diffData = {
				...diffData,
				resultSettings: {
					...diffData.resultSettings,
					showSelectedFilters: [oldVal, newVal],
				},
			};
		}

		if (get(diffData, 'resultSettings.rsConfig', null)) {
			const resultSettings = get(diffData, 'resultSettings.rsConfig', {});
			diffData = {
				...diffData,
				resultSettings: {
					...diffData.resultSettings,
					...resultSettings,
				},
			};
			delete diffData.resultSettings.rsConfig;
		}

		if (get(diffData, 'resultSettings.fields', null)) {
			const resultSettings = get(diffData, 'resultSettings.fields', {});
			Object.keys(resultSettings).forEach((i) => {
				let field = resultSettings[i];
				if (field[0] && !field[1]) {
					field = [field[0], ''];
				} else if (!field[0] && field[1]) {
					field = ['', field[1]];
				} else if (!field[0] && !field[1] && field.length === 3 && field[2]) {
					field = ['', field[2]];
				} else {
					field = [field[0], field[1]];
				}
				resultSettings[i] = field;
			});
			diffData = {
				...diffData,
				resultSettings: {
					...diffData.resultSettings,
					...resultSettings,
				},
			};
			delete diffData.resultSettings.fields;
			delete diffData?.searchSettings?.fields;
		}

		if (get(diffData, 'resultSettings', null)) {
			const resultSettings = get(diffData, 'resultSettings', null);
			// eslint-disable-next-line
			for (const key in resultSettings) {
				if (Array.isArray(resultSettings[key]) && resultSettings[key].length !== 2) {
					const newVal = get(newObj, `resultSettings.${key}`, '');
					const oldVal = get(oldObj, `resultSettings.${key}`, '');
					if (newVal !== oldVal) {
						diffData = {
							...diffData,
							resultSettings: {
								...diffData.resultSettings,
								[key]: [oldVal, newVal],
							},
						};
					} else {
						delete diffData.resultSettings[key];
					}
				}
			}
		}

		if (get(diffData, 'searchSettings.customMessages.noResults', null)) {
			const newVal = get(newObj, 'searchSettings.customMessages.noResults', '');
			const oldVal = get(oldObj, 'searchSettings.customMessages.noResults', '');
			diffData = {
				...diffData,
				searchSettings: {
					...diffData.searchSettings,
					noSuggestion: [oldVal, newVal],
				},
			};
			delete diffData.searchSettings.customMessages;
		}

		if (get(diffData, 'resultSettings.customMessages', null)) {
			const customMessages = get(diffData, 'resultSettings.customMessages', null);
			diffData = {
				...diffData,
				resultSettings: {
					...diffData.resultSettings,
					...customMessages,
				},
			};
			delete diffData.resultSettings.customMessages;
		}

		if (get(diffData, 'recommendationSettings', null)) {
			const recommendationSettings = get(diffData, 'recommendationSettings', null);
			diffData = {
				...diffData,
				recommendationSettings: {
					...diffData.recommendationSettings,
					...recommendationSettings,
				},
			};
		}

		if (get(diffData, 'recommendationSettings.recommendations', null)) {
			const newVal = get(newObj, 'recommendationSettings.recommendations', {});
			const oldVal = get(oldObj, 'recommendationSettings.recommendations', {});
			diffData = {
				...diffData,
				recommendationSettings: {
					...diffData.recommendationSettings,
					recommendations: [oldVal, newVal],
				},
			};
		}

		diffData = {
			ecommercePlatform: get(diffData, 'ecommercePlatform', {}),
			layoutAndDesign: get(diffData, 'layoutAndDesign', {}),
			searchSettings: get(diffData, 'searchSettings', {}),
			codeSettings: get(diffData, 'codeSettings', {}),
			generalSettings: get(diffData, 'generalSettings', {}),
			resultSettings: get(diffData, 'resultSettings', {}),
			exportSettings: get(diffData, 'exportSettings', {}),
			recommendationSettings: get(diffData, 'recommendationSettings', {}),
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

	const [diffCount, diffData] = getDiffData(oldData, newData);

	return (
		<div>
			<div style={{ position: 'relative' }}>
				{diffCount > 0 && <Badge>{diffCount}</Badge>}
				<Button
					style={{ marginRight: 10 }}
					size="large"
					type="primary"
					disabled={!diffCount}
					onClick={showModal}
					loading={isSearchLoading || isRecommLoading}
					data-cy="review-deploy-ui-builder"
					{...buttonProps}
				>
					Review and Save
				</Button>
			</div>
			<Modal
				visible={isOpen}
				title="Review Settings Before Saving"
				onOk={handleSave}
				width={1000}
				style={{
					top: 20,
				}}
				destroyOnClose
				okText={label}
				onCancel={handleCancel}
				cancelButtonProps={{ 'data-cy': 'cancel-modal-button' }}
				okButtonProps={{
					'data-cy': 'review-save-button',
				}}
			>
				<>
					{hasEdited && (
						<Alert
							type="warning"
							showIcon
							message="Your previously saved codesandbox changes will be overwritten once you save new changes for this search UI"
							style={{
								marginBottom: 10,
							}}
						/>
					)}
					{isOpen && <DiffList diff={diffData} />}
				</>
			</Modal>
		</div>
	);
};

ReviewAndSave.defaultProps = {
	buttonProps: null,
	preferenceId: null,
	hasEdited: false,
	isRecommLoading: false,
	isSearchLoading: false,
	isRecommendation: false,
	label: 'Save',
};

ReviewAndSave.propTypes = {
	isSearchLoading: bool,
	isRecommLoading: bool,
	label: string,
	hasEdited: bool,
	buttonProps: object,
	preferenceId: string,
	oldData: object.isRequired,
	newData: object.isRequired,
	setHasChanged: func.isRequired,
	getPreferencesPayload: func.isRequired,
	updateSearchPreferences: func.isRequired,
	updateRecommendationsPreferences: func.isRequired,
	form: object.isRequired,
	isRecommendation: bool,
};

const mapStateToProps = (state) => ({
	isSearchLoading: get(state, '$saveSearchPreferenceN.isFetching'),
	isRecommLoading: get(state, '$saveRecommendationPreferenceN.isFetching'),
});

const mapDispatchToProps = (dispatch, props) => ({
	updateSearchPreferences: (payload) =>
		dispatch(saveSearchPreferenceN(props.preferenceId, payload)),
	updateRecommendationsPreferences: (payload) =>
		dispatch(saveRecommendationPreferenceN(props.preferenceId, payload)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ReviewAndSave);
