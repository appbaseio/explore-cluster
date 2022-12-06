import { ReactiveBase, SearchBox } from '@appbaseio/reactivesearch';
import { Alert, Modal, notification, Spin } from 'antd';
import { css } from 'emotion';
import { uniqueId } from 'lodash';
import { any, bool, func, object, oneOfType, string } from 'prop-types';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import Flex from '../../../../batteries/components/shared/Flex';
import {
	removeSearchBox as removeSearchBoxAction,
	saveSearchBox as saveSearchBoxAction,
} from '../../../../batteries/modules/actions/searchboxes';
import { getURL } from '../../../../constants/config';
import { FormContext } from '../../../IntegrationsPage/utils';
import { parseJSON } from '../../utils';
import DesignPanel from './DesignPanel';

import SearchBoxPreview from './SearchBoxPreview';

const container = css`
	flex-wrap: wrap;
	gap: 1.5rem;
	height: 100%;
	padding-top: 3.5rem;
	overflow: auto;

	& > div {
		height: 100%;
		&:first-of-type {
			min-width: max(35%, 300px);
			border-right: 1px solid white;
			height: max-content;
			margin-bottom: 40px;
			flex-grow: 1;
			@media only screen and (max-width: 980px) {
				border-bottom: 1px solid #bfbfbf;
			}
		}
		&:nth-of-type(2) {
			flex-grow: 1;
			padding: 0 1rem 1rem 0;
			margin-left: 1rem;
			width: 48%;
		}
	}
`;

const DesignAndLayout = ({ saveSearchBox, deleteSearchBox, triggerLivePreview, searchBoxData }) => {
	const mainForm = useContext(FormContext);
	const form = mainForm.get('designAndLayout');
	const [showLivePreview, setShowLivePreview] = useState(false);
	const [previewLoading, setPreviewLoading] = useState(false);
	const featuredSuggestionsPayload = useRef({});
	const featuredSuggestionsId = useRef('');

	const collectSearchBoxPreviewState = useCallback(
		(stateObject) => {
			featuredSuggestionsPayload.current = stateObject;
			form.patchValue({
				searchbox: {
					...featuredSuggestionsPayload.current,
				},
			});
		},
		[featuredSuggestionsPayload],
	);

	const handleLivePreview = useCallback(async () => {
		try {
			if (featuredSuggestionsPayload.current) {
				setPreviewLoading(true);
				setShowLivePreview(true);
				const { endpoint = {}, popular = {}, recent = {} } = mainForm.value;
				const payload = JSON.parse(
					JSON.stringify({
						hidden: true,
						searchbox: {
							featured: {
								layout: {
									...featuredSuggestionsPayload.current,
								},
							},
							endpoint: {
								...(endpoint?.endpoint?.url && endpoint?.endpoint?.method
									? {
											endpoint: {
												url: endpoint?.endpoint?.url,
												headers:
													parseJSON(endpoint?.endpoint?.headers) ||
													undefined,
												body:
													parseJSON(endpoint?.endpoint?.body) ||
													undefined,
												method: endpoint?.endpoint?.method,
											},
									  }
									: {}),
								applyStopwords: endpoint.applyStopwords,
								customStopwords: endpoint.customStopwords || [],
								enableSynonyms: endpoint.enableSynonyms,
								excludeFields: endpoint.excludeFields,
								includeFields: endpoint.includeFields,
								maxPredictedWords: endpoint.maxPredictedWords,
								showDistinctSuggestions: endpoint.showDistinctSuggestions,
								...(endpoint.transformResponse
									? { transformResponse: endpoint.transformResponse }
									: {}),
								...(endpoint.urlField ? { urlField: endpoint.urlField } : {}),
							},
							popular: {
								size: popular.size,
								index: popular.indices?.join(','),
								minCount: popular.minCount,
								minChars: popular.minChars,
							},
							recent: {
								size: recent.size,
								index: recent.indices?.join(','),
								minHits: recent.minHits,
								minChars: recent.minChars,
							},
						},
					}),
				);
				const tempSearchBoxId = uniqueId(
					`temp_featured_suggestions${new Date().getTime()}`,
				);
				const response = await saveSearchBox(tempSearchBoxId, payload, false);

				featuredSuggestionsId.current = response.payload.id;
			}
			setTimeout(() => {
				setPreviewLoading(false);
			}, 500);
		} catch (e) {
			setShowLivePreview(false);
			setPreviewLoading(false);
			notification.error({
				description: e,
				message: 'Error processing live preview.',
			});
		}
	}, [setShowLivePreview]);

	useEffect(() => {
		if (triggerLivePreview && !previewLoading) {
			handleLivePreview();
		}
	}, [triggerLivePreview]);

	return (
		<>
			<Flex className={container}>
				<div style={{ position: 'relative', paddingBottom: '60px' }}>
					<DesignPanel />
					<Alert
						type="info"
						showIcon
						style={{
							minHeight: '38px',
							maxHeight: '60px',
							width: 'fit-content',
							position: 'absolute',
							bottom: '11px',
						}}
						message="Design elements are only testable with live preview"
					/>
				</div>
				<div>
					<SearchBoxPreview
						stateCollector={collectSearchBoxPreviewState}
						searchBoxData={searchBoxData}
					/>
				</div>
			</Flex>

			<Modal
				title={
					<div>
						<h3>Live Preview</h3>
					</div>
				}
				open={showLivePreview}
				onCancel={() => {
					setShowLivePreview(false);

					deleteSearchBox(featuredSuggestionsId.current, false);
					featuredSuggestionsId.current = '';
				}}
				style={{
					top: '4rem',
					maxWidth: 'min(652px, 95vw)',
				}}
				width="max(652px, 75vw) !important"
				footer={null}
			>
				<Spin style={{ margin: 'auto', width: '100%' }} spinning={previewLoading}>
					{previewLoading ? null : (
						<ReactiveBase
							app="featured_suggestions"
							credentials={mainForm.value.credentials}
							url={getURL()}
							enableAppbase
							themePreset={form.value.theme}
							theme={{
								colors: {
									primaryColor: form.value.primaryColor,
									textColor: form.value.textColor,
								},
							}}
						>
							<SearchBox
								enableRecentSuggestions={form.value.enableRecentSuggestions}
								enablePopularSuggestions={form.value.enablePopularSuggestions}
								enableFeaturedSuggestions={form.value.enableFeaturedSuggestions}
								enableIndexSuggestions={false}
								enableEndpointSuggestions={form.value.enableEndpointSuggestions}
								showVoiceSearch={form.value.enableVoiceSearch}
								highlight={form.value.highlight}
								componentId="search_box"
								size={10}
								{...(featuredSuggestionsId.current && {
									searchboxId: featuredSuggestionsId.current,
									featuredSuggestionsConfig: {
										sectionsOrder:
											featuredSuggestionsPayload.current.sectionsOrder,
									},
								})}
							/>
						</ReactiveBase>
					)}
				</Spin>
			</Modal>
		</>
	);
};

DesignAndLayout.propTypes = {
	saveSearchBox: func.isRequired,
	deleteSearchBox: func.isRequired,
	editPageId: oneOfType([string, any]).isRequired,
	triggerLivePreview: bool.isRequired,
	form: object.isRequired,
	searchBoxData: object,
};
DesignAndLayout.defaultProps = {
	searchBoxData: null,
};

const mapDispatchToProps = (dispatch) => ({
	saveSearchBox: (id, payload, shouldFetchSearchboxes) =>
		dispatch(saveSearchBoxAction(id, payload, shouldFetchSearchboxes)),
	deleteSearchBox: (id, shouldRefetchSearchboxes) =>
		dispatch(removeSearchBoxAction(id, shouldRefetchSearchboxes)),
});

export default connect(null, mapDispatchToProps)(DesignAndLayout);
